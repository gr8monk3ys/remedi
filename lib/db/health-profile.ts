/**
 * Health Profile Database Operations
 *
 * IMPORTANT: This module is server-only and cannot be imported in client components.
 */

import "server-only";
import { prisma } from "./client";

/**
 * Get health profile for a user
 */
export async function getHealthProfile(userId: string) {
  return prisma.healthProfile.findUnique({
    where: { userId },
  });
}

/**
 * Create or update health profile
 */
export async function upsertHealthProfile(
  userId: string,
  data: {
    categories?: string[];
    goals?: string[];
    allergies?: string[];
    conditions?: string[];
    dietaryPrefs?: string[];
  },
) {
  return prisma.healthProfile.upsert({
    where: { userId },
    create: {
      userId,
      categories: data.categories ?? [],
      goals: data.goals ?? [],
      allergies: data.allergies ?? [],
      conditions: data.conditions ?? [],
      dietaryPrefs: data.dietaryPrefs ?? [],
    },
    update: {
      categories: data.categories,
      goals: data.goals,
      allergies: data.allergies,
      conditions: data.conditions,
      dietaryPrefs: data.dietaryPrefs,
    },
  });
}
