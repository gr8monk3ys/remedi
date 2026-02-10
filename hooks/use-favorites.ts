"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useDbUser } from "@/hooks/use-db-user";
import { useSessionId } from "./use-session-id";
import { apiClient, ApiClientError } from "@/lib/api/client";

interface Favorite {
  id: string;
  remedyId: string;
  remedyName: string;
  notes?: string;
  collectionName?: string;
  createdAt: Date;
}

interface FavoriteRequestBody {
  remedyId: string;
  remedyName: string;
  userId?: string;
  sessionId?: string;
}

interface UseFavoritesReturn {
  favorites: Favorite[];
  isFavorite: (remedyId: string) => boolean;
  addFavorite: (remedyId: string, remedyName: string) => Promise<void>;
  removeFavorite: (remedyId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing user favorites with database persistence
 * Automatically handles session ID for anonymous users and user ID for authenticated users
 */
export function useFavorites(): UseFavoritesReturn {
  const { dbUserId } = useDbUser();
  const sessionId = useSessionId();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
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

        const data = await apiClient.get<{ favorites: Favorite[] }>(
          `/api/favorites?${params.toString()}`,
        );
        setFavorites(data.favorites);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load favorites";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [dbUserId, sessionId]);

  // Check if a remedy is favorited
  const isFavorite = useCallback(
    (remedyId: string) => {
      return favorites.some((fav) => fav.remedyId === remedyId);
    },
    [favorites],
  );

  // Add a remedy to favorites
  const addFavorite = useCallback(
    async (remedyId: string, remedyName: string) => {
      if (!dbUserId && !sessionId) {
        setError("Please sign in to save favorites");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const body: FavoriteRequestBody = {
          remedyId,
          remedyName,
        };

        if (dbUserId) {
          body.userId = dbUserId;
        } else if (sessionId) {
          body.sessionId = sessionId;
        }

        const data = await apiClient.post<{ favorite: Favorite }>(
          "/api/favorites",
          body,
        );
        setFavorites((prev) => [...prev, data.favorite]);
        toast.success("Added to favorites");
      } catch (err) {
        // Already favorited - silently ignore
        if (err instanceof ApiClientError && err.statusCode === 409) {
          return;
        }
        const message =
          err instanceof Error ? err.message : "Failed to add favorite";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [dbUserId, sessionId],
  );

  // Remove a remedy from favorites
  const removeFavorite = useCallback(
    async (remedyId: string) => {
      const favorite = favorites.find((fav) => fav.remedyId === remedyId);
      if (!favorite) return;

      setIsLoading(true);
      setError(null);

      try {
        await apiClient.delete(`/api/favorites?id=${favorite.id}`);
        setFavorites((prev) => prev.filter((fav) => fav.id !== favorite.id));
        toast.success("Removed from favorites");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to remove favorite";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [favorites],
  );

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    isLoading,
    error,
  };
}
