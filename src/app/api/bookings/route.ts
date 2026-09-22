import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { bookings, eventTypes } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { sendEmail, bookingConfirmationEmail } from '@/lib/email';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventTypeId, bookerEmail, bookerName, bookerNotes, startTime } = body;

    if (!eventTypeId || !bookerEmail || !bookerName || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [eventType] = await db
      .select()
      .from(eventTypes)
      .where(eq(eventTypes.id, eventTypeId));

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type not found' },
        { status: 404 }
      );
    }

    if (eventType.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + eventType.duration * 60 * 1000);

    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.eventTypeId, eventTypeId),
          eq(bookings.status, 'confirmed'),
          lte(bookings.startTime, end),
          gte(bookings.endTime, start)
        )
      );

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is no longer available' },
        { status: 409 }
      );
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        eventTypeId,
        userId: eventType.userId,
        bookerEmail: escapeHtml(bookerEmail),
        bookerName: escapeHtml(bookerName),
        bookerNotes: bookerNotes ? escapeHtml(bookerNotes) : undefined,
        startTime: start,
        endTime: end,
        status: 'confirmed',
      })
      .returning();

    await sendEmail({
      to: bookerEmail,
      subject: `Booking Confirmed - ${eventType.title}`,
      html: bookingConfirmationEmail({
        bookerName: escapeHtml(bookerName),
        eventTitle: escapeHtml(eventType.title),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        organizerName: 'Your Host',
      }),
    });

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, user.id));

    const results = await query;

    return NextResponse.json({ bookings: results });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
