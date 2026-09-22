# Changelog

All notable changes to CalOpen will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- Core scheduling functionality
- PayPal payment integration
- Stripe payment integration
- Email notifications via Resend
- Supabase authentication
- Database schema with Drizzle ORM
- Docker deployment support
- Railway deployment configuration

### Changed
- Migrated from Pages Router to App Router (Next.js 15)

### Fixed
- None yet

---

## [0.1.0] - 2026-09-22

### Features

#### Core Scheduling
- **Event Types** - Create and manage different meeting types with custom durations
- **Availability** - Set weekly availability with day-of-week granularity
- **Date Overrides** - Block specific dates for holidays or time off
- **Booking Flow** - Public booking page at `/book/[username]`

#### Authentication & Users
- **Supabase Auth** - Email/password authentication
- **User Profiles** - Name, avatar, timezone settings
- **Organization Support** - Multi-user organizations with roles

#### Payments
- **PayPal Integration** - Subscription plans and one-time payments
- **Stripe Integration** - Alternative payment processor support
- **Plan Tiers**:
  - Free: 1 user, unlimited event types
  - Teams: $12/user/month
  - Organizations: $28/user/month

#### Email
- **Booking Confirmations** - Automated emails when bookings are created
- **Email Reminders** - Upcoming appointment notifications
- **Resend Integration** - Reliable email delivery

#### Calendar
- **Google Calendar** - Sync with Google Calendar
- **Microsoft Outlook** - Sync with Outlook calendar
- **CalDAV** - Native CalDAV support for Nextcloud, Fastmail, iCloud

#### API Endpoints
- `GET /api/availability` - Fetch user availability
- `PUT /api/availability` - Update availability schedule
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `POST /api/paypal/confirm` - Confirm PayPal subscription
- `POST /api/paypal/confirm-payment` - Confirm PayPal one-time payment
- `GET /api/health` - Health check endpoint

#### Database
- **PostgreSQL** - Primary database via Supabase
- **Drizzle ORM** - Type-safe database queries
- **Row Level Security** - Database-level access control
- **Audit Logs** - HIPAA-compliant activity tracking

#### Deployment
- **Docker** - Single-command deployment with Docker Compose
- **Railway** - One-click deployment support
- **Environment Variables** - Comprehensive configuration

#### UI/UX
- **Tailwind CSS** - Modern, responsive design
- **Lucide Icons** - Beautiful icon set
- **Timezone Detection** - Automatic timezone handling
- **Mobile Responsive** - Works on all devices

### Technical Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS 3
- **Backend**: Node.js, TypeScript 5
- **Database**: PostgreSQL 16, Drizzle ORM
- **Auth**: Supabase Auth
- **Payments**: PayPal, Stripe
- **Email**: Resend
- **Testing**: Jest, React Testing Library

---

## Versioning

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

---

## Release Process

1. Update version in `package.json`
2. Update this CHANGELOG.md
3. Create git tag: `git tag v0.1.0`
4. Push with tags: `git push --tags`
5. Create GitHub Release with release notes

---

## Contributors

See the full list of contributors on [GitHub](https://github.com/calopen/calopen/graphs/contributors).
