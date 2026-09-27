import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, eventTypes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyBookingToken } from '@/lib/booking-token';
import { rateLimit, RL } from '@/lib/rate-limit';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** GET /api/public/bookings/manage?token= — guest views own booking */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'booking-manage', RL.slots);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const parsed = token ? verifyBookingToken(token) : null;
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 });
  }

  // bookerEmail is stored HTML-escaped; match the same form
  const [booking] = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.id, parsed.bookingId),
        eq(bookings.bookerEmail, escapeHtml(parsed.bookerEmail))
      )
    );
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const [event] = await db
    .select({ title: eventTypes.title, duration: eventTypes.duration })
    .from(eventTypes)
    .where(eq(eventTypes.id, booking.eventTypeId));

  return NextResponse.json({
    booking: {
      id: booking.id,
      eventTitle: event?.title || 'Appointment',
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      bookerName: booking.bookerName,
    },
  });
}

/** POST /api/public/bookings/manage — guest cancels own booking */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'booking-cancel', RL.book);
  if (limited) return limited;

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = body.token ? verifyBookingToken(body.token) : null;
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 });
  }

  const [booking] = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.id, parsed.bookingId),
        eq(bookings.bookerEmail, escapeHtml(parsed.bookerEmail))
      )
    );
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.status === 'cancelled') {
    return NextResponse.json({ success: true, already: true });
  }
  if (new Date(booking.startTime).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Past bookings cannot be cancelled' }, { status: 400 });
  }

  await db
    .update(bookings)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(bookings.id, booking.id));

  return NextResponse.json({ success: true });
}
