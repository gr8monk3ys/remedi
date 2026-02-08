"use client";

import { useMemo } from "react";
import { Filter } from "@/components/ui/filter";
import { Pagination } from "@/components/ui/pagination";
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
  // Memoize pagination slice to prevent unnecessary array creation on every render
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredResults, currentPage, itemsPerPage]);

  return (
    <div id="search-results">
      {/* Filters */}
      {results.length > 0 && showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
        <div className="flex justify-center items-center py-8">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: "var(--primary)" }}
          ></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredResults.length === 0 && query && !error && (
        <div
          className="text-center py-8"
          style={{ color: "var(--foreground-muted)" }}
        >
          {results.length > 0
            ? "No results match your current filters. Try adjusting your filters."
            : `No results found for "${query}". Try a different search term.`}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8" style={{ color: "var(--error)" }}>
          {error}
        </div>
      )}

      {/* Results List */}
      <div className="grid grid-cols-1 gap-6 mt-2">
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
