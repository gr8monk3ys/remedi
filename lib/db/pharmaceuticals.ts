/**
 * Pharmaceutical Database Operations
 *
 * CRUD operations for pharmaceutical drugs from FDA data.
 */

import { prisma } from "./client";
import { parsePharmaceutical, type RawPharmaceutical } from "./parsers";
import type { ProcessedDrug, ParsedPharmaceutical } from "../types";
import { logger } from "@/lib/logger";

/**
 * Search for pharmaceuticals by name or ingredients.
 *
 * Uses a two-tier strategy:
 *   1. PostgreSQL full-text search (`to_tsvector` / `to_tsquery`) for
 *      relevance-ranked results when the GIN index is available.
 *   2. Falls back to the original `ILIKE` pattern for partial / fuzzy
 *      matches, or when the full-text index has not been applied yet.
 */
export async function searchPharmaceuticals(
  query: string,
): Promise<ParsedPharmaceutical[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // ── Tier 1: Full-text search ──────────────────────────────────────────
  // Convert the user query into a tsquery by splitting on whitespace and
  // joining with '&' so every token must appear (AND semantics).
  const tsQueryTokens = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (tsQueryTokens.length > 0) {
    const tsQueryStr = tsQueryTokens.join(" & ");

    try {
      const ftsResults = await prisma.$queryRaw<RawPharmaceutical[]>`
        SELECT *
        FROM "Pharmaceutical"
        WHERE to_tsvector('english', coalesce("name", '') || ' ' || coalesce("description", ''))
              @@ to_tsquery('english', ${tsQueryStr})
        ORDER BY ts_rank(
          to_tsvector('english', coalesce("name", '') || ' ' || coalesce("description", '')),
          to_tsquery('english', ${tsQueryStr})
        ) DESC
        LIMIT 10
      `;

      if (ftsResults.length > 0) {
        return ftsResults.map(parsePharmaceutical);
      }
    } catch (error) {
      // If FTS fails (e.g. index not yet created, bad tsquery syntax)
      // we silently fall through to the ILIKE fallback.
      logger.warn("Full-text search failed, falling back to ILIKE", { error });
    }
  }

  // ── Tier 2: ILIKE fallback ────────────────────────────────────────────
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
