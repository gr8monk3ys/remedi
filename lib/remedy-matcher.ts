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

export function replacementTypeForScore(
  score: number,
): "Alternative" | "Complementary" | "Supportive" {
  if (score >= 0.75) return "Alternative";
  if (score >= 0.55) return "Complementary";
  return "Supportive";
}

/**
 * Some pharmaceuticals are not appropriate candidates for "alternative"
 * recommendations (for example, blood thinners). For these, we still allow
 * supportive lifestyle/supplement suggestions but force the label to
 * "Supportive" when persisting mappings.
 */
export function shouldForceSupportiveReplacement(
  drug: Pick<ProcessedDrug, "name" | "category">,
): boolean {
  const haystack = `${drug.name} ${drug.category}`.toLowerCase();

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

export function rankRemedyCandidatesForDrug(
  drug: ProcessedDrug,
  candidates: RemedyMatchCandidate[],
  options?: {
    limit?: number;
    minScore?: number;
  },
): NaturalRemedy[] {
  const limit = options?.limit ?? 10;
  const minScore = options?.minScore ?? 0.12;

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
