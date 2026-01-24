/**
 * Favorites Database Operations
 *
 * Manage user's favorite remedies with collection support.
 */

import { prisma } from "./client";

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
export async function addFavorite(
  favorite: FavoriteInput,
): Promise<FavoriteOutput> {
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
  collectionName?: string,
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
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a specific favorite by ID
 */
export async function getFavoriteById(
  id: string,
): Promise<FavoriteOutput | null> {
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
  userId?: string,
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
  updates: { notes?: string; collectionName?: string },
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
export async function getCollectionNames(
  sessionId?: string,
  userId?: string,
): Promise<string[]> {
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
    distinct: ["collectionName"],
  });

  return collections
    .map((c: { collectionName: string | null }) => c.collectionName)
    .filter((name: string | null): name is string => name !== null);
}
