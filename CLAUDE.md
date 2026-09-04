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
- **`.env.local` points `DATABASE_URL` at the production Neon database.** So
  `bun run init` — which runs `prisma migrate dev` — offers to reset production
  when it finds migration drift. Export the local URL before any
  Prisma command that writes:
  `export DATABASE_URL="postgresql://remedi:remedi_dev@localhost:5433/remedi?schema=public"`
- **Re-run `format:write` on a release PR immediately before merging it, not
  when it opens.** release-please rewrites CHANGELOG.md whenever another PR
  merges while the release PR is open, which silently discards an earlier
  formatting fix. `format:check` globs root `*.md`, so the regenerated file
  fails main's own gate and blocks every PR behind it. Fixed three times now: #76,
  then twice for 1.2.0.

## Agent skills

### Issue tracker

Issues live as GitHub issues in `gr8monk3ys/remedi`, driven by the `gh` CLI.
See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` at the repo root, ADRs in `docs/adr/`.
See `docs/agents/domain.md`.
