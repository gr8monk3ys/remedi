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
  ParsedNaturalRemedy,
  ParsedRemedyMapping,
} from "../types";

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
  const lowerQuery = query.toLowerCase();

  const results = await prisma.naturalRemedy.findMany({
    where: {
      OR: [
        { name: { contains: lowerQuery } },
        { description: { contains: lowerQuery } },
        { category: { contains: lowerQuery } },
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
 * Convert ParsedNaturalRemedy to DetailedRemedy format
 */
export function toDetailedRemedy(
  remedy: ParsedNaturalRemedy,
  similarityScore = 1.0,
): DetailedRemedy {
  const references =
    typeof remedy.references?.[0] === "string"
      ? (remedy.references as string[]).map((ref) => ({
          title: ref,
          url: ref,
        }))
      : (remedy.references as DetailedRemedy["references"]);

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
