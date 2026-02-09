"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Grid3X3,
  List,
  Heart,
  Search,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import {
  FavoriteCard,
  FavoriteCardSkeleton,
} from "@/components/dashboard/FavoriteCard";
import { fetchWithCSRF } from "@/lib/fetch";
import type {
  FavoriteItem,
  FavoritesSortOption,
  ViewMode,
} from "@/types/dashboard";

interface FavoritesPageClientProps {
  favorites: FavoriteItem[];
  collections: string[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  currentSort: string;
  currentCollection: string | null;
  /** User ID passed from server for potential future use (e.g., bulk operations). */
  userId: string;
}

const SORT_LABELS: Record<FavoritesSortOption, string> = {
  newest: "Newest First",
  oldest: "Oldest First",
  name_asc: "Name (A-Z)",
  name_desc: "Name (Z-A)",
};

/**
 * Favorites Page Client Component
 *
 * Handles client-side interactions for the favorites page including
 * view toggling, sorting, collection filtering, and removal.
 */
export function FavoritesPageClient({
  favorites,
  collections,
  currentPage,
  totalPages,
  totalCount,
  currentSort,
  currentCollection,
  userId: _userId,
}: FavoritesPageClientProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = (params: {
    page?: number;
    sort?: string;
    collection?: string | null;
  }): string => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params.page ?? currentPage));
    searchParams.set("sort", params.sort ?? currentSort);
    const col =
      params.collection !== undefined ? params.collection : currentCollection;
    if (col) {
      searchParams.set("collection", col);
    }
    return `/dashboard/favorites?${searchParams.toString()}`;
  };

  const handleSortChange = (sort: FavoritesSortOption): void => {
    startTransition(() => {
      router.push(buildUrl({ page: 1, sort }));
    });
  };

  const handleCollectionChange = (collection: string | null): void => {
    startTransition(() => {
      router.push(buildUrl({ page: 1, collection }));
    });
  };

  const handlePageChange = (newPage: number): void => {
    startTransition(() => {
      router.push(buildUrl({ page: newPage }));
    });
  };

  const handleRemoveFavorite = async (id: string): Promise<void> => {
    setIsRemoving(id);
    setError(null);

    try {
      const response = await fetchWithCSRF(`/api/favorites?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }

      router.refresh();
    } catch {
      setError("Failed to remove favorite. Please try again.");
    } finally {
      setIsRemoving(null);
    }
  };

  // Empty state
  if (totalCount === 0 && !currentCollection) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
          <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No favorites yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Start searching for natural remedies and save the ones you find
          helpful. Your favorites will appear here for quick access.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          <Search className="h-4 w-4" />
          Search for Remedies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {totalCount} {totalCount === 1 ? "favorite" : "favorites"}
          {currentCollection ? ` in "${currentCollection}"` : ""}
        </p>

        <div className="flex items-center gap-2">
          {/* Collection Filter */}
          {collections.length > 0 && (
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Filter by collection"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {currentCollection || "All Collections"}
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleCollectionChange(null)}
                  className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                    !currentCollection
                      ? "text-primary font-medium bg-primary/5"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  All Collections
                </button>
                {collections.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleCollectionChange(name)}
                    className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                      currentCollection === name
                        ? "text-primary font-medium bg-primary/5"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Sort favorites"
            >
              {SORT_LABELS[currentSort as FavoritesSortOption] || "Sort"}
            </button>
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {(
                Object.entries(SORT_LABELS) as [FavoritesSortOption, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleSortChange(value)}
                  className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                    currentSort === value
                      ? "text-primary font-medium bg-primary/5"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state for filtered results */}
      {favorites.length === 0 && currentCollection && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No favorites found in the &quot;{currentCollection}&quot;
            collection.
          </p>
          <button
            onClick={() => handleCollectionChange(null)}
            className="text-sm text-primary hover:underline"
          >
            View all favorites
          </button>
        </div>
      )}

      {/* Favorites Grid/List */}
      {favorites.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {isPending
            ? Array.from({ length: 6 }).map((_, i) => (
                <FavoriteCardSkeleton key={i} viewMode={viewMode} />
              ))
            : favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className={
                    isRemoving === favorite.id
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }
                >
                  <FavoriteCard
                    favorite={favorite}
                    viewMode={viewMode}
                    onDelete={handleRemoveFavorite}
                  />
                </div>
              ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
