# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Remedi is a Next.js 16 web application that helps users find natural alternatives to pharmaceutical drugs. It integrates with the OpenFDA API and uses a three-tier search strategy: Database → OpenFDA API → Mock fallback.

## Development Commands

```bash
bun run dev              # Start dev server at http://localhost:3000
bun run build            # Production build
bun run lint             # ESLint
bun run test             # Unit tests (Vitest)
bun run test:run         # Unit tests single run
bun run test:e2e         # E2E tests (Playwright)
bun run test:e2e:ui      # E2E tests with UI
bun run type-check       # TypeScript type checking
```

### Database Commands

```bash
bunx prisma generate                      # Generate client after schema changes
bunx prisma migrate dev --name <name>     # Create migration
bunx prisma studio                        # Visual database editor
bunx prisma db seed                       # Seed with sample data
```

### Data Import

```bash
bun run import:fda           # Import from OpenFDA API
bun run import:fda:dry       # Dry run (preview only)
bun run import:fda:quick     # Import 50 items
```

## Architecture

### Tech Stack

- **Framework**: Next.js 16 App Router (Turbopack) with React 19
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun
- **Database**: Prisma ORM + PostgreSQL
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Auth**: Clerk
- **AI**: OpenAI GPT-4 for remedy matching
- **Email**: Resend + React Email
- **Payments**: Stripe
- **Validation**: Zod schemas
- **Testing**: Vitest (unit) + Playwright (E2E)

### Database Schema (prisma/schema.prisma)

Core models:

- **Pharmaceutical**: FDA drugs with ingredients, warnings, interactions
- **NaturalRemedy**: Natural alternatives with evidence levels, dosage, precautions
- **NaturalRemedyMapping**: Many-to-many with similarity scores
- **DrugInteraction**: Drug-supplement interaction safety data
- **User**: Clerk-authenticated users with roles and subscriptions
- **RemedyContribution**: User-submitted remedies pending moderation
- **RemedyReview**: User ratings and reviews

Array fields use native PostgreSQL arrays (`String[]`).

### API Routes (app/api/)

| Route                        | Description                                    |
| ---------------------------- | ---------------------------------------------- |
| `/api/search?query=<drug>`   | Main search endpoint, returns natural remedies |
| `/api/remedy/[id]`           | Remedy details                                 |
| `/api/ai-search`             | AI-powered search with NLP                     |
| `/api/interactions`          | Drug interaction safety checker                |
| `/api/interactions/check`    | Multi-substance pairwise interaction check     |
| `/api/favorites`             | CRUD for user favorites                        |
| `/api/contributions`         | User remedy contributions                      |
| `/api/email-preferences`     | Email notification preferences                 |
| `/api/admin/moderation/[id]` | Admin moderation actions                       |
| `/api/admin/users/[id]`      | Admin user management                          |
| `/api/webhooks/clerk`        | Clerk auth webhooks                            |
| `/api/webhooks/stripe`       | Stripe payment webhooks                        |

### Key Library Modules (lib/)

- **openFDA.ts**: FDA API integration with `searchFdaDrugs()` and `getFdaDrugById()`
- **remedyMapping.ts**: Maps pharmaceuticals to remedies using `INGREDIENT_MAPPINGS` and `CATEGORY_MAPPINGS`
- **fuzzy-search.ts**: Levenshtein distance matching for typo tolerance
- **ai-matching.ts**: GPT-4 powered matching with intent detection
- **db/**: Prisma client, domain operations (pharmaceuticals, remedies, interactions, favorites, etc.)
- **email/**: Resend email service with React Email templates
- **validations/**: Zod schemas for API input validation
- **rate-limit.ts**: Upstash Redis rate limiting

### Search Flow

1. Query normalized (lowercase, suffix removal, spelling correction)
2. Database search for cached pharmaceuticals
3. If not found, query OpenFDA API and cache results
4. Map to natural remedies using similarity scoring
5. Return sorted by relevance

### Component Structure

- `components/ui/` - shadcn/ui components + custom UI (search, filter, pagination)
- `components/search/` - Search feature components
- `components/remedy/` - Remedy detail components
- `components/interactions/` - Drug interaction checker and warnings
- `components/home/` - Homepage sections (search, favorites, onboarding)
- `components/auth/` - Authentication components
- `components/providers.tsx` - App-wide context providers

### API Response Pattern

All APIs use standardized `ApiResponse<T>` type (lib/api/response.ts):

```typescript
{ success: true, data: T, metadata?: { page, total, ... } }
{ success: false, error: { code, message, statusCode } }
```

### Environment Variables

See `.env.example` for all variables. Key ones:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth (required in prod)
- `CLERK_SECRET_KEY` - Clerk auth (required in prod)
- `OPENAI_API_KEY` - For AI features
- `OPENFDA_API_KEY` - Higher rate limits (240/min vs 40/min)
- `STRIPE_SECRET_KEY` - Payment processing
- `RESEND_API_KEY` - Email notifications

## Code Patterns

### Validation

API routes validate input with Zod before processing:

```typescript
const parsed = searchQuerySchema.safeParse({ query });
if (!parsed.success) return errorResponse(400, parsed.error);
```

### Pre-commit Hooks

Husky runs lint-staged on commit:

- ESLint fix for TS/TSX files
- Related Vitest tests
- Prettier formatting

## Testing

### Unit Tests (**tests**/)

```bash
bun run test                    # Watch mode
bun run test:run                # Single run
bun run test -- fuzzy-search    # Run specific test file
```

### E2E Tests (e2e/)

```bash
bun run test:e2e               # Headless
bun run test:e2e:ui            # Interactive UI
bun run test:e2e:headed        # With browser visible
bunx playwright test -g "search" # Run tests matching pattern
```

## Key Files

- `app/api/search/route.ts` - Main search logic
- `lib/openFDA.ts` - FDA API with retry/error handling
- `lib/remedyMapping.ts` - Remedy matching algorithm
- `prisma/schema.prisma` - Database schema
- `middleware.ts` - Security headers, CORS, auth protection
- `next.config.ts` - Turbopack configuration, image config

## Disclaimer

This application is for informational purposes only. Users should consult healthcare professionals before making medication changes.
