/**
 * Remedy Journal Database Operations
 *
 * IMPORTANT: This module is server-only and cannot be imported in client components.
 */

import "server-only";
import { prisma } from "./client";

export interface JournalEntryInput {
  remedyId: string;
  remedyName: string;
  date: string;
  rating: number;
  symptoms?: string[];
  sideEffects?: string[];
  dosageTaken?: string | null;
  notes?: string | null;
  mood?: number | null;
  energyLevel?: number | null;
  sleepQuality?: number | null;
}

/**
 * Create a journal entry
 */
export async function createJournalEntry(
  userId: string,
  data: JournalEntryInput,
) {
  return prisma.remedyJournal.create({
    data: {
      userId,
      remedyId: data.remedyId,
      remedyName: data.remedyName,
      date: new Date(data.date),
      rating: data.rating,
      symptoms: data.symptoms ?? [],
      sideEffects: data.sideEffects ?? [],
      dosageTaken: data.dosageTaken ?? null,
      notes: data.notes ?? null,
      mood: data.mood ?? null,
      energyLevel: data.energyLevel ?? null,
      sleepQuality: data.sleepQuality ?? null,
    },
  });
}

/**
 * Update a journal entry
 */
export async function updateJournalEntry(
  id: string,
  data: Partial<JournalEntryInput>,
) {
  const updateData: Record<string, unknown> = {};
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.symptoms !== undefined) updateData.symptoms = data.symptoms;
  if (data.sideEffects !== undefined) updateData.sideEffects = data.sideEffects;
  if (data.dosageTaken !== undefined) updateData.dosageTaken = data.dosageTaken;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.mood !== undefined) updateData.mood = data.mood;
  if (data.energyLevel !== undefined) updateData.energyLevel = data.energyLevel;
  if (data.sleepQuality !== undefined)
    updateData.sleepQuality = data.sleepQuality;
  if (data.date !== undefined) updateData.date = new Date(data.date);

  return prisma.remedyJournal.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string) {
  return prisma.remedyJournal.delete({ where: { id } });
}

/**
 * Get a single journal entry by ID
 */
export async function getJournalEntryById(id: string) {
  return prisma.remedyJournal.findUnique({ where: { id } });
}

/**
 * Get journal entries for a user with filtering and pagination
 */
export async function getJournalEntries(
  userId: string,
  options?: {
    remedyId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;

  const where: Record<string, unknown> = { userId };
  if (options?.remedyId) where.remedyId = options.remedyId;
  if (options?.startDate || options?.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (options.startDate) dateFilter.gte = new Date(options.startDate);
    if (options.endDate) dateFilter.lte = new Date(options.endDate);
    where.date = dateFilter;
  }

  const [entries, total] = await Promise.all([
    prisma.remedyJournal.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.remedyJournal.count({ where }),
  ]);

  return { entries, total, page, pageSize };
}

/**
 * Get list of unique remedies the user has tracked
 */
export async function getTrackedRemedies(userId: string) {
  const entries = await prisma.remedyJournal.findMany({
    where: { userId },
    select: { remedyId: true, remedyName: true },
    distinct: ["remedyId"],
    orderBy: { updatedAt: "desc" },
  });

  return entries;
}

/**
 * Get effectiveness insights for a specific remedy
 */
export async function getRemedyInsights(userId: string, remedyId: string) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const entries = await prisma.remedyJournal.findMany({
    where: { userId, remedyId, date: { gte: ninetyDaysAgo } },
    orderBy: { date: "asc" },
    take: 365,
  });

  if (entries.length === 0) {
    return null;
  }

  const ratings = entries.map((e) => e.rating);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  // Collect all symptoms and count frequency
  const symptomCounts: Record<string, number> = {};
  for (const entry of entries) {
    for (const symptom of entry.symptoms) {
      symptomCounts[symptom] = (symptomCounts[symptom] ?? 0) + 1;
    }
  }

  // Collect all side effects and count frequency
  const sideEffectCounts: Record<string, number> = {};
  for (const entry of entries) {
    for (const effect of entry.sideEffects) {
      sideEffectCounts[effect] = (sideEffectCounts[effect] ?? 0) + 1;
    }
  }

  // Calculate trend (improvement or decline)
  let trend: "improving" | "declining" | "stable" = "stable";
  if (entries.length >= 3) {
    const recentAvg = ratings.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const earlierAvg = ratings.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    if (recentAvg - earlierAvg > 0.5) trend = "improving";
    else if (earlierAvg - recentAvg > 0.5) trend = "declining";
  }

  // Rating history for chart
  const ratingHistory = entries.map((e) => ({
    date: e.date.toISOString().split("T")[0],
    rating: e.rating,
    mood: e.mood,
    energyLevel: e.energyLevel,
    sleepQuality: e.sleepQuality,
  }));

  return {
    remedyId,
    remedyName: entries[0].remedyName,
    totalEntries: entries.length,
    avgRating: Math.round(avgRating * 10) / 10,
    trend,
    topSymptoms: Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count })),
    topSideEffects: Object.entries(sideEffectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([effect, count]) => ({ effect, count })),
    ratingHistory,
  };
}
