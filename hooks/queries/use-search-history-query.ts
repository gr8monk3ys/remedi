"use client";

import { useQuery } from "@tanstack/react-query";
import { useDbUser } from "@/hooks/use-db-user";
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
 *
 * Enabled only once a database user exists. Reading history is a Basic+
 * feature and `GET /api/search-history` answers 403 for anonymous sessions,
 * so firing it with only a session id produced a guaranteed console error
 * and a wasted request on every home-page load (three of them, with React
 * Query's retries). Anonymous searches are still recorded server-side for
 * a later upgrade; they are just not read back here.
 */
export function useSearchHistoryQuery(limit: number = 10) {
  const { dbUserId } = useDbUser();

  return useQuery({
    queryKey: [...SEARCH_HISTORY_KEY, { limit }] as const,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("userId", dbUserId as string);
      params.append("limit", limit.toString());

      const data = await apiClient.get<{ history: SearchHistoryItem[] }>(
        `/api/search-history?${params.toString()}`,
      );
      return data.history;
    },
    enabled: Boolean(dbUserId),
  });
}
