"use client";

import { useCallback, useRef, useEffect } from "react";
import { Search as SearchIcon, X as XIcon, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  /** Runs a search; pass a query to search it directly instead of the
   * debounced `query` state, which may not have flushed yet. */
  onSearch: (searchQuery?: string) => void;
  useAiSearch: boolean;
  setUseAiSearch: (value: boolean) => void;
  aiSearchAvailable: boolean;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Vitamin D",
  "Ibuprofen",
  "Melatonin",
  "Omega-3",
  "Tylenol",
];

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

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch();
      }, 400);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        onSearch();
      }
    },
    [onSearch],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      setQuery(suggestion);
      // Search the suggestion directly. Deferring to onSearch() would run it
      // against the *previous* query still captured in the closure, firing two
      // racing requests for different terms.
      onSearch(suggestion);
    },
    [setQuery, onSearch],
  );

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Search for pharmaceuticals or natural remedies"
          data-search-input
          className="h-12 pl-10 pr-28 text-base md:text-[15px]"
          placeholder={
            useAiSearch
              ? "Describe your needs naturally..."
              : "Search a drug or remedy..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-[5.75rem] top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
        <Button
          type="button"
          data-search-button
          size="sm"
          onClick={() => {
            if (debounceTimeoutRef.current) {
              clearTimeout(debounceTimeoutRef.current);
            }
            onSearch();
          }}
          className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 px-4"
        >
          Search
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow eyebrow-muted mr-1">Try</span>
          {suggestions.map((suggestion) => {
            const isActive = query === suggestion;
            return (
              <button
                type="button"
                key={suggestion}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
                aria-pressed={isActive}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            );
          })}
        </div>

        {/* AI Search Toggle */}
        {aiSearchAvailable && (
          <div className="flex shrink-0 items-center gap-2">
            <Switch
              data-ai-toggle
              checked={useAiSearch}
              onCheckedChange={setUseAiSearch}
              aria-label="Toggle AI search"
            />
            <button
              type="button"
              onClick={() => setUseAiSearch(!useAiSearch)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-pressed={useAiSearch}
            >
              <Sparkles
                className={cn("h-3.5 w-3.5", useAiSearch && "text-primary")}
                aria-hidden="true"
              />
              {useAiSearch ? "AI Search On" : "AI Search"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
