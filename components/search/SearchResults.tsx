"use client";

import { useMemo } from "react";
import { Filter } from "@/components/ui/filter";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SearchResultCard } from "./SearchResultCard";
import { AIInsightsPanel } from "./AIInsightsPanel";
import type { SearchResult, AIInsights } from "./types";

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
  error: string | null;
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
  error,
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

      {/* Empty State */}
      {!isLoading && filteredResults.length === 0 && query && !error && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {results.length > 0
              ? "No results match your current filters. Try adjusting your filters."
              : `No results found for "${query}". Try a different search term.`}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
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
