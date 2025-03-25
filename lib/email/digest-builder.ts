/**
 * Weekly Digest Data Builder
 *
 * Assembles personalized digest data for a user based on their plan tier.
 * Free: generic content (new remedies, trending searches)
 * Basic: personalized (profile-based recommendations, interaction alerts)
 * Premium: full (+ AI insight, journal summary)
 */

import "server-only";
import { prisma } from "@/lib/db/client";
import { createLogger } from "@/lib/logger";
import type { PlanType } from "@/lib/stripe-config";
import type { WeeklyDigestData } from "./types";

const log = createLogger("digest-builder");

/**
 * Shared data that is identical across all users and can be pre-fetched once.
 */
export interface SharedDigestData {
  newRemedies: Array<{
    id: string;
    name: string;
    category: string | null;
  }>;
  topSearches: Array<{
    query: string;
    count: number;
  }>;
  weekAgo: Date;
  periodStart: string;
  periodEnd: string;
}

/**
 * Fetches platform-wide data that is shared across all user digests.
 * Call this once before processing users to avoid N+1 queries.
 */
export async function fetchSharedDigestData(): Promise<SharedDigestData> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const periodStart = weekAgo.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const periodEnd = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const [newRemedies, recentSearches] = await Promise.all([
    prisma.naturalRemedy.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { id: true, name: true, category: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
    prisma.searchHistory.groupBy({
      by: ["query"],
      where: { createdAt: { gte: weekAgo } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 5,
    }),
  ]);

  return {
    newRemedies,
    topSearches: recentSearches.map((s) => ({
      query: s.query,
      count: s._count.query,
    })),
    weekAgo,
    periodStart,
    periodEnd,
  };
}

export async function buildDigestData(
  userId: string,
  plan: PlanType,
  sharedData?: SharedDigestData,
): Promise<WeeklyDigestData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) return null;

    // Use pre-fetched shared data or fetch inline (backward-compatible)
    const shared = sharedData ?? (await fetchSharedDigestData());
    const { weekAgo, periodStart, periodEnd, newRemedies, topSearches } =
      shared;

    // Per-user data only
    const [favoriteCount, searchHistoryCount] = await Promise.all([
      prisma.favorite.count({ where: { userId } }),
      prisma.searchHistory.count({
        where: { userId, createdAt: { gte: weekAgo } },
      }),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remedi.app";

    const data: WeeklyDigestData = {
      name: user.name || "there",
      newRemedies: newRemedies.map((r) => ({
        name: r.name,
        category: r.category ?? "General",
        url: `${baseUrl}/remedy/${r.id}`,
      })),
      topSearches,
      savedRemedies: favoriteCount,
      searchCount: searchHistoryCount,
      periodStart,
      periodEnd,
    };

    // Basic+ tier: personalized recommendations & interaction alerts
    if (plan === "basic" || plan === "premium") {
      const [profile, medications] = await Promise.all([
        prisma.healthProfile.findUnique({
          where: { userId },
          select: { categories: true, conditions: true },
        }),
        prisma.medicationCabinet.findMany({
          where: { userId, isActive: true },
          select: { name: true },
        }),
      ]);

      if (profile && profile.categories.length > 0) {
        const matchingRemedies = await prisma.naturalRemedy.findMany({
          where: {
            category: { in: profile.categories },
            createdAt: { gte: weekAgo },
          },
          select: { id: true, name: true, category: true },
          take: 5,
        });

        data.personalizedRemedies = matchingRemedies.map((r) => ({
          name: r.name,
          category: r.category ?? "General",
          matchReason: `Matches your ${r.category ?? "health"} interest`,
          url: `${baseUrl}/remedy/${r.id}`,
        }));
      }

      if (medications.length > 0) {
        const medNames = medications.map((m) => m.name);
        const interactions = await prisma.drugInteraction.findMany({
          where: {
            OR: [
              { substanceA: { in: medNames } },
              { substanceB: { in: medNames } },
            ],
            severity: { in: ["severe", "moderate"] },
          },
          select: {
            substanceA: true,
            substanceB: true,
            severity: true,
            description: true,
          },
          take: 5,
        });

        data.interactionAlerts = interactions.map((i) => ({
          medication: medNames.includes(i.substanceA)
            ? i.substanceA
            : i.substanceB,
          substance: medNames.includes(i.substanceA)
            ? i.substanceB
            : i.substanceA,
          severity: i.severity,
          description: i.description,
        }));
      }
    }

    // Premium tier: journal summary + AI insight
    if (plan === "premium") {
      const journalEntries = await prisma.remedyJournal.findMany({
        where: { userId, date: { gte: weekAgo } },
        select: { rating: true, remedyName: true },
      });

      if (journalEntries.length > 0) {
        const avgRating =
          journalEntries.reduce((sum, e) => sum + e.rating, 0) /
          journalEntries.length;

        // Find top remedy by frequency
        const counts: Record<string, number> = {};
        for (const e of journalEntries) {
          counts[e.remedyName] = (counts[e.remedyName] ?? 0) + 1;
        }
        const topRemedy =
          Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

        data.journalSummary = {
          entriesThisWeek: journalEntries.length,
          avgRating: Math.round(avgRating * 10) / 10,
          topRemedy,
        };
      }

      // AI insight — generate only when OpenAI is configured
      try {
        const { getOpenAIClient } = await import("@/lib/ai/client");
        const client = getOpenAIClient();
        if (client && data.journalSummary) {
          const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 150,
            messages: [
              {
                role: "system",
                content:
                  "You are a health wellness assistant. Provide a brief, encouraging health insight (2-3 sentences) based on the user journal summary. Be warm and supportive.",
              },
              {
                role: "user",
                content: `This week I logged ${data.journalSummary.entriesThisWeek} journal entries with an average effectiveness rating of ${data.journalSummary.avgRating}/5. My most-used remedy was ${data.journalSummary.topRemedy ?? "various remedies"}.`,
              },
            ],
          });
          data.aiInsight = completion.choices[0]?.message?.content ?? undefined;
        }
      } catch (error) {
        log.warn("Failed to generate AI insight for digest", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return data;
  } catch (error) {
    log.error("Failed to build digest data", error, { userId });
    return null;
  }
}
