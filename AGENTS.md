# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, and API routes (`app/api/*`).
- `components/`: Reusable UI and feature components.
- `lib/`: Core domain logic (auth, Stripe, trials, analytics, CSRF, DB).
- `prisma/`: Prisma schema, migrations, and seed scripts.
- `__tests__/` and `e2e/`: Unit/integration tests (Vitest) and E2E tests (Playwright).
- `public/`: Static assets.
- `docs/`: Operational docs (deployment, security, production checklist).

## Build, Test, and Development Commands
- `bun run dev`: Start the Next.js dev server.
- `bun run build`: Production build.
- `bun run start`: Run the production server.
- `bun run lint`: ESLint checks.
- `bun run type-check`: TypeScript check.
- `bun run test:run`: Vitest test run.
- `bun run test:e2e`: Playwright E2E tests.
- `bun run init`: Prisma generate + migrate + seed (local setup).

## Coding Style & Naming Conventions
- TypeScript, React, and Next.js conventions.
- Formatting via `prettier`; linting via `next lint` and ESLint config.
- Use `camelCase` for variables/functions, `PascalCase` for components, `kebab-case` for URLs.
- Prefer small, single‑purpose modules in `lib/` (see existing domain splits).

## Testing Guidelines
- Unit/integration: Vitest in `__tests__/` (e.g., `lib/__tests__/csrf.test.ts`).
- E2E: Playwright in `e2e/` (e.g., `e2e/search.spec.ts`).
- Naming: `*.test.ts` for unit, `*.spec.ts` for E2E.

## Commit & Pull Request Guidelines
- Commit style follows Conventional Commits (`feat:`, `fix:`, `refactor:`, `build(deps):`, `chore:`).
- PRs should include: summary, testing notes, and screenshots for UI changes.
- Link issues when applicable.

## Security & Configuration Tips
- Required env vars are documented in `.env.example` and `docs/PRODUCTION_CHECKLIST.md`.
- CSRF is enforced on state‑changing API routes; use `fetchWithCSRF` for POST/PUT/DELETE.
- Stripe webhooks are signed; do not add CSRF headers there.
