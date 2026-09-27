import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getMicrosoftAuthUrl } from '@/lib/outlook-calendar';
import { rateLimit, RL } from '@/lib/rate-limit';

/** GET /api/calendar/outlook/connect — start OAuth flow (login required) */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'outlook-connect', RL.oauth);
  if (limited) return limited;

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let authUrl: string;
  try {
    const state = randomBytes(16).toString('hex');
    const store = await cookies();
    store.set('ms_oauth_state', `${user.id}.${state}`, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });
    authUrl = getMicrosoftAuthUrl(`${user.id}.${state}`);
  } catch (e) {
    console.error('Outlook connect error:', e);
    return NextResponse.json(
      { error: 'Outlook Calendar is not configured yet' },
      { status: 503 }
    );
  }
  return NextResponse.redirect(authUrl);
}
