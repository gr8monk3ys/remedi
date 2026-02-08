"use client";

import { memo } from "react";
import Image from "next/image";
import { ExternalLink, Heart, GitCompare, Check } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchResult } from "./types";

interface SearchResultCardProps {
  result: SearchResult;
  isFavorite: boolean;
  isLoading: boolean;
  onFavoriteToggle: (
    e: React.MouseEvent,
    remedyId: string,
    remedyName: string,
  ) => void;
  onViewDetails: (remedyId: string) => void;
}

export const SearchResultCard = memo(function SearchResultCard({
  result,
  isFavorite,
  isLoading,
  onFavoriteToggle,
  onViewDetails,
}: SearchResultCardProps) {
  const { isInComparison, addToCompare, removeFromCompare, isFull } =
    useCompare();
  const isComparing = isInComparison(result.id);

  const handleCompareToggle = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (isComparing) {
      removeFromCompare(result.id);
    } else {
      addToCompare({
        id: result.id,
        name: result.name,
        category: result.category,
        imageUrl: result.imageUrl,
      });
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isComparing && "ring-2 ring-primary",
      )}
      onClick={() => onViewDetails(result.id)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {result.imageUrl ? (
              <Image
                src={result.imageUrl}
                alt={result.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs text-muted-foreground">No Image</span>
              </div>
            )}
            {isComparing && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                <Check className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="truncate font-semibold text-sm">
                  {result.name}
                </h3>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  data-compare-button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCompareToggle}
                  disabled={!isComparing && isFull}
                  aria-label={
                    isComparing ? "Remove from comparison" : "Add to comparison"
                  }
                  title={
                    isComparing
                      ? "Remove from comparison"
                      : isFull
                        ? "Comparison list is full (max 4)"
                        : "Add to comparison"
                  }
                >
                  <GitCompare
                    className={cn(
                      "h-4 w-4",
                      isComparing ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </Button>
                <Button
                  data-favorite-button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => onFavoriteToggle(e, result.id, result.name)}
                  disabled={isLoading}
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground",
                    )}
                  />
                </Button>
              </div>
            </div>

            {/* Category Badge */}
            {result.category && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {result.category}
              </Badge>
            )}

            {/* Description */}
            {result.description && (
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                {result.description}
              </p>
            )}

            {/* Matching Nutrients */}
            {result.matchingNutrients.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">
                  Nutrients:{" "}
                </span>
                <div className="mt-0.5 inline-flex flex-wrap gap-1">
                  {result.matchingNutrients.map((nutrient) => (
                    <Badge
                      key={nutrient}
                      variant="outline"
                      className="text-xs py-0"
                    >
                      {nutrient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Similarity Score */}
            {result.similarityScore !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-secondary">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{
                      width: `${result.similarityScore * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {(result.similarityScore * 100).toFixed(0)}% match
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
