import { prisma } from "@/lib/db";
import { CONVERSION_EVENT_TYPES } from "@/lib/analytics/conversion-events";
import type { Analytics } from "./analytics.types";
import { UserMetricsSection } from "./UserMetricsSection";
import { SearchMetricsSection } from "./SearchMetricsSection";
import { ActivationFunnelSection } from "./ActivationFunnelSection";
import { CohortRetentionSection } from "./CohortRetentionSection";
import { EventsAndRemediesSection } from "./EventsAndRemediesSection";

export const dynamic = "force-dynamic";

function startOfWeekUTC(date: Date): Date {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utcDate.getUTCDay();
  const diff = (day + 6) % 7; // Monday as week start
  utcDate.setUTCDate(utcDate.getUTCDate() - diff);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
}

function formatWeekLabel(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function getAnalytics(): Promise<Analytics> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const cohortWeeks = 6;
  const cohortStart = startOfWeekUTC(
    new Date(now.getTime() - (cohortWeeks - 1) * 7 * 24 * 60 * 60 * 1000),
  );

  const [
    // User stats
    totalUsers,
    newUsersDay,
    newUsersWeek,
    newUsersMonth,

    // Search stats
    totalSearches,
    searchesDay,
    searchesWeek,

    // Top searches
    topSearches,

    // Event breakdown
    eventsByType,

    // User activity
    activeUsersDay,
    activeUsersWeek,

    // Remedy stats
    totalRemedies,
    topViewedRemedies,

    // Activation funnel (last 7 days)
    landingViews,
    landingCtaClicks,
    searchEvents,
    remedyViews,
    favoriteEvents,
    reviewEvents,
    pricingViews,
    pricingSelections,
    checkoutStarted,
    checkoutCompleted,

    // Cohort users
    cohortUsers,
  ] = await Promise.all([
    // User counts
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: oneMonthAgo } } }),

    // Search counts
    prisma.searchHistory.count(),
    prisma.searchHistory.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.searchHistory.count({ where: { createdAt: { gte: oneWeekAgo } } }),

    // Top searches (last 7 days)
    prisma.searchHistory.groupBy({
      by: ["query"],
      where: { createdAt: { gte: oneWeekAgo } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),

    // Events by type (last 7 days)
    prisma.userEvent.groupBy({
      by: ["eventType"],
      where: { createdAt: { gte: oneWeekAgo } },
      _count: { eventType: true },
      orderBy: { _count: { eventType: "desc" } },
    }),

    // Active users (unique sessions/users)
    prisma.userEvent.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: oneDayAgo },
        userId: { not: null },
      },
    }),
    prisma.userEvent.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: oneWeekAgo },
        userId: { not: null },
      },
    }),

    // Remedy stats
    prisma.naturalRemedy.count(),

    // Top viewed (via favorites as proxy)
    prisma.favorite.groupBy({
      by: ["remedyId", "remedyName"],
      _count: { remedyId: true },
      orderBy: { _count: { remedyId: "desc" } },
      take: 10,
    }),

    prisma.userEvent.count({
      where: { createdAt: { gte: oneWeekAgo }, eventType: "landing_view" },
    }),
    prisma.userEvent.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        eventType: "landing_cta_clicked",
      },
    }),
    prisma.userEvent.count({
      where: { createdAt: { gte: oneWeekAgo }, eventType: "search" },
    }),
    prisma.userEvent.count({
      where: { createdAt: { gte: oneWeekAgo }, eventType: "view_remedy" },
    }),
    prisma.userEvent.count({
      where: { createdAt: { gte: oneWeekAgo }, eventType: "add_favorite" },
    }),
    prisma.userEvent.count({
      where: { createdAt: { gte: oneWeekAgo }, eventType: "review_submitted" },
    }),
    prisma.conversionEvent.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        eventType: CONVERSION_EVENT_TYPES.PRICING_PAGE_VIEWED,
      },
    }),
    prisma.conversionEvent.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        eventType: CONVERSION_EVENT_TYPES.PRICING_PLAN_SELECTED,
      },
    }),
    prisma.conversionEvent.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        eventType: CONVERSION_EVENT_TYPES.CHECKOUT_STARTED,
      },
    }),
    prisma.conversionEvent.count({
      where: {
        createdAt: { gte: oneWeekAgo },
        eventType: CONVERSION_EVENT_TYPES.CHECKOUT_COMPLETED,
      },
    }),

    prisma.user.findMany({
      where: { createdAt: { gte: cohortStart } },
      select: { id: true, createdAt: true },
    }),
  ]);

  const cohortBuckets = new Map<string, string[]>();
  for (const user of cohortUsers) {
    const weekStart = startOfWeekUTC(user.createdAt);
    const key = formatWeekLabel(weekStart);
    const list = cohortBuckets.get(key) ?? [];
    list.push(user.id);
    cohortBuckets.set(key, list);
  }

  const cohortRows: Analytics["cohorts"] = [];
  const cohortWeekStarts = Array.from(cohortBuckets.keys()).sort();

  for (const weekStartLabel of cohortWeekStarts) {
    const weekStart = new Date(`${weekStartLabel}T00:00:00.000Z`);
    const userIds = cohortBuckets.get(weekStartLabel) ?? [];

    const ranges = Array.from({ length: 5 }, (_, index) => {
      const start = new Date(
        weekStart.getTime() + index * 7 * 24 * 60 * 60 * 1000,
      );
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      return { start, end };
    });

    const [week0, week1, week2, week3, week4] = await Promise.all(
      ranges.map(async ({ start, end }) => {
        if (userIds.length === 0) return 0;
        const active = await prisma.userEvent.groupBy({
          by: ["userId"],
          where: {
            userId: { in: userIds },
            createdAt: { gte: start, lt: end },
          },
        });
        return active.length;
      }),
    );

    const signups = userIds.length;
    const pct = (value: number) =>
      signups > 0 ? Math.round((value / signups) * 1000) / 10 : 0;

    cohortRows.push({
      weekStart: weekStartLabel,
      signups,
      week0,
      week1,
      week2,
      week3,
      week4,
      week0Pct: pct(week0),
      week1Pct: pct(week1),
      week2Pct: pct(week2),
      week3Pct: pct(week3),
      week4Pct: pct(week4),
    });
  }

  const safeRate = (numerator: number, denominator: number) =>
    denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;

  return {
    users: {
      total: totalUsers,
      newDay: newUsersDay,
      newWeek: newUsersWeek,
      newMonth: newUsersMonth,
      activeDay: activeUsersDay.length,
      activeWeek: activeUsersWeek.length,
    },
    searches: {
      total: totalSearches,
      day: searchesDay,
      week: searchesWeek,
      top: topSearches.map(
        (s: { query: string; _count: { query: number } }) => ({
          query: s.query,
          count: s._count.query,
        }),
      ),
    },
    events: eventsByType.map(
      (e: { eventType: string; _count: { eventType: number } }) => ({
        type: e.eventType,
        count: e._count.eventType,
      }),
    ),
    activation: {
      landingViews,
      landingCtaClicks,
      searches: searchEvents,
      remedyViews,
      favorites: favoriteEvents,
      reviews: reviewEvents,
      pricingViews,
      pricingSelections,
      checkoutStarted,
      checkoutCompleted,
      rates: {
        ctaToPricing: safeRate(pricingViews, landingCtaClicks),
        pricingToCheckout: safeRate(checkoutStarted, pricingSelections),
        checkoutToPaid: safeRate(checkoutCompleted, checkoutStarted),
        landingToCheckout: safeRate(checkoutCompleted, landingViews),
      },
    },
    cohorts: cohortRows,
    remedies: {
      total: totalRemedies,
      topViewed: topViewedRemedies.map(
        (r: {
          remedyId: string;
          remedyName: string;
          _count: { remedyId: number };
        }) => ({
          id: r.remedyId,
          name: r.remedyName,
          count: r._count.remedyId,
        }),
      ),
    },
  };
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const exportUrl = `/api/admin/analytics/export?start=${start}&end=${end}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Platform usage metrics and insights
          </p>
        </div>
        <a
          href={exportUrl}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Download Funnel CSV
        </a>
      </div>

      <UserMetricsSection users={analytics.users} />
      <SearchMetricsSection searches={analytics.searches} />
      <ActivationFunnelSection activation={analytics.activation} />
      <CohortRetentionSection cohorts={analytics.cohorts} />
      <EventsAndRemediesSection
        events={analytics.events}
        remedies={analytics.remedies}
      />
    </div>
  );
}
