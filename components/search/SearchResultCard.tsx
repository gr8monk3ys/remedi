"use client";

import React, { memo } from "react";
import Image from "next/image";
import { ExternalLink, Heart } from "lucide-react";
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
  return (
    <div
      className="p-4 border rounded-lg mb-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onViewDetails(result.id)}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-16 h-16 rounded overflow-hidden">
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
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="font-bold">{result.name}</h3>
              <ExternalLink size={14} className="ml-2 text-primary" />
            </div>
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

          {/* Category Badge */}
          {result.category && (
            <span className="inline-block px-2 py-1 mt-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {result.category}
            </span>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{result.description}</p>

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
