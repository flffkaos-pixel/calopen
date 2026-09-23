import { NextRequest, NextResponse } from 'next/server';
import { resolveUserByUsername, computeSlots } from '@/lib/public-booking';
import { rateLimit, RL } from '@/lib/rate-limit';

/** GET /api/public/[username]/slots?eventId=&date=YYYY-MM-DD (no auth) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const limited = rateLimit(request, 'public-slots', RL.slots);
  if (limited) return limited;

  const { username } = await params;
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const date = searchParams.get('date');

  if (!eventId || !date) {
    return NextResponse.json(
      { error: 'eventId and date are required' },
      { status: 400 }
    );
  }

  const user = await resolveUserByUsername(username);
  if (!user) {
    return NextResponse.json({ error: 'Host not found' }, { status: 404 });
  }

  const result = await computeSlots(user.id, eventId, date);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  }
  return NextResponse.json({ slots: result.slots });
}
