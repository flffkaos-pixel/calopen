import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';

function getSecret(): string {
  const s = process.env.BOOKING_TOKEN_SECRET;
  if (!s) throw new Error('BOOKING_TOKEN_SECRET is not configured');
  return s;
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Buffer {
  const b = s.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b + '='.repeat((4 - (b.length % 4)) % 4), 'base64');
}

/** Signed guest token: bookingId.emailHash, valid until booking end + 7d grace. */
export function signBookingToken(bookingId: string, bookerEmail: string): string {
  const payload = `${bookingId}.${bookerEmail.toLowerCase().trim()}`;
  const sig = createHmac('sha256', getSecret()).update(payload).digest();
  return `${b64urlEncode(Buffer.from(payload, 'utf8'))}.${b64urlEncode(sig)}`;
}

export function verifyBookingToken(
  token: string
): { bookingId: string; bookerEmail: string } | null {
  try {
    const [p, s] = token.split('.');
    if (!p || !s) return null;
    const payload = b64urlDecode(p).toString('utf8');
    const sig = b64urlDecode(s);
    const expected = createHmac('sha256', getSecret()).update(payload).digest();
    if (sig.length !== expected.length || !timingSafeEqual(sig, expected)) return null;
    // bookingId is a UUID (exactly 36 chars, no dots); email follows
    if (payload.length < 38 || payload[36] !== '.') return null;
    const bookingId = payload.slice(0, 36);
    const bookerEmail = payload.slice(37);
    if (!bookerEmail.includes('@')) return null;
    return { bookingId, bookerEmail };
  } catch {
    return null;
  }
}

export function bookingManageUrl(appUrl: string, token: string): string {
  return `${appUrl}/book/manage?token=${encodeURIComponent(token)}`;
}
