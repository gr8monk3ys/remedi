# Audit Remediation

Companion to [CODE_QUALITY_AUDIT.md](CODE_QUALITY_AUDIT.md). That document records
what the audit **found**; this one records what was **changed**, how each change was
verified, and the decisions that deserve a second opinion.

Everything below is in this branch. Gates after the work: lint, `tsc --strict`,
Prettier, **1185 unit tests across 68 files**, knip, and a production `next build`
all pass.

> Test count moved from 1226 to 1185 because ~41 tests existed only to exercise
> deleted dead code (`lib/remedyMapping.ts`, `hooks/use-favorites.ts`). New tests
> were added for the safety, FDA-matching and fuzzy-search behaviour.

---

## Decisions worth reviewing

Two changes alter product behaviour rather than just fixing a defect. Both are
defensible, but they are judgement calls, not mechanical fixes.

### 1. A similarity floor now hides very weak remedy matches

`MIN_DISPLAY_SIMILARITY = 0.3` is applied when generating **and** reading
mappings (`lib/remedy-matcher.ts`, `lib/db/remedies.ts`). Previously anything
scoring ≥ 0.12 was shown as a ranked "natural alternative".

The threshold sits in a natural gap in the data — curated mappings score 0.45+,
generated noise falls under 0.23:

| score band | mappings |
| ---------- | -------- |
| 0.12–0.23  | 42       |
| 0.45–0.98  | 195      |

**Consequence to be aware of:** 12 seeded drugs have _only_ weak mappings, so
they now return no remedies instead of weak ones. They are Albuterol, Atenolol,
Doxycycline, Doxylamine, Empagliflozin, Enalapril, Hydrochlorothiazide,
Liraglutide, Pseudoephedrine, Sitagliptin, Tramadol and Valsartan.

For a rescue inhaler like Albuterol, returning nothing is the safer outcome than
suggesting a 0.15-similarity herb. If you would rather show weak matches, lower
the constant — but then keep the `replacementType` labelling below, because the
two changes were designed together.

### 2. `moderator` is now a real role

The UI offered "Set as Moderator", `isModerator()` checked for it, and the
moderation queue was built around it — but the `UserRole` enum only had
`user` and `admin`, so the action always failed with a 400.

Rather than delete the feature, the enum gained the value
(migration `20260812163127_add_moderator_role`). That closed one gap and opened
another: the `/admin` layout admits moderators, and the users, subscriptions,
analytics and production pages did not re-check for admin. They now call
`requireAdminPage()`, so moderators reach only the moderation queue.

If you would rather not have moderators at all, the alternative is removing the
menu item, `isModerator()` and the role checks — but the moderation queue then
needs a new access rule.

---

## What changed, by finding

### Safety (P0)

| Finding                                                             | Change                                                                                                                                                 | Verification                                                                                                                                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **C1** — API failure rendered as "No known drug interactions found" | `InteractionWarnings` treats only an explicitly successful response as proof of no interactions; every other outcome renders a "could not verify" card | 5 new tests in `__tests__/components/interactions/InteractionWarnings.test.tsx` cover the error envelope, network throw, unparseable body, empty success and populated success |
| **H1** — warnings never loaded for logged-out users                 | `/api/interactions(.*)` added to the public matcher in `proxy.ts`                                                                                      | Live: anonymous `GET /api/interactions?substance=Ginkgo%20Biloba` returned 200 with real data (previously blocked)                                                             |
| **H2** — every "Related Remedies" link 404'd                        | `resolveRelatedRemedies()` maps stored names to real IDs; records that already carry structured entries are left untouched                             | Live: `/remedy/<id>` now returns related entries with UUIDs, and those URLs render "Sunlight Exposure" and "Cod Liver Oil" instead of "Remedy Not Found"                       |
| **H6** — "Delete Account" 404'd                                     | Added `app/user-profile/[[...user-profile]]/page.tsx` (Clerk `<UserProfile/>`); settings links converted to `next/link`                                | Route exists and builds; lint rule that flagged the raw anchors now passes                                                                                                     |

### Broken features (P1)

- **H3** — `UpgradeModal` posted a `priceId` taken from a `monthlyPriceId` field
  no plan defines, so its guard always returned early and checkout never
  started. It now posts `{ plan, interval }`, the shape `/api/checkout` accepts.
- **H15** — the paywall was mounted nowhere. `SearchComponent` now opens it when
  the API reports a plan limit, and distinguishes `LIMIT_EXCEEDED` (upgrade)
  from `RATE_LIMIT_EXCEEDED` (wait) — they share HTTP 429.
- **H4 / M4** — "Clear All" history and the admin production check used bare
  `fetch`, which CSRF middleware rejects 100% of the time. Both use
  `fetchWithCSRF`.
- **H5** — removing a favourite omitted `sessionId`, so anonymous users could
  add but never remove. It is now sent.
- **M3** — the contribution form labelled reference URLs optional but submitted
  `""`, which fails Zod `.url()`. Empty URLs are omitted.
- **M2** — see the moderator decision above.

### Security (P1)

- **H10** — the rate-limit identifier took the **left-most** `x-forwarded-for`
  entry, which the caller controls; rotating it defeated every per-IP limit. It
  now prefers platform-set headers and the right-most hop, and falls back to the
  session cookie rather than one shared `"anonymous"` bucket.
- **H11** — `/api/cron/*` was not public, so Clerk rejected Vercel Cron before
  the route's own `CRON_SECRET` check could run: the digest never sent and the
  secret check was dead code. The path is now public, and the secret is
  mandatory in every environment with a constant-time compare.
- **L5** — an Upstash outage threw out of `withRateLimit` and 500'd the route.
  It now falls back to the in-memory limiter.
- **M8** — admin-only pages re-check `isAdmin()` (see decision 2).

### Trust and UX (P2)

- **H7** — deleted the invented testimonials (including "David L., Naturopath"
  endorsing the paid plan) and the "thousands of users" claim.
- **H8** — cookie consent now gates Google Analytics, which sets cookies.
  Cookieless Plausible still loads. Banner copy matches the behaviour.
- **H12** — dark tokens moved from `@media (prefers-color-scheme: dark)` into
  `.dark`, the signal next-themes actually drives; the brand green is now
  `--primary` in both themes (6.0:1 light, 6.6:1 dark), and `text-white` on
  `bg-primary` became `text-primary-foreground` across 19 files.
- **M1** — `lib/evidence-levels.ts` is the single source of truth. Five palettes
  disagreed; amber meant "Limited" on one screen and "Moderate" on another.
- **H13** — the search result title is a real link, so opening a result no
  longer requires a mouse.
- **H14** — searches are guarded by an `AbortController` and a request sequence
  id, and clicking a suggestion searches that suggestion instead of re-running
  the previous query through a stale closure.
- **M11** — `WelcomeModal` no longer swallows Enter and arrow keys typed into
  fields.
- **M9 / M12 / nav** — one `<Header/>` on legal pages; the admin sidebar is
  responsive; the marketing header is hidden on `/dashboard` and `/admin` (it
  overlapped their chrome and produced a second hamburger); the interaction
  checker is linked from the header; the pricing "Downgrade" button opens the
  billing portal.

### Correctness (P2)

- **H9** — OpenFDA queries are fielded and quoted
  (`openfda.brand_name:"…"`), and a returned drug's name must correspond to the
  query before it is cached. An unqualified search matched any label field with
  OR semantics, so a mis-hit could become the sticky answer for everyone.
- **M5** — the high-risk-drug guard reads the label's warnings and interactions
  text. FDA categories are generic ("Oral Medication"), so anticoagulant wording
  only ever appears in the body and the guard could not fire on real FDA data.
  `replacementType` is now surfaced in results instead of being write-only.
- **M6** — AI calls request JSON mode and validate responses with Zod. Without
  JSON mode the model wrapped output in code fences, `JSON.parse` threw, and the
  user silently saw "no results". Candidates are selected by relevance rather
  than `createdAt desc`, which had limited the model to 50 of ~500 remedies.
- **L1** — fuzzy search scores against tokens, not the whole concatenated
  record. Levenshtein over an 80-character document scored ~0.03 for an
  8-character typo, so typo tolerance never actually worked. `ibuprofn` and
  `tylenl` now match.
- **L2** — anonymous searches send `sessionId`, so history is attributed.

### Hygiene (P3)

Deleted (~3,300 lines plus a 352 KB tracked binary):

- `lib/remedyMapping.ts` + its 466-line test — a dead twin of the live
  `lib/remedy-matcher.ts` that the docs named as _the_ matcher
- `hooks/use-favorites.ts` + its 545-line test — dead twin of the React Query hook
- `lib/accessibility.ts` (0 importers), `lib/fetch-with-csrf.ts` (1 importer,
  repointed at `lib/fetch.ts`), `lib/analytics/index.ts` (unused barrel)
- `app/auth/error/` — a NextAuth relic decoding error codes Clerk never emits
- `prisma/dev.db` (SQLite, in a Postgres-only project) and `prisma/seed*.js`
- `withTransaction` and `createRemedyMapping` (zero references anywhere)
- the five unused create-next-app template SVGs

`knip.json` no longer hides its own findings: the ignore entries for
`lib/accessibility.ts`, the JS seeds and the analytics barrel are gone, and
unused **files** is now an error — that is the rule that catches dead modules.
Unused _exports_ and _types_ report as warnings; the residual set is dominated
by Zod-inferred contract types and barrel re-exports, so failing CI on them
would be noise rather than signal.

Docs corrected: the README claimed **MIT** while `LICENSE` is **GPL v3**; it
listed files that do not exist, described favourites and history as
localStorage (both are database-backed), documented a SQLite dev database, and
listed Vitest, authentication and AI matching as future work. `CLAUDE.md` named
the deleted `remedyMapping.ts` as the matcher.

---

## Verification

Run against a real seeded Postgres 16, not mocks:

```
lint            pass
type-check      pass (strict)
format:check    pass
test:run        pass — 1185 tests / 68 files
knip            pass (unused files = error)
next build      pass
```

Live smoke tests after the changes:

- anonymous `GET /api/interactions?substance=…` → 200 with real interaction data
- `GET /api/remedy/<id>` → related remedies carry UUIDs
- `/remedy/<related-uuid>` → renders the remedy, not "Remedy Not Found"
- `GET /api/cron/weekly-digest` → 503 `CRON_SECRET is not configured` (reaches
  its own check instead of being blocked by Clerk)
- POST without a CSRF token → 403; with one → 200

## Not changed

- `sendExpirationReminder` and its template remain unused. It is a coherent
  feature that wants wiring to a scheduler, not deletion — but nothing calls it
  today.
- The CSP keeps `'unsafe-inline'` alongside the nonce as a legacy-browser
  fallback (audit L1). Removing it is a deliberate compatibility decision.
- The `codeql` workflow fails on `main` for an unrelated reason: PR #67 bumped
  `github/codeql-action/autobuild` to 4.36.2 while `init` and `analyze` stayed
  at 4.32.6. That is an infrastructure fix for a separate change.
