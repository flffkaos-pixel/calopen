import { NextResponse } from 'next/server';

/**
 * GET /api/calendar/providers — which calendar providers are configured.
 * Public booleans only (no secrets). Used to hide unconfigured Connect buttons.
 */
export async function GET() {
  return NextResponse.json({
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    outlook: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
  });
}
