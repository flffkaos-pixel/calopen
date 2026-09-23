import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { db } from '@/lib/db';
import { users, eventTypes, availability, dateOverrides, bookings, calendars } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getFreeBusy, getValidAccessToken, refreshAccessToken } from '@/lib/google-calendar';

/** Best-effort Google busy periods for a host in [rangeStart, rangeEnd]. Never throws. */
async function getGoogleBusy(
  userId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<{ start: number; end: number }[]> {
  try {
    const [row] = await db
      .select()
      .from(calendars)
      .where(and(eq(calendars.userId, userId), eq(calendars.provider, 'google')));
    if (!row || !row.accessToken) return [];

    const persist = async (accessToken: string, expiresAt: Date) => {
      await db.update(calendars).set({ accessToken, expiresAt }).where(eq(calendars.id, row.id));
    };

    let token = await getValidAccessToken(
      {
        id: row.id,
        accessToken: row.accessToken,
        refreshToken: row.refreshToken,
        expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
      },
      persist
    );
    if (!token) return [];

    try {
      return await getFreeBusy(token, rangeStart.toISOString(), rangeEnd.toISOString());
    } catch (e) {
      // Token may have been revoked server-side; try one refresh
      if (e instanceof Error && e.message === 'GOOGLE_TOKEN_EXPIRED' && row.refreshToken) {
        const refreshed = await refreshAccessToken(row.refreshToken).catch(() => null);
        if (!refreshed) return [];
        const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
        await persist(refreshed.access_token, expiresAt);
        return await getFreeBusy(refreshed.access_token, rangeStart.toISOString(), rangeEnd.toISOString()).catch(
          () => []
        );
      }
      return [];
    }
  } catch {
    return [];
  }
}

export async function resolveUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()));
  return user || null;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function hhmm(t: number): string {
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export interface Slot {
  start: string;
  end: string;
}

function isValidDateStr(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(`${dateStr}T00:00:00Z`);
  return !isNaN(d.getTime());
}

/**
 * Computes free slots for an event on a given date.
 * `dateStr` (YYYY-MM-DD) is interpreted in the HOST's timezone;
 * returned ISO strings are UTC instants.
 */
export async function computeSlots(
  userId: string,
  eventId: string,
  dateStr: string
): Promise<{ slots?: Slot[]; error?: string; status?: number }> {
  if (!isValidDateStr(dateStr)) return { error: 'Invalid date', status: 400 };

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return { error: 'Host not found', status: 404 };
  const tz = user.timezone || 'UTC';

  const [event] = await db
    .select()
    .from(eventTypes)
    .where(and(eq(eventTypes.id, eventId), eq(eventTypes.userId, userId)));
  if (!event || !event.isActive) return { error: 'Event not found', status: 404 };

  // Day of week in host timezone
  const hostMidnightUtc = fromZonedTime(`${dateStr} 00:00:00`, tz);
  const dow = toZonedTime(hostMidnightUtc, tz).getDay();

  const schedule = await db
    .select()
    .from(availability)
    .where(and(eq(availability.userId, userId), eq(availability.dayOfWeek, dow)));

  const overrides = await db
    .select()
    .from(dateOverrides)
    .where(and(eq(dateOverrides.userId, userId), eq(dateOverrides.date, dateStr)));

  if (overrides.some((o) => !o.startTime || !o.endTime)) {
    return { slots: [] };
  }
  const windows =
    overrides.length > 0
      ? overrides.map((o) => ({ start: toMinutes(o.startTime!), end: toMinutes(o.endTime!) }))
      : schedule
          .filter((s) => s.isActive)
          .map((s) => ({ start: toMinutes(s.startTime), end: toMinutes(s.endTime) }));

  // UTC range covering the host-local day (pad ±1 day for TZ safety)
  const rangeStart = new Date(hostMidnightUtc.getTime() - 24 * 3600 * 1000);
  const rangeEnd = new Date(hostMidnightUtc.getTime() + 48 * 3600 * 1000);

  const existing = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, rangeStart),
        lte(bookings.startTime, rangeEnd)
      )
    );
  const busy: { start: number; end: number }[] = existing
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .map((b) => ({
      start: new Date(b.startTime).getTime(),
      end: new Date(b.endTime).getTime(),
    }));

  // Merge Google Calendar busy times (best effort)
  const googleBusy = await getGoogleBusy(userId, rangeStart, rangeEnd);
  busy.push(...googleBusy);

  const now = Date.now();
  const step = event.duration + (event.bufferBefore || 0) + (event.bufferAfter || 0);
  const slots: Slot[] = [];
  for (const w of windows) {
    for (let t = w.start; t + event.duration <= w.end; t += step) {
      // Host-local HH:MM -> UTC instant (DST-safe)
      const s = fromZonedTime(`${dateStr} ${hhmm(t)}:00`, tz);
      const e = new Date(s.getTime() + event.duration * 60 * 1000);
      if (s.getTime() <= now) continue;
      const overlap = busy.some((b) => s.getTime() < b.end && e.getTime() > b.start);
      if (!overlap) slots.push({ start: s.toISOString(), end: e.toISOString() });
    }
  }
  return { slots };
}

/** Host-local YYYY-MM-DD for a given instant. */
export function toHostDateStr(instant: Date, tz: string): string {
  const z = toZonedTime(instant, tz);
  return `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, '0')}-${String(z.getDate()).padStart(2, '0')}`;
}
