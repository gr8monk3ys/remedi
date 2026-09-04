"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { apiClient, ApiClientError } from "@/lib/api/client";
import {
  useFavoritesQuery,
  useToggleFavorite,
  useSearchHistoryQuery,
} from "@/hooks/queries";
import { useDbUser } from "@/hooks/use-db-user";
import { useSessionId } from "@/hooks/use-session-id";
import { createLogger } from "@/lib/logger";
import { useFeatureAccess } from "@/components/upgrade/FeatureGate";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { usePlanQuery } from "@/hooks/queries";
import { SearchInput } from "./SearchInput";
import { SearchTabs } from "./SearchTabs";
import { SearchHistory } from "./SearchHistory";
import { SearchResults } from "./SearchResults";
import type {
  SearchResult,
  AIInsights,
  AIRecommendation,
  SearchRefusal,
} from "./types";

const log = createLogger("search-component");

type SearchEndpointType = "search" | "ai-search";

type PlanLimitReason = "search_limit" | "ai_search_limit";

function formatRateLimitMessage(
  endpoint: SearchEndpointType,
  retryAfter: number | null,
): string {
  const endpointLabel = endpoint === "ai-search" ? "AI search" : "Search";
  if (retryAfter && retryAfter > 0) {
    return `${endpointLabel} is temporarily rate-limited. Please wait ${retryAfter}s and try again.`;
  }
  return `${endpointLabel} is temporarily rate-limited. Please try again in about a minute.`;
}

/**
 * Turn a failed search into something to show the user.
 *
 * Plan limits and transient rate limits share HTTP 429 but need opposite
 * responses: a plan limit is resolved by upgrading, a rate limit by waiting.
 * Both endpoints fail the same way, so this is written once for both.
 */
function describeSearchFailure(
  error: unknown,
  endpoint: SearchEndpointType,
): { message: string; planLimit: PlanLimitReason | null } {
  const label = endpoint === "ai-search" ? "AI search" : "Search";

  if (error instanceof ApiClientError) {
    if (error.code === "LIMIT_EXCEEDED") {
      return {
        message:
          error.message || `You've reached your ${label} limit for today.`,
        planLimit:
          endpoint === "ai-search" ? "ai_search_limit" : "search_limit",
      };
    }
    if (error.code === "RATE_LIMIT_EXCEEDED" || error.statusCode === 429) {
      return {
        message: formatRateLimitMessage(endpoint, error.retryAfter ?? null),
        planLimit: null,
      };
    }
    return {
      message: error.message || `${label} failed. Please try again.`,
      planLimit: null,
    };
  }

  return {
    message: "Failed to retrieve search results. Please try again.",
    planLimit: null,
  };
}

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
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { dbUserId } = useDbUser();
  const sessionId = useSessionId();
  const { hasAccess: canAccessHistory } = useFeatureAccess("canAccessHistory");
  const showHistoryTab = canAccessHistory === true;
  const { data: planData } = usePlanQuery();
  const currentPlan = planData?.plan ?? "free";
  const { data: favorites = [], isLoading: favoritesLoading } =
    useFavoritesQuery();
  const toggleFavoriteMutation = useToggleFavorite();
  const isFavorite = useCallback(
    (remedyId: string) => favorites.some((f) => f.remedyId === remedyId),
    [favorites],
  );
  const { data: searchHistory = [], isLoading: historyLoading } =
    useSearchHistoryQuery(10);

  const clearHistory = useCallback(async () => {
    if (!dbUserId && !sessionId) return;
    const params = new URLSearchParams();
    if (dbUserId) {
      params.append("userId", dbUserId);
    } else if (sessionId) {
      params.append("sessionId", sessionId);
    }
    await apiClient.delete(`/api/search-history?${params.toString()}`);
    await queryClient.invalidateQueries({ queryKey: ["search-history"] });
  }, [dbUserId, sessionId, queryClient]);

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
  const [refusal, setRefusal] = useState<SearchRefusal | null>(null);
  // Set when the API rejects a search because the user's plan quota is spent,
  // so we can offer an upgrade instead of a dead-end error message.
  const [planLimitReason, setPlanLimitReason] = useState<
    "search_limit" | "ai_search_limit" | null
  >(null);

  // Refs for DOM elements (React pattern instead of document.querySelector)
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Search request bookkeeping: the controller cancels the in-flight request
  // when a newer one starts, and the id lets late handlers detect that they
  // have been superseded before touching state.
  const searchAbortRef = useRef<AbortController | null>(null);
  const searchRequestIdRef = useRef(0);

  // Lets the ?q= effect call the latest handleSearch without depending on it
  // (it is defined further down and would otherwise re-run the effect).
  const handleSearchRef = useRef<((q?: string) => Promise<void>) | null>(null);

  // Run a search from ?q= on arrival, so links into the app (e.g. "search
  // again" from history) land on results instead of an empty search box.
  const initialQueryRef = useRef<string | null>(null);
  useEffect(() => {
    const initialQuery = searchParams.get("q")?.trim();
    if (!initialQuery || initialQueryRef.current === initialQuery) {
      return;
    }
    initialQueryRef.current = initialQuery;
    setQuery(initialQuery);
    void handleSearchRef.current?.(initialQuery);
  }, [searchParams]);

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

  // If the user can't access history (or auth is still loading), keep them on Results.
  useEffect(() => {
    if (!showHistoryTab && activeTab === "history") {
      setActiveTab("results");
    }
  }, [showHistoryTab, activeTab]);

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

      // Typing (debounced), pressing Enter and clicking a suggestion can all
      // put searches in flight at once. Cancel the previous request and stamp
      // this one, so a slow earlier response can never overwrite newer results.
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      const requestId = ++searchRequestIdRef.current;
      const isStale = (): boolean => searchRequestIdRef.current !== requestId;

      setIsLoading(true);
      setError(null);
      setAiInsights(null);
      setRefusal(null);

      try {
        log.info("Searching", { query: queryToSearch, aiPowered: useAiSearch });

        if (useAiSearch && aiSearchAvailable) {
          const { recommendations, intent, extractedInfo, refused } =
            await apiClient.post<{
              recommendations: AIRecommendation[];
              intent: AIInsights["intent"];
              extractedInfo: AIInsights["extractedInfo"];
              refused?: SearchRefusal;
            }>(
              "/api/ai-search",
              { query: queryToSearch },
              { signal: controller.signal },
            );

          // The route answers a policy refusal with an empty list and a stated
          // reason. Dropping the reason here is what made a refusal look like
          // "nothing found" on screen.
          if (refused) {
            if (isStale()) return;
            setRefusal(refused);
            setResults([]);
            setFilteredResults([]);
            if (onSearch) onSearch([]);
            setCurrentPage(1);
            setCategoryFilters([]);
            setNutrientFilters([]);
            setActiveTab("results");
            return;
          }

          const aiResults: SearchResult[] = recommendations.map((rec) => ({
            id: rec.remedy.id,
            name: rec.remedy.name,
            description: rec.remedy.description || rec.reasoning,
            imageUrl: rec.remedy.imageUrl || "",
            category: rec.remedy.category,
            matchingNutrients: rec.remedy.matchingNutrients || [],
            similarityScore: rec.confidence,
          }));

          if (isStale()) return;
          setAiInsights({ intent, extractedInfo, recommendations });
          setResults(aiResults);
          setFilteredResults(aiResults);
          if (onSearch) onSearch(aiResults);
        } else {
          // Pass sessionId so anonymous searches are attributed to the
          // visitor's session instead of being saved unattributed.
          const searchParamsForRequest = new URLSearchParams({
            query: queryToSearch,
          });
          if (!dbUserId && sessionId) {
            searchParamsForRequest.set("sessionId", sessionId);
          }

          const data = await apiClient.get<SearchResult[]>(
            `/api/search?${searchParamsForRequest.toString()}`,
            { signal: controller.signal },
          );

          if (isStale()) return;
          setResults(data);
          setFilteredResults(data);
          if (onSearch) onSearch(data);
        }

        if (isStale()) return;
        setCurrentPage(1);
        setCategoryFilters([]);
        setNutrientFilters([]);
        setActiveTab("results");
      } catch (error) {
        // An aborted request was deliberately superseded; it is not an error
        // and its state must not leak into the newer search.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (isStale()) return;
        log.error("Error searching", error);

        const { message, planLimit } = describeSearchFailure(
          error,
          useAiSearch && aiSearchAvailable ? "ai-search" : "search",
        );
        if (planLimit) setPlanLimitReason(planLimit);
        setError(message);
        setResults([]);
        setFilteredResults([]);
      } finally {
        // Only the newest request owns the spinner.
        if (!isStale()) {
          setIsLoading(false);
        }
      }
    },
    [query, useAiSearch, aiSearchAvailable, onSearch, dbUserId, sessionId],
  );

  // Keep the ref pointing at the current handler for the ?q= effect above.
  handleSearchRef.current = handleSearch;

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
        await toggleFavoriteMutation.mutateAsync({
          remedyId,
          remedyName,
          action: isFavorite(remedyId) ? "remove" : "add",
        });
      } catch (error) {
        log.error("Failed to toggle favorite", error);
      }
    },
    [isFavorite, toggleFavoriteMutation],
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
          showHistoryTab={showHistoryTab}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          activeFiltersCount={categoryFilters.length + nutrientFilters.length}
        />
      )}

      {showHistoryTab &&
        activeTab === "history" &&
        searchHistory.length > 0 && (
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
            refusal={refusal}
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

      {/* Hitting a plan quota should offer a way forward, not just an error. */}
      <UpgradeModal
        isOpen={planLimitReason !== null}
        onClose={() => setPlanLimitReason(null)}
        triggerReason={planLimitReason ?? "feature"}
        currentPlan={currentPlan}
      />
    </div>
  );
}

// Re-export types for external use
export type { SearchResult, AIInsights } from "./types";
