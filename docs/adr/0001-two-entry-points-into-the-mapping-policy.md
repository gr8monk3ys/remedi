# 1. The mapping policy has two entry points, deliberately

Date: 2026-09-09

## Status

Accepted

## Context

The Remedy Mapping safety policy in `lib/remedy-matcher.ts` is reachable
through two functions, and they do not apply the same rules:

|                                 | generated path           | curated path             |
| ------------------------------- | ------------------------ | ------------------------ |
| entry point                     | `buildRemedyMappingsFor` | `certifyReplacementType` |
| never-mapped (identity)         | applied                  | applied                  |
| never-alternative (identity)    | applied                  | applied                  |
| high-risk downgrade (free text) | **applied**              | **not applied**          |

That asymmetry looks like drift. An architecture review of this repository
flagged it as exactly that — "two doors into the policy" — and proposed
collapsing them into one gate that applies all three rules everywhere.

Doing so would be wrong, and this ADR exists because the reasoning was only
ever recorded in a docstring, which was not enough to stop the suggestion
being made again.

## The measurement

`shouldForceSupportiveReplacement` is a keyword scan over
`name + category + description + warnings + interactions`, looking for
`anticoagulant`, `antiplatelet`, `blood thinner`, `chemotherapy`,
`antiretroviral`, `immunosuppress`, `transplant`.

`warnings` and `interactions` describe **other** substances by construction.
A label saying "may interact with blood thinners" is a statement about what a
drug _meets_, not about what it _is_.

Run against the 235 curated mappings in `prisma/seed-data`:

| haystack                                      | non-Supportive mappings demoted | drugs affected                                                                                       |
| --------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| as written (incl. `warnings`, `interactions`) | **20**                          | Ibuprofen, Aspirin, Naproxen, Celecoxib, Fish Oil Supplement, Melatonin Supplement, CoQ10 Supplement |
| without `warnings` + `interactions`           | 2                               | Aspirin                                                                                              |
| identity fields only                          | 0                               | none                                                                                                 |

Of the 20, only Aspirin is genuinely high-risk — it is an antiplatelet agent,
and its own description says so. The other 18 are false positives: four NSAIDs
that interact with anticoagulants, and three supplements whose interaction
text mentions blood thinners or chemotherapy.

Notably, **zero** curated drugs are high-risk by identity, because the ones
that are — warfarin, apixaban, rivaroxaban, dabigatran, clopidogrel — are in
`NEVER_MAPPED` and refused outright, so they carry no mappings to demote.

## Decision

Keep the two entry points. The high-risk free-text downgrade stays on the
generated path only.

It exists to compensate for FDA-derived records, whose category is a generic
string like `HUMAN PRESCRIPTION DRUG LABEL` and whose class is only discoverable
in the label's prose. A curated row already carries a category a person chose,
so the compensating heuristic has nothing to compensate for and only destroys
accurate curation.

What _is_ shared is the **composition**. Both curated write paths — the seed and
`scripts/remediate-mappings.ts` — previously spelled out the same four checks in
the same order by hand. The primitives could not drift, but the sequence could.
That is now `certifyCuratedMapping`, returning a verdict each caller reports in
its own voice.

## Consequences

- "One door into the policy" is not a goal for this module. Two entry points
  with different coverage is the correct shape, and a future review proposing
  to unify them should read this first.
- The free-text scan is a known-imprecise heuristic, accepted only where its
  input is imprecise too. If it is ever extended to curated data, the numbers
  above are the cost.
- A genuine improvement remains available and is **not** taken here: the scan
  could drop `warnings` and `interactions` and gain `genericName` and
  `ingredients`, which would make it identity-shaped and safe to apply
  everywhere. That is a behaviour change to the generated path — it would stop
  catching FDA records whose class appears only in warnings text — so it needs
  its own decision and its own evidence, not a refactor.

## Reproducing the numbers

The measurement is a keyword scan over `prisma/seed-data/pharmaceuticals.ts`
joined to `prisma/seed-data/mappings.ts` by `pharmaceuticalName`, counting
mappings whose `replacementType` is not already `Supportive`. See
`__tests__/lib/curated-mapping-gate.test.ts` for the invariants this ADR
protects.
