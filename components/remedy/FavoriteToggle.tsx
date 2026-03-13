"use client";

import { Heart } from "lucide-react";
import { useFavoritesQuery, useToggleFavorite } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { createLogger } from "@/lib/logger";

const logger = createLogger("favorite-toggle");

interface FavoriteToggleProps {
  remedyId: string;
  remedyName: string;
}

export function FavoriteToggle({ remedyId, remedyName }: FavoriteToggleProps) {
  const { data: favorites = [], isLoading: queryLoading } = useFavoritesQuery();
  const toggleMutation = useToggleFavorite();
  const favorited = favorites.some((f) => f.remedyId === remedyId);
  const isLoading = queryLoading || toggleMutation.isPending;

  const handleToggle = async (): Promise<void> => {
    try {
      await toggleMutation.mutateAsync({
        remedyId,
        remedyName,
        action: favorited ? "remove" : "add",
      });
    } catch (error) {
      logger.error("Failed to toggle favorite", error);
    }
  };

  return (
    <Button
      variant={favorited ? "destructive" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className="gap-1.5"
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
      {favorited ? "Saved" : "Save"}
    </Button>
  );
}
