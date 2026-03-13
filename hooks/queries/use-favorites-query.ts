"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDbUser } from "@/hooks/use-db-user";
import { useSessionId } from "@/hooks/use-session-id";
import { apiClient, ApiClientError } from "@/lib/api/client";

interface Favorite {
  id: string;
  remedyId: string;
  remedyName: string;
  notes?: string;
  collectionName?: string;
  createdAt: Date;
}

const FAVORITES_KEY = ["favorites"] as const;

function buildParams(
  dbUserId: string | undefined,
  sessionId: string | null,
): URLSearchParams | null {
  const params = new URLSearchParams();
  if (dbUserId) {
    params.append("userId", dbUserId);
  } else if (sessionId) {
    params.append("sessionId", sessionId);
  } else {
    return null;
  }
  return params;
}

export function useFavoritesQuery() {
  const { dbUserId } = useDbUser();
  const sessionId = useSessionId();

  return useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: async () => {
      const params = buildParams(dbUserId, sessionId);
      if (!params) return [];
      const data = await apiClient.get<{ favorites: Favorite[] }>(
        `/api/favorites?${params.toString()}`,
      );
      return data.favorites;
    },
    enabled: Boolean(dbUserId || sessionId),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { dbUserId } = useDbUser();
  const sessionId = useSessionId();

  return useMutation({
    mutationFn: async ({
      remedyId,
      remedyName,
      action,
    }: {
      remedyId: string;
      remedyName: string;
      action: "add" | "remove";
    }) => {
      if (action === "add") {
        const body: Record<string, string> = { remedyId, remedyName };
        if (dbUserId) body.userId = dbUserId;
        else if (sessionId) body.sessionId = sessionId;
        return apiClient.post<{ favorite: Favorite }>("/api/favorites", body);
      }
      // For remove, we need the favorite's id from cache
      const cached = queryClient.getQueryData<Favorite[]>(FAVORITES_KEY) ?? [];
      const fav = cached.find((f) => f.remedyId === remedyId);
      if (!fav) throw new Error("Favorite not found");
      return apiClient.delete(`/api/favorites?id=${fav.id}`);
    },
    onMutate: async ({ remedyId, remedyName, action }) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });
      const previous =
        queryClient.getQueryData<Favorite[]>(FAVORITES_KEY) ?? [];

      queryClient.setQueryData<Favorite[]>(FAVORITES_KEY, (old = []) =>
        action === "add"
          ? [
              ...old,
              {
                id: `optimistic-${remedyId}`,
                remedyId,
                remedyName,
                createdAt: new Date(),
              },
            ]
          : old.filter((f) => f.remedyId !== remedyId),
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_KEY, context.previous);
      }
      if (err instanceof ApiClientError && err.statusCode === 409) return;
      toast.error(
        err instanceof Error ? err.message : "Failed to update favorite",
      );
    },
    onSuccess: (_data, vars) => {
      toast.success(
        vars.action === "add" ? "Added to favorites" : "Removed from favorites",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
}
