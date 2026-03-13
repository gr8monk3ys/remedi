"use client";

import { useQuery } from "@tanstack/react-query";
import { useDbUser } from "@/hooks/use-db-user";
import { useSessionId } from "@/hooks/use-session-id";
import { apiClient } from "@/lib/api/client";

interface SearchHistoryItem {
  id: string;
  query: string;
  resultsCount: number;
  searchedAt: Date;
}

const SEARCH_HISTORY_KEY = ["search-history"] as const;

/**
 * Fetches the authenticated user's search history.
 * Disabled when no user identity is available.
 */
export function useSearchHistoryQuery(limit: number = 10) {
  const { dbUserId } = useDbUser();
  const sessionId = useSessionId();

  return useQuery({
    queryKey: [...SEARCH_HISTORY_KEY, { limit }] as const,
    queryFn: async () => {
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
      return data.history;
    },
    enabled: Boolean(dbUserId || sessionId),
  });
}
