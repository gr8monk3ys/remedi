/**
 * Pharmaceutical Database Operations
 *
 * CRUD operations for pharmaceutical drugs from FDA data.
 */

import { prisma } from "./client";
import { parsePharmaceutical } from "./parsers";
import type { ProcessedDrug, ParsedPharmaceutical } from "../types";

/**
 * Search for pharmaceuticals by name or ingredients
 * Note: SQLite doesn't support case-insensitive mode, so we search with lowercase
 */
export async function searchPharmaceuticals(
  query: string,
): Promise<ParsedPharmaceutical[]> {
  const lowerQuery = query.toLowerCase();

  const results = await prisma.pharmaceutical.findMany({
    where: {
      OR: [
        { name: { contains: lowerQuery } },
        { description: { contains: lowerQuery } },
        { category: { contains: lowerQuery } },
      ],
    },
    take: 10,
  });

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
