# TODO - Remedi

**Last Updated**: 2026-06-02
**Status**: Feature-complete. Remaining work is production configuration and operational hardening, not core functionality.

> **Note on history:** Earlier versions of this file described the app as using
> NextAuth.js and lacking a payment system. Both are out of date. The app
> migrated to **Clerk** for authentication and has a **full Stripe**
> integration (checkout, billing portal, webhooks, subscriptions, trials).
> This file has been rewritten to reflect the current codebase.

---

## Current State (verified)

Quality gates all pass on a clean checkout:

- `bun run lint` — clean
- `bun run type-check` — clean (TypeScript strict)
- `bun run test:run` — **1189 unit tests across 65 files, all passing**

### Implemented and working

**Auth & users**

- [x] Clerk authentication (`@clerk/nextjs`), server helpers in `lib/auth.ts`
- [x] Clerk webhook sync (`app/api/webhooks/clerk/route.ts`) incl. legacy account migration
- [x] Role-based access (user, moderator, admin) + authorization helpers
- [x] E2E local-auth bypass guarded against production use (`lib/env.ts`)

**Search**

- [x] Three-tier strategy: database → OpenFDA API → mock fallback (`app/api/search/route.ts`)
- [x] Fuzzy matching, query normalization, category/evidence filtering, pagination
- [x] Postgres full-text search migration (`20260312000000_add_fulltext_search`)
- [x] Search history (auth + anonymous sessionId)

**Payments (Stripe)**

- [x] Checkout (`app/api/checkout/route.ts`)
- [x] Billing portal (`app/api/billing-portal/route.ts`)
- [x] Signed webhook handler (`app/api/webhooks/stripe/route.ts`) with event DLQ table
- [x] Subscription + trial endpoints (`app/api/subscription`, `app/api/trial/*`)
- [x] Usage limits / plan lookup (`app/api/plan`, `app/api/usage`)

**AI**

- [x] AI-enhanced search, gracefully disabled when `OPENAI_API_KEY` is absent/invalid
- [x] Interaction analysis and report generation (`lib/ai/*`)

**Other features**

- [x] Favorites, reviews, contributions (with moderation), filter preferences
- [x] Journal + insights, medication cabinet + interaction checks, health profile
- [x] Reports + data export (`app/api/reports`, `app/api/account/export`)
- [x] Admin panel (users, moderation, analytics, subscriptions, production check)
- [x] Email via Resend + React Email templates, weekly digest cron

**Infrastructure & security**

- [x] Security middleware (`proxy.ts`): per-request CSP nonce, CSRF enforcement,
      CORS allowlist, maintenance mode, HSTS in production
- [x] Rate limiting via Upstash Redis with graceful fallback (`lib/rate-limit.ts`)
- [x] Sentry (client/server/edge), structured logging, health endpoint
- [x] PWA, SEO (sitemap/robots/structured data), legal pages, dark mode
- [x] CI (`ci.yml`) runs migrations, seed, DB verification, and Playwright

---

## Remaining work

### Before production launch — configuration

The code is ready; these are environment/operational tasks. See
[docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) and
[docs/production-readiness.md](docs/production-readiness.md) for the full list.

- [ ] Provision production secrets: Clerk keys, `STRIPE_SECRET_KEY`,
      `STRIPE_WEBHOOK_SECRET`, and the four `STRIPE_*_PRICE_ID` values
- [ ] Configure Upstash Redis to activate rate limiting in production
- [ ] Configure Resend (`RESEND_API_KEY`, `EMAIL_FROM`) for transactional email
- [ ] Configure Sentry DSN + auth token for release tracking
- [ ] Run `bun run predeploy` and `bun run test:e2e` against a production-like env

### Code & repo health (from recent audit)

- [ ] `app/api/webhooks/stripe/route.ts` imports `@prisma/client` directly;
      route DB access through `lib/db/` for consistency with the rest of the app
- [ ] ESLint config ignores `scripts/**`, `e2e/**`, and `prisma/seed*.ts` —
      decide whether those should be linted
- [ ] Keep `bun.lock` in sync with `package.json` after dependency bumps

### Post-launch / nice to have

- [ ] Raise unit coverage targets and add more API integration tests
- [ ] Bundle analysis pass (`bun run analyze`)
- [ ] Internationalization
- [ ] Public API for third parties
