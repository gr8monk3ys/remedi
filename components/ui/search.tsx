"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search as SearchIcon } from "lucide-react";
import Image from "next/image";

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  matchingNutrients: string[];
  similarityScore?: number;
}

interface SearchProps extends React.HTMLProps<HTMLDivElement> {
  onSearch?: (results: SearchResult[]) => void;
  className?: string;
}

export function SearchComponent({ className, onSearch, ...props }: SearchProps) {
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log("Searching for:", query);
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Search results:", data);
      setResults(data);
      if (onSearch) {
        onSearch(data);
      }

      // Add to recent searches if not already there
      if (!recentSearches.includes(query)) {
        setRecentSearches((prev) => [query, ...prev.slice(0, 2)]); // Keep only last 3
      }
    } catch (error) {
      console.error("Error searching:", error);
      setError("Failed to retrieve search results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="relative flex w-full max-w-md mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Try: Vitamin D, Ibuprofen, Melatonin..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg 
                     bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white 
                     rounded-r-lg hover:bg-blue-600 transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SearchIcon size={20} />
          )}
        </button>
      </div>

      <div className="mt-2 w-full max-w-md mx-auto text-center text-xs text-gray-500 dark:text-gray-400">
        Try searching for:
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {[
            "Vitamin D3",
            "Ibuprofen",
            "Melatonin",
            "Fish Oil",
            "Omeprazole",
            "Tylenol",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                // Execute search immediately
                setTimeout(() => {
                  handleSearch();
                }, 100);
              }}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                query === suggestion
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="mt-4 w-full max-w-md mx-auto text-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">Recent searches: </span>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {recentSearches.map((searchTerm, index) => (
              <button
                key={`${searchTerm}-${index}`}
                onClick={() => {
                  setQuery(searchTerm);
                  setTimeout(() => handleSearch(), 100);
                }}
                className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 
                         text-gray-600 dark:text-gray-400 rounded-full 
                         hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                {searchTerm}
              </button>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <div className="mt-6 w-full max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-2">{error}</h3>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-6 w-full max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Natural Alternatives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result) => (
              <div key={result.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start gap-3">
                  {result.imageUrl && (
                    <div className="relative w-20 h-20 rounded-md overflow-hidden">
                      <Image
                        src={result.imageUrl}
                        alt={result.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-lg">{result.name}</h4>
                    {result.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {result.description}
                      </p>
                    )}
                    {result.matchingNutrients.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Matching nutrients:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.matchingNutrients.map((nutrient, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 
                                       text-green-800 dark:text-green-100 rounded-full"
                            >
                              {nutrient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : query && !isLoading ? (
        <div className="mt-6 w-full max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try searching for: Vitamin D, Ibuprofen, Melatonin, Fish Oil, or Omeprazole
          </p>
        </div>
      ) : null}
    </div>
  );
}
