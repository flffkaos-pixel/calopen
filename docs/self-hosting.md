# Self-Hosting Guide

This guide covers deploying CalOpen on your own infrastructure.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Manual Installation](#manual-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Production Deployment](#production-deployment)
- [Reverse Proxy Configuration](#reverse-proxy-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring](#monitoring)
- [Backup Strategy](#backup-strategy)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Minimum Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Storage | 10 GB | 20 GB |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

### Required Software

- **Docker** 24+ and Docker Compose v2
- **Node.js** 20+ (for manual installation)
- **PostgreSQL** 16 (included in Docker setup)
- **Redis** 7 (included in Docker setup)

---

## Quick Start (Docker)

### 1. Clone the Repository

```bash
git clone https://github.com/calopen/calopen.git
cd calopen
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Required: Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required: Database connection (uses local PostgreSQL in Docker)
DATABASE_URL=postgresql://postgres:your-password@db:5432/calopen

# Required: PayPal configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_TEAMS_PLAN_ID=your-teams-plan-id
PAYPAL_ORGS_PLAN_ID=your-orgs-plan-id

# Required: Email (Resend)
RESEND_API_KEY=re_your-api-key
EMAIL_FROM=CalOpen <notifications@yourdomain.com>

# Required: Application URL
NEXT_PUBLIC_APP_URL=https://cal.yourdomain.com
```

### 3. Start Services

```bash
docker compose up -d
```

This starts:
- **App** - Next.js application on port 3000
- **PostgreSQL** - Database on port 5432
- **Redis** - Cache on port 6379

### 4. Verify Installation

```bash
# Check services are running
docker compose ps

# Check health endpoint
curl http://localhost:3000/api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-09-22T12:00:00.000Z",
  "version": "0.1.0"
}
```

---

## Manual Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Set Up Database

Option A: Use Supabase (recommended)

Option B: Use local PostgreSQL:

```bash
# Start PostgreSQL
docker run -d --name calopen-db \
  -p 5432:5432 \
  -e POSTGRES_DB=calopen \
  -e POSTGRES_PASSWORD=your-password \
  postgres:16-alpine
```

### 4. Run Migrations

```bash
npm run db:push
```

### 5. Build for Production

```bash
npm run build
```

### 6. Start Production Server

```bash
npm start
```

---

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID | `AXxxx...` |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | `EXxxx...` |
| `RESEND_API_KEY` | Resend email API key | `re_xxx...` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `https://cal.example.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_FROM` | Sender email address | `CalOpen <notifications@calopen.dev>` |
| `GOOGLE_CLIENT_ID` | Google Calendar integration | - |
| `GOOGLE_CLIENT_SECRET` | Google Calendar secret | - |
| `MICROSOFT_CLIENT_ID` | Outlook integration | - |
| `MICROSOFT_CLIENT_SECRET` | Outlook secret | - |
| `STRIPE_SECRET_KEY` | Stripe payments | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - |

---

## Database Setup

### Option 1: Supabase (Recommended)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get credentials from Settings → API
4. Run migrations in SQL Editor:
   - Copy contents of `supabase/migrations/001_initial.sql`
   - Paste into SQL Editor
   - Click "Run"

### Option 2: Self-Hosted PostgreSQL

```bash
# Using Docker
docker run -d \
  --name calopen-postgres \
  -e POSTGRES_DB=calopen \
  -e POSTGRES_PASSWORD=secure-password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Run migrations
DATABASE_URL=postgresql://postgres:secure-password@localhost:5432/calopen \
  npm run db:push
```

### Database Backup

```bash
# Automated daily backup (add to crontab)
0 2 * * * docker exec calopen-postgres pg_dump -U postgres calopen | gzip > /backups/calopen-$(date +\%Y\%m\%d).sql.gz

# Restore from backup
gunzip < backup.sql.gz | docker exec -i calopen-postgres psql -U postgres calopen
```

---

## Production Deployment

### Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/calopen
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - NEXT_PUBLIC_PAYPAL_CLIENT_ID=${NEXT_PUBLIC_PAYPAL_CLIENT_ID}
      - PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: calopen
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Deploy:

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Railway

1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Note: Vercel requires external database (Supabase recommended).

---

## Reverse Proxy Configuration

### Nginx

Create `/etc/nginx/sites-available/calopen`:

```nginx
server {
    listen 80;
    server_name cal.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cal.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/cal.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cal.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/calopen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Caddy

```
cal.yourdomain.com {
    reverse_proxy localhost:3000
}
```

---

## SSL/TLS Setup

### Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d cal.yourdomain.com

# Auto-renewal (usually configured automatically)
sudo certbot renew --dry-run
```

---

## Monitoring

### Health Check

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response
{
  "status": "ok",
  "timestamp": "2026-09-22T12:00:00.000Z",
  "version": "0.1.0"
}
```

### Docker Logs

```bash
# View application logs
docker compose logs -f app

# View database logs
docker compose logs -f db
```

### Resource Monitoring

```bash
# Check container resource usage
docker stats

# Check disk space
df -h

# Check memory
free -m
```

---

## Backup Strategy

### What to Back Up

1. **PostgreSQL Database** - All application data
2. **Environment Variables** - `.env` file
3. **Uploads** - Any user-uploaded files (if applicable)

### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/calopen"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker exec calopen-postgres pg_dump -U postgres calopen | \
  gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
```

Make executable and schedule:

```bash
chmod +x backup.sh
# Add to crontab: daily at 2 AM
crontab -e
0 2 * * * /path/to/backup.sh
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker compose logs app

# Common issues:
# - Missing environment variables
# - Database connection refused
# - Port already in use
```

### Database Connection Issues

```bash
# Test database connection
docker exec -it calopen-postgres psql -U postgres calopen

# Check if PostgreSQL is running
docker compose ps db
```

### Email Not Sending

```bash
# Verify Resend API key
curl -H "Authorization: Bearer re_your-key" \
  https://api.resend.com/api-keys

# Check email logs
docker compose logs app | grep -i email
```

### PayPal Integration Issues

```bash
# Verify PayPal credentials
# 1. Check sandbox environment at https://sandbox.paypal.com
# 2. Ensure webhooks are configured
# 3. Check PayPal dashboard for API logs
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Scale if needed (horizontal scaling)
docker compose up -d --scale app=3
```

---

## Support

- **Documentation:** [docs.calopen.dev](https://docs.calopen.dev)
- **GitHub Issues:** [github.com/calopen/calopen/issues](https://github.com/calopen/calopen/issues)
- **Community:** [GitHub Discussions](https://github.com/calopen/calopen/discussions)

---

## Next Steps

- [Set up PayPal payments](paypal-setup.md)
- [Configure Supabase](supabase-setup.md)
- [Review the API documentation](api.md)
