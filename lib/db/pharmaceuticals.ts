/**
 * Pharmaceutical Database Operations
 *
 * CRUD operations for pharmaceutical drugs from FDA data.
 */

import { prisma } from "./client";
import { parsePharmaceutical, type RawPharmaceutical } from "./parsers";
import type { ProcessedDrug, ParsedPharmaceutical } from "../types";

/**
 * Search for pharmaceuticals by name or ingredients
 * Uses case-insensitive matching in PostgreSQL.
 */
export async function searchPharmaceuticals(
  query: string,
): Promise<ParsedPharmaceutical[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Prisma does not support substring matching inside text[] elements, so we
  // use a small raw query to search "ingredients" as well.
  const like = `%${trimmed}%`;
  const results = await prisma.$queryRaw<RawPharmaceutical[]>`
    SELECT *
    FROM "Pharmaceutical"
    WHERE "name" ILIKE ${like}
       OR "description" ILIKE ${like}
       OR "category" ILIKE ${like}
       OR EXISTS (
         SELECT 1
         FROM unnest("ingredients") AS ingredient
         WHERE ingredient ILIKE ${like}
       )
    ORDER BY "name" ASC
    LIMIT 10
  `;

  return results.map(parsePharmaceutical);
}

/**
 * Get pharmaceutical by ID
 */
export async function getPharmaceuticalById(
  id: string,
): Promise<ParsedPharmaceutical | null> {
  const result = await prisma.pharmaceutical.findUnique({
    where: { id },
  });

  return result ? parsePharmaceutical(result) : null;
}

/**
 * Get pharmaceutical by FDA ID
 */
export async function getPharmaceuticalByFdaId(
  fdaId: string,
): Promise<ParsedPharmaceutical | null> {
  const result = await prisma.pharmaceutical.findFirst({
    where: { fdaId },
  });

  return result ? parsePharmaceutical(result) : null;
}

/**
 * Create or update pharmaceutical from FDA data
 */
export async function upsertPharmaceutical(
  drug: ProcessedDrug,
): Promise<ParsedPharmaceutical> {
  const result = await prisma.pharmaceutical.upsert({
    where: { name: drug.name },
    update: {
      fdaId: drug.fdaId,
      description: drug.description,
      category: drug.category,
      ingredients: drug.ingredients,
      benefits: drug.benefits,
      usage: drug.usage,
      warnings: drug.warnings,
      interactions: drug.interactions,
    },
    create: {
      fdaId: drug.fdaId,
      name: drug.name,
      description: drug.description,
      category: drug.category,
      ingredients: drug.ingredients,
      benefits: drug.benefits,
      usage: drug.usage,
      warnings: drug.warnings,
      interactions: drug.interactions,
    },
  });

  return parsePharmaceutical(result);
}
