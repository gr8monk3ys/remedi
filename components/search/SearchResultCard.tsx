"use client";

import { memo } from "react";
import Image from "next/image";
import { ExternalLink, Heart, GitCompare, Check } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import type { SearchResult } from "./types";

interface SearchResultCardProps {
  result: SearchResult;
  isFavorite: boolean;
  isLoading: boolean;
  onFavoriteToggle: (e: React.MouseEvent, remedyId: string, remedyName: string) => void;
  onViewDetails: (remedyId: string) => void;
}

export const SearchResultCard = memo(function SearchResultCard({
  result,
  isFavorite,
  isLoading,
  onFavoriteToggle,
  onViewDetails,
}: SearchResultCardProps) {
  const { isInComparison, addToCompare, removeFromCompare, isFull } = useCompare();
  const isComparing = isInComparison(result.id);

  const handleCompareToggle = (e: React.MouseEvent) => {
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
    <div
      className={`p-4 border rounded-lg mb-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer ${
        isComparing ? "border-primary bg-primary/5 dark:bg-primary/10" : ""
      }`}
      onClick={() => onViewDetails(result.id)}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
          {result.imageUrl ? (
            <Image
              src={result.imageUrl}
              alt={result.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">No Image</span>
            </div>
          )}
          {/* Compare indicator overlay */}
          {isComparing && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center min-w-0">
              <h3 className="font-bold truncate">{result.name}</h3>
              <ExternalLink size={14} className="ml-2 text-primary flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Compare button */}
              <button
                data-compare-button
                onClick={handleCompareToggle}
                disabled={!isComparing && isFull}
                className={`p-2 rounded-full transition-colors ${
                  isComparing
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : isFull
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-400 hover:text-primary hover:bg-primary/10"
                }`}
                aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
                title={
                  isComparing
                    ? "Remove from comparison"
                    : isFull
                      ? "Comparison list is full (max 4)"
                      : "Add to comparison"
                }
              >
                <GitCompare
                  size={18}
                  className="transition-all"
                />
              </button>
              {/* Favorite button */}
              <button
                data-favorite-button
                onClick={(e) => onFavoriteToggle(e, result.id, result.name)}
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite
                    ? "text-red-500 hover:text-red-600 dark:text-red-400"
                    : "text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  size={20}
                  fill={isFavorite ? "currentColor" : "none"}
                  className="transition-all"
                />
              </button>
            </div>
          </div>

          {/* Category Badge */}
          {result.category && (
            <span className="inline-block px-2 py-1 mt-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {result.category}
            </span>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{result.description}</p>

          {/* Matching Nutrients */}
          <div className="mt-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Matching Nutrients:
            </span>
            <div className="flex flex-wrap gap-1">
              {result.matchingNutrients.map((nutrient) => (
                <span
                  key={nutrient}
                  className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs"
                >
                  {nutrient}
                </span>
              ))}
            </div>
          </div>

          {/* Similarity Score */}
          {result.similarityScore !== undefined && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Match score: {(result.similarityScore * 100).toFixed(0)}%
            </div>
          )}

          <div className="mt-2 text-xs text-primary">Click for detailed information</div>
        </div>
      </div>
    </div>
  );
});
