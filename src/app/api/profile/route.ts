import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const ALLOWED_TIMEZONES = new Set([
  'UTC',
  'Asia/Seoul',
  'Asia/Tokyo',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
]);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** GET /api/profile — own profile */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [row] = await db.select().from(users).where(eq(users.id, user.id));
  if (!row) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  return NextResponse.json({
    profile: {
      id: row.id,
      email: row.email,
      name: row.name,
      username: row.username,
      timezone: row.timezone,
      weekStart: row.weekStart,
    },
  });
}

/** PUT /api/profile — update own profile (name/timezone/weekStart) */
export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const patch: Partial<{ name: string; timezone: string; weekStart: number }> = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length < 1) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    patch.name = escapeHtml(body.name.trim().slice(0, 255));
  }
  if (body.timezone !== undefined) {
    if (!ALLOWED_TIMEZONES.has(body.timezone)) {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
    }
    patch.timezone = body.timezone;
  }
  if (body.weekStart !== undefined) {
    const ws = Number(body.weekStart);
    if (ws !== 0 && ws !== 1) {
      return NextResponse.json({ error: 'Invalid weekStart' }, { status: 400 });
    }
    patch.weekStart = ws;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning();

  // Keep auth metadata in sync for trigger-created display names
  if (patch.name) {
    await supabase.auth.updateUser({ data: { name: patch.name } });
  }

  return NextResponse.json({ success: true, profile: updated });
}
