# Production Launch Checklist

Use this checklist to ensure Remedi is ready for production launch.

---

## Pre-Launch Checklist

### Infrastructure

- [ ] **Database provisioned** (PostgreSQL on Vercel Postgres, Neon, Supabase, or similar)
- [ ] **Database migrations applied** (`npx prisma migrate deploy`)
- [ ] **Database backup strategy in place** (automated backups enabled)
- [ ] **Redis configured** (Upstash for rate limiting)
- [ ] **CDN configured** (automatic with Vercel)

### Environment Variables

#### Required

- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` - PostgreSQL connection string (with pooling)
- [ ] `DIRECT_URL` - Direct PostgreSQL connection (for migrations)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (e.g., `https://remedi.com`)

#### Authentication

- [ ] `CLERK_WEBHOOK_SECRET` - Clerk webhook signing secret
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - Sign-in route (typically `/sign-in`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - Sign-up route (typically `/sign-up`)

#### Payments (Stripe)

- [ ] `STRIPE_SECRET_KEY` - Live secret key (starts with `sk_live_`)
- [ ] `STRIPE_PUBLISHABLE_KEY` - Live publishable key (starts with `pk_live_`)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- [ ] `STRIPE_BASIC_MONTHLY_PRICE_ID` - Price ID for Basic monthly plan
- [ ] `STRIPE_BASIC_YEARLY_PRICE_ID` - Price ID for Basic yearly plan
- [ ] `STRIPE_PREMIUM_MONTHLY_PRICE_ID` - Price ID for Premium monthly plan
- [ ] `STRIPE_PREMIUM_YEARLY_PRICE_ID` - Price ID for Premium yearly plan

#### Monitoring

- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN (client + server)
- [ ] `SENTRY_AUTH_TOKEN` - Auth token for source map uploads
- [ ] `SENTRY_ORG` - Sentry organization slug
- [ ] `SENTRY_PROJECT` - Sentry project slug

#### Rate Limiting

- [ ] `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

#### Optional Services

- [ ] `OPENAI_API_KEY` - For AI-powered search
- [ ] `OPENFDA_API_KEY` - For higher FDA API rate limits
- [ ] `RESEND_API_KEY` - For transactional emails
- [ ] `EMAIL_FROM` - Verified sender email address

### Clerk Configuration

- [ ] **Production domain configured** in Clerk dashboard
- [ ] **Sign-in/sign-up URLs configured** to match app routes
- [ ] **Webhook endpoint configured**: `https://your-domain.com/api/webhooks/clerk`
- [ ] **Webhook events enabled**:
  - [ ] `user.created`
  - [ ] `user.updated`
  - [ ] `user.deleted`

### Stripe Configuration

- [ ] **Products created** in Stripe Dashboard (Basic, Premium)
- [ ] **Prices created** (monthly and yearly for each plan)
- [ ] **Webhook endpoint configured**: `https://your-domain.com/api/webhooks/stripe`
- [ ] **Webhook events enabled**:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] **Test mode disabled** (using live keys)

### Sentry Configuration

- [ ] **Project created** for Next.js
- [ ] **DSN configured** in environment variables
- [ ] **Source maps uploading** during build
- [ ] **Alerts configured** for new errors
- [ ] **Rate-limit alert rule** for `API rate limit exceeded` (tag: `rate_limit.identifier`)
- [ ] **Team notifications** set up (Slack, email, PagerDuty)

### DNS & SSL

- [ ] **Domain configured** in Vercel
- [ ] **DNS records** pointing to Vercel
- [ ] **SSL certificate** issued and active
- [ ] **www redirect** configured (if applicable)

### Security

- [ ] **Security headers configured** (X-Frame-Options, CSP, etc.)
- [ ] **Rate limiting enabled** (Upstash Redis)
- [ ] **HTTPS enforced** (automatic with Vercel)
- [ ] **Secrets not in code** (all in environment variables)
- [ ] **No debug mode** (`DEBUG=false`, `NODE_ENV=production`)
- [ ] **Auth secret is unique** and not reused from development

### Performance

- [ ] **Build succeeds** without errors
- [ ] **Bundle size acceptable** (check with `npm run build`)
- [ ] **Images optimized** (using next/image)
- [ ] **Static assets cached** (automatic with Vercel)

### Testing

- [ ] **All unit tests pass** (`npm run test:run`)
- [ ] **E2E tests pass** (`npm run test:e2e`)
- [ ] **Type checking passes** (`npm run type-check`)
- [ ] **Linting passes** (`npm run lint`)
- [ ] **Build succeeds** (`npm run build`)

---

## Launch Day Checklist

### Before Going Live

- [ ] **Final code review** completed
- [ ] **Staging environment** verified working
- [ ] **Team notified** of launch time
- [ ] **Rollback plan** documented and tested
- [ ] **Monitoring dashboards** open

### Deploy

- [ ] **Deploy to production** (`vercel --prod` or merge to main)
- [ ] **Verify deployment** succeeded in Vercel dashboard
- [ ] **Check build logs** for any warnings

### Verify

- [ ] **Homepage loads** at production URL
- [ ] **Health check passes**: `GET /api/health?verbose=true`
- [ ] **Search works**: Try searching for a medication
- [ ] **Auth works**: Sign in and sign out
- [ ] **Stripe works**: Test checkout flow (use test card if in test mode)
- [ ] **Sentry works**: Check for connection event

### Monitor

- [ ] **Error rate** is normal (check Sentry)
- [ ] **Response times** are acceptable (check Vercel Analytics)
- [ ] **No 5xx errors** in logs

---

## Post-Launch Checklist

### Immediate (First Hour)

- [ ] **Monitor error rate** in Sentry
- [ ] **Watch response times** in Vercel
- [ ] **Check database connections** aren't exhausted
- [ ] **Verify webhooks** are being received (Stripe dashboard)

### First Day

- [ ] **Review all errors** in Sentry
- [ ] **Check user signups** are working
- [ ] **Verify payments** are processing
- [ ] **Monitor database** load and query times

### First Week

- [ ] **Address any critical bugs**
- [ ] **Review performance metrics**
- [ ] **Check billing** is accurate
- [ ] **Gather initial user feedback**

---

## Rollback Procedures

### Quick Rollback (Vercel)

1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

### Database Rollback

1. Restore from backup (use provider's dashboard)
2. Or rollback migration: `npx prisma migrate resolve --rolled-back MIGRATION_NAME`

### Emergency: Enable Maintenance Mode

1. Set `MAINTENANCE_MODE=true` in Vercel environment variables
2. Redeploy or wait for propagation
3. Users will see maintenance page

---

## Monitoring & Alerts

### Uptime Monitoring

Set up alerts for:

| Service    | URL                      | Alert Threshold |
| ---------- | ------------------------ | --------------- |
| API Health | `/api/health`            | Down > 1 min    |
| Homepage   | `/`                      | Down > 2 min    |
| Search API | `/api/search?query=test` | Error > 5%      |

### Error Monitoring (Sentry)

Configure alerts for:

- See `docs/SENTRY_ALERTS.md` for recommended rules and tags.
- [ ] **New errors** - Alert immediately
- [ ] **Error spike** - >10 errors/minute
- [ ] **P99 latency** - >3 seconds
- [ ] **429 spike** - rate-limit exceeded events increase abnormally

### Resource Monitoring

Watch for:

- [ ] **Database connections** - Near pool limit
- [ ] **Memory usage** - Approaching limits
- [ ] **API rate limits** - Approaching OpenFDA/OpenAI limits

---

## Support Contacts

| Service  | Support Link                 |
| -------- | ---------------------------- |
| Vercel   | https://vercel.com/support   |
| Stripe   | https://support.stripe.com   |
| Sentry   | https://sentry.io/support    |
| Neon     | https://neon.tech/docs       |
| Supabase | https://supabase.com/support |
| Upstash  | https://upstash.com/docs     |

---

## Checklist Sign-Off

| Role          | Name | Date | Signature |
| ------------- | ---- | ---- | --------- |
| Developer     |      |      |           |
| DevOps        |      |      |           |
| Product Owner |      |      |           |

---

**Launch Date**: **\*\***\_\_\_**\*\***

**Launch Time**: **\*\***\_\_\_**\*\***

**Version**: **\*\***\_\_\_**\*\***
