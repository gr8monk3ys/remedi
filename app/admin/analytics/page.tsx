import { prisma } from "@/lib/db";
import { CONVERSION_EVENT_TYPES } from "@/lib/analytics/conversion-events";
export const dynamic = "force-dynamic";

interface SearchStat {
  query: string;
  count: number;
}

interface EventStat {
  type: string;
  count: number;
}

interface RemedyStat {
  id: string;
  name: string;
  count: number;
}

interface Analytics {
  users: {
    total: number;
    newDay: number;
    newWeek: number;
    newMonth: number;
    activeDay: number;
    activeWeek: number;
  };
  searches: {
    total: number;
    day: number;
    week: number;
    top: SearchStat[];
  };
  events: EventStat[];
  activation: {
    landingViews: number;
    landingCtaClicks: number;
    searches: number;
    remedyViews: number;
    favorites: number;
    reviews: number;
    pricingViews: number;
    pricingSelections: number;
    checkoutStarted: number;
    checkoutCompleted: number;
    rates: {
      ctaToPricing: number;
      pricingToCheckout: number;
      checkoutToPaid: number;
      landingToCheckout: number;
    };
  };
  cohorts: {
    weekStart: string;
    signups: number;
    week0: number;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    week0Pct: number;
    week1Pct: number;
    week2Pct: number;
    week3Pct: number;
    week4Pct: number;
  }[];
  remedies: {
    total: number;
    topViewed: RemedyStat[];
  };
}

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Platform usage metrics and insights
          </p>
        </div>
        <a
          href={exportUrl}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Download Funnel CSV
        </a>
      </div>

      {/* User Stats */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          User Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Users" value={analytics.users.total} />
          <StatCard
            label="New (24h)"
            value={analytics.users.newDay}
            highlight="green"
          />
          <StatCard label="New (7d)" value={analytics.users.newWeek} />
          <StatCard label="New (30d)" value={analytics.users.newMonth} />
          <StatCard
            label="Active (24h)"
            value={analytics.users.activeDay}
            highlight="blue"
          />
          <StatCard label="Active (7d)" value={analytics.users.activeWeek} />
        </div>
      </section>

      {/* Search Stats */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Search Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Searches" value={analytics.searches.total} />
          <StatCard
            label="Searches (24h)"
            value={analytics.searches.day}
            highlight="purple"
          />
          <StatCard label="Searches (7d)" value={analytics.searches.week} />
        </div>

        {/* Top Searches */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Top Searches (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {analytics.searches.top.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No search data</p>
            ) : (
              analytics.searches.top.map((search, i) => (
                <div
                  key={search.query}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-sm w-6">
                      {i + 1}.
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {search.query}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {search.count} searches
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Activation Funnel */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Activation Funnel (Last 7 Days)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Landing Views"
            value={analytics.activation.landingViews}
          />
          <StatCard
            label="Landing CTA Clicks"
            value={analytics.activation.landingCtaClicks}
          />
          <StatCard
            label="Search Events"
            value={analytics.activation.searches}
          />
          <StatCard
            label="Remedy Views"
            value={analytics.activation.remedyViews}
          />
          <StatCard
            label="Favorites Added"
            value={analytics.activation.favorites}
          />
          <StatCard
            label="Reviews Submitted"
            value={analytics.activation.reviews}
          />
          <StatCard
            label="Pricing Views"
            value={analytics.activation.pricingViews}
          />
          <StatCard
            label="Pricing Selections"
            value={analytics.activation.pricingSelections}
          />
          <StatCard
            label="Checkout Started"
            value={analytics.activation.checkoutStarted}
          />
          <StatCard
            label="Checkout Completed"
            value={analytics.activation.checkoutCompleted}
            highlight="green"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <RateCard
            label="CTA → Pricing"
            value={analytics.activation.rates.ctaToPricing}
          />
          <RateCard
            label="Pricing → Checkout"
            value={analytics.activation.rates.pricingToCheckout}
          />
          <RateCard
            label="Checkout → Paid"
            value={analytics.activation.rates.checkoutToPaid}
          />
          <RateCard
            label="Landing → Paid"
            value={analytics.activation.rates.landingToCheckout}
          />
        </div>
      </section>

      {/* Cohort Retention */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Cohort Retention (Weekly)
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-4">Cohort Week</th>
                <th className="py-2 pr-4">Signups</th>
                <th className="py-2 pr-4">W0</th>
                <th className="py-2 pr-4">W1</th>
                <th className="py-2 pr-4">W2</th>
                <th className="py-2 pr-4">W3</th>
                <th className="py-2 pr-4">W4</th>
                <th className="py-2 pr-4">W0 %</th>
                <th className="py-2 pr-4">W1 %</th>
                <th className="py-2 pr-4">W2 %</th>
                <th className="py-2 pr-4">W3 %</th>
                <th className="py-2">W4 %</th>
              </tr>
            </thead>
            <tbody>
              {analytics.cohorts.length === 0 ? (
                <tr>
                  <td
                    className="py-4 text-gray-500 dark:text-gray-400"
                    colSpan={12}
                  >
                    No cohort data yet.
                  </td>
                </tr>
              ) : (
                analytics.cohorts.map((row) => (
                  <tr
                    key={row.weekStart}
                    className="border-b border-gray-100 dark:border-gray-700 last:border-0 text-gray-700 dark:text-gray-300"
                  >
                    <td className="py-2 pr-4 font-mono text-xs">
                      {row.weekStart}
                    </td>
                    <td className="py-2 pr-4">{row.signups}</td>
                    <td className="py-2 pr-4">{row.week0}</td>
                    <td className="py-2 pr-4">{row.week1}</td>
                    <td className="py-2 pr-4">{row.week2}</td>
                    <td className="py-2 pr-4">{row.week3}</td>
                    <td className="py-2 pr-4">{row.week4}</td>
                    <td className="py-2 pr-4">
                      <CohortHeatCell percent={row.week0Pct} />
                    </td>
                    <td className="py-2 pr-4">
                      <CohortHeatCell percent={row.week1Pct} />
                    </td>
                    <td className="py-2 pr-4">
                      <CohortHeatCell percent={row.week2Pct} />
                    </td>
                    <td className="py-2 pr-4">
                      <CohortHeatCell percent={row.week3Pct} />
                    </td>
                    <td className="py-2">
                      <CohortHeatCell percent={row.week4Pct} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Event Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Events by Type (Last 7 Days)
          </h3>
          <div className="space-y-3">
            {analytics.events.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No event data</p>
            ) : (
              analytics.events.map((event) => (
                <div
                  key={event.type}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {event.type.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (event.count /
                              Math.max(
                                ...analytics.events.map((e) => e.count),
                              )) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                      {event.count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Remedies */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Most Favorited Remedies
          </h3>
          <div className="space-y-3">
            {analytics.remedies.topViewed.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No favorite data
              </p>
            ) : (
              analytics.remedies.topViewed.map((remedy, i) => (
                <div
                  key={remedy.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-sm w-6">
                      {i + 1}.
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {remedy.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {remedy.count} favorites
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: "green" | "blue" | "purple";
}) {
  const highlightColors = {
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-2xl font-bold mt-1 ${
          highlight
            ? highlightColors[highlight]
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function RateCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
        {value.toFixed(1)}%
      </p>
    </div>
  );
}

function CohortHeatCell({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const opacity = clamped / 100;
  return (
    <div
      className="px-2 py-1 rounded-md text-xs font-semibold text-gray-900 dark:text-gray-100"
      style={{
        backgroundColor: `rgba(59, 130, 246, ${0.15 + opacity * 0.75})`,
      }}
    >
      {percent.toFixed(1)}%
    </div>
  );
}
