import { prisma } from "@/lib/db";
import {
  Users,
  FileText,
  Search,
  Heart,
  TrendingUp,
  Clock,
} from "lucide-react";
export const dynamic = "force-dynamic";

interface RecentSearch {
  query: string;
  createdAt: Date;
  resultsCount: number;
}

interface RecentContribution {
  id: string;
  name: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface RecentActivity {
  recentSearches: RecentSearch[];
  recentContributions: RecentContribution[];
}

async function getStats() {
  const [
    userCount,
    remedyCount,
    searchCount,
    favoriteCount,
    pendingContributions,
    recentEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.naturalRemedy.count(),
    prisma.searchHistory.count(),
    prisma.favorite.count(),
    prisma.remedyContribution.count({ where: { status: "pending" } }),
    prisma.userEvent.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
  ]);

  return {
    userCount,
    remedyCount,
    searchCount,
    favoriteCount,
    pendingContributions,
    recentEvents,
  };
}

async function getRecentActivity(): Promise<RecentActivity> {
  const [recentSearches, recentContributions] = await Promise.all([
    prisma.searchHistory.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { query: true, createdAt: true, resultsCount: true },
    }),
    prisma.remedyContribution.findMany({
      take: 5,
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return { recentSearches, recentContributions };
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const activity = await getRecentActivity();

  const statCards = [
    {
      label: "Total Users",
      value: stats.userCount,
      icon: Users,
    },
    {
      label: "Natural Remedies",
      value: stats.remedyCount,
      icon: FileText,
    },
    {
      label: "Total Searches",
      value: stats.searchCount,
      icon: Search,
    },
    {
      label: "Total Favorites",
      value: stats.favoriteCount,
      icon: Heart,
    },
    {
      label: "Pending Reviews",
      value: stats.pendingContributions,
      icon: Clock,
    },
    {
      label: "Events (24h)",
      value: stats.recentEvents,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your Remedi platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="eyebrow eyebrow-muted">{stat.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
              </div>
              <p className="tabular mt-4 text-3xl font-semibold tracking-tight text-foreground">
                {stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Searches */}
        <div className="rounded-lg border border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="eyebrow eyebrow-muted">Recent Searches</h2>
          </div>
          <div className="p-6">
            {activity.recentSearches.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No recent searches
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.recentSearches.map((search, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {search.query}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {search.resultsCount} results
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(search.createdAt).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pending Contributions */}
        <div className="rounded-lg border border-border bg-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Pending Contributions
            </h2>
          </div>
          <div className="p-6">
            {activity.recentContributions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No pending contributions
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.recentContributions.map((contribution) => (
                  <li
                    key={contribution.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {contribution.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        by {contribution.user.name || contribution.user.email}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                      Pending
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
