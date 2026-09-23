import { NextRequest, NextResponse } from 'next/server';

interface Bucket {
  hits: number[];
}

// In-memory sliding-window limiter (per serverless instance).
// Raises abuse cost substantially on Vercel's multi-instance setup;
// for strict global limits, swap the store for Upstash Redis later.
const buckets = new Map<string, Bucket>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export interface RateLimitOptions {
  /** Max requests per window. */
  limit: number;
  /** Window in seconds. */
  windowSec: number;
}

/**
 * Returns null when allowed, or a 429 JSON response when limited.
 * Always sets RateLimit-* headers (draft-ietf-httpapi-ratelimit-headers).
 */
export function rateLimit(
  request: NextRequest,
  key: string,
  { limit, windowSec }: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const mapKey = `${key}:${getClientIp(request)}`;

  let bucket = buckets.get(mapKey);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(mapKey, bucket);
  }
  // Prune old hits
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  const remaining = Math.max(0, limit - bucket.hits.length);
  const resetSec = bucket.hits.length > 0
    ? Math.ceil((bucket.hits[0] + windowMs - now) / 1000)
    : windowSec;

  const headers = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.max(0, resetSec)),
  };

  if (bucket.hits.length >= limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers }
    );
  }

  bucket.hits.push(now);

  // Opportunistic memory hygiene
  if (buckets.size > 10000) {
    const cutoff = now - windowMs;
    for (const [k, b] of buckets) {
      b.hits = b.hits.filter((t) => t > cutoff);
      if (b.hits.length === 0) buckets.delete(k);
    }
  }

  return null;
}

/** Presets per endpoint sensitivity. */
export const RL = {
  /** Guest booking creation: 10/min/IP (abuse + spam target). */
  book: { limit: 10, windowSec: 60 },
  /** Slot scraping: 60/min/IP. */
  slots: { limit: 60, windowSec: 60 },
  /** Payment confirm: 20/min/IP. */
  paypal: { limit: 20, windowSec: 60 },
  /** OAuth start: 20/min/IP. */
  oauth: { limit: 20, windowSec: 60 },
  /** Default authenticated APIs: 120/min/IP. */
  api: { limit: 120, windowSec: 60 },
} satisfies Record<string, RateLimitOptions>;
