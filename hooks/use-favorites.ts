"use client";

import { useState, useEffect, useCallback } from "react";
import { useDbUser } from "@/hooks/use-db-user";
import { useSessionId } from "./use-session-id";
import { fetchWithCSRF } from "@/lib/fetch";

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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
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

        const response = await fetch(`/api/favorites?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch favorites: ${response.status}`);
        }

        const data: ApiResponse<{ favorites: Favorite[] }> =
          await response.json();

        if (data.success && data.data?.favorites) {
          setFavorites(data.data.favorites);
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load favorites",
        );
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

        const response = await fetchWithCSRF("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data: ApiResponse<{ favorite: Favorite }> = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            // Already favorited - just refresh the list
            return;
          }
          throw new Error(data.error?.message || "Failed to add favorite");
        }

        if (data.success && data.data?.favorite) {
          setFavorites((prev) => [...prev, data.data!.favorite]);
        }
      } catch (err) {
        console.error("Error adding favorite:", err);
        setError(err instanceof Error ? err.message : "Failed to add favorite");
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
        const response = await fetchWithCSRF(
          `/api/favorites?id=${favorite.id}`,
          {
            method: "DELETE",
          },
        );

        const data: ApiResponse<null> = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Failed to remove favorite");
        }

        setFavorites((prev) => prev.filter((fav) => fav.id !== favorite.id));
      } catch (err) {
        console.error("Error removing favorite:", err);
        setError(
          err instanceof Error ? err.message : "Failed to remove favorite",
        );
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
