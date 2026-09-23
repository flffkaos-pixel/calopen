import 'server-only';

/**
 * PayPal server-side helpers (Live).
 * Uses PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET (server-only env vars).
 */

const PAYPAL_API = 'https://api-m.paypal.com';

function credentials() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error('PayPal server credentials are not configured');
  }
  return { id, secret };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  const { id, secret } = credentials();
  const basic = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`PayPal token request failed: ${res.status}`);
  }
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export interface PayPalSubscription {
  id: string;
  status: string;
  plan_id: string;
  custom_id?: string;
  subscriber?: { email_address?: string };
}

export async function getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`PayPal subscription lookup failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Verify a PayPal webhook signature.
 * See https://developer.paypal.com/docs/api/webhooks/#verify-webhook-signature
 */
export async function verifyWebhookSignature(args: {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookId: string;
  eventBody: unknown;
}): Promise<boolean> {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transmission_id: args.transmissionId,
      transmission_time: args.transmissionTime,
      cert_url: args.certUrl,
      auth_algo: args.authAlgo,
      transmission_sig: args.transmissionSig,
      webhook_id: args.webhookId,
      webhook_event: args.eventBody,
    }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === 'SUCCESS';
}
