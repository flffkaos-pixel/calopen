import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eventTypes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { resolveUserByUsername } from '@/lib/public-booking';

/** GET /api/public/[username] -> host profile + active event types (no auth) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const user = await resolveUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'Host not found' }, { status: 404 });
  }
  const events = await db
    .select()
    .from(eventTypes)
    .where(and(eq(eventTypes.userId, user.id), eq(eventTypes.isActive, true)));

  return NextResponse.json({
    host: { username: user.username, name: user.name },
    eventTypes: events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      duration: e.duration,
      price: e.price,
      currency: e.currency,
    })),
  });
}
