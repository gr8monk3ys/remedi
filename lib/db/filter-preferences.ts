/**
 * Filter Preferences Database Operations
 *
 * Save and retrieve user's filter preferences for persistent UX.
 */

import { prisma } from "./client";
import { parseJsonArray } from "./parsers";

export interface FilterPreferenceInput {
  sessionId?: string;
  userId?: string;
  categories?: string[];
  nutrients?: string[];
  evidenceLevels?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
 * Raw filter preference from database
 */
interface RawFilterPreference {
  id: string;
  categories: string | null;
  nutrients: string | null;
  evidenceLevels: string | null;
  sortBy: string | null;
  sortOrder: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parse filter preference from database
 */
function parseFilterPreference(
  pref: RawFilterPreference,
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
  preferences: FilterPreferenceInput,
): Promise<FilterPreferenceOutput> {
  const {
    sessionId,
    userId,
    categories,
    nutrients,
    evidenceLevels,
    sortBy,
    sortOrder,
  } = preferences;

  const result = await prisma.filterPreference.upsert({
    where: {
      sessionId: sessionId || "",
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
  userId?: string,
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
export async function clearFilterPreferences(
  sessionId?: string,
  userId?: string,
): Promise<void> {
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
