/**
 * Deterministic (non-AI) matching between a pharmaceutical drug and natural remedies.
 *
 * Used to:
 * - Generate initial remedy mappings for pharmaceuticals
 * - Provide fast fallbacks when explicit mappings don't exist yet
 */

import type { ProcessedDrug, NaturalRemedy } from "./types";
import { known, unknown, type Outcome } from "./outcome";

export type RemedyMatchCandidate = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  ingredients: string[];
  benefits: string[];
  evidenceLevel?: string | null;
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "used",
  "with",
  "without",
  // Units / dosage tokens
  "mg",
  "mcg",
  "g",
  "kg",
  "ml",
  "iu",
  // Common noise words for lists
  "daily",
  "day",
  "once",
  "twice",
  "times",
  "tablet",
  "tablets",
  "capsule",
  "capsules",
  "extended",
  "release",
  // Chemical suffixes that often appear and aren't useful for matching
  "hydrochloride",
  "sodium",
  "acid",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .filter((t) => !STOPWORDS.has(t));
}

function toTokenSet(phrases: string[]): Set<string> {
  const tokens = new Set<string>();
  for (const phrase of phrases) {
    for (const token of tokenize(phrase)) {
      tokens.add(token);
    }
  }
  return tokens;
}

function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  const out = new Set<T>(a);
  for (const item of b) out.add(item);
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const denom = a.size + b.size - intersection;
  return denom === 0 ? 0 : intersection / denom;
}

function evidenceBoost(level: string | null | undefined): number {
  const normalized = (level || "").toLowerCase();
  if (normalized === "strong") return 0.05;
  if (normalized === "moderate") return 0.03;
  if (normalized === "limited") return 0.01;
  return 0;
}

/**
 * What a Remedy Mapping is allowed to claim.
 *
 * Three values, no more. This used to be a bare `string` at every boundary,
 * which is how a mapping could round-trip through the database and come back
 * carrying anything at all — including nothing.
 */
export type ReplacementType = "Alternative" | "Complementary" | "Supportive";

/**
 * Present only on a mapping the policy itself produced.
 *
 * The symbol has no runtime value and is not exported, so a plain object
 * literal is not assignable to `RemedyMapping`. Writing one by hand takes a
 * deliberate `as RemedyMapping` — which is greppable, and which review can ask
 * about. That is the honest strength of this guard: it does not make an
 * unchecked mapping impossible, it makes one impossible to write *by accident*.
 */
declare const POLICY_CHECKED: unique symbol;

/**
 * A Natural Remedy paired with a drug, carrying a Replacement Type the policy
 * decided — never one a caller chose.
 */
export type RemedyMapping = Omit<NaturalRemedy, "replacementType"> & {
  readonly replacementType: ReplacementType;
  readonly [POLICY_CHECKED]: true;
};

/**
 * Coerce a persisted value back into a Replacement Type.
 *
 * The database column is the widest possible type and predates this union, so
 * a row can hold a legacy label, or none. An unrecognised value degrades to
 * `Supportive` — the weakest claim this vocabulary can make — rather than
 * throwing, because failing a whole page over one stale row is a worse outcome
 * for a reader than showing an over-cautious label.
 */
export function parseReplacementType(value: unknown): ReplacementType {
  if (
    value === "Alternative" ||
    value === "Complementary" ||
    value === "Supportive"
  ) {
    return value;
  }
  return "Supportive";
}

/**
 * The Replacement Type a score alone would justify, before any demotion.
 *
 * Exported so the AI path uses these thresholds rather than re-typing them:
 * a model's confidence is rendered on the same scale, in the same place, and
 * two copies of 0.75 and 0.55 would drift.
 */
export function replacementTypeForScore(score: number): ReplacementType {
  if (score >= 0.75) return "Alternative";
  if (score >= 0.55) return "Complementary";
  return "Supportive";
}

/**
 * Minimum similarity for a mapping to be shown to a user.
 *
 * Below this the "match" is little more than incidental token overlap, and
 * presenting it as a natural alternative to a medication overstates it. The
 * seeded data has a natural gap here: curated mappings sit at 0.45 and above,
 * while generated noise falls under 0.23.
 */
export const MIN_DISPLAY_SIMILARITY = 0.3;

/**
 * Some pharmaceuticals are not appropriate candidates for "alternative"
 * recommendations (for example, blood thinners). For these, we still allow
 * supportive lifestyle/supplement suggestions but force the label to
 * "Supportive" when persisting mappings.
 */
function shouldForceSupportiveReplacement(
  drug: Pick<ProcessedDrug, "name" | "category"> &
    Partial<Pick<ProcessedDrug, "warnings" | "interactions" | "description">>,
): boolean {
  // FDA-derived records carry generic categories like "Oral Medication", so
  // name and category alone never reveal that a drug is e.g. an anticoagulant
  // — that wording lives in the label's warnings and interactions text.
  const haystack = [
    drug.name,
    drug.category,
    drug.description,
    drug.warnings,
    drug.interactions,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Keep this list small and conservative; expand only with clear product/legal intent.
  const highRiskKeywords = [
    "anticoagulant",
    "antiplatelet",
    "blood thinner",
    "chemotherapy",
    "antiretroviral",
    "immunosuppress",
    "transplant",
  ];

  return highRiskKeywords.some((keyword) => haystack.includes(keyword));
}

function rankRemedyCandidatesForDrug(
  drug: ProcessedDrug,
  candidates: RemedyMatchCandidate[],
  options?: {
    limit?: number;
    minScore?: number;
  },
): NaturalRemedy[] {
  const limit = options?.limit ?? 10;
  const minScore = options?.minScore ?? MIN_DISPLAY_SIMILARITY;

  const drugIngredientTokens = toTokenSet(drug.ingredients || []);
  const drugBenefitTokens = toTokenSet(drug.benefits || []);
  const drugNameTokens = new Set(tokenize(drug.name || ""));
  const drugCategoryTokens = new Set(tokenize(drug.category || ""));

  const drugBenefitsPlus = union(drugBenefitTokens, drugNameTokens);

  const results: NaturalRemedy[] = [];

  for (const remedy of candidates) {
    const remedyIngredientTokens = toTokenSet(remedy.ingredients || []);
    const remedyBenefitTokens = toTokenSet(remedy.benefits || []);
    const remedyNameTokens = new Set(tokenize(remedy.name || ""));
    const remedyCategoryTokens = new Set(tokenize(remedy.category || ""));

    const remedyBenefitsPlus = union(remedyBenefitTokens, remedyNameTokens);
    const remedyCategoryPlus = union(
      remedyBenefitsPlus,
      union(remedyCategoryTokens, remedyNameTokens),
    );

    const ingredientScore = jaccard(
      drugIngredientTokens,
      remedyIngredientTokens,
    );
    const benefitScore = jaccard(drugBenefitsPlus, remedyBenefitsPlus);
    const categoryScore = jaccard(drugCategoryTokens, remedyCategoryPlus);

    // Weighted blend: in practice we see more overlap on benefit/category terms.
    let score =
      benefitScore * 0.5 + categoryScore * 0.3 + ingredientScore * 0.2;
    score += evidenceBoost(remedy.evidenceLevel);

    // Clamp to [0, 1] and keep stable precision for deterministic sorting.
    score = Math.max(0, Math.min(1, Math.round(score * 1000) / 1000));

    if (score < minScore) continue;

    const matchingNutrients =
      Array.isArray(remedy.ingredients) && remedy.ingredients.length > 0
        ? remedy.ingredients.slice(0, 3)
        : (remedy.benefits || []).slice(0, 3);

    results.push({
      id: remedy.id,
      name: remedy.name,
      description: remedy.description || "",
      imageUrl: remedy.imageUrl || "",
      category: remedy.category,
      matchingNutrients,
      similarityScore: score,
    });
  }

  results.sort((a, b) => b.similarityScore - a.similarityScore);
  return results.slice(0, limit);
}

/**
 * Drugs that must never be given a generated Remedy Mapping at all.
 *
 * For these, an empty result is the correct answer: even a "Supportive"
 * suggestion changes bleeding risk or implies a substitution that is unsafe.
 * Emptiness here is a decision, not an accident — which is why it is a rule in
 * code rather than a property the scorer happens to have.
 *
 * Matched against the drug's substance identity — see policyHaystack — so
 * FDA-sourced variants ("Warfarin Sodium") and brand names ("COUMADIN") are
 * covered as well as the curated generic name.
 */
export const NEVER_MAPPED: Readonly<Record<string, string>> = {
  warfarin: "anticoagulant — even 'supportive' additions alter bleeding risk",
  apixaban: "anticoagulant — even 'supportive' additions alter bleeding risk",
  rivaroxaban:
    "anticoagulant — even 'supportive' additions alter bleeding risk",
  dabigatran: "anticoagulant — even 'supportive' additions alter bleeding risk",
  clopidogrel: "antiplatelet — even 'supportive' additions alter bleeding risk",
  quetiapine:
    "antipsychotic — discontinuation or substitution suggestions are unsafe",
};

/**
 * Drugs whose class rules out labelling any remedy an "Alternative":
 * emergency/rescue medication, opioids, seizure medication, antibiotics,
 * incretin therapy, and hormonal contraception. Complementary and Supportive
 * remain available; "Alternative" does not.
 */
export const NEVER_ALTERNATIVE: readonly string[] = [
  "albuterol",
  "tramadol",
  "clonazepam",
  "doxycycline",
  "amoxicillin",
  "azithromycin",
  "ciprofloxacin",
  "liraglutide",
  "ethinyl estradiol",
  "levonorgestrel",
];

/**
 * Words that appear in a recorded Drug Interaction's substance names but
 * identify no substance: pharmacological categories and dosage-form nouns.
 * Matching on them would forbid pairs that have nothing in common.
 */
const INTERACTION_STOPWORDS: ReadonlySet<string> = new Set([
  "supplement",
  "supplements",
  "medication",
  "medications",
  "antibiotic",
  "antibiotics",
  "inhibitor",
  "inhibitors",
  "extract",
  "disease",
  "control",
  "pills",
  "and",
  "oral",
  "high",
  "dose",
  "juice",
  "root",
]);

function significantWords(substance: string): string[] {
  return substance
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 0 && !INTERACTION_STOPWORDS.has(word));
}

/**
 * The words identifying the *drug* side of a recorded Drug Interaction.
 *
 * A drug-side name is a class followed by the members it covers —
 * "Fluoroquinolone Antibiotics (Ciprofloxacin, Levofloxacin)". Those are
 * alternatives, so a drug matches when it matches ANY of them: a record named
 * "Ciprofloxacin" contains none of the word "fluoroquinolone".
 *
 * Single letters are dropped here because a drug haystack is long enough that
 * one letter matches everything.
 */
export function interactionDrugTerms(substance: string): string[] {
  return significantWords(substance).filter((word) => word.length >= 3);
}

/**
 * The remedy-side names of a recorded Drug Interaction, as alternatives.
 *
 * Unlike the drug side, this names ONE substance — so its words are a phrase
 * and a remedy must match all of them, which is what keeps "Vitamin D (High
 * Dose)" from forbidding Vitamin E. But parentheses and slashes carry aliases
 * for that same substance ("Coenzyme Q10 (CoQ10)", "Turmeric/Curcumin"), and
 * requiring those too would forbid nothing at all. So each alias is its own
 * group, and a remedy matching any complete group is forbidden.
 *
 * Nothing is dropped for being short. An earlier version required five
 * characters and so produced no words at all for "Iron Supplements", "Kava"
 * and "St. John's Wort" — the last of which holds the only two contraindicated
 * interactions in the table. A rule that silently forbids nothing is worse
 * than no rule, because it looks like one.
 */
export function interactionRemedyTerms(substance: string): string[][] {
  return substance
    .toLowerCase()
    .split(/[()/,]+/)
    .map((segment) =>
      segment
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 0 && !INTERACTION_STOPWORDS.has(word)),
    )
    .filter((group) => group.length > 0);
}

/**
 * Whether a recorded Drug Interaction forbids pairing this remedy with a drug.
 *
 * `groups` are the remedy-side alternatives of interactions recorded against
 * the drug, already resolved by the caller — the policy stays a pure function,
 * and the database access stays in the data layer where it can be tested
 * against a real table.
 *
 * A group matches only when every one of its words is present: the words name
 * one substance together, so a partial match is a different substance.
 */
export function isRemedyForbidden(
  remedyName: string,
  groups: readonly (readonly string[])[],
): boolean {
  const remedy = remedyName.toLowerCase();
  return groups.some(
    (group) => group.length > 0 && group.every((word) => remedy.includes(word)),
  );
}

/** The fields that can identify which substance a drug record is. */
export type PolicyIdentity = Pick<
  ProcessedDrug,
  "name" | "genericName" | "category" | "ingredients"
>;

/**
 * The text the safety rules are matched against.
 *
 * `name` alone is not identity. An FDA label is brand-first, so a warfarin
 * record arrives named "COUMADIN" with the category "HUMAN PRESCRIPTION DRUG
 * LABEL" — and every rule below is keyed on generic names, so both halves of
 * the old haystack could miss. `genericName` and `ingredients` carry the
 * substance regardless of which name the source chose to lead with.
 */
function policyHaystack(drug: PolicyIdentity): string {
  return [
    drug.name,
    drug.genericName,
    drug.category,
    ...(drug.ingredients ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * The reason this drug may carry no generated Remedy Mapping, or null.
 *
 * NEVER_MAPPED has always recorded *why* each drug is refused; until now that
 * reason went no further than the source file. Returning it lets a refusal say
 * something to a reader instead of looking like an empty result.
 */
export function neverMappedReason(drug: PolicyIdentity): string | null {
  const haystack = policyHaystack(drug);
  const match = Object.entries(NEVER_MAPPED).find(([name]) =>
    haystack.includes(name),
  );
  return match ? match[1] : null;
}

/** Whether this drug may carry any generated Remedy Mapping. */
export function isNeverMapped(drug: PolicyIdentity): boolean {
  return neverMappedReason(drug) !== null;
}

function isNeverAlternative(drug: PolicyIdentity): boolean {
  const haystack = policyHaystack(drug);
  return NEVER_ALTERNATIVE.some((name) => haystack.includes(name));
}

/**
 * The Replacement Type a hand-authored Remedy Mapping is actually allowed to
 * claim, or a refusal to carry it at all.
 *
 * Curated seed rows are typed by a person and written to the database verbatim.
 * The safety rules were therefore enforced on them only by a test over the
 * static array — which cannot see the database, and which no write path
 * consults. This routes the curated path through the same rules as the
 * generated ones, so a hand-typed "Alternative" on an anticoagulant is demoted
 * or dropped rather than shipped.
 *
 * It never *raises* a claim: a curator may always be more cautious than the
 * policy, never less.
 *
 * Only the two identity-keyed rules apply here. The high-risk downgrade is
 * deliberately not one of them: it is a free-text scan of a label's warnings
 * and interactions, and it exists to compensate for FDA-derived records whose
 * category identifies nothing. Run against curated prose it fires on any drug
 * whose label merely *mentions* anticoagulants — measured on this seed data it
 * demoted most of the Ibuprofen mappings, which are not high-risk. A curated
 * row already carries a category a person chose, so the compensating heuristic
 * has nothing to compensate for and only destroys accurate curation.
 */
export function certifyReplacementType(
  drug: PolicyIdentity,
  claimed: unknown,
): Outcome<ReplacementType, MappingRefusal> {
  const refusal = neverMappedReason(drug);
  if (refusal) {
    return unknown("never-mapped", refusal);
  }

  let type = parseReplacementType(claimed);

  if (type === "Alternative" && isNeverAlternative(drug)) {
    type = "Complementary";
  }

  return known(type);
}

/** Why the policy declined to produce any Remedy Mapping for a drug. */
export type MappingRefusal = "never-mapped";

/**
 * The policy's answer for one drug: mappings, or a stated refusal.
 *
 * A refusal is not an empty result. For an anticoagulant the policy withholds
 * deliberately, and a reader who sees an empty list cannot tell that from "we
 * found nothing that matched" — so the two are different arms rather than the
 * same empty array.
 */
export type MappingOutcome = Outcome<RemedyMapping[], MappingRefusal>;

/**
 * Build the Remedy Mappings a drug may carry.
 *
 * This is the only interface either write path crosses. Scoring, the
 * score-to-label thresholds, the high-risk downgrade and the never-map and
 * never-alternative rules are all applied here, so a caller cannot assemble
 * the policy differently — or forget half of it. Every returned mapping
 * carries a Replacement Type this function chose.
 *
 * `known` with an empty array means nothing scored high enough. `unknown`
 * means the policy refuses to map this drug at all; those are not the same
 * answer and must not render the same way.
 */
export function buildRemedyMappingsFor(
  drug: ProcessedDrug,
  candidates: RemedyMatchCandidate[],
  options?: {
    limit?: number;
    minScore?: number;
    /**
     * Remedy-side alternatives of Drug Interactions recorded against this
     * drug. A candidate matching any complete group is dropped: a pair we have
     * already recorded as interacting must not also be offered as a remedy.
     */
    forbiddenRemedies?: readonly (readonly string[])[];
  },
): MappingOutcome {
  const refusal = neverMappedReason(drug);
  if (refusal) {
    return unknown("never-mapped", refusal);
  }

  const forbidden = options?.forbiddenRemedies ?? [];
  const permitted =
    forbidden.length === 0
      ? candidates
      : candidates.filter(
          (candidate) => !isRemedyForbidden(candidate.name, forbidden),
        );

  const matches = rankRemedyCandidatesForDrug(drug, permitted, options);
  const forceSupportive = shouldForceSupportiveReplacement(drug);
  const noAlternative = isNeverAlternative(drug);

  return known(
    matches.map((match) => {
      let replacementType: ReplacementType = forceSupportive
        ? "Supportive"
        : replacementTypeForScore(match.similarityScore);

      if (noAlternative && replacementType === "Alternative") {
        replacementType = "Complementary";
      }

      // The one place a RemedyMapping is minted. Everything the brand
      // promises — that a Replacement Type was decided by the rules above and
      // not by a caller — is true exactly here.
      return { ...match, replacementType } as RemedyMapping;
    }),
  );
}
