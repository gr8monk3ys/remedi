# Production Readiness Checklist

This checklist maps directly to the remaining production gaps and gives you a repeatable path to verify them locally or in CI.

## 1) Database Setup + Migrations (Verified)

Local (recommended):

```bash
# Start Postgres

docker-compose up -d postgres

# Run migrations + seed
bun run init

# Verify DB + sanity checks
bun run db:verify
bun run db:integrity
```

CI: `ci.yml` runs migrations, seed, and DB verification automatically.

## 2) End-to-End Tests

Local:

```bash
bun run test:e2e
```

CI: `ci.yml` runs Playwright against Postgres.

## 2.5) Pre-deploy Checks

Run the full pre-deploy suite locally:

```bash
bun run predeploy
```

## 3) Real Secrets & Config

Required for production:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_BASIC_MONTHLY_PRICE_ID`
- `STRIPE_BASIC_YEARLY_PRICE_ID`
- `STRIPE_PREMIUM_MONTHLY_PRICE_ID`
- `STRIPE_PREMIUM_YEARLY_PRICE_ID`

Recommended:

- `AUTH_SECRET`
- Email provider (`EMAIL_SERVER`, `EMAIL_FROM`)
- Sentry (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`)
- Upstash Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)

## 4) Deployment + Observability

Required:

- Production deploy pipeline (Vercel or Docker)
- `/api/health` available for uptime checks

Recommended:

- Sentry configured for both server and client
- Alerts for `5xx` spikes and Stripe webhook failures

## 5) Data Integrity Checks

Run after seeding:

```bash
bun run db:integrity
```

## 6) Rate Limits & Abuse Protection

Ensure Upstash Redis keys are present and verify rate limit headers on:

- `/api/search`
- `/api/user-events`
- `/api/conversion-events`

Use:

```bash
curl -I http://localhost:3000/api/search?query=ibuprofen
```

Check for `X-RateLimit-*` headers.

## Notes on Migrations

The migration history was originally created for SQLite. A PostgreSQL baseline migration has been generated at `prisma/migrations/20260205094500_baseline_postgres`. Use that migration when bootstrapping a fresh Postgres database, or regenerate a clean baseline with `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`.

To mark the baseline as applied on a fresh Postgres database:

```bash
bun run db:baseline
```
