import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, eventTypes, users } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { sendEmail, bookingReminderEmail } from '@/lib/email';
import { signBookingToken, bookingManageUrl } from '@/lib/booking-token';

/**
 * GET /api/cron/reminders — sends reminder emails for bookings starting
 * in the next ~24h. Triggered by Vercel Cron (free tier).
 * Auth: Authorization: Bearer <CRON_SECRET> (Vercel provides CRON_SECRET).
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') || '';
  if (cronSecret) {
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (process.env.VERCEL === '1') {
    // Fail closed in production: Vercel auto-provisions CRON_SECRET for
    // projects with cron jobs; running without it would allow mail spam.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000);
  // 23-25h window avoids duplicate sends across runs
  const windowStart = new Date(now.getTime() + 23 * 3600 * 1000);

  const upcoming = await db
    .select({
      booking: bookings,
      eventTitle: eventTypes.title,
      hostName: users.name,
      hostUsername: users.username,
    })
    .from(bookings)
    .innerJoin(eventTypes, eq(bookings.eventTypeId, eventTypes.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(
      and(
        eq(bookings.status, 'confirmed'),
        gte(bookings.startTime, windowStart),
        lte(bookings.startTime, in24h)
      )
    )
    .limit(100);

  const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://calopen.vercel.app';
  let sent = 0;
  let skipped = 0;
  for (const row of upcoming) {
    try {
      const manageUrl = bookingManageUrl(
        appBase,
        signBookingToken(row.booking.id, row.booking.bookerEmail)
      );
      const result = await sendEmail({
        to: row.booking.bookerEmail,
        subject: `Reminder: ${row.eventTitle} tomorrow`,
        html:
          bookingReminderEmail({
            bookerName: row.booking.bookerName || 'Guest',
            eventTitle: row.eventTitle,
            startTime: new Date(row.booking.startTime).toISOString(),
            organizerName: row.hostName || row.hostUsername || 'Your Host',
          }).replace(
            '</body>',
            `<p style="text-align:center"><a href="${manageUrl}">Manage booking</a></p></body>`
          ),
      });
      if (result.success && !result.skipped) sent++;
      else skipped++;
    } catch (e) {
      console.error('Reminder failed:', e);
      skipped++;
    }
  }

  return NextResponse.json({ success: true, sent, skipped, checked: upcoming.length });
}
