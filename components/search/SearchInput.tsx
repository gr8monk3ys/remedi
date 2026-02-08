"use client";

import { useCallback, useRef, useEffect } from "react";
import { Search as SearchIcon, X as XIcon, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
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
      setTimeout(onSearch, 100);
    },
    [setQuery, onSearch],
  );

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search for pharmaceuticals or natural remedies"
          data-search-input
          className="h-11 pl-10 pr-24 rounded-lg"
          placeholder={
            useAiSearch
              ? "Describe your needs naturally..."
              : "Search a drug or supplement..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
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
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 rounded-md"
        >
          Search
        </Button>
      </div>

      {/* AI Search Toggle */}
      {aiSearchAvailable && (
        <div className="flex items-center justify-center gap-2">
          <Switch
            data-ai-toggle
            checked={useAiSearch}
            onCheckedChange={setUseAiSearch}
            aria-label="Toggle AI search"
          />
          <button
            onClick={() => setUseAiSearch(!useAiSearch)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles
              className={cn("h-3.5 w-3.5", useAiSearch && "text-primary")}
            />
            <span className="font-medium">
              {useAiSearch ? "AI Search On" : "AI Search"}
            </span>
          </button>
        </div>
      )}

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {suggestions.map((suggestion) => (
          <Badge
            key={suggestion}
            variant={query === suggestion ? "default" : "outline"}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}
