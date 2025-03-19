"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Search as SearchIcon, SlidersHorizontal, X as XIcon, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Pagination } from "@/components/ui/pagination";
import { Filter } from "@/components/ui/filter";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  matchingNutrients: string[];
  similarityScore?: number;
  category?: string; 
}

interface SearchProps extends React.HTMLProps<HTMLDivElement> {
  onSearch?: (results: SearchResult[]) => void;
  className?: string;
}

export function SearchComponent({ className, onSearch, ...props }: SearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("recentSearches", []);
  const [activeTab, setActiveTab] = useState<"results" | "history">("results");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [nutrientFilters, setNutrientFilters] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 3; 
  
  const categoryOptions = Array.from(new Set(results.filter(r => r.category).map(r => r.category!))).map(category => ({
    value: category,
    label: category,
    count: results.filter(r => r.category === category).length,
  }));
  
  const allNutrients = results.flatMap(r => r.matchingNutrients);
  const nutrientOptions = Array.from(new Set(allNutrients)).map(nutrient => ({
    value: nutrient,
    label: nutrient,
    count: allNutrients.filter(n => n === nutrient).length,
  }));

  useEffect(() => {
    let filtered = [...results];
    
    if (categoryFilters.length > 0) {
      filtered = filtered.filter(r => r.category && categoryFilters.includes(r.category));
    }
    
    if (nutrientFilters.length > 0) {
      filtered = filtered.filter(r => 
        r.matchingNutrients.some(nutrient => nutrientFilters.includes(nutrient))
      );
    }
    
    setFilteredResults(filtered);
    setCurrentPage(1);
  }, [results, categoryFilters, nutrientFilters]);
  
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
      setFilteredResults(data);
      if (onSearch) {
        onSearch(data);
      }

      setCurrentPage(1);
      
      setCategoryFilters([]);
      setNutrientFilters([]);

      if (!recentSearches.includes(query) && data.length > 0) {
        setRecentSearches([query, ...recentSearches.filter(s => s !== query).slice(0, 4)]); 
      }
      
      setActiveTab("results");
    } catch (error) {
      console.error("Error searching:", error);
      setError("Failed to retrieve search results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setTimeout(handleSearch, 100); 
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: document.getElementById('search-results')?.offsetTop || 0, behavior: 'smooth' });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const viewRemedyDetails = (remedyId: string) => {
    router.push(`/remedy/${remedyId}`);
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a pharmaceutical drug or supplement..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        
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
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Search
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 justify-center">
        {["Vitamin D", "Ibuprofen", "Melatonin", "Omega-3", "Tylenol"].map((suggestion) => (
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

      {(results.length > 0 || recentSearches.length > 0) && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 mt-6 mb-4">
          <button
            onClick={() => setActiveTab("results")}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "results"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Results {results.length > 0 && `(${results.length})`}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === "history"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            History {recentSearches.length > 0 && `(${recentSearches.length})`}
          </button>
          
          {results.length > 0 && activeTab === "results" && (
            <button
              onClick={toggleFilters}
              className={`ml-auto py-2 px-4 font-medium text-sm flex items-center ${
                showFilters
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <SlidersHorizontal size={14} className="mr-1" />
              Filters {(categoryFilters.length > 0 || nutrientFilters.length > 0) && 
                `(${categoryFilters.length + nutrientFilters.length})`}
            </button>
          )}
        </div>
      )}

      {activeTab === "history" && recentSearches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={`${search}-${index}`}
                onClick={() => {
                  setQuery(search);
                  handleSearch();
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full text-sm"
              >
                {search}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setRecentSearches([]);
            }}
            className="mt-2 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear History
          </button>
        </div>
      )}

      {activeTab === "results" && results.length > 0 && showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {categoryOptions.length > 0 && (
            <Filter
              title="Filter by Category"
              options={categoryOptions}
              selectedValues={categoryFilters}
              onChange={setCategoryFilters}
            />
          )}
          
          {nutrientOptions.length > 0 && (
            <Filter
              title="Filter by Nutrients"
              options={nutrientOptions}
              selectedValues={nutrientFilters}
              onChange={setNutrientFilters}
            />
          )}
        </div>
      )}

      {activeTab === "results" && (
        <div id="search-results">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
      
          {!isLoading && filteredResults.length === 0 && query && !error && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {results.length > 0 
                ? "No results match your current filters. Try adjusting your filters."
                : `No results found for "${query}". Try a different search term.`}
            </div>
          )}
      
          {error && (
            <div className="text-center py-8 text-red-500 dark:text-red-400">
              {error}
            </div>
          )}
      
          <div className="grid grid-cols-1 gap-6 mt-2">
            {currentItems.map((result) => (
              <div 
                key={result.id} 
                className="p-4 border rounded-lg mb-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer" 
                onClick={() => viewRemedyDetails(result.id)}
              >
                <div className="flex gap-4">
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
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-bold">{result.name}</h3>
                      <ExternalLink size={14} className="ml-2 text-primary" />
                    </div>
                    {result.category && (
                      <span className="inline-block px-2 py-1 mt-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {result.category}
                      </span>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{result.description}</p>
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
                    {result.similarityScore !== undefined && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Match score: {(result.similarityScore * 100).toFixed(0)}%
                      </div>
                    )}
                    <div className="mt-2 text-xs text-primary">
                      Click for detailed information
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredResults.length > 0 && (
            <Pagination
              totalItems={filteredResults.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
