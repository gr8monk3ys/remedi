"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSessionId } from "./use-session-id";
import { fetchWithCSRF } from "@/lib/fetch";

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
export function useSearchHistory(limit: number = 10): UseSearchHistoryReturn {
  const { data: session } = useSession();
  const sessionId = useSessionId();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch search history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.user && !sessionId) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (session?.user?.id) {
          params.append("userId", session.user.id);
        } else if (sessionId) {
          params.append("sessionId", sessionId);
        }
        params.append("limit", limit.toString());

        const response = await fetch(`/api/search-history?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch search history: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data?.history) {
          setHistory(data.data.history);
        }
      } catch (err) {
        console.error("Error fetching search history:", err);
        setError(err instanceof Error ? err.message : "Failed to load search history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [session, sessionId, limit]);

  // Clear all search history
  const clearHistory = useCallback(async () => {
    if (!session?.user && !sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (session?.user?.id) {
        params.append("userId", session.user.id);
      } else if (sessionId) {
        params.append("sessionId", sessionId);
      }

      const response = await fetchWithCSRF(`/api/search-history?${params.toString()}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to clear history");
      }

      setHistory([]);
    } catch (err) {
      console.error("Error clearing search history:", err);
      setError(err instanceof Error ? err.message : "Failed to clear history");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session, sessionId]);

  return {
    history,
    clearHistory,
    isLoading,
    error,
  };
}
