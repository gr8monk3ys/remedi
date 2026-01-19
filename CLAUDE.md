# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Remedi is a Next.js 15 web application that helps users find natural alternatives to pharmaceutical drugs. It integrates with the OpenFDA API and uses a three-tier search strategy: Database → OpenFDA API → Mock fallback.

## Development Commands

```bash
npm run dev              # Start dev server at http://localhost:3000
npm run build            # Production build
npm run lint             # ESLint
npm run test             # Unit tests (Vitest)
npm run test:run         # Unit tests single run
npm run test:e2e         # E2E tests (Playwright)
npm run test:e2e:ui      # E2E tests with UI
npm run type-check       # TypeScript type checking
```

### Database Commands

```bash
npx prisma generate                      # Generate client after schema changes
npx prisma migrate dev --name <name>     # Create migration
npx prisma studio                        # Visual database editor
npm run prisma db seed                   # Seed with sample data
```

### Data Import

```bash
npm run import:fda           # Import from OpenFDA API
npm run import:fda:dry       # Dry run (preview only)
npm run import:fda:quick     # Import 50 items
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 App Router with React 18
- **Language**: TypeScript (strict mode)
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Styling**: TailwindCSS 4
- **Auth**: NextAuth.js v5 with Google/GitHub OAuth
- **AI**: OpenAI GPT-4 for remedy matching
- **Validation**: Zod schemas
- **Testing**: Vitest (unit) + Playwright (E2E)

### Database Schema (prisma/schema.prisma)

Three core models:
- **Pharmaceutical**: FDA drugs with ingredients, warnings, interactions
- **NaturalRemedy**: Natural alternatives with evidence levels, dosage, precautions
- **NaturalRemedyMapping**: Many-to-many with similarity scores

Array fields are JSON strings (SQLite compatibility) - parsed in lib/db.ts.

### API Routes (app/api/)

| Route | Description |
|-------|-------------|
| `/api/search?query=<drug>` | Main search endpoint, returns natural remedies |
| `/api/remedy/[id]` | Remedy details |
| `/api/ai-search` | AI-powered search with NLP |
| `/api/auth/[...nextauth]` | NextAuth.js handlers |
| `/api/favorites` | CRUD for user favorites |
| `/api/search-history` | Search history tracking |
| `/api/filter-preferences` | Saved filter state |

### Key Library Modules (lib/)

- **openFDA.ts**: FDA API integration with `searchFdaDrugs()` and `getFdaDrugById()`
- **remedyMapping.ts**: Maps pharmaceuticals to remedies using `INGREDIENT_MAPPINGS` and `CATEGORY_MAPPINGS`
- **fuzzy-search.ts**: Levenshtein distance matching for typo tolerance
- **ai-matching.ts**: GPT-4 powered matching with intent detection
- **db.ts**: Prisma client and JSON parsing utilities
- **validations/**: Zod schemas for API input validation

### Search Flow

1. Query normalized (lowercase, suffix removal, spelling correction)
2. Database search for cached pharmaceuticals
3. If not found, query OpenFDA API and cache results
4. Map to natural remedies using similarity scoring
5. Return sorted by relevance

### Component Structure

- `components/ui/` - Reusable UI components (search, filter, pagination, skeletons)
- `components/search/` - Search feature components (split from monolithic search.tsx)
- `components/remedy/` - Remedy detail components
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
- `DATABASE_URL` - Prisma connection string
- `OPENAI_API_KEY` - For AI features
- `OPENFDA_API_KEY` - Higher rate limits (240/min vs 40/min)
- `NEXTAUTH_SECRET` - Auth encryption
- `GOOGLE_CLIENT_ID/SECRET` - OAuth
- `GITHUB_CLIENT_ID/SECRET` - OAuth

## Code Patterns

### JSON Field Handling
SQLite stores arrays as JSON strings. Always use lib/db.ts utilities:
```typescript
const ingredients = JSON.parse(remedy.ingredients || '[]');
```

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

### Unit Tests (__tests__/)
```bash
npm run test                    # Watch mode
npm run test:run                # Single run
npm run test -- fuzzy-search    # Run specific test file
```

### E2E Tests (e2e/)
```bash
npm run test:e2e               # Headless
npm run test:e2e:ui            # Interactive UI
npm run test:e2e:headed        # With browser visible
npx playwright test -g "search" # Run tests matching pattern
```

## Key Files

- `app/api/search/route.ts` - Main search logic
- `lib/openFDA.ts` - FDA API with retry/error handling
- `lib/remedyMapping.ts` - Remedy matching algorithm
- `prisma/schema.prisma` - Database schema
- `middleware.ts` - Security headers, CORS, auth protection
- `next.config.ts` - Webpack optimization, image config

## Disclaimer

This application is for informational purposes only. Users should consult healthcare professionals before making medication changes.
