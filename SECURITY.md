# Security Policy

## Reporting a vulnerability

**Do not open a public issue.** Report privately:

- GitHub: https://github.com/flffkaos-pixel/calopen/security/advisories/new

We aim to acknowledge within 72 hours and ship a fix within 14 days for
critical issues.

## Scope

- `https://calopen.vercel.app` (production)
- API routes under `/api/`
- Supabase Postgres Row Level Security policies (`supabase/migrations/`)

## What we do

- **Auth**: Supabase Auth (JWT sessions, httpOnly cookies). Email confirmation
  configurable; password rules enforced by Supabase.
- **Database**: RLS enabled on all tables; server routes use the service-role
  key only on the server, never shipped to the browser.
- **Payments**: PayPal subscriptions verified server-side against the PayPal
  API; webhooks verified via PayPal signature check.
- **OAuth**: `state` CSRF tokens in httpOnly cookies; tokens stored
  server-side in Postgres, revoked on disconnect.
- **Abuse**: per-IP sliding-window rate limits on public/payment/OAuth
  endpoints (in-memory per instance; upgrade to Redis for strict global limits).
- **Headers**: CSP, HSTS, `frame-ancestors 'none'`, `Permissions-Policy`,
  `no-store` on API responses (see `vercel.json`).
- **Dependencies**: Dependabot enabled (`.github/dependabot.yml`); `npm audit`
  runs in CI.

## Known accepted risks (tracked)

| Advisory | Status | Reason |
|----------|--------|--------|
| `drizzle-orm <0.45.2` SQL-identifier injection (GHSA-gpj5-g38j-94v9) | Accepted, monitored | Fix requires breaking upgrade to 0.45.x. Our code uses only the static query builder — no dynamic identifiers/table names — so the sink is unreachable. Re-evaluate on each Dependabot PR. |
| `postcss` via `next@15` (XSS/file-read/path-traversal) | Accepted, monitored | Build-time only (Vercel ephemeral builders), no runtime user impact. Fix requires Next.js 16 major upgrade. Re-evaluate quarterly. |

## Out of scope

- Social engineering, physical attacks.
- PayPal/Google/Supabase/Vercel/Resend platform vulnerabilities
  (report to those vendors).
- Unauthenticated denial-of-service beyond our rate limits
  (mitigated by Vercel + Supabase platform limits).
