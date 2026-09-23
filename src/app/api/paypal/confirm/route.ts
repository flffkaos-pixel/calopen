import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSubscription } from '@/lib/paypal-server';
import { rateLimit, RL } from '@/lib/rate-limit';

const TEAMS_PLAN_ID = process.env.PAYPAL_TEAMS_PLAN_ID;
const ORGS_PLAN_ID = process.env.PAYPAL_ORGS_PLAN_ID;

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'paypal-confirm', RL.paypal);
  if (limited) return limited;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId, userId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId is required' },
        { status: 400 }
      );
    }

    if (userId && userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify the subscription directly with PayPal (never trust the client alone)
    let subscription;
    try {
      subscription = await getSubscription(subscriptionId);
    } catch (e) {
      console.error('PayPal subscription lookup failed:', e);
      return NextResponse.json(
        { error: 'Could not verify subscription with PayPal' },
        { status: 502 }
      );
    }

    if (!['ACTIVE', 'APPROVAL_PENDING', 'APPROVED'].includes(subscription.status)) {
      return NextResponse.json(
        { error: `Subscription is not active (status: ${subscription.status})` },
        { status: 402 }
      );
    }

    // subscription.custom_id carries our user id from the checkout component
    if (subscription.custom_id && subscription.custom_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const plan =
      subscription.plan_id === ORGS_PLAN_ID
        ? 'organizations'
        : subscription.plan_id === TEAMS_PLAN_ID
          ? 'teams'
          : 'teams';

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id));

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: userRecord.id,
      email: userRecord.email,
      plan,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
