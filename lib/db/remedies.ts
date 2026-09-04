/**
 * Natural Remedy Database Operations
 *
 * CRUD operations for natural remedies and their mappings to pharmaceuticals.
 */

import { prisma } from "./client";
import type {
  NaturalRemedy,
  DetailedRemedy,
  ProcessedDrug,
  ParsedNaturalRemedy,
} from "../types";
import { normalizeReferences } from "@/lib/references";
import {
  MIN_DISPLAY_SIMILARITY,
  buildRemedyMappingsFor,
  parseReplacementType,
  type MappingOutcome,
  type RemedyMatchCandidate,
} from "../remedy-matcher";
import { known } from "../outcome";

/**
 * Get natural remedy by ID
 */
export async function getNaturalRemedyById(
  id: string,
): Promise<ParsedNaturalRemedy | null> {
  const result = await prisma.naturalRemedy.findUnique({
    where: { id },
  });

  return result;
}

/**
 * Search natural remedies by name or category.
 */
export async function searchNaturalRemedies(
  query: string,
): Promise<ParsedNaturalRemedy[]> {
  const results = await prisma.naturalRemedy.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 20,
  });

  return results;
}

/**
 * Get all natural remedies mapped to a pharmaceutical
 * Optimized: only parses matchingNutrients (the only JSON field used in output)
 */
export async function getNaturalRemediesForPharmaceutical(
  pharmaceuticalId: string,
): Promise<NaturalRemedy[]> {
  const mappings = await prisma.naturalRemedyMapping.findMany({
    // Weak mappings were persisted historically at a much lower floor. Filter
    // them on read so incidental token overlap is never presented to a user as
    // a natural alternative to their medication.
    where: {
      pharmaceuticalId,
      similarityScore: { gte: MIN_DISPLAY_SIMILARITY },
    },
    include: {
      naturalRemedy: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          category: true,
        },
      },
    },
    orderBy: {
      similarityScore: "desc",
    },
  });

  return mappings.map((mapping) => ({
    id: mapping.naturalRemedy.id,
    name: mapping.naturalRemedy.name,
    description: mapping.naturalRemedy.description || "",
    imageUrl: mapping.naturalRemedy.imageUrl || "",
    category: mapping.naturalRemedy.category,
    matchingNutrients: mapping.matchingNutrients,
    similarityScore: mapping.similarityScore,
    // Surfaced so the UI can distinguish an alternative from a merely
    // supportive suggestion instead of labelling everything the same.
    //
    // The column is wider than the union and predates it, so a legacy or
    // absent value is coerced to the weakest claim rather than trusted or
    // thrown on. A missing label used to render as no badge at all — the
    // least cautious presentation, from the least governed rows.
    replacementType: parseReplacementType(mapping.replacementType),
  }));
}

/**
 * Generate and persist mappings for a pharmaceutical when explicit mappings are missing.
 *
 * This is a deterministic, DB-backed matcher (non-AI) that:
 * - ranks remedies using token overlap heuristics
 * - inserts NaturalRemedyMapping rows (skip duplicates)
 * - returns the ranked results for immediate use
 */
export async function generateRemedyMappingsForPharmaceutical(params: {
  pharmaceuticalId: string;
  drug: ProcessedDrug;
  limit?: number;
  minScore?: number;
}): Promise<MappingOutcome> {
  const {
    pharmaceuticalId,
    drug,
    limit = 10,
    minScore = MIN_DISPLAY_SIMILARITY,
  } = params;

  const candidates = (await prisma.naturalRemedy.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      category: true,
      ingredients: true,
      benefits: true,
      evidenceLevel: true,
    },
  })) as RemedyMatchCandidate[];

  const outcome = buildRemedyMappingsFor(drug, candidates, {
    limit,
    minScore,
  });

  // A refusal is passed through untouched. Persisting nothing is right, but so
  // is telling the caller *why* nothing was persisted — an anticoagulant with
  // no mappings is a decision, and it must not read as "none matched".
  if (outcome.kind === "unknown") {
    return outcome;
  }

  const matches = outcome.data;
  if (matches.length === 0) {
    return known([]);
  }

  // skipDuplicates keeps curated mappings authoritative: a generated row never
  // overwrites one that was seeded by hand.
  await prisma.naturalRemedyMapping.createMany({
    data: matches.map((match) => ({
      pharmaceuticalId,
      naturalRemedyId: match.id,
      similarityScore: match.similarityScore,
      matchingNutrients: match.matchingNutrients,
      replacementType: match.replacementType,
    })),
    skipDuplicates: true,
  });

  return known(matches);
}

/**
 * Resolve related-remedy names to routable remedy IDs.
 *
 * `NaturalRemedy.relatedRemedies` stores plain names, but the UI links to
 * `/remedy/<id>`, which only accepts UUIDs. Names that have no matching remedy
 * are dropped: a missing entry is better than a link that 404s.
 */
export async function resolveRelatedRemedies(
  related: ParsedNaturalRemedy["relatedRemedies"],
): Promise<Array<{ id: string; name: string }> | undefined> {
  const entries = related ?? [];

  // Some records already carry structured {id, name} entries. Those are
  // routable as-is, so signal "no override" and let the caller keep them.
  const names = entries.filter(
    (entry): entry is string => typeof entry === "string",
  );
  if (names.length === 0) {
    return entries.length > 0 ? undefined : [];
  }

  const matches = await prisma.naturalRemedy.findMany({
    where: {
      OR: names.map((name) => ({
        name: { equals: name, mode: "insensitive" as const },
      })),
    },
    select: { id: true, name: true },
  });

  const byName = new Map(
    matches.map((match) => [match.name.toLowerCase(), match]),
  );

  return names
    .map((name) => byName.get(name.toLowerCase()))
    .filter((match): match is { id: string; name: string } => Boolean(match));
}

/**
 * Convert ParsedNaturalRemedy to DetailedRemedy format.
 *
 * Pass `resolvedRelatedRemedies` (from `resolveRelatedRemedies`) whenever the
 * result is rendered with links; without it the related entries carry names in
 * place of IDs and are not routable.
 */
export function toDetailedRemedy(
  remedy: ParsedNaturalRemedy,
  similarityScore = 1.0,
  resolvedRelatedRemedies?: Array<{ id: string; name: string }>,
): DetailedRemedy {
  const references = normalizeReferences(remedy.references);

  const relatedRemedies =
    resolvedRelatedRemedies ??
    (typeof remedy.relatedRemedies?.[0] === "string"
      ? (remedy.relatedRemedies as string[]).map((name) => ({
          id: name,
          name,
        }))
      : (remedy.relatedRemedies as DetailedRemedy["relatedRemedies"]));

  return {
    id: remedy.id,
    name: remedy.name,
    description: remedy.description || "",
    imageUrl: remedy.imageUrl || "",
    category: remedy.category,
    matchingNutrients: remedy.ingredients,
    similarityScore,
    usage: remedy.usage || "Usage information not available.",
    dosage: remedy.dosage || "Dosage information not available.",
    precautions: remedy.precautions || "Precaution information not available.",
    scientificInfo:
      remedy.scientificInfo || "Scientific information not available.",
    references: references || [],
    relatedRemedies: relatedRemedies || [],
    evidenceLevel: remedy.evidenceLevel ?? null,
  };
}

/**
 * Get all unique categories from natural remedies
 */
export async function getAllCategories(): Promise<string[]> {
  const categories = await prisma.naturalRemedy.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  return categories.map((c: { category: string }) => c.category);
}

/**
 * Get all unique evidence levels
 */
export async function getAllEvidenceLevels(): Promise<string[]> {
  const levels = await prisma.naturalRemedy.findMany({
    where: {
      evidenceLevel: { not: null },
    },
    select: { evidenceLevel: true },
    distinct: ["evidenceLevel"],
  });

  return levels
    .map((l: { evidenceLevel: string | null }) => l.evidenceLevel)
    .filter((l: string | null): l is string => l !== null);
}
