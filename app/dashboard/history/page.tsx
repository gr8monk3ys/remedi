import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HistoryTableSkeleton } from "@/components/dashboard/HistoryTable";
import { HistoryPageClient } from "./history-client";
import type { SearchHistoryItem } from "@/types/dashboard";
import type { Metadata } from "next";
import Link from "next/link";
import { getEffectivePlanLimits } from "@/lib/trial";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search History",
  description: "View and manage your search history on Remedi.",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
  }>;
}

/**
 * Search History Page
 *
 * Displays paginated search history with export and clear options.
 */
export default async function HistoryPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { limits } = await getEffectivePlanLimits(user.id);

  if (!limits.canAccessHistory) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search History</h1>
          <p className="text-muted-foreground mt-1">
            Search history is available on Basic and Premium plans.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-foreground">
            Upgrade to unlock your full search history and export tools.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Upgrade
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const sort = params.sort || "newest";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Search History</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your past searches. Re-run searches or export your
          history.
        </p>
      </div>

      {/* History Content */}
      <Suspense fallback={<HistoryPageSkeleton />}>
        <HistoryContent userId={user.id} page={page} sort={sort} />
      </Suspense>
    </div>
  );
}

/**
 * History Content Component
 */
async function HistoryContent({
  userId,
  page,
  sort,
}: {
  userId: string;
  page: number;
  sort: string;
}) {
  const pageSize = 10;

  // Determine sort order
  let orderBy: { createdAt?: "asc" | "desc"; resultsCount?: "asc" | "desc" } = {
    createdAt: "desc",
  };
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "most_results":
      orderBy = { resultsCount: "desc" };
      break;
    case "least_results":
      orderBy = { resultsCount: "asc" };
      break;
  }

  // Fetch history with pagination
  const [history, totalCount] = await Promise.all([
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        query: true,
        resultsCount: true,
        createdAt: true,
      },
    }),
    prisma.searchHistory.count({
      where: { userId },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Transform to SearchHistoryItem type
  const items: SearchHistoryItem[] = history.map(
    (h: {
      id: string;
      query: string;
      resultsCount: number;
      createdAt: Date;
    }) => ({
      id: h.id,
      query: h.query,
      resultsCount: h.resultsCount,
      createdAt: h.createdAt,
    }),
  );

  return (
    <HistoryPageClient
      history={items}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      currentSort={sort}
      userId={userId}
    />
  );
}

/**
 * Skeleton loader for history page
 */
function HistoryPageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Action bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <HistoryTableSkeleton rows={10} />
      </div>
    </div>
  );
}
