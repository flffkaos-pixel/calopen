import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, eventTypes, users } from '@/lib/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { resolveUserByUsername, computeSlots, toHostDateStr } from '@/lib/public-booking';
import { sendEmail, bookingConfirmationEmail } from '@/lib/email';
import { calendars } from '@/lib/db/schema';
import {
  getValidAccessToken,
  insertCalendarEvent,
  refreshAccessToken,
} from '@/lib/google-calendar';

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

    // Add to host's Google Calendar (best effort — never fails the booking)
    let meetingLink: string | undefined;
    try {
      const [cal] = await db
        .select()
        .from(calendars)
        .where(and(eq(calendars.userId, user.id), eq(calendars.provider, 'google')));
      if (cal?.accessToken) {
        const persist = async (accessToken: string, expiresAt: Date) => {
          await db.update(calendars).set({ accessToken, expiresAt }).where(eq(calendars.id, cal.id));
        };
        let token = await getValidAccessToken(
          {
            id: cal.id,
            accessToken: cal.accessToken,
            refreshToken: cal.refreshToken,
            expiresAt: cal.expiresAt ? new Date(cal.expiresAt) : null,
          },
          persist
        );
        const doInsert = async (t: string) =>
          insertCalendarEvent(t, {
            summary: `${event.title} — ${bookerName}`,
            description: `Booked via CalOpen\nGuest: ${bookerName} <${bookerEmail}>\n${bookerNotes || ''}`,
            startIso: start.toISOString(),
            endIso: end.toISOString(),
            attendeeEmail: bookerEmail,
            timeZone: user.timezone || 'UTC',
          });
        try {
          if (token) {
            const created = await doInsert(token);
            meetingLink = created.htmlLink;
          }
        } catch (e) {
          if (e instanceof Error && e.message === 'GOOGLE_TOKEN_EXPIRED' && cal.refreshToken) {
            const refreshed = await refreshAccessToken(cal.refreshToken).catch(() => null);
            if (refreshed) {
              const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
              await persist(refreshed.access_token, expiresAt);
              const created = await doInsert(refreshed.access_token).catch(() => null);
              meetingLink = created?.htmlLink;
            }
          }
        }
        if (meetingLink) {
          await db.update(bookings).set({ meetingLink }).where(eq(bookings.id, booking.id));
        }
      }
    } catch (e) {
      console.error('Google Calendar insert failed (non-fatal):', e);
    }

    return NextResponse.json(
      { success: true, booking: { ...booking, meetingLink: meetingLink || booking.meetingLink } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Public booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
