"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";

interface FavoriteToggleProps {
  remedyId: string;
  remedyName: string;
}

export function FavoriteToggle({ remedyId, remedyName }: FavoriteToggleProps) {
  const { isFavorite, addFavorite, removeFavorite, isLoading } = useFavorites();
  const favorited = isFavorite(remedyId);

  const handleToggle = async (): Promise<void> => {
    try {
      if (favorited) {
        await removeFavorite(remedyId);
      } else {
        await addFavorite(remedyId, remedyName);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
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
