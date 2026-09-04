# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is **a person who has just been prescribed something** and is
working out what they could safely take alongside it. They are not a clinician.
They are often anxious, reading on a phone, and looking for a straight answer
rather than a browsing experience.

Two secondary audiences exist in the product but do not lead design decisions:
signed-in users maintaining a Medication Cabinet and journal over time, and
moderators/admins reviewing community contributions (`UserRole` of `user`,
`moderator`, `admin`).

## Product Purpose

Remedi maps a Pharmaceutical to the Natural Remedies honestly related to it, and
labels what each relationship is allowed to claim: **Alternative**,
**Complementary**, or **Supportive**. It also checks interactions between the
Substances a person takes.

Success is a person getting an answer they can trust the shape of — including
"we deliberately have nothing to show you here," which is a real answer this
product is built to be able to give.

## Positioning

The mechanism is not the search; it is **what the data is not allowed to say.**

The catalogue is held to pharmacological invariants enforced in code and in CI,
so a careless edit fails the build instead of shipping:

- Rescue inhalers, opioids, seizure medication, antibiotics, GLP-1s and hormonal
  contraceptives can never carry an "Alternative" label.
- Anticoagulants and antiplatelets (warfarin, apixaban, rivaroxaban, dabigatran,
  clopidogrel) and quetiapine have **zero** mappings on purpose. Even a
  "Supportive" Natural Remedy changes bleeding risk, so an empty page is the curated
  answer.
- A pair already recorded as a Drug Interaction cannot also be offered as a
  remedy for it — magnesium beside ciprofloxacin, iron beside a fluoroquinolone.

The invariants are pinned both ways: refused drugs must stay unmapped, and every
other drug must carry at least one displayable mapping, so **emptiness is always
a decision and never a gap.** A neighbouring product could copy the catalogue; it
could not truthfully copy the refusals.

## Operating Context

Entry is usually a search for a drug name, from a phone, shortly after a
prescription or a pharmacy visit. Signed-in users additionally keep a Medication
Cabinet, a journal, saved favourites, comparisons, and generated reports.

Anonymous use is a first-class path: search, remedy pages, favourites, history
and filter preferences all work without an account.

## Capabilities and Constraints

- Search resolves from the database first, then OpenFDA, caching results back.
  FDA-sourced records are brand-first, so Substance Identity (generic name,
  ingredients, RxCUI/UNII) is what safety rules key on — never the display name.
- An interaction check that fails renders as an error, never as "no known
  interactions". Only a known, empty result may be presented as "none".
- Optional AI search, gated by plan, refused outright when the question or the
  Medication Cabinet names a substance the policy will not map.
- Three plans: **Free** (5 searches/day, 3 favourites, 3 medications, no AI, no
  compare, no export, no history), **Basic**, and **Premium**.
- Stack is set by the existing codebase: Next.js 16 App Router, React 19,
  TypeScript strict, Bun, Prisma 7 + PostgreSQL, Tailwind 4, Clerk, Stripe,
  Resend, OpenAI (optional), Sentry.

## Brand Commitments

Name: **Remedi**. Live at https://remedi-iota.vercel.app.

The product's voice is plainly stated and non-promotional. Its own README leads
with the constraint rather than the feature, and that restraint is the identity:
the product is trustworthy because it says less than it could.

Domain vocabulary is binding and defined in `CONTEXT.md`, including terms this
product deliberately avoids (`supplement`, `natural alternative`,
`recommendation`, `contraindication` as a synonym for interaction). Copy uses the
glossary's words.

## Evidence on Hand

- Curated seed set: 85 Pharmaceuticals, 504 Natural Remedies, 249 Remedy
  Mappings (`prisma/seed-data/`), plus 48 curated Drug Interactions.
- Safety invariants enforced by `__tests__/seed-data/mappings.test.ts` and
  `lib/remedy-matcher.ts`.
- Evidence Level is recorded per Natural Remedy and feeds the Similarity Score.

There are **no** testimonials, named customers, case studies, press mentions,
benchmarks, or usage numbers. Future work must not invent any. Efficacy claims
beyond what the Evidence Level supports are out of bounds.

## Product Principles

1. **Emptiness is a decision.** Where the product shows nothing, it says why.
   Silence that could be mistaken for absence of risk is a defect.
2. **A failure is never an all-clear.** Any surface that could render "nothing
   found" must distinguish that from "we could not check".
3. **Claim no more than the label allows.** Every Remedy Mapping is presented
   with its Replacement Type; an unlabelled suggestion is the least cautious
   thing the product can show.
4. **Identity over name.** The same molecule under a brand name is the same
   molecule. Never let presentation decide safety.
5. **Say less than you could.** Restraint is the brand. Informational only,
   stated wherever a claim is made.

## Accessibility & Inclusion

**WCAG 2.2 AA.** The bar for a health-adjacent consumer product read under
stress: contrast, visible focus, complete keyboard paths, honoured
`prefers-reduced-motion`, and error states that are legible rather than merely
coloured. No accessibility module exists in the codebase yet; this is the
standard to build to, not a description of the current state.
