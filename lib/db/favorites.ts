/**
 * Favorites Database Operations
 *
 * Manage user's favorite remedies with collection support.
 */

import { prisma } from "./client";
import { ownerConditions } from "./owner";

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
  skip = 0,
  take = 20,
): Promise<{ favorites: FavoriteOutput[]; total: number }> {
  const orConditions = ownerConditions(userId, sessionId);
  if (!orConditions) {
    return { favorites: [], total: 0 };
  }

  const where = {
    OR: orConditions,
    ...(collectionName ? { collectionName } : {}),
  };

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.favorite.count({ where }),
  ]);

  return { favorites, total };
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
  const orConditions = ownerConditions(userId, sessionId);
  if (!orConditions) {
    return false;
  }

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
  const orConditions = ownerConditions(userId, sessionId);
  if (!orConditions) {
    return [];
  }

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
