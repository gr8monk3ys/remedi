# CLAUDE.md

Remedi: Next.js 16 (App Router, React 19, TypeScript strict) app that maps
pharmaceuticals to natural remedies. Bun, Prisma 7 + PostgreSQL, Tailwind 4,
Clerk auth, Stripe, Resend, OpenAI (optional), Sentry. Live at
https://remedi-iota.vercel.app.

## Run

    docker-compose up -d postgres        # Postgres on localhost:5433
    cp .env.example .env
    bun install && bun run init          # prisma generate + migrate + seed
    bun run dev                          # http://localhost:3000

## Check (all of these gate CI, `.github/workflows/ci.yml`)

    bun run format:check && bun run lint && bun run type-check && bun run knip
    bun run test:run                     # vitest, __tests__/
    bun run test:e2e                     # playwright, e2e/ (needs DB)
    bun run db:verify && bun run db:integrity && bun run prod:check

## Where things live

- `app/api/search/route.ts` — search: DB first, then OpenFDA (`lib/openFDA.ts`), cached back to DB.
- `lib/remedy-matcher.ts` — token-overlap scoring; `MIN_DISPLAY_SIMILARITY` hides weak mappings.
- `prisma/seed-data/` — curated drugs, remedies, mappings. Safety rules for the
  mappings are enforced by `__tests__/seed-data/mappings.test.ts`: no
  "Alternative" label for rescue/opioid/seizure/antibiotic/incretin/contraceptive
  drugs, anticoagulants deliberately unmapped, no magnesium beside ciprofloxacin.
- `lib/db/` — all Prisma access. `lib/validations/` — Zod schemas for route input.
- `lib/api/response.ts` — every route returns `{ success, data | error }`.
- `proxy.ts` — Next middleware: CSP, CORS, auth-protected paths.
- `components/interactions/` — interaction checker; an API failure must render
  as an error, never as "no known interactions".

## Gotchas

- `type-check` and `knip` need a `DATABASE_URL` only to run `prisma generate`; the scripts default one.
- `release-please` publishes from `main`; CHANGELOG.md is generated, don't hand-edit.
- Husky pre-commit runs lint-staged and `type-check`.
