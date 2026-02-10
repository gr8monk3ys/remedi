import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS, parsePlanType } from "@/lib/stripe";
import { StatsCard, StatsGridSkeleton } from "@/components/dashboard/StatsCard";
import {
  ActivityFeed,
  ActivityFeedSkeleton,
} from "@/components/dashboard/ActivityFeed";
import { UsageProgressList } from "@/components/dashboard/UsageProgress";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Search, Heart, Star, Sparkles } from "lucide-react";
import type { ActivityItem, UsageData } from "@/types/dashboard";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview",
  description:
    "View your Remedi dashboard overview with stats, activity, and quick actions.",
};

/**
 * Dashboard Overview Page
 *
 * Displays user stats, recent activity, and quick actions.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is an overview of your activity and account.
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsGridSkeleton count={4} />}>
        <DashboardStats userId={user.id} />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <RecentActivity userId={user.id} />
          </Suspense>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Usage Stats */}
          <Suspense
            fallback={
              <div className="h-48 animate-pulse bg-muted rounded-xl" />
            }
          >
            <UsageStats userId={user.id} />
          </Suspense>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard Stats Component
 */
async function DashboardStats({ userId }: { userId: string }) {
  // Get date range for this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Fetch stats in parallel
  const [searchesThisMonth, favoritesCount, reviewsCount, subscription] =
    await Promise.all([
      prisma.searchHistory.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.favorite.count({
        where: { userId },
      }),
      prisma.remedyReview.count({
        where: { userId },
      }),
      prisma.subscription.findUnique({
        where: { userId },
        select: { plan: true, status: true },
      }),
    ]);

  const currentPlan = parsePlanType(subscription?.plan);
  const planDetails = PLANS[currentPlan];
  const aiLimit = planDetails.limits.aiSearches;
  // AI searches are always capped (0, 10, or 50), never unlimited
  const aiRemaining = aiLimit;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Searches This Month"
        value={searchesThisMonth}
        subtitle="Total searches"
        icon={Search}
      />
      <StatsCard
        title="Saved Favorites"
        value={favoritesCount}
        subtitle="Remedies saved"
        icon={Heart}
      />
      <StatsCard
        title="Reviews Written"
        value={reviewsCount}
        subtitle="Community contributions"
        icon={Star}
      />
      <StatsCard
        title="AI Searches"
        value={aiRemaining}
        subtitle={currentPlan === "free" ? "Upgrade for AI" : "Available"}
        icon={Sparkles}
      />
    </div>
  );
}

/**
 * Recent Activity Component
 */
async function RecentActivity({ userId }: { userId: string }) {
  // Fetch recent activities
  const [searches, favorites, reviews] = await Promise.all([
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, query: true, resultsCount: true, createdAt: true },
    }),
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, remedyName: true, createdAt: true },
    }),
    prisma.remedyReview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, remedyName: true, rating: true, createdAt: true },
    }),
  ]);

  // Combine and sort activities
  const activities: ActivityItem[] = [
    ...searches.map(
      (s: {
        id: string;
        query: string;
        resultsCount: number;
        createdAt: Date;
      }) => ({
        id: `search-${s.id}`,
        type: "search" as const,
        title: `Searched for "${s.query}"`,
        description: `${s.resultsCount} results found`,
        timestamp: s.createdAt,
      }),
    ),
    ...favorites.map(
      (f: { id: string; remedyName: string; createdAt: Date }) => ({
        id: `favorite-${f.id}`,
        type: "favorite_add" as const,
        title: `Saved ${f.remedyName}`,
        description: "Added to favorites",
        timestamp: f.createdAt,
      }),
    ),
    ...reviews.map(
      (r: {
        id: string;
        remedyName: string;
        rating: number;
        createdAt: Date;
      }) => ({
        id: `review-${r.id}`,
        type: "review" as const,
        title: `Reviewed ${r.remedyName}`,
        description: `Rated ${r.rating} stars`,
        timestamp: r.createdAt,
      }),
    ),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  return <ActivityFeed activities={activities} maxItems={10} />;
}

/**
 * Usage Stats Component
 */
async function UsageStats({ userId }: { userId: string }) {
  // Get subscription and usage data
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });

  const currentPlan = parsePlanType(subscription?.plan);
  const planDetails = PLANS[currentPlan];

  // Get current usage
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [searchesToday, favoritesCount] = await Promise.all([
    prisma.searchHistory.count({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
    }),
    prisma.favorite.count({
      where: { userId },
    }),
  ]);

  const usages: UsageData[] = [
    {
      label: "Daily Searches",
      current: searchesToday,
      limit: planDetails.limits.searchesPerDay,
    },
    {
      label: "Saved Favorites",
      current: favoritesCount,
      limit: planDetails.limits.favorites,
    },
    {
      label: "AI Searches",
      current: 0, // TODO: Track AI searches
      limit: planDetails.limits.aiSearches,
    },
  ];

  return <UsageProgressList usages={usages} title="Usage This Period" />;
}
