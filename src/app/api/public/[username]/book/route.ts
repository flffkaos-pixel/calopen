import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, eventTypes, users } from '@/lib/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { resolveUserByUsername, computeSlots, toHostDateStr } from '@/lib/public-booking';
import { sendEmail, bookingConfirmationEmail } from '@/lib/email';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** POST /api/public/[username]/book — guest booking, no auth required */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await resolveUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 });
    }

    const body = await request.json();
    const { eventId, bookerName, bookerEmail, bookerPhone, bookerNotes, startTime } = body;

    if (!eventId || !bookerName || !bookerEmail || !startTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (typeof bookerName !== 'string' || bookerName.trim().length < 1 || bookerName.length > 255) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    if (!isValidEmail(bookerEmail)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const [event] = await db
      .select()
      .from(eventTypes)
      .where(and(eq(eventTypes.id, eventId), eq(eventTypes.userId, user.id)));
    if (!event || !event.isActive) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime()) || start.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Invalid start time' }, { status: 400 });
    }
    const end = new Date(start.getTime() + event.duration * 60 * 1000);

    // Re-validate the slot is still free (prevents double booking).
    // Date is interpreted in the host's timezone.
    const dateStr = toHostDateStr(start, user.timezone || 'UTC');
    const slotCheck = await computeSlots(user.id, event.id, dateStr);
    const stillFree = (slotCheck.slots || []).some(
      (s) => new Date(s.start).getTime() === start.getTime()
    );
    if (!stillFree) {
      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 409 }
      );
    }

    const [booking] = await db
      .insert(bookings)
      .values({
        eventTypeId: event.id,
        userId: user.id,
        bookerEmail: escapeHtml(bookerEmail),
        bookerName: escapeHtml(bookerName.trim()),
        bookerPhone: bookerPhone ? escapeHtml(String(bookerPhone).slice(0, 50)) : undefined,
        bookerNotes: bookerNotes ? escapeHtml(String(bookerNotes).slice(0, 2000)) : undefined,
        startTime: start,
        endTime: end,
        status: event.price && event.price > 0 ? 'pending' : 'confirmed',
      })
      .returning();

    // Confirmation email to guest (skipped gracefully if Resend not configured)
    await sendEmail({
      to: bookerEmail,
      subject: `Booking ${booking.status === 'confirmed' ? 'Confirmed' : 'Received'} - ${event.title}`,
      html: bookingConfirmationEmail({
        bookerName: escapeHtml(bookerName.trim()),
        eventTitle: escapeHtml(event.title),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        organizerName: escapeHtml(user.name || user.username || 'Your Host'),
      }),
    });

    // Notify host
    const [hostRow] = await db.select().from(users).where(eq(users.id, user.id));
    if (hostRow) {
      await sendEmail({
        to: hostRow.email,
        subject: `New booking: ${event.title} - ${bookerName}`,
        html: bookingConfirmationEmail({
          bookerName: escapeHtml(user.name || user.username || 'Host'),
          eventTitle: escapeHtml(`${event.title} (booked by ${bookerName})`),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          organizerName: escapeHtml(bookerEmail),
        }),
      });
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Public booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
