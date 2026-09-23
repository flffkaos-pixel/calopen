import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/paypal-server';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';

/**
 * PayPal webhook receiver.
 * Events: BILLING.SUBSCRIPTION.ACTIVATED / CANCELLED / SUSPENDED /
 *         PAYMENT.SALE.COMPLETED, etc.
 *
 * Register URL in PayPal dashboard:
 *   https://calopen.vercel.app/api/paypal/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      // Webhook not configured yet — acknowledge so PayPal stops retrying
      // only after configuration. For now, log and accept.
      console.warn('PAYPAL_WEBHOOK_ID is not set; skipping signature verification');
    }

    const eventBody = await request.json();

    if (webhookId) {
      const ok = await verifyWebhookSignature({
        transmissionId: request.headers.get('paypal-transmission-id') || '',
        transmissionTime: request.headers.get('paypal-transmission-time') || '',
        certUrl: request.headers.get('paypal-cert-url') || '',
        authAlgo: request.headers.get('paypal-auth-algo') || '',
        transmissionSig: request.headers.get('paypal-transmission-sig') || '',
        webhookId,
        eventBody,
      });
      if (!ok) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    const eventType: string = eventBody.event_type || '';
    const resource = eventBody.resource || {};
    const subscriptionId: string | undefined =
      resource.id || resource.billing_agreement_id;

    console.log(`PayPal webhook: ${eventType} sub=${subscriptionId || 'n/a'}`);

    // Audit-log every subscription lifecycle event (HIPAA traceability)
    try {
      await db.insert(auditLogs).values({
        action: `paypal.${eventType}`,
        entityType: 'subscription',
        metadata: {
          subscriptionId: subscriptionId || null,
          status: resource.status || null,
          planId: resource.plan_id || null,
          customId: resource.custom_id || null,
        },
      });
    } catch (e) {
      console.error('Failed to audit-log webhook:', e);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
