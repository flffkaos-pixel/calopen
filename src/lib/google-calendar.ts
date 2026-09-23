import 'server-only';

/**
 * Google Calendar server helpers: OAuth token exchange/refresh,
 * freebusy lookup, and event insertion. All server-side only.
 */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_API = 'https://www.googleapis.com';

function oauthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calopen.vercel.app';
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured');
  }
  return { clientId, clientSecret, redirectUri: `${appUrl}/api/calendar/google/callback` };
}

export function getGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = oauthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'openid',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri } = oauthConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status}`);
  }
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const { clientId, clientSecret } = oauthConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status}`);
  }
  return res.json();
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).catch(() => {});
}

export interface StoredCalendarTokens {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}

/**
 * Returns a usable access token, refreshing it when expired.
 * `persist` saves the refreshed tokens (caller wires DB update).
 * Returns null when no usable token exists.
 */
export async function getValidAccessToken(
  stored: StoredCalendarTokens,
  persist: (accessToken: string, expiresAt: Date) => Promise<void>
): Promise<string | null> {
  if (stored.accessToken && stored.expiresAt && stored.expiresAt.getTime() > Date.now() + 60_000) {
    return stored.accessToken;
  }
  if (!stored.refreshToken) return null;
  try {
    const tokens = await refreshAccessToken(stored.refreshToken);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await persist(tokens.access_token, expiresAt);
    return tokens.access_token;
  } catch {
    return null;
  }
}

export interface BusyPeriod {
  start: number;
  end: number;
}

/** Query Google freebusy for the primary calendar in [timeMin, timeMax]. */
export async function getFreeBusy(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<BusyPeriod[]> {
  const res = await fetch(`${GOOGLE_API}/calendar/v3/freeBusy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: 'primary' }],
    }),
  });
  if (res.status === 401) {
    throw new Error('GOOGLE_TOKEN_EXPIRED');
  }
  if (!res.ok) {
    throw new Error(`Google freebusy failed: ${res.status}`);
  }
  const data = await res.json();
  const busy = data.calendars?.primary?.busy || [];
  return busy.map((b: { start: string; end: string }) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  startIso: string;
  endIso: string;
  attendeeEmail?: string;
  timeZone?: string;
}

/** Insert a booking event into the host's primary Google Calendar. */
export async function insertCalendarEvent(
  accessToken: string,
  input: CalendarEventInput
): Promise<{ id?: string; htmlLink?: string }> {
  const res = await fetch(`${GOOGLE_API}/calendar/v3/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startIso, timeZone: input.timeZone || 'UTC' },
      end: { dateTime: input.endIso, timeZone: input.timeZone || 'UTC' },
      attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : undefined,
    }),
  });
  if (res.status === 401) {
    throw new Error('GOOGLE_TOKEN_EXPIRED');
  }
  if (!res.ok) {
    throw new Error(`Google event insert failed: ${res.status}`);
  }
  return res.json();
}
