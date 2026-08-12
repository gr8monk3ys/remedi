# Remedi — Code Quality & Deep-Dive Audit

**Date:** 2026-08-12
**Scope:** Whole repository — core search flow, remedy detail, auth/billing/security, client↔API contracts, UI/UX, dead code / AI slop, docs vs. reality.
**Method:** Static reading of every source module, plus a **live run** against a real seeded Postgres 16 database (migrate → seed → dev server) with smoke tests of the API and pages, plus a full production `next build`. Every headline finding below was verified by reading the code and, where possible, reproduced at runtime.

> ## Status: remediated
>
> This document is kept as the **record of what was found**. The findings below
> have since been fixed in this branch — see `docs/AUDIT_REMEDIATION.md` for what
> changed, how each fix was verified, and the two judgement calls worth review.
>
> The severities and descriptions below describe the code **as it was audited**,
> not as it stands now.

---

## TL;DR

The **engineering scaffolding is genuinely strong** and the **core is coherent**: all quality gates pass on a clean checkout — lint, `tsc --strict`, Prettier, **1214 unit tests across 69 files**, knip, and a clean production build. Search → DB → OpenFDA → mock fallback works, CSRF is really enforced, webhook signatures are verified, and — importantly for a health app — **fabricated "mock" remedy data is correctly gated out of production** by default.

The problems are **not** in the plumbing; they are in **feature wiring and content**:

- A **safety-critical bug**: when the interactions API errors (rate limit / DB blip), the remedy page tells the user **"No known drug interactions found"** — a system failure rendered as a medical all-clear.
- A cluster of **silently broken features** (dead upgrade button, related-remedy 404s, clear-history always fails, anonymous users can't un-favorite, broken account-deletion link).
- **Fabricated trust content** on a health product (invented testimonials incl. a fake "Naturopath", "thousands of users").
- **Dark mode is broken** (split theme system + invisible white-on-white CTAs).
- ~**3,300 lines of dead "AI-slop"** kept alive by their own tests, plus a **README that contradicts the code and the LICENSE**.

None of this blocks a build or a test run — which is exactly why it survived. The fixes are mostly small and local.

### Scorecard

| Area                             | Grade  | Notes                                                     |
| -------------------------------- | ------ | --------------------------------------------------------- |
| Build / type / lint / test gates | **A**  | All green; 1214 tests; clean prod build                   |
| Core search + DB layer           | **B+** | Solid; FDA query precision + auto-persist floor need work |
| Security (auth/CSRF/webhooks)    | **B**  | Real protections; rate-limit bypass + cron auth gap       |
| Client↔API contracts             | **C**  | 6 broken contracts causing dead features                  |
| UI/UX & accessibility            | **C**  | Dark mode broken, keyboard gaps, fake content             |
| Dead code / AI slop              | **C‑** | ~3,300 dead lines; knip configured not to see them        |
| Docs accuracy                    | **D**  | README contradicts code **and** the license               |

---

## How to read this

Findings are tagged with a verification level:

- **✓ Runtime** — reproduced against the running app / live DB.
- **✓ Code** — confirmed by reading the exact code paths (file:line).
- **⚠ Reported** — surfaced by deep static analysis, code-plausible, not runtime-reproduced here.

---

## CRITICAL

### C1 — Interaction-API failures are shown to users as a safety "all-clear" ✓ Code

**`components/interactions/InteractionWarnings.tsx:170-245`**

The fetch handler only ever does `if (data.success && data.data) setInteractions(...)`. The `error` state is set **only when `fetch` itself throws**. So when the API returns a JSON error envelope — a `429` rate-limit or a `500` DB error, both of which return `{ success: false }` with a parseable body — **neither** branch runs, `loading` clears, and the component falls through to its empty-state render:

> 🛡️ **"No known drug interactions found for {remedy} in our database."**

**Failure scenario:** Postgres has a brief blip, or the user trips the interactions rate limit, while viewing St. John's Wort (which has severe, documented interactions with SSRIs and warfarin). The page affirmatively tells them there are none. On a health-information product, a transient failure is converted into fabricated medical reassurance.

**Fix:** Treat `!response.ok || data.success !== true` as an error and render a neutral "Couldn't verify interactions — consult your provider" card, never the green "none found" copy, unless the request genuinely succeeded.

---

## HIGH — Broken features

### H1 — Interaction warnings never load for logged-out users on the public remedy page ✓ Runtime + Code

**`proxy.ts:20-52`, `components/interactions/InteractionWarnings.tsx:175-177`, rendered at `app/remedy/[id]/RemedyContent.tsx:104`**

The remedy page (`/remedy/*`) is public, but the endpoint the warnings panel calls — `GET /api/interactions?substance=` — is **not** in the middleware's public-route list (only `/api/interactions/check` is). For an anonymous visitor, Clerk's `authObj.protect()` blocks the request; `response.json()` throws → `error = true` → `if (error) return null` → **the entire Interaction Warnings section silently disappears**. Combined with C1, the safety feature is effectively off for the whole logged-out audience. CI never caught it because the E2E suite only mocks `/api/interactions/check`.

**Verified:** live, the single-substance endpoint returned a middleware error for anonymous requests while `/check` worked.
**Fix:** add `"/api/interactions(.*)"` to `isPublicRoute` (it already rate-limits and Zod-validates), or fetch interactions server-side in the page.

### H2 — Every "Related Remedies" link 404s ✓ Runtime

**`lib/db/remedies.ts:153-165` (`toDetailedRemedy`), `app/remedy/[id]/RemedyContent.tsx:168-178`**

`NaturalRemedy.relatedRemedies` stores remedy **names**; `toDetailedRemedy` maps each name into `{ id: name, name }`; the sidebar then links to `/remedy/${related.id}` → e.g. `/remedy/Sunlight Exposure`. The page loader rejects non-UUIDs and returns `notFound()`.

**Verified:** live, `/remedy/Ashwagandha`, `/remedy/Cordyceps`, `/remedy/Turkey Tail` all render the **"Remedy Not Found"** page. This breaks the primary in-page navigation for **100% of seeded DB remedies** that have related entries.
**Fix:** resolve names → IDs at read time (one `findMany({ where: { name: { in: names } } })`), or store UUIDs at seed time.

### H3 — The "Upgrade" button in the paywall modal never starts checkout ✓ Code

**`components/upgrade/UpgradeModal.tsx:93-101`, `lib/stripe-config.ts:106-171`**

`handleUpgrade` guards with `if (!("monthlyPriceId" in planConfig)) return;`. `PLANS` has **no `monthlyPriceId`** on any plan (a comment at `:106` states price IDs are server-only). The guard is therefore always true and the checkout POST is **never sent** — the button spins briefly and does nothing. (Compounding: `FeatureGate`/`UpgradeModal`/`TrialBanner` aren't mounted anywhere in the live tree, so free users who hit limits get raw error toasts with no upgrade path at all.)
**Fix:** post `{ plan, interval }` (the shape `/api/checkout` already accepts) and mount the gate at the limit touchpoints — or delete the subsystem and stop advertising gated tiers.

### H4 — "Clear All" search history always fails ✓ Code

**`app/dashboard/history/history-client.tsx:82-84`**

Uses a plain `fetch(..., { method: "DELETE" })` with **no `x-csrf-token` header**. The CSRF middleware 403s every state-changing `/api/*` call lacking the header (verified live: POST without a token → `403 CSRF_VALIDATION_FAILED`). Every other mutation uses `fetchWithCSRF`/`apiClient`; this one was missed → 100% reproducible "Failed to clear history."
**Fix:** use `fetchWithCSRF`/`apiClient`.

### H5 — Anonymous users can favorite but never un-favorite ✓ Code

**`hooks/queries/use-favorites-query.ts:78` (and the dead twin `hooks/use-favorites.ts:141`)**

The remove path calls `DELETE /api/favorites?id=<id>` **without** the `sessionId` query param, though `sessionId` is in scope. For session-owned (anonymous) favorites, `verifyResourceOwnership` requires it → `401`. Add works (sessionId is in the POST body); remove never does. Signed-out users on public pages get a filled heart they can't clear.
**Fix:** append `&sessionId=` on the delete for anonymous users.

### H6 — "Delete Account" and "Manage Profile" links 404 (broken data-deletion flow) ✓ Runtime

**`app/dashboard/settings/settings-client.tsx:181, 331`**

Both link to `/user-profile`, which **does not exist** (verified: no `app/user-profile/` route). The Danger-Zone "Delete Account" action — the product's only account-deletion path — 404s, while the FAQ (`app/faq/page.tsx:89`) explicitly promises "You can delete your account and all associated data at any time." This is a GDPR/data-deletion gap, not just a UX nit.
**Fix:** add `app/user-profile/[[...user-profile]]/page.tsx` rendering Clerk's `<UserProfile/>`, or use `openUserProfile()`.

### H7 — Fabricated testimonials (incl. a fake "Naturopath") on a health product ✓ Code

**`app/pricing/page.tsx:381-400`**

Hardcoded invented endorsements: _"Sarah M., Health Enthusiast"_, _"David L., Naturopath — the Premium plan is absolutely worth it"_, _"Emily R., Wellness Blogger"_, plus _"Join thousands of users…"_ (`:237`) — contradicted by the landing page's own "Launching Early Access" badge. Fake practitioner endorsement of a medical-adjacent purchase is a real trust/compliance risk.
**Fix:** remove until real testimonials exist (the app has a real `RemedyReview` system that could feed them later).

### H8 — Cookie-consent "Decline" is cosmetic (GDPR) ✓ Code

**`components/CookieConsent.tsx:22-25`, `components/analytics.tsx:65-86`**

Nothing reads the stored `cookie-consent` value (grep-clean). Google Analytics (cookie-setting) and Plausible load unconditionally when configured, so "Decline" changes nothing while the banner says "By accepting, you consent…".
**Fix:** gate the GA `<Script>` on consent, or drop GA and keep cookieless Plausible (then the banner can go).

### H9 — OpenFDA search is unfielded; the first hit is trusted and permanently cached ⚠ Reported

**`lib/openFDA.ts:110-113`, `app/api/search/route.ts:203-233`**

The query is sent as `search=<query>` with **no field qualifier and no quoting**, so it matches against every label field (warnings, interactions, inactive ingredients…) with OR semantics; `drugResults[0]` is then taken as "the drug", **upserted into the DB**, and mapped to remedies. A mis-hit (e.g. "tylenol extra strength" matching an "Extra Strength Gas Relief" label) becomes the sticky database-first answer for all future searches.
**Fix:** field+quote the query (`openfda.brand_name:"…" + openfda.generic_name:"…"`) and verify the returned name actually matches before caching.

### H10 — Rate limiting is bypassable via `X-Forwarded-For` spoofing ✓ Code

**`lib/rate-limit.ts:245-255`**

The client identifier is the **left-most** `x-forwarded-for` entry (`forwardedFor?.split(",")[0]`), which is attacker-controlled. Rotating that header gives every request a fresh bucket, defeating all per-IP limits (auth brute-force, checkout/trial abuse caps, and DoS/cost controls on `/api/search`, `/api/interactions/check`, `/api/ai-search`). On Vercel the trustworthy IP is the **right-most** hop / `x-real-ip`, never index `[0]`.
**Fix:** derive the client IP from the platform's trusted hop; don't collapse missing IPs into one shared `"anonymous"` bucket.

### H11 — The weekly-digest cron never runs, and its `CRON_SECRET` check is dead code ✓ Code

**`proxy.ts:20-52`, `app/api/cron/weekly-digest/route.ts:44-56`, `vercel.json`**

`/api/cron/*` is **not** in `isPublicRoute`, so the unauthenticated Vercel Cron request hits `authObj.protect()` and is rejected **before** the handler runs — the in-route `Authorization: Bearer $CRON_SECRET` check is never reached. Net effect: (a) the digest job doesn't run in production, and (b) the secret check is security theater. Also, when `CRON_SECRET` is unset the route only 503s **in production** — in any other env an unset secret means no auth at all.
**Fix:** add `/api/cron/(.*)` to `isPublicRoute` **and** make the secret comparison mandatory (constant-time) in every environment.

---

## HIGH — UI/UX & accessibility

### H12 — Dark mode is broken two ways ⚠ Reported (code)

**`app/globals.css:98-133` vs `:664-696`, plus ~21 `bg-primary text-white` call sites**

1. **Split-brain theme.** Custom tokens (`--surface`, `--primary-*`, `--evidence-*`) are redefined only under `@media (prefers-color-scheme: dark)`, but shadcn tokens are redefined only under `.dark` (next-themes toggles the class). The two mechanisms disagree, so a user whose in-app choice differs from their OS gets dark cards on a light page gradient (or vice-versa).
2. **Invisible CTAs.** In `.dark`, `--primary` is near-white, so the many `bg-primary text-white` buttons (pricing, compare, tutorial "Next", review/contribution submit, history, subscription, PWA prompt…) render as blank white pills with invisible labels (~1.2:1 contrast).

**Fix:** move the media-query token values into `.dark`, pick one green `--primary` with a correct `--primary-foreground`, and replace `text-white` with `text-primary-foreground` on `bg-primary` buttons.

### H13 — Search result cards aren't keyboard-operable ⚠ Reported (code)

**`components/search/SearchResultCard.tsx:51-57`**

The card's open action is `onClick` on a `<div>` — no `role`, `tabIndex`, key handler, or `<Link>`. Keyboard/screen-reader users can favorite and compare a result but **cannot open it**; the core search→detail flow is mouse-only.
**Fix:** wrap the title in a `next/link` to `/remedy/[id]`.

### H14 — Search-as-you-type race conditions ⚠ Reported (code)

**`components/search/index.tsx:247-386`, `SearchInput.tsx:76-85`**

`handleSearch` has no `AbortController` or request-sequence guard, and every response calls `setResults()` unconditionally, so a slow earlier request can clobber newer results. Separately, `handleSuggestionClick` does `setQuery(x); setTimeout(onSearch, 100)` where `onSearch` closes over the **old** query — clicking a suggestion fires two racing searches.
**Fix:** AbortController (or monotonic request-id) before `setResults`; call `handleSearch(suggestion)` directly.

### H15 — The upgrade/paywall subsystem is dead code ⚠ Reported (code)

`FeatureGate` (and thus `UpgradeModal`) is mounted **nowhere**; `TrialBanner`/`TrialBadge` are imported only by tests. The pricing table advertises gating the UI doesn't enforce (e.g. "Compare remedies: free ✗" while `CompareContext` gives everyone 4 slots). Either wire it up (see H3) or delete it and stop promising tiers.

---

## MEDIUM (selected — full list in the appendix)

- **M1 — Five conflicting evidence-level color systems.** `components/remedy/EvidenceBadge.tsx` (amber=Limited) vs `components/compare/*` (case-sensitive; Traditional=purple) vs `MobileComparisonSwiper` inline vs `reports/ReportViewer.tsx` (**amber=Moderate** — the color that means "Limited" elsewhere) vs `app/about/page.tsx`. For a product whose value is communicating evidence strength, the same remedy shows different colors on different screens. Consolidate on the remedy component. ✓ Code
- **M2 — Admin "Set as Moderator" is rejected by the API.** UI offers it (`components/admin/UserTable.tsx:218`) but `updateUserSchema` is `z.enum(["user","admin"])` (`app/api/admin/users/[id]/route.ts:18`) → 400, no error shown. ✓ Code
- **M3 — Contribution references: "URL (optional)" fails when empty.** Client submits `{ title, url: "" }`; Zod `.url()` rejects `""` → 400 "Must be a valid URL" despite the label. `useContributionForm.ts:123` / `app/api/contributions/route.ts:51`. ✓ Code
- **M4 — Admin "Run checks" (production-check) POSTs without CSRF** → always 403. `app/admin/production/production-check.tsx:21`. ✓ Code
- **M5 — Auto-persisted remedy mappings, 0.12 similarity floor, no read-side floor**, and a high-risk-drug safety guard that reads only name/category (never the FDA `warnings`/`interactions` text), so e.g. warfarin isn't forced to "Supportive". Weak matches get cached and served as ranked "alternatives". `lib/db/remedies.ts:102-148`, `lib/remedy-matcher.ts:131-159`. ⚠ Reported
- **M6 — AI search only considers the 50 most-recently-created remedies** (`take:50, orderBy:{createdAt:'desc'}`) out of ~500, and parses GPT output with `JSON.parse` and no JSON-mode/Zod, so fenced output silently yields "no results". `lib/ai/matching.ts:86-126`, `lib/ai/nlp.ts:43`, `lib/ai/interactions.ts:65`. ⚠ Reported
- **M7 — Demo/mock search results 404 on click in dev.** The fallback returns remedy IDs 101–110 but detail data exists only for 101–104; related links inside the mock set are mislabeled. Dev/demo-only. `lib/mock-data.ts` vs `app/remedy/[id]/mockRemedies.ts`. ⚠ Reported
- **M8 — Moderators can read all-user PII/billing** via `/admin/users` and `/admin/subscriptions` (layout admits `isModerator`, pages don't re-check `isAdmin`), even though the mutation APIs correctly require admin. `app/admin/layout.tsx:20`, `app/admin/users/page.tsx`, `app/admin/subscriptions/page.tsx`. ⚠ Reported
- **M9 — Double `<Header/>` on legal pages.** `app/layout.tsx:151` renders it globally; each `app/legal/*/page.tsx` renders another → two stacked headers. ✓ Code
- **M10 — Orphan pages shipping internal copy.** `/landing` (unlinked duplicate homepage with growth-strategy copy: "the decisions that lead to upgrades") and `/auth/error` (NextAuth relic in a Clerk app). Delete or wire up. ✓ Code
- **M11 — WelcomeModal hijacks global Enter/arrow keys** (no target check), double-firing with input handlers; hand-rolled modals across the app lack dialog semantics/focus trap (Radix Dialog is already available). `components/onboarding/WelcomeModal.tsx:152-165`. ⚠ Reported
- **M12 — Admin panel has no mobile layout** (fixed `w-64` sidebar always rendered); the global fixed header overlaps dashboard/admin chrome and produces two hamburgers on mobile dashboard. `components/admin/AdminSidebar.tsx:77`. ⚠ Reported

---

## AI slop / dead code (~3,300 lines) ✓ Code

The core is coherent; the slop is concentrated in **abandoned twins kept alive by their own tests** plus ignore-list config that hides them.

| Item                                                                     | Evidence                                                                                                                                                              | Action                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `lib/remedyMapping.ts` + its 466-line test                               | **Dead twin** of the live `lib/remedy-matcher.ts`; only its own test imports it; ships a broken 3-entry inline "DB". **CLAUDE.md & README name it as _the_ matcher.** | Delete (685 lines); fix docs to point at `remedy-matcher.ts` |
| `hooks/use-favorites.ts` + its 545-line test                             | Dead twin of `use-favorites-query.ts`; only its test imports it                                                                                                       | Delete (710 lines)                                           |
| `lib/accessibility.ts`                                                   | 249 lines, **0 importers**; explicitly hidden in `knip.json` ignore list                                                                                              | Delete                                                       |
| `lib/fetch-with-csrf.ts`                                                 | 3rd CSRF-fetch copy, **1 importer**; `postWithCSRF` has 0 consumers; comments reference `lib/fetch-with-retry.ts` **which doesn't exist**                             | Delete, repoint the one import                               |
| `prisma/dev.db` (352 KB SQLite binary) + `prisma/seed*.js` (1,038 lines) | Git-tracked in a Postgres-only project; superseded by `prisma/seed.ts`                                                                                                | Remove from VCS                                              |
| Dead exports                                                             | `lib/constants.ts` (17/19 groups), `lib/types.ts` (~10/22), `lib/validations/api.ts` (5), `lib/email` (2 senders + 2 templates), `lib/db` barrel (5)                  | Prune                                                        |
| `public/*.svg`                                                           | All five create-next-app template SVGs, 0 references                                                                                                                  | Delete                                                       |
| Re-export shims                                                          | `components/ui/search.tsx`, `lib/ai-matching.ts`, moderation/contribution shims                                                                                       | Collapse (optional)                                          |

**Root cause — the dead-code checker is configured not to look.** `knip.json` sets `"exports": "off"`, `"types": "off"`, `"duplicates": "off"` and ignores several dead files, so CI passes green over all of the above. Re-arming knip (and un-ignoring the dead files) is the single highest-leverage cleanup: it turns this list into an automatically-enforced one.

Also clean, for the record: **no** TODO/FIXME/lorem/"coming soon" in production code; **no** stray `console.log` (everything routes through `lib/logger.ts`); no "as the user requested" narration comments.

---

## Docs vs. reality ✓ Code

The `README.md` actively misleads:

- **License contradiction (legally significant):** README:361 says **MIT**; the `LICENSE` file is **GNU GPL v3**.
- Lists files that don't exist (`components/ui/aurora-background.tsx`, `hooks/use-local-storage.ts`, `COMPLETED_TASKS.md`).
- "Roadmap" lists Vitest, authentication, and AI matching as **future work** — all three shipped.
- Claims favorites/history are **localStorage** (both are DB-backed) and documents `prisma/dev.db` (SQLite) in a Postgres app.
- API examples show a bare-array response and `/api/remedy/turmeric` slugs — the real API uses the `{success,data}` envelope and UUID/numeric IDs.

`CLAUDE.md` is mostly accurate but names the dead `lib/remedyMapping.ts` as the matcher (twice) and says "GPT-4" (actual: `gpt-4-turbo-preview` + `gpt-4o-mini`). `docs/TODO.md` is genuinely good and current.

---

## What's genuinely well done

- **Quality gates**: lint, `tsc --strict`, Prettier, **1214 tests / 69 files**, knip, and a clean production build all pass on a fresh checkout.
- **Production safety of mock data**: `isDemoDataEnabled()` is off in production unless `DEMO_MODE=true`, with an explicit `DEMO_MODE=false` kill switch. Prod search returns an empty `source:"none"` result rather than fabricated remedies. This is the right call for a health app and it's implemented consistently across all five fallback sites.
- **CSRF is real** (not theater): double-submit, timing-safe compare, `sameSite:strict`, enforced in middleware for every state-changing `/api/*` except signed webhooks. Verified live (403 without token; 200 with).
- **Webhook signature verification** (Stripe `constructEvent`, Clerk svix) rejects bad signatures before any DB write; **admin mutation APIs** all re-check `isAdmin` server-side against the DB role.
- **OpenFDA transport**: timeout, retry/backoff, a real circuit breaker (`lib/circuit-breaker.ts`, 5 live consumers), and deliberate degrade-to-empty.
- **Resilience & a11y baseline**: Clerk wrapped in error boundaries with a no-auth fallback; near-complete `loading.tsx`/`error.tsx` coverage with shape-matched skeletons; skip-to-content link, `prefers-reduced-motion` kill switch, labeled forms, and the remedy `EvidenceBadge` (tooltip + composed `aria-label`) is a model component.
- **The compare feature** (URL-shareable state, plan-cap trimming with a notice, print styles, mobile swiper, empty state) is the most coherent end-to-end flow in the app.
- **Tables** are uniformly wrapped in `overflow-x-auto`.

---

## Prioritized remediation plan

**P0 — safety & data-integrity (do first; all small):**

1. C1 — interaction-API failure must not render "no interactions found."
2. H1 — make `/api/interactions` public (or fetch server-side) so warnings load for everyone.
3. H2 — resolve related-remedy names → IDs so the links stop 404-ing.
4. H6 — restore the account-deletion / profile route.

**P1 — broken revenue & core flows:** 5. H3/H15 — make the upgrade button post `{plan,interval}` and mount the paywall (or delete it). 6. H4, H5, M2, M3, M4 — the CSRF/param/enum contract breaks (each is a 1–3 line fix). 7. H10, H11 — rate-limit identifier + cron auth.

**P2 — trust, UX, correctness:** 8. H7, H8 — remove fabricated testimonials; make cookie-consent actually gate GA. 9. H12, H13, H14, M1 — dark mode, keyboard-open on result cards, search race guard, unify evidence colors. 10. H9, M5, M6 — FDA query precision, mapping floors + safety-guard text, AI JSON-mode/Zod + candidate selection.

**P3 — hygiene (mostly deletions):** 11. Re-arm `knip.json`, then delete the dead twins/exports/binaries (~3,300 lines + 352 KB). 12. Fix `README.md` (license first) and the `CLAUDE.md` matcher reference. 13. M9 double header, M10 orphan pages, M12 admin mobile.

Most P0/P1 items are a handful of lines each. The largest single change is the theme-system unification (H12), which is still contained to `globals.css` plus a mechanical `text-white → text-primary-foreground` sweep.

---

## Appendix — verification log

Run locally against a real seeded Postgres 16 (not mocks):

- `bun run lint` ✓ · `bun run type-check` ✓ · `bun run format:check` ✓ · `bun run test:run` ✓ (1214/1214) · `bun run knip` ✓ · `bunx next build` ✓ (full route table)
- `prisma migrate dev` + `db seed` + `db:verify` + `db:integrity` ✓ (20 meds, 48 interactions, 100+ remedies)
- Live smoke tests: `/api/health` 200; `/api/search?query=ibuprofen` returns real DB remedies; typo `ibuprofn` → 0 results (fuzzy tolerance is mathematically dead — Levenshtein is computed against the whole concatenated record); `/api/remedy/{uuid}` 200, bogus UUID → 404; anonymous favorites 200; POST without CSRF → 403; POST with CSRF → 200 (real Ginkgo×Warfarin "severe" interaction); `/remedy/{name}` → "Remedy Not Found"; OpenFDA calls 403 in the sandbox → correctly fell through the three-tier fallback.

_Prepared as a read-only audit. No application code was modified to produce this report._
