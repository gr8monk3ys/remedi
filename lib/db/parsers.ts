/**
 * JSON Parsing Utilities for Database Fields
 *
 * SQLite stores arrays as JSON strings. These utilities handle
 * parsing those fields safely with fallbacks.
 */

import type {
  ParsedPharmaceutical,
  ParsedNaturalRemedy,
  ParsedRemedyMapping,
} from "../types";

/**
 * Parse JSON string field or return empty array if invalid
 */
export function parseJsonArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}

/**
 * Parse JSON string field or return null if invalid
 */
export function parseJsonObject<T>(jsonString: string | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Raw Prisma Pharmaceutical type (before JSON parsing)
 */
export interface RawPharmaceutical {
  id: string;
  fdaId: string | null;
  name: string;
  description: string | null;
  category: string;
  ingredients: string;
  benefits: string;
  usage: string | null;
  warnings: string | null;
  interactions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Prisma Pharmaceutical to ParsedPharmaceutical
 */
export function parsePharmaceutical(
  pharma: RawPharmaceutical,
): ParsedPharmaceutical {
  return {
    ...pharma,
    ingredients: parseJsonArray(pharma.ingredients),
    benefits: parseJsonArray(pharma.benefits),
  };
}

/**
 * Raw Prisma NaturalRemedy type (before JSON parsing)
 */
export interface RawNaturalRemedy {
  id: string;
  name: string;
  description: string | null;
  category: string;
  ingredients: string;
  benefits: string;
  imageUrl: string | null;
  usage: string | null;
  dosage: string | null;
  precautions: string | null;
  scientificInfo: string | null;
  references: string | null;
  relatedRemedies: string | null;
  sourceUrl: string | null;
  evidenceLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Prisma NaturalRemedy to ParsedNaturalRemedy
 */
export function parseNaturalRemedy(
  remedy: RawNaturalRemedy,
): ParsedNaturalRemedy {
  return {
    ...remedy,
    ingredients: parseJsonArray(remedy.ingredients),
    benefits: parseJsonArray(remedy.benefits),
    references: parseJsonObject(remedy.references) || [],
    relatedRemedies: parseJsonObject(remedy.relatedRemedies) || [],
  };
}

/**
 * Raw Prisma NaturalRemedyMapping type (before JSON parsing)
 */
export interface RawRemedyMapping {
  id: string;
  pharmaceuticalId: string;
  naturalRemedyId: string;
  similarityScore: number;
  matchingNutrients: string;
  replacementType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Prisma NaturalRemedyMapping to ParsedRemedyMapping
 */
export function parseRemedyMapping(
  mapping: RawRemedyMapping,
): ParsedRemedyMapping {
  return {
    ...mapping,
    matchingNutrients: parseJsonArray(mapping.matchingNutrients),
  };
}
