import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getGoogleAuthUrl } from '@/lib/google-calendar';

/** GET /api/calendar/google/connect — start OAuth flow (login required) */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let authUrl: string;
  try {
    const state = randomBytes(16).toString('hex');
    const store = await cookies();
    store.set('gcal_oauth_state', `${user.id}.${state}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    authUrl = getGoogleAuthUrl(`${user.id}.${state}`);
  } catch (e) {
    console.error('Google connect error:', e);
    return NextResponse.json(
      { error: 'Google Calendar is not configured yet' },
      { status: 503 }
    );
  }
  return NextResponse.redirect(authUrl);
}
