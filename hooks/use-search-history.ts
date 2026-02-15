"use client";

import { useState, useEffect, useCallback } from "react";
import { useDbUser } from "@/hooks/use-db-user";
import { useSessionId } from "./use-session-id";
import { apiClient } from "@/lib/api/client";
import { createLogger } from "@/lib/logger";

const logger = createLogger("use-search-history");

interface SearchHistoryItem {
  id: string;
  query: string;
  resultsCount: number;
  searchedAt: Date;
}

interface UseSearchHistoryReturn {
  history: SearchHistoryItem[];
  clearHistory: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing search history with database persistence
 * Automatically fetches history for authenticated users or session-based users
 */
export function useSearchHistory(
  limit: number = 10,
  options?: { enabled?: boolean },
): UseSearchHistoryReturn {
  const enabled = options?.enabled ?? true;
  const { dbUserId } = useDbUser();
  const sessionId = useSessionId();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If disabled, clear any existing state and do not fetch.
  useEffect(() => {
    if (!enabled) {
      setHistory([]);
      setIsLoading(false);
      setError(null);
    }
  }, [enabled]);

  // Fetch search history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!enabled) return;
      if (!dbUserId && !sessionId) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (dbUserId) {
          params.append("userId", dbUserId);
        } else if (sessionId) {
          params.append("sessionId", sessionId);
        }
        params.append("limit", limit.toString());

        const data = await apiClient.get<{ history: SearchHistoryItem[] }>(
          `/api/search-history?${params.toString()}`,
        );
        setHistory(data.history);
      } catch (err) {
        logger.error("Error fetching search history", err);
        setError(
          err instanceof Error ? err.message : "Failed to load search history",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [dbUserId, sessionId, limit, enabled]);

  // Clear all search history
  const clearHistory = useCallback(async () => {
    if (!enabled) return;
    if (!dbUserId && !sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (dbUserId) {
        params.append("userId", dbUserId);
      } else if (sessionId) {
        params.append("sessionId", sessionId);
      }

      await apiClient.delete(`/api/search-history?${params.toString()}`);
      setHistory([]);
    } catch (err) {
      logger.error("Error clearing search history", err);
      setError(err instanceof Error ? err.message : "Failed to clear history");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dbUserId, sessionId, enabled]);

  return {
    history,
    clearHistory,
    isLoading,
    error,
  };
}
