import { prisma } from "@/lib/db";

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
  remedies: {
    total: number;
    topViewed: RemedyStat[];
  };
}

async function getAnalytics(): Promise<Analytics> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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
  ]);

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
      top: topSearches.map((s: { query: string; _count: { query: number } }) => ({
        query: s.query,
        count: s._count.query,
      })),
    },
    events: eventsByType.map((e: { eventType: string; _count: { eventType: number } }) => ({
      type: e.eventType,
      count: e._count.eventType,
    })),
    remedies: {
      total: totalRemedies,
      topViewed: topViewedRemedies.map((r: { remedyId: string; remedyName: string; _count: { remedyId: number } }) => ({
        id: r.remedyId,
        name: r.remedyName,
        count: r._count.remedyId,
      })),
    },
  };
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Platform usage metrics and insights
        </p>
      </div>

      {/* User Stats */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          User Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Users" value={analytics.users.total} />
          <StatCard label="New (24h)" value={analytics.users.newDay} highlight="green" />
          <StatCard label="New (7d)" value={analytics.users.newWeek} />
          <StatCard label="New (30d)" value={analytics.users.newMonth} />
          <StatCard label="Active (24h)" value={analytics.users.activeDay} highlight="blue" />
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
          <StatCard label="Searches (24h)" value={analytics.searches.day} highlight="purple" />
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
                              Math.max(...analytics.events.map((e) => e.count))) *
                              100
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
              <p className="text-gray-500 dark:text-gray-400">No favorite data</p>
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
