# Supabase Setup Guide

This guide covers setting up Supabase for CalOpen's authentication and database.

## Overview

CalOpen uses Supabase for:

- **Authentication** - User login/signup
- **PostgreSQL Database** - All application data
- **Row Level Security** - Database-level access control

## Table of Contents

- [Prerequisites](#prerequisites)
- [Create Supabase Project](#create-supabase-project)
- [Get Credentials](#get-credentials)
- [Database Setup](#database-setup)
- [Authentication Configuration](#authentication-configuration)
- [Row Level Security](#row-level-security)
- [Local Development](#local-development)
- [Migrations](#migrations)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account (for authentication)
- Supabase free tier is sufficient for development

---

## Create Supabase Project

### Step 1: Sign Up

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub
4. Authorize Supabase

### Step 2: Create Project

1. Click **"New Project"**
2. Fill in details:

| Field | Value |
|-------|-------|
| Organization | Create new or select existing |
| Project Name | `calopen` |
| Database Password | **Save this securely!** |
| Region | Choose closest to your users |

3. Click **"Create new project"**
4. Wait 1-2 minutes for setup

---

## Get Credentials

### Navigate to API Settings

1. Go to **Settings → API** in your project dashboard
2. Copy the following values:

| Setting | Location | Use in CalOpen |
|---------|----------|----------------|
| **Project URL** | Settings → API | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | Settings → API | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** | Settings → API | `SUPABASE_SERVICE_ROLE_KEY` |

### Environment Variables

Add to your `.env` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (for direct connection/migrations)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Finding Database URL

1. Go to **Settings → Database**
2. Scroll to **Connection string**
3. Copy the **URI** format
4. Replace `[PASSWORD]` with your database password

---

## Database Setup

### Option 1: SQL Editor (Recommended)

1. Go to **SQL Editor** in your dashboard
2. Create a new query
3. Paste the contents of `supabase/migrations/001_initial.sql`
4. Click **Run**

The migration creates:

- `users` - User profiles
- `organizations` - Multi-user organizations
- `organization_members` - Org membership
- `event_types` - Bookable event types
- `availability` - Weekly schedules
- `date_overrides` - Holidays/time off
- `bookings` - All bookings
- `calendars` - Calendar integrations
- `audit_logs` - HIPAA audit trail

### Option 2: Drizzle Migrations

```bash
# Push schema to database
npm run db:push

# Or generate and run migrations
npm run db:generate
npm run db:migrate
```

### Verify Tables

1. Go to **Table Editor**
2. Verify all tables are created:
   - users
   - organizations
   - organization_members
   - event_types
   - availability
   - date_overrides
   - bookings
   - calendars
   - audit_logs

---

## Authentication Configuration

### Email/Password Auth

Enabled by default. Users can:

1. Sign up with email/password
2. Log in with credentials
3. Reset password via email

### Configure Email Templates

1. Go to **Authentication → Email Templates**
2. Customize:

| Template | Description |
|----------|-------------|
| **Confirm signup** | Email verification |
| **Magic Link** | Passwordless login |
| **Change Email Address** | Email change confirmation |
| **Reset Password** | Password reset |

### Email Settings

1. Go to **Authentication → Providers → Email**
2. Configure:
   - **Confirm email** - Require email verification
   - **Secure password** - Enforce password requirements

### Disable Email Confirmation (Development Only)

For local development, you may want to disable email confirmation:

1. Go to **Authentication → Providers → Email**
2. Toggle **Confirm email** to OFF

> **Warning:** Never disable email confirmation in production!

### Social Login (Optional)

To add Google/GitHub login:

1. Go to **Authentication → Providers**
2. Enable desired provider
3. Add OAuth credentials
4. Configure callback URLs

---

## Row Level Security

CalOpen uses RLS to protect data at the database level.

### How RLS Works

- Policies control which rows users can access
- All queries are automatically filtered
- Even direct database access respects RLS

### Existing Policies

The migration creates these policies:

```sql
-- Users can only see their own data
CREATE POLICY users_self_policy ON users
  FOR ALL USING (id = auth.uid());

-- Event types are private to owner
CREATE POLICY event_types_self_policy ON event_types
  FOR ALL USING (user_id = auth.uid());

-- Bookings: owner can see all, public can create
CREATE POLICY bookings_read_policy ON bookings
  FOR SELECT USING (
    user_id = auth.uid() OR
    event_type_id IN (SELECT id FROM event_types WHERE user_id = auth.uid())
  );

CREATE POLICY bookings_insert_policy ON bookings
  FOR INSERT WITH CHECK (true);
```

### Adding New Policies

Example: Allow organization members to view each other's events:

```sql
CREATE POLICY org_events_policy ON event_types
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

---

## Local Development

### Option 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Stop when done
supabase stop
```

Local credentials are printed after `supabase start`.

### Option 2: Docker Compose

The project includes a PostgreSQL container:

```bash
docker compose up db -d
```

Use this connection string:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/calopen
```

### Option 3: Remote Supabase

Use your hosted Supabase project for development:

```bash
DATABASE_URL=postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## Migrations

### Create Migration

```bash
# Generate migration from schema changes
npm run db:generate

# Or create manually
touch supabase/migrations/002_add_feature.sql
```

### Run Migrations

```bash
# Push to database
npm run db:push

# Or run pending migrations
npm run db:migrate
```

### View Schema

```bash
# Open Drizzle Studio
npm run db:studio
```

---

## Security Best Practices

### 1. Never Expose Service Role Key

```bash
# BAD: Exposed to client
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...

# GOOD: Server-side only
SUPABASE_SERVICE_ROLE_KEY=...
```

The `service_role` key bypasses RLS - keep it secret!

### 2. Use RLS Everywhere

Always enable RLS on new tables:

```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
```

### 3. Rotate Keys Periodically

1. Go to **Settings → API**
2. Generate new keys
3. Update environment variables
4. Redeploy application

### 4. Audit Database Access

Query the audit logs:

```sql
SELECT * FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### 5. Enable Database Notifications

1. Go to **Database → Webhooks**
2. Add webhook for suspicious activity
3. Configure alerts

---

## Troubleshooting

### "relation does not exist"

```bash
# Cause: Tables not created
# Solution: Run migration
npm run db:push
# Or paste SQL in Supabase SQL Editor
```

### "permission denied for table"

```bash
# Cause: RLS blocking access
# Solution: Check RLS policies
# Or test with service_role key (server-side only)
```

### "JWT expired"

```bash
# Cause: Session token expired
# Solution: Refresh token or re-authenticate
```

### "Invalid API key"

```bash
# Cause: Wrong key or environment
# Solution: Verify keys in Settings → API
```

### Connection Pool Exhausted

```bash
# Cause: Too many connections
# Solution: Use connection pooling
DATABASE_URL=postgresql://...?pgbouncer=true
```

### Database Size Limits

Free tier: 500 MB

Check usage:

1. Go to **Settings → Database**
2. View **Database size**

---

## Database Schema Reference

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│    users    │────▶│ organization_   │◀────│organizations│
└─────────────┘     │    members      │     └─────────────┘
      │             └─────────────────┘           │
      │                                           │
      ▼                                           │
┌─────────────┐     ┌─────────────────┐           │
│ availability│     │   event_types   │◀──────────┘
└─────────────┘     └─────────────────┘
      │                    │
      ▼                    ▼
┌─────────────┐     ┌─────────────────┐
│date_overrides│    │    bookings     │
└─────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ audit_logs  │
                    └─────────────┘
```

### Key Relationships

- `users.id` ← `event_types.user_id` (One user has many event types)
- `event_types.id` ← `bookings.event_type_id` (One event type has many bookings)
- `users.id` ← `bookings.user_id` (One user has many bookings)
- `organizations.id` ← `organization_members.organization_id` (Orgs have many members)

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Drizzle ORM + Supabase](https://orm.drizzle.team/docs/connectors/supabase)

---

## Next Steps

- [Configure PayPal payments](paypal-setup.md)
- [Review the API documentation](api.md)
- [Deploy to production](self-hosting.md)
