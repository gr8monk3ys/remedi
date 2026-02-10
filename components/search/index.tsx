"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { fetchWithCSRF } from "@/lib/fetch-with-csrf";
import { useFavorites } from "@/hooks/use-favorites";
import { useSearchHistory } from "@/hooks/use-search-history";
import { createLogger } from "@/lib/logger";
import { SearchInput } from "./SearchInput";
import { SearchTabs } from "./SearchTabs";
import { SearchHistory } from "./SearchHistory";
import { SearchResults } from "./SearchResults";
import type { SearchResult, AIInsights, AIRecommendation } from "./types";

const log = createLogger("search-component");

interface SearchComponentProps extends React.HTMLProps<HTMLDivElement> {
  onSearch?: (results: SearchResult[]) => void;
  className?: string;
}

export function SearchComponent({
  className,
  onSearch,
  ...props
}: SearchComponentProps) {
  const router = useRouter();
  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    isLoading: favoritesLoading,
  } = useFavorites();
  const {
    history: searchHistory,
    clearHistory,
    isLoading: historyLoading,
  } = useSearchHistory(10);

  // Search state
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"results" | "history">("results");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3;

  // Filter state
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [nutrientFilters, setNutrientFilters] = useState<string[]>([]);

  // AI state
  const [useAiSearch, setUseAiSearch] = useState<boolean>(false);
  const [aiSearchAvailable, setAiSearchAvailable] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);

  // Refs for DOM elements (React pattern instead of document.querySelector)
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Check AI availability on mount
  useEffect(() => {
    const checkAiAvailability = async () => {
      try {
        const data = await apiClient.get<{ status: string }>("/api/ai-search");
        if (data.status === "available") {
          setAiSearchAvailable(true);
        }
      } catch (error) {
        log.error("Failed to check AI search availability", error);
      }
    };
    checkAiAvailability();
  }, []);

  // Memoized filter options - optimized single-pass calculation
  const categoryOptions = useMemo(() => {
    // Single pass: accumulate category counts in a Map
    const categoryCountMap = new Map<string, number>();
    for (const result of results) {
      if (result.category) {
        categoryCountMap.set(
          result.category,
          (categoryCountMap.get(result.category) || 0) + 1,
        );
      }
    }
    // Convert to array of options
    return Array.from(categoryCountMap.entries()).map(([category, count]) => ({
      value: category,
      label: category,
      count,
    }));
  }, [results]);

  const nutrientOptions = useMemo(() => {
    // Single pass: accumulate nutrient counts in a Map
    const nutrientCountMap = new Map<string, number>();
    for (const result of results) {
      for (const nutrient of result.matchingNutrients) {
        nutrientCountMap.set(
          nutrient,
          (nutrientCountMap.get(nutrient) || 0) + 1,
        );
      }
    }
    // Convert to array of options
    return Array.from(nutrientCountMap.entries()).map(([nutrient, count]) => ({
      value: nutrient,
      label: nutrient,
      count,
    }));
  }, [results]);

  // Apply filters
  useEffect(() => {
    let filtered = [...results];

    if (categoryFilters.length > 0) {
      filtered = filtered.filter(
        (r) => r.category && categoryFilters.includes(r.category),
      );
    }

    if (nutrientFilters.length > 0) {
      filtered = filtered.filter((r) =>
        r.matchingNutrients.some((nutrient) =>
          nutrientFilters.includes(nutrient),
        ),
      );
    }

    setFilteredResults(filtered);
    setCurrentPage(1);
  }, [results, categoryFilters, nutrientFilters]);

  // Search handler - memoized with useCallback
  // Accepts optional searchQuery parameter for direct invocation (e.g., from history selection)
  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const queryToSearch = searchQuery ?? query;
      if (!queryToSearch.trim()) return;

      // Update query state if a specific search query was provided
      if (searchQuery && searchQuery !== query) {
        setQuery(searchQuery);
      }

      setIsLoading(true);
      setError(null);
      setAiInsights(null);

      try {
        log.info("Searching", { query: queryToSearch, aiPowered: useAiSearch });

        let response;
        let apiResponse;

        if (useAiSearch && aiSearchAvailable) {
          // Use fetchWithCSRF for POST requests to include CSRF token
          response = await fetchWithCSRF("/api/ai-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: queryToSearch }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          apiResponse = await response.json();

          if (apiResponse.success === false) {
            setError(apiResponse.error?.message || "AI search failed");
            setResults([]);
            setFilteredResults([]);
            return;
          }

          const { recommendations, intent, extractedInfo } = apiResponse.data;

          const aiResults: SearchResult[] = (
            recommendations as AIRecommendation[]
          ).map((rec) => ({
            id: rec.remedy.id,
            name: rec.remedy.name,
            description: rec.remedy.description || rec.reasoning,
            imageUrl: rec.remedy.imageUrl || "",
            category: rec.remedy.category,
            matchingNutrients: rec.remedy.matchingNutrients || [],
            similarityScore: rec.confidence,
          }));

          setAiInsights({ intent, extractedInfo, recommendations });
          setResults(aiResults);
          setFilteredResults(aiResults);
          if (onSearch) onSearch(aiResults);
        } else {
          response = await fetch(
            `/api/search?query=${encodeURIComponent(queryToSearch)}`,
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          apiResponse = await response.json();

          if (apiResponse.success === false) {
            setError(apiResponse.error?.message || "Search failed");
            setResults([]);
            setFilteredResults([]);
            return;
          }

          const data = apiResponse.data || apiResponse;
          setResults(data);
          setFilteredResults(data);
          if (onSearch) onSearch(data);
        }

        setCurrentPage(1);
        setCategoryFilters([]);
        setNutrientFilters([]);
        setActiveTab("results");
      } catch (error) {
        log.error("Error searching", error);
        setError("Failed to retrieve search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [query, useAiSearch, aiSearchAvailable, onSearch],
  );

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Use ref instead of document.getElementById for React pattern
    if (searchResultsRef.current) {
      window.scrollTo({
        top: searchResultsRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, []);

  const handleFavoriteToggle = useCallback(
    async (e: React.MouseEvent, remedyId: string, remedyName: string) => {
      e.stopPropagation();
      try {
        if (isFavorite(remedyId)) {
          await removeFavorite(remedyId);
        } else {
          await addFavorite(remedyId, remedyName);
        }
      } catch (error) {
        log.error("Failed to toggle favorite", error);
      }
    },
    [isFavorite, addFavorite, removeFavorite],
  );

  const handleSelectHistoryQuery = useCallback(
    (selectedQuery: string) => {
      // Directly call handleSearch with the selected query
      // This avoids DOM manipulation and follows React patterns
      handleSearch(selectedQuery);
    },
    [handleSearch],
  );

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const showTabs = results.length > 0 || searchHistory.length > 0;

  return (
    <div className={cn("w-full", className)} {...props}>
      <SearchInput
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        useAiSearch={useAiSearch}
        setUseAiSearch={setUseAiSearch}
        aiSearchAvailable={aiSearchAvailable}
      />

      {showTabs && (
        <SearchTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          resultsCount={results.length}
          historyCount={searchHistory.length}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          activeFiltersCount={categoryFilters.length + nutrientFilters.length}
        />
      )}

      {activeTab === "history" && searchHistory.length > 0 && (
        <SearchHistory
          history={searchHistory}
          isLoading={historyLoading}
          onSelectQuery={handleSelectHistoryQuery}
          onClearHistory={clearHistory}
        />
      )}

      {activeTab === "results" && (
        <div ref={searchResultsRef}>
          <SearchResults
            results={results}
            filteredResults={filteredResults}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            error={error}
            query={query}
            showFilters={showFilters}
            categoryOptions={categoryOptions}
            nutrientOptions={nutrientOptions}
            categoryFilters={categoryFilters}
            nutrientFilters={nutrientFilters}
            setCategoryFilters={setCategoryFilters}
            setNutrientFilters={setNutrientFilters}
            aiInsights={aiInsights}
            isFavorite={isFavorite}
            favoritesLoading={favoritesLoading}
            onFavoriteToggle={handleFavoriteToggle}
            onViewDetails={(id) => router.push(`/remedy/${id}`)}
          />
        </div>
      )}
    </div>
  );
}

// Re-export types for external use
export type { SearchResult, AIInsights } from "./types";
