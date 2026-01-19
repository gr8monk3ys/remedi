"use client";

import { useCallback, useRef, useEffect } from "react";
import { Search as SearchIcon, X as XIcon, Sparkles } from "lucide-react";

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
  useAiSearch: boolean;
  setUseAiSearch: (value: boolean) => void;
  aiSearchAvailable: boolean;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = ["Vitamin D", "Ibuprofen", "Melatonin", "Omega-3", "Tylenol"];

export function SearchInput({
  query,
  setQuery,
  onSearch,
  useAiSearch,
  setUseAiSearch,
  aiSearchAvailable,
  suggestions = DEFAULT_SUGGESTIONS,
}: SearchInputProps) {
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);

  // Debounced auto-search as user types
  useEffect(() => {
    // Skip the initial mount to avoid searching on page load
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Only trigger search if query has content
    if (query.trim().length >= 2) {
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch();
      }, 400);
    }

    // Cleanup on unmount or query change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Clear debounce timeout for immediate search
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      onSearch();
    }
  }, [onSearch]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    // Clear debounce timeout since we're searching immediately
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setQuery(suggestion);
    setTimeout(onSearch, 100);
  }, [setQuery, onSearch]);

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          type="search"
          aria-label="Search for pharmaceuticals or natural remedies"
          data-search-input
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            useAiSearch
              ? "Describe your needs naturally..."
              : "Enter a pharmaceutical drug or supplement..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <SearchIcon
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XIcon size={20} />
          </button>
        )}
        <button
          type="button"
          data-search-button
          onClick={() => {
            // Clear debounce for immediate search
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            onSearch();
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Search
        </button>
      </div>

      {/* AI Search Toggle */}
      {aiSearchAvailable && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            data-ai-toggle
            onClick={() => setUseAiSearch(!useAiSearch)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              useAiSearch
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Sparkles size={16} className={useAiSearch ? "animate-pulse" : ""} />
            <span className="text-sm font-medium">
              {useAiSearch ? "AI Search Enabled" : "Enable AI Search"}
            </span>
          </button>
          {useAiSearch && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Powered by GPT-4</span>
          )}
        </div>
      )}

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              query === suggestion
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
