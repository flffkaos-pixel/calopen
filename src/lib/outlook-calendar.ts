import 'server-only';

/**
 * Outlook / Microsoft Graph server helpers: OAuth token exchange/refresh,
 * free/busy lookup via calendarView, and event insertion. Server-only.
 */

const MS_AUTHORIZE = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MS_TOKEN = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const GRAPH = 'https://graph.microsoft.com/v1.0';

const SCOPES = ['openid', 'email', 'offline_access', 'Calendars.Read', 'Calendars.ReadWrite'];

function oauthConfig() {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calopen.vercel.app';
  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth is not configured');
  }
  return { clientId, clientSecret, redirectUri: `${appUrl}/api/calendar/outlook/callback` };
}

export function getMicrosoftAuthUrl(state: string): string {
  const { clientId, redirectUri } = oauthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    response_mode: 'query',
    scope: SCOPES.join(' '),
    state,
  });
  return `${MS_AUTHORIZE}?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const { clientId, clientSecret } = oauthConfig();
  const res = await fetch(MS_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...body }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Microsoft token request failed: ${res.status}`);
  }
  return res.json();
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResponse> {
  return tokenRequest({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' });
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  return tokenRequest({ refresh_token: refreshToken, grant_type: 'refresh_token', scope: SCOPES.join(' ') });
}

export function getRedirectUri(): string {
  return oauthConfig().redirectUri;
}

export interface BusyPeriod {
  start: number;
  end: number;
}

/** Busy periods via calendarView in [timeMin, timeMax]. */
export async function getOutlookBusy(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<BusyPeriod[]> {
  const params = new URLSearchParams({
    startDateTime: timeMin,
    endDateTime: timeMax,
    $select: 'start,end,showAs',
    $top: '100',
  });
  const res = await fetch(`${GRAPH}/me/calendar/calendarView?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // Force UTC wall-times so parsing is unambiguous.
      Prefer: 'outlook.timezone="UTC"',
    },
  });
  if (res.status === 401) {
    throw new Error('MS_TOKEN_EXPIRED');
  }
  if (!res.ok) {
    throw new Error(`Graph calendarView failed: ${res.status}`);
  }
  const data = await res.json();
  const busy: BusyPeriod[] = [];
  const asUtc = (dt?: string): number => {
    if (!dt) return NaN;
    const clean = dt.replace(/[Zz]$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
    return new Date(`${clean}Z`).getTime();
  };
  for (const ev of data.value || []) {
    // 'free' doesn't block; everything else (busy/tentative/oof/workingElsewhere) does
    if (ev.showAs === 'free') continue;
    const s = asUtc(ev.start?.dateTime);
    const e = asUtc(ev.end?.dateTime);
    if (!isNaN(s) && !isNaN(e)) busy.push({ start: s, end: e });
  }
  return busy;
}

export interface OutlookEventInput {
  subject: string;
  body?: string;
  /** UTC ISO instants (e.g. from Date.toISOString()). */
  startIso: string;
  endIso: string;
  attendeeEmail?: string;
}

/** Insert a booking event into the host's Outlook calendar. */
export async function insertOutlookEvent(
  accessToken: string,
  input: OutlookEventInput
): Promise<{ id?: string; webLink?: string }> {
  // Graph takes wall-time + zone; our instants are UTC so zone is UTC.
  const wall = (iso: string) => iso.replace(/\.\d+Z$/, '').replace(/Z$/, '');
  const res = await fetch(`${GRAPH}/me/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: input.subject,
      body: { contentType: 'text', content: input.body || '' },
      start: { dateTime: wall(input.startIso), timeZone: 'UTC' },
      end: { dateTime: wall(input.endIso), timeZone: 'UTC' },
      attendees: input.attendeeEmail
        ? [{ emailAddress: { address: input.attendeeEmail }, type: 'required' }]
        : undefined,
    }),
  });
  if (res.status === 401) {
    throw new Error('MS_TOKEN_EXPIRED');
  }
  if (!res.ok) {
    throw new Error(`Graph event insert failed: ${res.status}`);
  }
  return res.json();
}

export interface StoredOutlookTokens {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}

/** Usable access token with refresh; null when unusable. Never throws. */
export async function getValidOutlookAccessToken(
  stored: StoredOutlookTokens,
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
