/**
 * Database utility functions using Prisma
 * Provides helper functions for database operations
 */

import { PrismaClient } from '@prisma/client';
import type {
  ProcessedDrug,
  NaturalRemedy,
  DetailedRemedy,
  ParsedPharmaceutical,
  ParsedNaturalRemedy,
  ParsedRemedyMapping,
} from './types';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================================================
// Helper Functions for JSON Parsing
// ============================================================================

/**
 * Parse JSON string field or return empty array if invalid
 */
function parseJsonArray(jsonString: string | null): string[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}

/**
 * Parse JSON string field or return empty array if invalid
 */
function parseJsonObject<T>(jsonString: string | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Convert Prisma Pharmaceutical to ParsedPharmaceutical
 */
function parsePharmaceutical(
  pharma: {
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
): ParsedPharmaceutical {
  return {
    ...pharma,
    ingredients: parseJsonArray(pharma.ingredients),
    benefits: parseJsonArray(pharma.benefits),
  };
}

/**
 * Convert Prisma NaturalRemedy to ParsedNaturalRemedy
 */
function parseNaturalRemedy(
  remedy: {
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
 * Convert Prisma NaturalRemedyMapping to ParsedRemedyMapping
 */
function parseRemedyMapping(
  mapping: {
    id: string;
    pharmaceuticalId: string;
    naturalRemedyId: string;
    similarityScore: number;
    matchingNutrients: string;
    replacementType: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
): ParsedRemedyMapping {
  return {
    ...mapping,
    matchingNutrients: parseJsonArray(mapping.matchingNutrients),
  };
}

// ============================================================================
// Pharmaceutical Database Operations
// ============================================================================

/**
 * Search for pharmaceuticals by name or ingredients
 * Note: SQLite doesn't support case-insensitive mode, so we search with lowercase
 */
export async function searchPharmaceuticals(query: string): Promise<ParsedPharmaceutical[]> {
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
export async function getPharmaceuticalById(id: string): Promise<ParsedPharmaceutical | null> {
  const result = await prisma.pharmaceutical.findUnique({
    where: { id },
  });

  return result ? parsePharmaceutical(result) : null;
}

/**
 * Get pharmaceutical by FDA ID
 */
export async function getPharmaceuticalByFdaId(fdaId: string): Promise<ParsedPharmaceutical | null> {
  const result = await prisma.pharmaceutical.findFirst({
    where: { fdaId },
  });

  return result ? parsePharmaceutical(result) : null;
}

/**
 * Create or update pharmaceutical from FDA data
 */
export async function upsertPharmaceutical(drug: ProcessedDrug): Promise<ParsedPharmaceutical> {
  const result = await prisma.pharmaceutical.upsert({
    where: { name: drug.name },
    update: {
      fdaId: drug.fdaId,
      description: drug.description,
      category: drug.category,
      ingredients: JSON.stringify(drug.ingredients),
      benefits: JSON.stringify(drug.benefits),
      usage: drug.usage,
      warnings: drug.warnings,
      interactions: drug.interactions,
    },
    create: {
      fdaId: drug.fdaId,
      name: drug.name,
      description: drug.description,
      category: drug.category,
      ingredients: JSON.stringify(drug.ingredients),
      benefits: JSON.stringify(drug.benefits),
      usage: drug.usage,
      warnings: drug.warnings,
      interactions: drug.interactions,
    },
  });

  return parsePharmaceutical(result);
}

// ============================================================================
// Natural Remedy Database Operations
// ============================================================================

/**
 * Get natural remedy by ID
 */
export async function getNaturalRemedyById(id: string): Promise<ParsedNaturalRemedy | null> {
  const result = await prisma.naturalRemedy.findUnique({
    where: { id },
  });

  return result ? parseNaturalRemedy(result) : null;
}

/**
 * Search natural remedies by name or category
 * Note: SQLite doesn't support case-insensitive mode, so we search with lowercase
 */
export async function searchNaturalRemedies(query: string): Promise<ParsedNaturalRemedy[]> {
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
  pharmaceuticalId: string
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
      similarityScore: 'desc',
    },
  });

  return mappings.map((mapping) => ({
    id: mapping.naturalRemedy.id,
    name: mapping.naturalRemedy.name,
    description: mapping.naturalRemedy.description || '',
    imageUrl: mapping.naturalRemedy.imageUrl || '',
    category: mapping.naturalRemedy.category,
    matchingNutrients: parseJsonArray(mapping.matchingNutrients),
    similarityScore: mapping.similarityScore,
  }));
}

/**
 * Convert ParsedNaturalRemedy to DetailedRemedy format
 */
export function toDetailedRemedy(remedy: ParsedNaturalRemedy, similarityScore = 1.0): DetailedRemedy {
  return {
    id: remedy.id,
    name: remedy.name,
    description: remedy.description || '',
    imageUrl: remedy.imageUrl || '',
    category: remedy.category,
    matchingNutrients: remedy.ingredients,
    similarityScore,
    usage: remedy.usage || 'Usage information not available.',
    dosage: remedy.dosage || 'Dosage information not available.',
    precautions: remedy.precautions || 'Precaution information not available.',
    scientificInfo: remedy.scientificInfo || 'Scientific information not available.',
    references: remedy.references,
    relatedRemedies: remedy.relatedRemedies,
  };
}

// ============================================================================
// Remedy Mapping Database Operations
// ============================================================================

/**
 * Create a mapping between pharmaceutical and natural remedy
 */
export async function createRemedyMapping(
  pharmaceuticalId: string,
  naturalRemedyId: string,
  similarityScore: number,
  matchingNutrients: string[],
  replacementType?: string
): Promise<ParsedRemedyMapping> {
  const result = await prisma.naturalRemedyMapping.create({
    data: {
      pharmaceuticalId,
      naturalRemedyId,
      similarityScore,
      matchingNutrients: JSON.stringify(matchingNutrients),
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
    distinct: ['category'],
  });

  return categories.map((c) => c.category);
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
    distinct: ['evidenceLevel'],
  });

  return levels.map((l) => l.evidenceLevel).filter((l): l is string => l !== null);
}

// ============================================================================
// Search History Database Operations
// ============================================================================

/**
 * Save search query to history
 */
export async function saveSearchHistory(
  query: string,
  resultsCount: number,
  sessionId?: string,
  userId?: string
): Promise<void> {
  await prisma.searchHistory.create({
    data: {
      query,
      resultsCount,
      sessionId,
      userId,
    },
  });
}

/**
 * Get search history for a session or user
 * Returns empty array if neither sessionId nor userId is provided (security: prevents data leak)
 */
export async function getSearchHistory(
  sessionId?: string,
  userId?: string,
  limit = 10
): Promise<Array<{ id: string; query: string; resultsCount: number; createdAt: Date }>> {
  // Security: require at least one identifier to prevent returning all records
  if (!sessionId && !userId) {
    return [];
  }

  // Build OR conditions only for provided identifiers
  const orConditions = [];
  if (sessionId) orConditions.push({ sessionId });
  if (userId) orConditions.push({ userId });

  return prisma.searchHistory.findMany({
    where: {
      OR: orConditions,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      query: true,
      resultsCount: true,
      createdAt: true,
    },
  });
}

/**
 * Get popular search queries (most frequently searched)
 */
export async function getPopularSearches(limit = 5): Promise<Array<{ query: string; count: number }>> {
  const searches = await prisma.searchHistory.groupBy({
    by: ['query'],
    _count: {
      query: true,
    },
    orderBy: {
      _count: {
        query: 'desc',
      },
    },
    take: limit,
  });

  return searches.map((s) => ({
    query: s.query,
    count: s._count.query,
  }));
}

/**
 * Clear search history for a session or user
 * Returns 0 if neither sessionId nor userId is provided (security: prevents deleting all records)
 */
export async function clearSearchHistory(sessionId?: string, userId?: string): Promise<number> {
  // Security: require at least one identifier to prevent deleting all records
  if (!sessionId && !userId) {
    return 0;
  }

  // Build OR conditions only for provided identifiers
  const orConditions = [];
  if (sessionId) orConditions.push({ sessionId });
  if (userId) orConditions.push({ userId });

  const result = await prisma.searchHistory.deleteMany({
    where: {
      OR: orConditions,
    },
  });

  return result.count;
}

// ============================================================================
// Favorites Database Operations
// ============================================================================

export interface FavoriteInput {
  remedyId: string;
  remedyName: string;
  sessionId?: string;
  userId?: string;
  notes?: string;
  collectionName?: string;
}

export interface FavoriteOutput {
  id: string;
  remedyId: string;
  remedyName: string;
  sessionId: string | null;
  userId: string | null;
  notes: string | null;
  collectionName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Add a remedy to favorites
 */
export async function addFavorite(favorite: FavoriteInput): Promise<FavoriteOutput> {
  return prisma.favorite.create({
    data: favorite,
  });
}

/**
 * Get all favorites for a session or user
 * Returns empty array if neither sessionId nor userId is provided (security: prevents data leak)
 */
export async function getFavorites(
  sessionId?: string,
  userId?: string,
  collectionName?: string
): Promise<FavoriteOutput[]> {
  // Security: require at least one identifier to prevent returning all records
  if (!sessionId && !userId) {
    return [];
  }

  // Build OR conditions only for provided identifiers
  const orConditions = [];
  if (sessionId) orConditions.push({ sessionId });
  if (userId) orConditions.push({ userId });

  return prisma.favorite.findMany({
    where: {
      OR: orConditions,
      ...(collectionName ? { collectionName } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a specific favorite by ID
 */
export async function getFavoriteById(id: string): Promise<FavoriteOutput | null> {
  return prisma.favorite.findUnique({
    where: { id },
  });
}

/**
 * Check if a remedy is favorited
 * Returns false if neither sessionId nor userId is provided (security: prevents false positives)
 */
export async function isFavorite(
  remedyId: string,
  sessionId?: string,
  userId?: string
): Promise<boolean> {
  // Security: require at least one identifier to prevent matching unrelated records
  if (!sessionId && !userId) {
    return false;
  }

  // Build OR conditions only for provided identifiers
  const orConditions = [];
  if (sessionId) orConditions.push({ sessionId });
  if (userId) orConditions.push({ userId });

  const favorite = await prisma.favorite.findFirst({
    where: {
      remedyId,
      OR: orConditions,
    },
  });

  return favorite !== null;
}

/**
 * Update favorite notes or collection
 */
export async function updateFavorite(
  id: string,
  updates: { notes?: string; collectionName?: string }
): Promise<FavoriteOutput> {
  return prisma.favorite.update({
    where: { id },
    data: updates,
  });
}

/**
 * Remove a remedy from favorites
 */
export async function removeFavorite(id: string): Promise<void> {
  await prisma.favorite.delete({
    where: { id },
  });
}

/**
 * Get all collection names for a session or user
 * Returns empty array if neither sessionId nor userId is provided (security: prevents data leak)
 */
export async function getCollectionNames(sessionId?: string, userId?: string): Promise<string[]> {
  // Security: require at least one identifier to prevent returning all records
  if (!sessionId && !userId) {
    return [];
  }

  // Build OR conditions only for provided identifiers
  const orConditions = [];
  if (sessionId) orConditions.push({ sessionId });
  if (userId) orConditions.push({ userId });

  const collections = await prisma.favorite.findMany({
    where: {
      OR: orConditions,
      collectionName: { not: null },
    },
    select: { collectionName: true },
    distinct: ['collectionName'],
  });

  return collections
    .map((c) => c.collectionName)
    .filter((name): name is string => name !== null);
}

// ============================================================================
// Filter Preferences Database Operations
// ============================================================================

export interface FilterPreferenceInput {
  sessionId?: string;
  userId?: string;
  categories?: string[];
  nutrients?: string[];
  evidenceLevels?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterPreferenceOutput {
  id: string;
  categories: string[];
  nutrients: string[];
  evidenceLevels: string[];
  sortBy: string | null;
  sortOrder: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parse filter preference from database
 */
function parseFilterPreference(
  pref: {
    id: string;
    categories: string | null;
    nutrients: string | null;
    evidenceLevels: string | null;
    sortBy: string | null;
    sortOrder: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
): FilterPreferenceOutput {
  return {
    id: pref.id,
    categories: parseJsonArray(pref.categories),
    nutrients: parseJsonArray(pref.nutrients),
    evidenceLevels: parseJsonArray(pref.evidenceLevels),
    sortBy: pref.sortBy,
    sortOrder: pref.sortOrder,
    createdAt: pref.createdAt,
    updatedAt: pref.updatedAt,
  };
}

/**
 * Save or update filter preferences
 */
export async function saveFilterPreferences(
  preferences: FilterPreferenceInput
): Promise<FilterPreferenceOutput> {
  const { sessionId, userId, categories, nutrients, evidenceLevels, sortBy, sortOrder } = preferences;

  const result = await prisma.filterPreference.upsert({
    where: {
      sessionId: sessionId || '',
    },
    update: {
      categories: categories ? JSON.stringify(categories) : null,
      nutrients: nutrients ? JSON.stringify(nutrients) : null,
      evidenceLevels: evidenceLevels ? JSON.stringify(evidenceLevels) : null,
      sortBy,
      sortOrder,
    },
    create: {
      sessionId,
      userId,
      categories: categories ? JSON.stringify(categories) : null,
      nutrients: nutrients ? JSON.stringify(nutrients) : null,
      evidenceLevels: evidenceLevels ? JSON.stringify(evidenceLevels) : null,
      sortBy,
      sortOrder,
    },
  });

  return parseFilterPreference(result);
}

/**
 * Get filter preferences for a session or user
 * Returns null if neither sessionId nor userId is provided (security: prevents data leak)
 */
export async function getFilterPreferences(
  sessionId?: string,
  userId?: string
): Promise<FilterPreferenceOutput | null> {
  // Security: require at least one identifier to prevent returning unrelated records
  if (!sessionId && !userId) {
    return null;
  }

  // Build OR conditions only for provided identifiers
  const orConditions = [];
  if (sessionId) orConditions.push({ sessionId });
  if (userId) orConditions.push({ userId });

  const result = await prisma.filterPreference.findFirst({
    where: {
      OR: orConditions,
    },
  });

  return result ? parseFilterPreference(result) : null;
}

/**
 * Clear filter preferences for a session or user
 * Does nothing if neither sessionId nor userId is provided (security: prevents deleting all records)
 */
export async function clearFilterPreferences(sessionId?: string, userId?: string): Promise<void> {
  // Security: require at least one identifier to prevent deleting all records
  if (!sessionId && !userId) {
    return;
  }

  // Build OR conditions only for provided identifiers
  const orConditions = [];
  if (sessionId) orConditions.push({ sessionId });
  if (userId) orConditions.push({ userId });

  await prisma.filterPreference.deleteMany({
    where: {
      OR: orConditions,
    },
  });
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Disconnect Prisma client
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
