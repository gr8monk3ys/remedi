"use client";

import { useMemo } from "react";
import { Filter } from "@/components/ui/filter";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SearchResultCard } from "./SearchResultCard";
import { AIInsightsPanel } from "./AIInsightsPanel";
import type { SearchResult, AIInsights } from "./types";
import type { SearchStatus } from "./status";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  filteredResults: SearchResult[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  /**
   * What the search has to say: answered, refused, or unavailable.
   *
   * One value rather than separate `error` and `refusal` props, so the empty
   * state ("No results found") is structurally unreachable unless the search
   * actually answered. Reporting a refusal or an outage as an absence is the
   * failure this shape exists to prevent.
   */
  status: SearchStatus;
  query: string;
  showFilters: boolean;
  categoryOptions: FilterOption[];
  nutrientOptions: FilterOption[];
  categoryFilters: string[];
  nutrientFilters: string[];
  setCategoryFilters: (filters: string[]) => void;
  setNutrientFilters: (filters: string[]) => void;
  aiInsights: AIInsights | null;
  isFavorite: (id: string) => boolean;
  favoritesLoading: boolean;
  onFavoriteToggle: (
    e: React.MouseEvent,
    remedyId: string,
    remedyName: string,
  ) => void;
  onViewDetails: (remedyId: string) => void;
}

export function SearchResults({
  results,
  filteredResults,
  currentPage,
  itemsPerPage,
  onPageChange,
  isLoading,
  status,
  query,
  showFilters,
  categoryOptions,
  nutrientOptions,
  categoryFilters,
  nutrientFilters,
  setCategoryFilters,
  setNutrientFilters,
  aiInsights,
  isFavorite,
  favoritesLoading,
  onFavoriteToggle,
  onViewDetails,
}: SearchResultsProps) {
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredResults, currentPage, itemsPerPage]);

  return (
    <div id="search-results">
      {/* Filters */}
      {results.length > 0 && showFilters && (
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
          {categoryOptions.length > 0 && (
            <Filter
              title="Filter by Category"
              options={categoryOptions}
              selectedValues={categoryFilters}
              onChange={setCategoryFilters}
            />
          )}
          {nutrientOptions.length > 0 && (
            <Filter
              title="Filter by Nutrients"
              options={nutrientOptions}
              selectedValues={nutrientFilters}
              onChange={setNutrientFilters}
            />
          )}
        </div>
      )}

      {/* AI Insights */}
      {aiInsights && !isLoading && <AIInsightsPanel insights={aiInsights} />}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/*
        The three arms below are mutually exclusive by construction. The empty
        state sits inside `status.kind === "answered"`, so a refusal or an
        outage cannot reach it — previously that was a `!refusal && !error`
        guard, which anyone editing this JSX could drop without the compiler
        noticing.
      */}
      {!isLoading && status.kind === "refused" && (
        <div
          role="status"
          className="my-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4"
        >
          <p className="text-sm font-medium text-foreground">
            No matches are offered for this search.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{status.message}</p>
        </div>
      )}

      {!isLoading && status.kind === "unavailable" && (
        <div role="status" className="py-8 text-center">
          <p className="text-sm text-destructive">{status.message}</p>
        </div>
      )}

      {!isLoading &&
        status.kind === "answered" &&
        filteredResults.length === 0 &&
        query && (
          <div role="status" className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {results.length > 0
                ? "No results match your current filters. Try adjusting your filters."
                : `No results found for "${query}". Try a different search term.`}
            </p>
          </div>
        )}

      {/*
        The disclaimer belongs with the advice.

        It used to live only at the foot of app/page.tsx, after the label
        glossary and the whole "How it works" section — roughly two screens
        below the last recommendation, in the smallest, lowest-contrast type on
        the page. Every other surface that recommends something (the remedy
        page, the interaction checker, /compare) carries a proper alert beside
        the recommendation. The homepage is the primary journey and had the
        weakest treatment.

        Rendering it here rather than on the page means it follows the results
        to wherever they are shown, and appears only when there is something to
        disclaim.
      */}
      {!isLoading && filteredResults.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
            <strong>These are not medical advice.</strong> Remedi maps published
            ingredient and property data; it does not know your history. Never
            stop or change a prescribed medication without talking to your
            prescriber or pharmacist first.
          </p>
        </div>
      )}

      {/* Results List */}
      <div className="grid grid-cols-1 gap-3 mt-2">
        {currentItems.map((result) => (
          <SearchResultCard
            key={result.id}
            result={result}
            isFavorite={isFavorite(result.id)}
            isLoading={favoritesLoading}
            onFavoriteToggle={onFavoriteToggle}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Pagination */}
      {filteredResults.length > 0 && (
        <Pagination
          totalItems={filteredResults.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
