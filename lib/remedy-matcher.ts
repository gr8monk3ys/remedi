/**
 * Deterministic (non-AI) matching between a pharmaceutical drug and natural remedies.
 *
 * Used to:
 * - Generate initial remedy mappings for pharmaceuticals
 * - Provide fast fallbacks when explicit mappings don't exist yet
 */

import type { ProcessedDrug, NaturalRemedy } from "./types";

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

function replacementTypeForScore(
  score: number,
): "Alternative" | "Complementary" | "Supportive" {
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

/** Whether this drug may carry any generated Remedy Mapping. */
export function isNeverMapped(drug: PolicyIdentity): boolean {
  const haystack = policyHaystack(drug);
  return Object.keys(NEVER_MAPPED).some((name) => haystack.includes(name));
}

function isNeverAlternative(drug: PolicyIdentity): boolean {
  const haystack = policyHaystack(drug);
  return NEVER_ALTERNATIVE.some((name) => haystack.includes(name));
}

/**
 * Build the Remedy Mappings a drug may carry.
 *
 * This is the only interface either write path crosses. Scoring, the
 * score-to-label thresholds, the high-risk downgrade and the never-map and
 * never-alternative rules are all applied here, so a caller cannot assemble
 * the policy differently — or forget half of it. Every returned remedy has a
 * `replacementType`.
 *
 * Returns an empty array for a drug the policy forbids mapping.
 */
export function buildRemedyMappingsFor(
  drug: ProcessedDrug,
  candidates: RemedyMatchCandidate[],
  options?: { limit?: number; minScore?: number },
): NaturalRemedy[] {
  if (isNeverMapped(drug)) {
    return [];
  }

  const matches = rankRemedyCandidatesForDrug(drug, candidates, options);
  const forceSupportive = shouldForceSupportiveReplacement(drug);
  const noAlternative = isNeverAlternative(drug);

  return matches.map((match) => {
    let replacementType = forceSupportive
      ? "Supportive"
      : replacementTypeForScore(match.similarityScore);

    if (noAlternative && replacementType === "Alternative") {
      replacementType = "Complementary";
    }

    return { ...match, replacementType };
  });
}
