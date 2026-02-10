/**
 * SearchResultCard Component Tests
 *
 * Tests for the search result card component including:
 * - Rendering remedy name, description, category badge
 * - Favorite toggle button
 * - Compare toggle button
 * - Click navigation to remedy detail
 * - Similarity score display
 * - Matching nutrients display
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import type { SearchResult } from "@/components/search/types";

// Mock the CompareContext
const mockIsInComparison = vi.fn();
const mockAddToCompare = vi.fn();
const mockRemoveFromCompare = vi.fn();

vi.mock("@/context/CompareContext", () => ({
  useCompare: vi.fn(() => ({
    isInComparison: mockIsInComparison,
    addToCompare: mockAddToCompare,
    removeFromCompare: mockRemoveFromCompare,
    isFull: false,
    items: [],
    maxItems: 4,
    clearComparison: vi.fn(),
    getCompareUrl: vi.fn(() => "/compare"),
  })),
}));

// Mock next/image to render a standard img tag
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

const mockResult: SearchResult = {
  id: "remedy-1",
  name: "Turmeric",
  description: "Natural anti-inflammatory spice used in traditional medicine",
  category: "Herbal Remedy",
  imageUrl: "https://example.com/turmeric.jpg",
  matchingNutrients: ["Curcumin", "Vitamin C"],
  similarityScore: 0.85,
};

const defaultProps = {
  result: mockResult,
  isFavorite: false,
  isLoading: false,
  onFavoriteToggle: vi.fn(),
  onViewDetails: vi.fn(),
};

describe("SearchResultCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInComparison.mockReturnValue(false);
  });

  it("renders the remedy name", () => {
    render(<SearchResultCard {...defaultProps} />);
    expect(screen.getByText("Turmeric")).toBeInTheDocument();
  });

  it("renders the remedy description", () => {
    render(<SearchResultCard {...defaultProps} />);
    expect(
      screen.getByText(
        "Natural anti-inflammatory spice used in traditional medicine",
      ),
    ).toBeInTheDocument();
  });

  it("renders the category badge", () => {
    render(<SearchResultCard {...defaultProps} />);
    expect(screen.getByText("Herbal Remedy")).toBeInTheDocument();
  });

  it("renders the remedy image when imageUrl is provided", () => {
    render(<SearchResultCard {...defaultProps} />);
    const img = screen.getByAltText("Turmeric");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/turmeric.jpg");
  });

  it("renders No Image placeholder when imageUrl is not provided", () => {
    const resultWithoutImage: SearchResult = {
      ...mockResult,
      imageUrl: undefined,
    };
    render(<SearchResultCard {...defaultProps} result={resultWithoutImage} />);
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });

  it("renders Add to favorites label when not favorited", () => {
    render(<SearchResultCard {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "Add to favorites" }),
    ).toBeInTheDocument();
  });

  it("renders Remove from favorites label when favorited", () => {
    render(<SearchResultCard {...defaultProps} isFavorite={true} />);
    expect(
      screen.getByRole("button", { name: "Remove from favorites" }),
    ).toBeInTheDocument();
  });

  it("renders the compare toggle button with Add to comparison label", () => {
    render(<SearchResultCard {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "Add to comparison" }),
    ).toBeInTheDocument();
  });

  it("renders matching nutrients", () => {
    render(<SearchResultCard {...defaultProps} />);
    expect(screen.getByText("Curcumin")).toBeInTheDocument();
    expect(screen.getByText("Vitamin C")).toBeInTheDocument();
    expect(screen.getByText(/Nutrients:/)).toBeInTheDocument();
  });

  it("renders the similarity score", () => {
    render(<SearchResultCard {...defaultProps} />);
    expect(screen.getByText("85% match")).toBeInTheDocument();
  });

  it("does not render similarity score when not provided", () => {
    const resultWithoutScore: SearchResult = {
      ...mockResult,
      similarityScore: undefined,
    };
    render(<SearchResultCard {...defaultProps} result={resultWithoutScore} />);
    expect(screen.queryByText(/match/)).not.toBeInTheDocument();
  });

  it("does not render nutrients section when matchingNutrients is empty", () => {
    const resultWithoutNutrients: SearchResult = {
      ...mockResult,
      matchingNutrients: [],
    };
    render(
      <SearchResultCard {...defaultProps} result={resultWithoutNutrients} />,
    );
    expect(screen.queryByText(/Nutrients:/)).not.toBeInTheDocument();
  });

  it("calls onViewDetails with the remedy id when the card is clicked", async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    render(
      <SearchResultCard {...defaultProps} onViewDetails={onViewDetails} />,
    );

    await user.click(screen.getByText("Turmeric"));
    expect(onViewDetails).toHaveBeenCalledWith("remedy-1");
  });

  it("calls onFavoriteToggle when favorite button is clicked", async () => {
    const user = userEvent.setup();
    const onFavoriteToggle = vi.fn();
    render(
      <SearchResultCard
        {...defaultProps}
        onFavoriteToggle={onFavoriteToggle}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add to favorites" }));
    expect(onFavoriteToggle).toHaveBeenCalledWith(
      expect.any(Object),
      "remedy-1",
      "Turmeric",
    );
  });

  it("disables favorite button when isLoading is true", () => {
    render(<SearchResultCard {...defaultProps} isLoading={true} />);
    expect(
      screen.getByRole("button", { name: "Add to favorites" }),
    ).toBeDisabled();
  });

  it("calls addToCompare when compare button is clicked", async () => {
    const user = userEvent.setup();
    mockIsInComparison.mockReturnValue(false);

    render(<SearchResultCard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: "Add to comparison" }));
    expect(mockAddToCompare).toHaveBeenCalledWith({
      id: "remedy-1",
      name: "Turmeric",
      category: "Herbal Remedy",
      imageUrl: "https://example.com/turmeric.jpg",
    });
  });

  it("calls removeFromCompare when compare button is clicked and already comparing", async () => {
    const user = userEvent.setup();
    mockIsInComparison.mockReturnValue(true);

    render(<SearchResultCard {...defaultProps} />);

    await user.click(
      screen.getByRole("button", { name: "Remove from comparison" }),
    );
    expect(mockRemoveFromCompare).toHaveBeenCalledWith("remedy-1");
  });

  it("does not render description when not provided", () => {
    const resultWithoutDesc: SearchResult = {
      ...mockResult,
      description: undefined,
    };
    render(<SearchResultCard {...defaultProps} result={resultWithoutDesc} />);
    expect(
      screen.queryByText(
        "Natural anti-inflammatory spice used in traditional medicine",
      ),
    ).not.toBeInTheDocument();
  });

  it("does not render category badge when not provided", () => {
    const resultWithoutCategory: SearchResult = {
      ...mockResult,
      category: undefined,
    };
    render(
      <SearchResultCard {...defaultProps} result={resultWithoutCategory} />,
    );
    expect(screen.queryByText("Herbal Remedy")).not.toBeInTheDocument();
  });
});
