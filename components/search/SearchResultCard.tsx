"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, GitCompare, Check } from "lucide-react";
import { useCompare } from "@/lib/context/CompareContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SearchResult } from "./types";

/** Plain-language meaning of each replacement type, shown on hover. */
const REPLACEMENT_TYPE_HINTS: Record<string, string> = {
  Alternative:
    "May serve a similar purpose. Never stop a prescribed medication without talking to your provider.",
  Complementary: "Sometimes used alongside conventional treatment.",
  Supportive:
    "General supportive use only — not a substitute for this medication.",
};

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
  const { isInComparison, addToCompare, removeFromCompare, isFull, maxItems } =
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
    <article
      data-search-result-card
      className={cn(
        "surface-hover cursor-pointer rounded-lg border border-border bg-card p-4",
        isComparing && "border-primary ring-1 ring-primary",
      )}
      onClick={() => onViewDetails(result.id)}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          {result.imageUrl ? (
            <Image
              src={result.imageUrl}
              alt={result.name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-mono text-[10px] text-muted-foreground">
                No Image
              </span>
            </div>
          )}
          {isComparing && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
              <Check className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {/* A real link, so opening a result is reachable by keyboard
                  and screen reader — the card's onClick is mouse-only. */}
              <Link
                href={`/remedy/${result.id}`}
                onClick={(e) => e.stopPropagation()}
                className="group/link truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h3 className="truncate text-[15px] font-semibold tracking-tight">
                  {result.name}
                </h3>
              </Link>
              <ArrowUpRight
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
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
                      ? `Comparison list is full (max ${maxItems})`
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
                      ? "fill-primary text-primary"
                      : "text-muted-foreground",
                  )}
                />
              </Button>
            </div>
          </div>

          {/* Category + how this remedy relates to the drug */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {result.category && (
              <Badge variant="secondary">{result.category}</Badge>
            )}
            {/* Without this, a merely supportive suggestion looks identical
                to a genuine alternative to someone's medication. */}
            {result.replacementType && (
              <Badge
                variant="outline"
                title={
                  REPLACEMENT_TYPE_HINTS[result.replacementType] ??
                  "How this remedy relates to the medication."
                }
              >
                {result.replacementType}
              </Badge>
            )}
          </div>

          {/* Description */}
          {result.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {result.description}
            </p>
          )}

          {/* Matching Nutrients */}
          {result.matchingNutrients.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Nutrients:</span>
              {result.matchingNutrients.map((nutrient) => (
                <Badge key={nutrient} variant="outline">
                  {nutrient}
                </Badge>
              ))}
            </div>
          )}

          {/* Relevance (ingredient/property similarity — informational only) */}
          {result.similarityScore !== undefined && (
            <div
              className="mt-3 flex items-center gap-2"
              title="Relevance reflects shared ingredients and properties — it is informational only and is not a measure of medical effectiveness."
            >
              <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${result.similarityScore * 100}%`,
                  }}
                />
              </div>
              <span className="tabular font-mono text-[11px] text-muted-foreground">
                {(result.similarityScore * 100).toFixed(0)}% relevance
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});
