import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FavoriteCardSkeleton } from "@/components/dashboard/FavoriteCard";
import { FavoritesPageClient } from "./favorites-client";
import type { FavoriteItem } from "@/types/dashboard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Favorites",
  description: "View and manage your saved natural remedies on Remedi.",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    collection?: string;
  }>;
}

/**
 * Favorites Dashboard Page
 *
 * Displays paginated favorites with collection filtering and sort options.
 */
export default async function FavoritesPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const sort = params.sort || "newest";
  const collection = params.collection || null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your saved natural remedies. Organize them into
          collections for quick access.
        </p>
      </div>

      {/* Favorites Content */}
      <Suspense fallback={<FavoritesPageSkeleton />}>
        <FavoritesContent
          userId={user.id}
          page={page}
          sort={sort}
          collection={collection}
        />
      </Suspense>
    </div>
  );
}

/**
 * Favorites Content Component
 */
async function FavoritesContent({
  userId,
  page,
  sort,
  collection,
}: {
  userId: string;
  page: number;
  sort: string;
  collection: string | null;
}): Promise<React.JSX.Element> {
  const pageSize = 12;

  // Build where clause
  const where: { userId: string; collectionName?: string } = { userId };
  if (collection) {
    where.collectionName = collection;
  }

  // Determine sort order
  let orderBy: {
    createdAt?: "asc" | "desc";
    remedyName?: "asc" | "desc";
  } = { createdAt: "desc" };
  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "name_asc":
      orderBy = { remedyName: "asc" };
      break;
    case "name_desc":
      orderBy = { remedyName: "desc" };
      break;
  }

  // Fetch favorites, count, and distinct collections in parallel
  const [favorites, totalCount, collectionsRaw] = await Promise.all([
    prisma.favorite.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        remedyId: true,
        remedyName: true,
        notes: true,
        collectionName: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.favorite.count({ where }),
    prisma.favorite.findMany({
      where: { userId },
      distinct: ["collectionName"],
      select: { collectionName: true },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // Transform to FavoriteItem type
  const items: FavoriteItem[] = favorites.map(
    (f: {
      id: string;
      remedyId: string;
      remedyName: string;
      notes: string | null;
      collectionName: string | null;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: f.id,
      remedyId: f.remedyId,
      remedyName: f.remedyName,
      notes: f.notes,
      collectionName: f.collectionName,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }),
  );

  // Extract collection names, filtering out null values
  const collections: string[] = collectionsRaw
    .map((c: { collectionName: string | null }) => c.collectionName)
    .filter((name: string | null): name is string => name !== null);

  return (
    <FavoritesPageClient
      favorites={items}
      collections={collections}
      currentPage={page}
      totalPages={totalPages}
      totalCount={totalCount}
      currentSort={sort}
      currentCollection={collection}
      userId={userId}
    />
  );
}

/**
 * Skeleton loader for favorites page
 */
function FavoritesPageSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4">
      {/* Action bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
          <div className="h-10 w-10 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <FavoriteCardSkeleton key={i} viewMode="grid" />
        ))}
      </div>
    </div>
  );
}
