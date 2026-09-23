import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { calendars } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/** GET /api/calendar/status — connected providers for the logged-in host */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await db
    .select({ provider: calendars.provider })
    .from(calendars)
    .where(eq(calendars.userId, user.id));
  return NextResponse.json({
    connected: rows.map((r) => r.provider),
  });
}
