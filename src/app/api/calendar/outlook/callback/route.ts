import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { calendars } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { exchangeCodeForTokens, getRedirectUri } from '@/lib/outlook-calendar';

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://calopen.vercel.app';
}

/** GET /api/calendar/outlook/callback — OAuth callback, stores tokens */
export async function GET(request: NextRequest) {
  const fail = (msg: string) =>
    NextResponse.redirect(`${appUrl()}/dashboard/settings?calendar=error&reason=${encodeURIComponent(msg)}`);

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return fail('login-required');

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (searchParams.get('error')) return fail('denied');
    if (!code || !state) return fail('invalid-response');

    const store = await cookies();
    const expected = store.get('ms_oauth_state')?.value;
    store.delete('ms_oauth_state');
    if (!expected || expected !== state) return fail('invalid-state');

    const [stateUserId] = state.split('.');
    if (stateUserId !== user.id) return fail('user-mismatch');

    const tokens = await exchangeCodeForTokens(code, getRedirectUri());
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    const existing = await db
      .select()
      .from(calendars)
      .where(and(eq(calendars.userId, user.id), eq(calendars.provider, 'outlook')));

    if (existing.length > 0) {
      await db
        .update(calendars)
        .set({
          accessToken: tokens.access_token,
          ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
          expiresAt,
        })
        .where(eq(calendars.id, existing[0].id));
    } else {
      await db.insert(calendars).values({
        userId: user.id,
        provider: 'outlook',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      });
    }

    return NextResponse.redirect(`${appUrl()}/dashboard/settings?calendar=connected`);
  } catch (e) {
    console.error('Outlook callback error:', e);
    return fail('exchange-failed');
  }
}
