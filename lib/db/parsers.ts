/**
 * JSON Parsing Utilities for Database Fields
 *
 * This module provides utilities for handling array fields that may come from
 * either SQLite (as JSON strings) or PostgreSQL (as native arrays).
 *
 * PostgreSQL Migration Note:
 * - PostgreSQL returns native arrays directly (no parsing needed)
 * - SQLite stores arrays as JSON strings (requires JSON.parse)
 * - These utilities detect the type and handle both cases transparently
 */

import type {
  ParsedPharmaceutical,
  ParsedNaturalRemedy,
  ParsedRemedyMapping,
} from "../types";

/**
 * Normalize a field that could be:
 * - A native array (PostgreSQL)
 * - A JSON string (SQLite)
 * - null/undefined
 *
 * Returns an empty array for null/undefined or invalid input
 */
export function parseJsonArray(value: string | string[] | null | undefined): string[] {
  // Already an array (PostgreSQL native arrays)
  if (Array.isArray(value)) {
    return value;
  }

  // Null or undefined
  if (value == null) {
    return [];
  }

  // Empty string
  if (value === "") {
    return [];
  }

  // JSON string (SQLite)
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // If it's not valid JSON, treat it as a single-item array
    // This handles edge cases where a plain string was stored
    return value.trim() ? [value.trim()] : [];
  }
}

/**
 * Normalize a field that could be:
 * - A native object/array (PostgreSQL JSON/JSONB)
 * - A JSON string (SQLite)
 * - null/undefined
 *
 * Returns null for null/undefined or invalid input
 */
export function parseJsonObject<T>(value: string | T | null | undefined): T | null {
  // Already an object (PostgreSQL native JSON)
  if (value !== null && typeof value === "object") {
    return value as T;
  }

  // Null or undefined
  if (value == null) {
    return null;
  }

  // Empty string
  if (value === "") {
    return null;
  }

  // JSON string (SQLite)
  try {
    return JSON.parse(value as string);
  } catch {
    return null;
  }
}

/**
 * Raw Prisma Pharmaceutical type (supports both SQLite and PostgreSQL)
 *
 * In PostgreSQL: ingredients and benefits are string[]
 * In SQLite: ingredients and benefits are JSON strings
 */
export interface RawPharmaceutical {
  id: string;
  fdaId: string | null;
  name: string;
  description: string | null;
  category: string;
  ingredients: string | string[]; // string (SQLite) or string[] (PostgreSQL)
  benefits: string | string[];    // string (SQLite) or string[] (PostgreSQL)
  usage: string | null;
  warnings: string | null;
  interactions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Prisma Pharmaceutical to ParsedPharmaceutical
 * Handles both SQLite JSON strings and PostgreSQL native arrays
 */
export function parsePharmaceutical(
  pharma: RawPharmaceutical
): ParsedPharmaceutical {
  return {
    ...pharma,
    ingredients: parseJsonArray(pharma.ingredients),
    benefits: parseJsonArray(pharma.benefits),
  };
}

/**
 * Raw Prisma NaturalRemedy type (supports both SQLite and PostgreSQL)
 */
export interface RawNaturalRemedy {
  id: string;
  name: string;
  description: string | null;
  category: string;
  ingredients: string | string[];
  benefits: string | string[];
  imageUrl: string | null;
  usage: string | null;
  dosage: string | null;
  precautions: string | null;
  scientificInfo: string | null;
  references: string | string[] | null;
  relatedRemedies: string | string[] | null;
  sourceUrl: string | null;
  evidenceLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Prisma NaturalRemedy to ParsedNaturalRemedy
 * Handles both SQLite JSON strings and PostgreSQL native arrays
 */
export function parseNaturalRemedy(
  remedy: RawNaturalRemedy
): ParsedNaturalRemedy {
  return {
    ...remedy,
    ingredients: parseJsonArray(remedy.ingredients),
    benefits: parseJsonArray(remedy.benefits),
    references: parseJsonArray(remedy.references),
    relatedRemedies: parseJsonArray(remedy.relatedRemedies),
  };
}

/**
 * Raw Prisma NaturalRemedyMapping type (supports both SQLite and PostgreSQL)
 */
export interface RawRemedyMapping {
  id: string;
  pharmaceuticalId: string;
  naturalRemedyId: string;
  similarityScore: number;
  matchingNutrients: string | string[];
  replacementType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Prisma NaturalRemedyMapping to ParsedRemedyMapping
 * Handles both SQLite JSON strings and PostgreSQL native arrays
 */
export function parseRemedyMapping(
  mapping: RawRemedyMapping
): ParsedRemedyMapping {
  return {
    ...mapping,
    matchingNutrients: parseJsonArray(mapping.matchingNutrients),
  };
}

/**
 * Serialize an array for database storage
 *
 * For PostgreSQL: returns the array as-is (native array support)
 * For SQLite: converts to JSON string
 *
 * Note: With the PostgreSQL migration, this function is mainly for backwards
 * compatibility. Prisma handles the conversion automatically for PostgreSQL.
 *
 * @param arr - Array to serialize
 * @param forSqlite - If true, serialize as JSON string (default: false)
 */
export function serializeArray(arr: string[], forSqlite = false): string | string[] {
  if (forSqlite) {
    return JSON.stringify(arr);
  }
  return arr;
}

/**
 * Check if the database is PostgreSQL based on the DATABASE_URL
 * Useful for conditional logic if needed
 */
export function isPostgres(): boolean {
  const dbUrl = process.env.DATABASE_URL || "";
  return dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");
}

/**
 * Check if the database is SQLite based on the DATABASE_URL
 */
export function isSqlite(): boolean {
  const dbUrl = process.env.DATABASE_URL || "";
  return dbUrl.startsWith("file:");
}
