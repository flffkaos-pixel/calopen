import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { calendars } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/** DELETE /api/calendar/outlook — disconnect Outlook (delete tokens) */
export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Microsoft has no simple revoke endpoint for delegated tokens without
  // the app; deleting stored tokens is sufficient (refresh stops working).
  await db
    .delete(calendars)
    .where(and(eq(calendars.userId, user.id), eq(calendars.provider, 'outlook')));
  return NextResponse.json({ success: true });
}
