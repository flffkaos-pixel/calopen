import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { bookings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { rateLimit, RL } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'paypal-confirm-payment', RL.paypal);
  if (limited) return limited;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, itemId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    if (itemId) {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, itemId));

      if (!booking || booking.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await db
        .update(bookings)
        .set({ paymentId: orderId })
        .where(eq(bookings.id, itemId));
    }

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error) {
    console.error('PayPal payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
