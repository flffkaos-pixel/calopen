import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { calendars } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revokeToken } from '@/lib/google-calendar';

/** DELETE /api/calendar/google — disconnect Google (revoke + delete tokens) */
export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(calendars)
    .where(and(eq(calendars.userId, user.id), eq(calendars.provider, 'google')));
  for (const row of rows) {
    if (row.accessToken) await revokeToken(row.accessToken);
    if (row.refreshToken) await revokeToken(row.refreshToken);
  }
  await db
    .delete(calendars)
    .where(and(eq(calendars.userId, user.id), eq(calendars.provider, 'google')));
  return NextResponse.json({ success: true });
}
