/**
 * SearchInput Component Tests
 *
 * Tests for the search input component including:
 * - Input renders with placeholder
 * - Typing updates input value
 * - Form submission calls onSearch callback
 * - Clear button works
 * - Suggestion chips
 * - AI search toggle
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "@/components/search/SearchInput";

const defaultProps = {
  query: "",
  setQuery: vi.fn(),
  onSearch: vi.fn(),
  useAiSearch: false,
  setUseAiSearch: vi.fn(),
  aiSearchAvailable: false,
  suggestions: ["Vitamin D", "Ibuprofen", "Melatonin"],
};

describe("SearchInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("renders the search input with default placeholder", () => {
      render(<SearchInput {...defaultProps} />);
      expect(
        screen.getByLabelText("Search for pharmaceuticals or natural remedies"),
      ).toBeInTheDocument();
    });

    it("renders the AI search placeholder when useAiSearch is true", () => {
      render(<SearchInput {...defaultProps} useAiSearch={true} />);
      expect(
        screen.getByPlaceholderText("Describe your needs naturally..."),
      ).toBeInTheDocument();
    });

    it("renders the Search button", () => {
      render(<SearchInput {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "Search" }),
      ).toBeInTheDocument();
    });

    it("renders suggestion chips", () => {
      render(<SearchInput {...defaultProps} />);
      expect(screen.getByText("Vitamin D")).toBeInTheDocument();
      expect(screen.getByText("Ibuprofen")).toBeInTheDocument();
      expect(screen.getByText("Melatonin")).toBeInTheDocument();
    });

    it("renders default suggestions when none provided", () => {
      const { suggestions: _, ...propsWithoutSuggestions } = defaultProps;
      render(<SearchInput {...propsWithoutSuggestions} />);
      expect(screen.getByText("Vitamin D")).toBeInTheDocument();
      expect(screen.getByText("Ibuprofen")).toBeInTheDocument();
      expect(screen.getByText("Melatonin")).toBeInTheDocument();
      expect(screen.getByText("Omega-3")).toBeInTheDocument();
      expect(screen.getByText("Tylenol")).toBeInTheDocument();
    });

    it("displays the current query value in the input", () => {
      render(<SearchInput {...defaultProps} query="turmeric" />);
      expect(
        screen.getByLabelText("Search for pharmaceuticals or natural remedies"),
      ).toHaveValue("turmeric");
    });
  });

  describe("Interactions", () => {
    it("calls setQuery when user types in the input", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const setQuery = vi.fn();
      render(<SearchInput {...defaultProps} setQuery={setQuery} />);

      const input = screen.getByLabelText(
        "Search for pharmaceuticals or natural remedies",
      );
      await user.type(input, "a");
      expect(setQuery).toHaveBeenCalledWith("a");
    });

    it("calls onSearch when Enter key is pressed", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(
        <SearchInput {...defaultProps} query="ibuprofen" onSearch={onSearch} />,
      );

      const input = screen.getByLabelText(
        "Search for pharmaceuticals or natural remedies",
      );
      await user.type(input, "{Enter}");
      expect(onSearch).toHaveBeenCalled();
    });

    it("calls onSearch when Search button is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<SearchInput {...defaultProps} onSearch={onSearch} />);

      await user.click(screen.getByRole("button", { name: "Search" }));
      expect(onSearch).toHaveBeenCalled();
    });
  });

  describe("Clear button", () => {
    it("shows clear button when query is non-empty", () => {
      render(<SearchInput {...defaultProps} query="test" />);
      expect(
        screen.getByRole("button", { name: "Clear search" }),
      ).toBeInTheDocument();
    });

    it("hides clear button when query is empty", () => {
      render(<SearchInput {...defaultProps} query="" />);
      expect(
        screen.queryByRole("button", { name: "Clear search" }),
      ).not.toBeInTheDocument();
    });

    it("calls setQuery with empty string when clear button is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const setQuery = vi.fn();
      render(
        <SearchInput {...defaultProps} query="test" setQuery={setQuery} />,
      );

      await user.click(screen.getByRole("button", { name: "Clear search" }));
      expect(setQuery).toHaveBeenCalledWith("");
    });
  });

  describe("Suggestion chips", () => {
    it("calls setQuery with the suggestion text when a chip is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const setQuery = vi.fn();
      render(<SearchInput {...defaultProps} setQuery={setQuery} />);

      await user.click(screen.getByText("Ibuprofen"));
      expect(setQuery).toHaveBeenCalledWith("Ibuprofen");
    });

    it("calls onSearch after clicking a suggestion", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<SearchInput {...defaultProps} onSearch={onSearch} />);

      await user.click(screen.getByText("Vitamin D"));

      // The suggestion click triggers onSearch after a 100ms setTimeout
      await act(async () => {
        vi.advanceTimersByTime(150);
      });
      expect(onSearch).toHaveBeenCalled();
    });
  });

  describe("AI Search toggle", () => {
    it("renders AI toggle when aiSearchAvailable is true", () => {
      render(<SearchInput {...defaultProps} aiSearchAvailable={true} />);
      expect(screen.getByLabelText("Toggle AI search")).toBeInTheDocument();
    });

    it("does not render AI toggle when aiSearchAvailable is false", () => {
      render(<SearchInput {...defaultProps} aiSearchAvailable={false} />);
      expect(
        screen.queryByLabelText("Toggle AI search"),
      ).not.toBeInTheDocument();
    });

    it("shows AI Search On text when useAiSearch is true", () => {
      render(
        <SearchInput
          {...defaultProps}
          aiSearchAvailable={true}
          useAiSearch={true}
        />,
      );
      expect(screen.getByText("AI Search On")).toBeInTheDocument();
    });

    it("shows AI Search text when useAiSearch is false", () => {
      render(
        <SearchInput
          {...defaultProps}
          aiSearchAvailable={true}
          useAiSearch={false}
        />,
      );
      expect(screen.getByText("AI Search")).toBeInTheDocument();
    });
  });
});
