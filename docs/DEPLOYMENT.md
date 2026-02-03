# Deployment Guide

This guide covers deploying Remedi to production on Vercel with PostgreSQL.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring Setup](#monitoring-setup)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] [Vercel account](https://vercel.com) with project created
- [ ] PostgreSQL database (Vercel Postgres, Neon, Supabase, or similar)
- [ ] [Stripe account](https://stripe.com) with products/prices configured
- [ ] [Sentry account](https://sentry.io) for error tracking
- [ ] [Upstash account](https://upstash.com) for Redis (rate limiting)
- [ ] OAuth credentials (Google and/or GitHub)
- [ ] [OpenAI API key](https://platform.openai.com) for AI features
- [ ] Domain name (optional but recommended)

---

## Environment Variables

### Required Variables

These must be set for the application to function:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string with pooling | `postgresql://...` |
| `DIRECT_URL` | Direct PostgreSQL connection for migrations | `postgresql://...` |
| `NEXTAUTH_SECRET` | Session encryption key (32+ chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://remedi.example.com` |

### Authentication Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_ID` | GitHub OAuth client ID |
| `GITHUB_SECRET` | GitHub OAuth client secret |

### Payment Variables (Stripe)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_BASIC_MONTHLY_PRICE_ID` | Price ID for Basic monthly |
| `STRIPE_BASIC_YEARLY_PRICE_ID` | Price ID for Basic yearly |
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Price ID for Premium monthly |
| `STRIPE_PREMIUM_YEARLY_PRICE_ID` | Price ID for Premium yearly |

### Monitoring Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry project slug |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API for AI search | Disabled |
| `OPENFDA_API_KEY` | FDA API for higher rate limits | 40 req/min |
| `UPSTASH_REDIS_REST_URL` | Redis for rate limiting | Disabled |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token | - |
| `ENABLE_AI_SEARCH` | Enable AI features | `true` |
| `MAINTENANCE_MODE` | Enable maintenance page | `false` |

---

## Database Setup

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** > **Create Database** > **Postgres**
3. Copy the connection strings to your environment variables
4. The `DATABASE_URL` and `DIRECT_URL` will be automatically configured

### Option 2: Neon

1. Create a database at [neon.tech](https://neon.tech)
2. Copy the pooled connection string to `DATABASE_URL`
3. Copy the direct connection string to `DIRECT_URL`

### Option 3: Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings** > **Database** > **Connection string**
3. Use the **Connection pooling** URL for `DATABASE_URL`
4. Use the **Direct connection** URL for `DIRECT_URL`

### Run Migrations

After setting up the database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed with sample data
npm run prisma db seed
```

---

## Vercel Deployment

### Initial Setup

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Link to project
   vercel link
   ```

2. **Configure Environment Variables**

   In Vercel Dashboard > Project > Settings > Environment Variables:
   - Add all required variables for Production environment
   - Add preview-specific variables if needed

3. **Configure Build Settings**

   In Vercel Dashboard > Project > Settings > General:
   - Framework Preset: `Next.js`
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

### Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

Or push to your main branch for automatic deployment.

### Configure Domain

1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

---

## Post-Deployment Verification

### Health Check

```bash
# Basic health check
curl https://your-domain.com/api/health

# Verbose health check
curl https://your-domain.com/api/health?verbose=true
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "0.1.0",
  "environment": "production",
  "services": {
    "database": { "status": "healthy", "latency": 45 },
    "redis": { "status": "healthy", "latency": 12 },
    "stripe": { "status": "healthy", "latency": 234 }
  }
}
```

### Verification Checklist

1. **Homepage loads** - Visit the main URL
2. **Search works** - Try searching for "ibuprofen"
3. **Auth works** - Sign in with Google/GitHub
4. **Database connected** - Check `/api/health?verbose=true`
5. **Stripe connected** - Visit billing page
6. **Sentry connected** - Check Sentry dashboard for test event

### Smoke Tests

```bash
# Run E2E tests against production (be careful!)
PLAYWRIGHT_TEST_BASE_URL=https://your-domain.com npm run test:e2e
```

---

## Monitoring Setup

### Sentry Configuration

1. **Create Project**
   - Go to [sentry.io](https://sentry.io)
   - Create a new Next.js project
   - Copy the DSN

2. **Configure Source Maps**
   - Generate auth token at Sentry > Settings > Auth Tokens
   - Add `SENTRY_AUTH_TOKEN` to Vercel environment variables
   - Source maps are automatically uploaded during build

3. **Set Up Alerts**
   - Go to Sentry > Alerts
   - Create alert for new errors
   - Configure notification channel (Slack, email, PagerDuty)

### Uptime Monitoring

Configure your monitoring service (UptimeRobot, Pingdom, etc.):

| Check | URL | Interval |
|-------|-----|----------|
| Health | `/api/health` | 1 min |
| Homepage | `/` | 5 min |
| Search API | `/api/search?query=test` | 5 min |

### Performance Monitoring

Sentry automatically tracks:
- Page load times
- API response times
- Core Web Vitals (LCP, FID, CLS)
- Database query performance

---

## Rollback Procedures

### Vercel Instant Rollback

1. Go to Vercel Dashboard > Project > Deployments
2. Find the last working deployment
3. Click the three dots menu > **Promote to Production**

### Database Rollback

If a migration caused issues:

```bash
# Rollback last migration (careful in production!)
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Or restore from backup
# (Use your database provider's backup restore feature)
```

### Emergency Procedures

1. **Enable Maintenance Mode**
   ```bash
   # In Vercel environment variables
   MAINTENANCE_MODE=true
   ```
   Then redeploy or wait for automatic propagation.

2. **Rollback to Previous Deployment**
   - Use Vercel's instant rollback feature

3. **Database Issues**
   - Check connection string is correct
   - Verify database is accessible (firewall, VPC)
   - Check Prisma client is generated

---

## Troubleshooting

### Common Issues

#### Build Fails: "Cannot find module '@prisma/client'"

```bash
# Ensure prisma generate runs before build
# Build command should be: prisma generate && next build
```

#### Database Connection Errors

1. Check `DATABASE_URL` format
2. Verify SSL mode (`?sslmode=require`)
3. Check IP allowlist if using managed database

#### OAuth Redirect Errors

1. Verify `NEXTAUTH_URL` matches your domain
2. Check OAuth provider callback URLs are configured
3. Ensure provider credentials are correct

#### Stripe Webhook Failures

1. Verify `STRIPE_WEBHOOK_SECRET` is correct
2. Check webhook endpoint is `/api/webhooks/stripe`
3. Ensure webhook is configured for correct events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Logs

```bash
# View Vercel logs
vercel logs

# View real-time logs
vercel logs --follow

# Filter by function
vercel logs --filter api
```

### Support

- Vercel Support: https://vercel.com/support
- Sentry Support: https://sentry.io/support
- Stripe Support: https://support.stripe.com

---

## Security Checklist

Before going live:

- [ ] All secrets are in environment variables, not code
- [ ] `NEXTAUTH_SECRET` is unique and secure (32+ characters)
- [ ] OAuth redirect URIs are exact matches
- [ ] Stripe webhook secret is configured
- [ ] Rate limiting is enabled (Upstash Redis configured)
- [ ] Sentry is receiving errors
- [ ] Security headers are configured (check with securityheaders.com)
- [ ] HTTPS is enforced (automatic with Vercel)

---

## Maintenance

### Regular Tasks

- **Weekly**: Review Sentry errors and fix high-priority issues
- **Monthly**: Update dependencies (`npm update`)
- **Quarterly**: Review and rotate secrets
- **As needed**: Scale database based on usage

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update minor versions
npm update

# Update major versions (carefully)
npx npm-check-updates -u
npm install

# Run tests after updating
npm run test:run
npm run build
```
