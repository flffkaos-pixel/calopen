# CalOpen

The open source scheduling platform for regulated businesses.

## Features

- **HIPAA Ready** - Audit logs, encryption, access controls
- **Self-Hosted** - One Docker command deployment
- **CalDAV Native** - Works with Nextcloud, Fastmail, iCloud
- **Stripe Payments** - Collect payments for appointments
- **Timezone Smart** - Automatic timezone detection
- **Embeddable** - Add booking to your site with one script

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/calopen/calopen.git
cd calopen

# Copy environment variables
cp .env.example .env

# Edit .env with your settings
nano .env

# Start the application
docker compose up -d
```

### Manual Setup

```bash
# Install dependencies
npm install

# Set up database
cp .env.example .env
# Edit .env with your database URL

# Run migrations
npm run db:push

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables.

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Node.js, Drizzle ORM
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **Email:** Resend

## License

MIT
