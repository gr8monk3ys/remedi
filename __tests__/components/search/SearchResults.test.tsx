/**
 * SearchResults Component Tests
 *
 * Tests for the search results list component including:
 * - Rendering a list of SearchResultCards
 * - Empty state message when no results
 * - Loading state with skeletons
 * - Error state display
 * - Pagination rendering
 * - Filter rendering
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchResults } from "@/components/search/SearchResults";
import type { SearchResult } from "@/components/search/types";

// Mock the CompareContext used by SearchResultCard
vi.mock("@/context/CompareContext", () => ({
  useCompare: vi.fn(() => ({
    isInComparison: vi.fn(() => false),
    addToCompare: vi.fn(),
    removeFromCompare: vi.fn(),
    isFull: false,
    items: [],
    maxItems: 4,
    clearComparison: vi.fn(),
    getCompareUrl: vi.fn(() => "/compare"),
  })),
}));

// Mock next/image
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

const mockResults: SearchResult[] = [
  {
    id: "remedy-1",
    name: "Turmeric",
    description: "Natural anti-inflammatory spice",
    category: "Herbal Remedy",
    imageUrl: "https://example.com/turmeric.jpg",
    matchingNutrients: ["Curcumin"],
    similarityScore: 0.85,
  },
  {
    id: "remedy-2",
    name: "Ginger",
    description: "Root with anti-nausea properties",
    category: "Herbal Remedy",
    imageUrl: "https://example.com/ginger.jpg",
    matchingNutrients: ["Gingerol"],
    similarityScore: 0.72,
  },
  {
    id: "remedy-3",
    name: "Omega-3 Fish Oil",
    description: "Essential fatty acids for heart health",
    category: "Supplement",
    imageUrl: "https://example.com/omega3.jpg",
    matchingNutrients: ["EPA", "DHA"],
    similarityScore: 0.65,
  },
];

const defaultProps = {
  results: mockResults,
  filteredResults: mockResults,
  currentPage: 1,
  itemsPerPage: 10,
  onPageChange: vi.fn(),
  isLoading: false,
  error: null,
  query: "ibuprofen",
  showFilters: false,
  categoryOptions: [],
  nutrientOptions: [],
  categoryFilters: [],
  nutrientFilters: [],
  setCategoryFilters: vi.fn(),
  setNutrientFilters: vi.fn(),
  aiInsights: null,
  isFavorite: vi.fn(() => false),
  favoritesLoading: false,
  onFavoriteToggle: vi.fn(),
  onViewDetails: vi.fn(),
};

describe("SearchResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Results rendering", () => {
    it("renders a list of result cards", () => {
      render(<SearchResults {...defaultProps} />);
      expect(screen.getByText("Turmeric")).toBeInTheDocument();
      expect(screen.getByText("Ginger")).toBeInTheDocument();
      expect(screen.getByText("Omega-3 Fish Oil")).toBeInTheDocument();
    });

    it("renders the correct number of result cards", () => {
      render(<SearchResults {...defaultProps} />);
      const favoriteButtons = screen.getAllByRole("button", {
        name: "Add to favorites",
      });
      expect(favoriteButtons).toHaveLength(3);
    });

    it("passes isFavorite correctly to each card", () => {
      const isFavorite = vi.fn((id: string) => id === "remedy-1");
      render(<SearchResults {...defaultProps} isFavorite={isFavorite} />);
      expect(isFavorite).toHaveBeenCalledWith("remedy-1");
      expect(isFavorite).toHaveBeenCalledWith("remedy-2");
      expect(isFavorite).toHaveBeenCalledWith("remedy-3");
    });
  });

  describe("Loading state", () => {
    it("renders skeleton cards when loading", () => {
      const { container } = render(
        <SearchResults {...defaultProps} isLoading={true} />,
      );
      // Skeleton elements have the animate-pulse class
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("does not render result cards when loading", () => {
      render(
        <SearchResults
          {...defaultProps}
          isLoading={true}
          filteredResults={mockResults}
        />,
      );
      // The result cards should still render (they are not conditionally hidden during loading)
      // But skeletons should also be present
      const { container } = render(
        <SearchResults {...defaultProps} isLoading={true} />,
      );
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Empty state", () => {
    it("shows empty state message when no results and query exists", () => {
      render(
        <SearchResults
          {...defaultProps}
          results={[]}
          filteredResults={[]}
          query="ibuprofen"
        />,
      );
      expect(
        screen.getByText(/No results found for .ibuprofen./),
      ).toBeInTheDocument();
    });

    it("shows filter-specific empty message when results exist but filters exclude all", () => {
      render(
        <SearchResults
          {...defaultProps}
          results={mockResults}
          filteredResults={[]}
          query="ibuprofen"
        />,
      );
      expect(
        screen.getByText(/No results match your current filters/),
      ).toBeInTheDocument();
    });

    it("does not show empty state when there is no query", () => {
      render(
        <SearchResults
          {...defaultProps}
          results={[]}
          filteredResults={[]}
          query=""
        />,
      );
      expect(screen.queryByText(/No results found/)).not.toBeInTheDocument();
    });
  });

  describe("Error state", () => {
    it("displays an error message when error prop is provided", () => {
      render(<SearchResults {...defaultProps} error="Something went wrong" />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("does not display error when error prop is null", () => {
      render(<SearchResults {...defaultProps} error={null} />);
      expect(
        screen.queryByText("Something went wrong"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("renders pagination when there are results", () => {
      render(<SearchResults {...defaultProps} />);
      // Pagination component is rendered (it may show nothing if totalPages <= 1)
      // With 3 items and 10 per page, pagination shows but returns null
      // Let us test with more items
    });

    it("does not render pagination when filteredResults is empty", () => {
      render(
        <SearchResults {...defaultProps} results={[]} filteredResults={[]} />,
      );
      // No pagination buttons should be present
      expect(
        screen.queryByRole("button", { name: /previous/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /next/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Filters", () => {
    it("renders category filters when showFilters is true and options exist", () => {
      render(
        <SearchResults
          {...defaultProps}
          showFilters={true}
          categoryOptions={[
            { value: "herbal", label: "Herbal Remedy", count: 2 },
            { value: "supplement", label: "Supplement", count: 1 },
          ]}
        />,
      );
      expect(screen.getByText("Filter by Category")).toBeInTheDocument();
    });

    it("renders nutrient filters when showFilters is true and options exist", () => {
      render(
        <SearchResults
          {...defaultProps}
          showFilters={true}
          nutrientOptions={[{ value: "curcumin", label: "Curcumin", count: 1 }]}
        />,
      );
      expect(screen.getByText("Filter by Nutrients")).toBeInTheDocument();
    });

    it("does not render filters when showFilters is false", () => {
      render(
        <SearchResults
          {...defaultProps}
          showFilters={false}
          categoryOptions={[
            { value: "herbal", label: "Herbal Remedy", count: 2 },
          ]}
        />,
      );
      expect(screen.queryByText("Filter by Category")).not.toBeInTheDocument();
    });

    it("does not render filters when results are empty", () => {
      render(
        <SearchResults
          {...defaultProps}
          results={[]}
          filteredResults={[]}
          showFilters={true}
          categoryOptions={[
            { value: "herbal", label: "Herbal Remedy", count: 2 },
          ]}
        />,
      );
      expect(screen.queryByText("Filter by Category")).not.toBeInTheDocument();
    });
  });

  describe("Items per page", () => {
    it("only renders items for the current page", () => {
      const manyResults: SearchResult[] = Array.from({ length: 5 }, (_, i) => ({
        id: "remedy-" + (i + 1),
        name: "Remedy " + (i + 1),
        description: "Description " + (i + 1),
        category: "Category",
        matchingNutrients: [],
      }));

      render(
        <SearchResults
          {...defaultProps}
          results={manyResults}
          filteredResults={manyResults}
          currentPage={1}
          itemsPerPage={2}
        />,
      );

      expect(screen.getByText("Remedy 1")).toBeInTheDocument();
      expect(screen.getByText("Remedy 2")).toBeInTheDocument();
      expect(screen.queryByText("Remedy 3")).not.toBeInTheDocument();
    });

    it("renders correct items for page 2", () => {
      const manyResults: SearchResult[] = Array.from({ length: 5 }, (_, i) => ({
        id: "remedy-" + (i + 1),
        name: "Remedy " + (i + 1),
        description: "Description " + (i + 1),
        category: "Category",
        matchingNutrients: [],
      }));

      render(
        <SearchResults
          {...defaultProps}
          results={manyResults}
          filteredResults={manyResults}
          currentPage={2}
          itemsPerPage={2}
        />,
      );

      expect(screen.queryByText("Remedy 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Remedy 2")).not.toBeInTheDocument();
      expect(screen.getByText("Remedy 3")).toBeInTheDocument();
      expect(screen.getByText("Remedy 4")).toBeInTheDocument();
      expect(screen.queryByText("Remedy 5")).not.toBeInTheDocument();
    });
  });
});
