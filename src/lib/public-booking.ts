import { db } from '@/lib/db';
import { users, eventTypes, availability, dateOverrides, bookings } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

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

export interface Slot {
  start: string;
  end: string;
}

/**
 * Computes free slots for an event on a given date (YYYY-MM-DD).
 * Weekly availability minus date overrides minus existing bookings.
 */
export async function computeSlots(
  userId: string,
  eventId: string,
  dateStr: string
): Promise<{ slots?: Slot[]; error?: string; status?: number }> {
  const [event] = await db
    .select()
    .from(eventTypes)
    .where(and(eq(eventTypes.id, eventId), eq(eventTypes.userId, userId)));
  if (!event || !event.isActive) return { error: 'Event not found', status: 404 };

  const date = new Date(`${dateStr}T00:00:00`);
  if (isNaN(date.getTime())) return { error: 'Invalid date', status: 400 };
  const dow = date.getDay();

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

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existing = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        gte(bookings.startTime, dayStart),
        lte(bookings.startTime, dayEnd)
      )
    );
  const busy = existing
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .map((b) => ({
      start: new Date(b.startTime).getTime(),
      end: new Date(b.endTime).getTime(),
    }));

  const now = Date.now();
  const step = event.duration + (event.bufferBefore || 0) + (event.bufferAfter || 0);
  const slots: Slot[] = [];
  for (const w of windows) {
    for (let t = w.start; t + event.duration <= w.end; t += step) {
      const s = new Date(date);
      s.setHours(Math.floor(t / 60), t % 60, 0, 0);
      const e = new Date(s.getTime() + event.duration * 60 * 1000);
      if (s.getTime() <= now) continue;
      const overlap = busy.some((b) => s.getTime() < b.end && e.getTime() > b.start);
      if (!overlap) slots.push({ start: s.toISOString(), end: e.toISOString() });
    }
  }
  return { slots };
}
