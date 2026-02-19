/**
 * Natural Remedy Database Operations
 *
 * CRUD operations for natural remedies and their mappings to pharmaceuticals.
 */

import { prisma } from "./client";
import { parseNaturalRemedy, parseRemedyMapping } from "./parsers";
import type {
  NaturalRemedy,
  DetailedRemedy,
  ProcessedDrug,
  ParsedNaturalRemedy,
  ParsedRemedyMapping,
} from "../types";
import { normalizeReferences } from "@/lib/references";
import {
  rankRemedyCandidatesForDrug,
  replacementTypeForScore,
  shouldForceSupportiveReplacement,
  type RemedyMatchCandidate,
} from "../remedy-matcher";

/**
 * Get natural remedy by ID
 */
export async function getNaturalRemedyById(
  id: string,
): Promise<ParsedNaturalRemedy | null> {
  const result = await prisma.naturalRemedy.findUnique({
    where: { id },
  });

  return result ? parseNaturalRemedy(result) : null;
}

/**
 * Search natural remedies by name or category
 * Note: SQLite doesn't support case-insensitive mode, so we search with lowercase
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

  return results.map(parseNaturalRemedy);
}

/**
 * Get all natural remedies mapped to a pharmaceutical
 * Optimized: only parses matchingNutrients (the only JSON field used in output)
 */
export async function getNaturalRemediesForPharmaceutical(
  pharmaceuticalId: string,
): Promise<NaturalRemedy[]> {
  const mappings = await prisma.naturalRemedyMapping.findMany({
    where: { pharmaceuticalId },
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
}): Promise<NaturalRemedy[]> {
  const { pharmaceuticalId, drug, limit = 10, minScore = 0.12 } = params;

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

  const matches = rankRemedyCandidatesForDrug(drug, candidates, {
    limit,
    minScore,
  });

  if (matches.length === 0) {
    return [];
  }

  const forceSupportive = shouldForceSupportiveReplacement(drug);

  await prisma.naturalRemedyMapping.createMany({
    data: matches.map((match) => ({
      pharmaceuticalId,
      naturalRemedyId: match.id,
      similarityScore: match.similarityScore,
      matchingNutrients: match.matchingNutrients,
      replacementType: forceSupportive
        ? "Supportive"
        : replacementTypeForScore(match.similarityScore),
    })),
    skipDuplicates: true,
  });

  return matches;
}

/**
 * Convert ParsedNaturalRemedy to DetailedRemedy format
 */
export function toDetailedRemedy(
  remedy: ParsedNaturalRemedy,
  similarityScore = 1.0,
): DetailedRemedy {
  const references = normalizeReferences(remedy.references);

  const relatedRemedies =
    typeof remedy.relatedRemedies?.[0] === "string"
      ? (remedy.relatedRemedies as string[]).map((name) => ({
          id: name,
          name,
        }))
      : (remedy.relatedRemedies as DetailedRemedy["relatedRemedies"]);

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
  };
}

/**
 * Create a mapping between pharmaceutical and natural remedy
 */
export async function createRemedyMapping(
  pharmaceuticalId: string,
  naturalRemedyId: string,
  similarityScore: number,
  matchingNutrients: string[],
  replacementType?: string,
): Promise<ParsedRemedyMapping> {
  const result = await prisma.naturalRemedyMapping.create({
    data: {
      pharmaceuticalId,
      naturalRemedyId,
      similarityScore,
      matchingNutrients,
      replacementType,
    },
  });

  return parseRemedyMapping(result);
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
