/**
 * Search History Database Operations
 *
 * Track and retrieve user search history for analytics and UX.
 */

import { prisma } from "./client";
import { ownerConditions } from "./owner";

/**
 * Save search query to history
 */
export async function saveSearchHistory(
  query: string,
  resultsCount: number,
  sessionId?: string,
  userId?: string,
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
  limit = 10,
): Promise<
  Array<{ id: string; query: string; resultsCount: number; createdAt: Date }>
> {
  const orConditions = ownerConditions(userId, sessionId);
  if (!orConditions) {
    return [];
  }

  return prisma.searchHistory.findMany({
    where: {
      OR: orConditions,
    },
    orderBy: { createdAt: "desc" },
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
export async function getPopularSearches(
  limit = 5,
): Promise<Array<{ query: string; count: number }>> {
  const searches = await prisma.searchHistory.groupBy({
    by: ["query"],
    _count: {
      query: true,
    },
    orderBy: {
      _count: {
        query: "desc",
      },
    },
    take: limit,
  });

  return searches.map((s: { query: string; _count: { query: number } }) => ({
    query: s.query,
    count: s._count.query,
  }));
}

/**
 * Clear search history for a session or user
 * Returns 0 if neither sessionId nor userId is provided (security: prevents deleting all records)
 */
export async function clearSearchHistory(
  sessionId?: string,
  userId?: string,
): Promise<number> {
  const orConditions = ownerConditions(userId, sessionId);
  if (!orConditions) {
    return 0;
  }

  const result = await prisma.searchHistory.deleteMany({
    where: {
      OR: orConditions,
    },
  });

  return result.count;
}
