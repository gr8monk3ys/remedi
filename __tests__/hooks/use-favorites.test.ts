/**
 * Unit Tests for useFavorites Hook
 *
 * Tests for:
 * - Initial state (empty favorites, loading states)
 * - Fetching favorites on mount
 * - addFavorite: POST to /api/favorites and state update
 * - removeFavorite: DELETE to /api/favorites and state update
 * - isFavorite: checking if a remedy is favorited
 * - Error handling for API failures
 * - Authentication requirements (uses dbUserId and sessionId)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const {
  mockToast,
  mockUseDbUser,
  mockUseSessionId,
  mockApiGet,
  mockApiPost,
  mockApiDelete,
} = vi.hoisted(() => ({
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  mockUseDbUser: vi.fn(),
  mockUseSessionId: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockApiDelete: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("@/hooks/use-db-user", () => ({
  useDbUser: () => mockUseDbUser(),
}));

vi.mock("@/hooks/use-session-id", () => ({
  useSessionId: () => mockUseSessionId(),
}));

vi.mock("@/lib/api/client", () => {
  class ApiClientError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: unknown;
    constructor(
      message: string,
      code: string,
      statusCode: number,
      details?: unknown,
    ) {
      super(message);
      this.name = "ApiClientError";
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
    }
  }
  return {
    ApiClientError,
    apiClient: {
      get: (...args: unknown[]) => mockApiGet(...args),
      post: (...args: unknown[]) => mockApiPost(...args),
      delete: (...args: unknown[]) => mockApiDelete(...args),
    },
  };
});

import { useFavorites } from "@/hooks/use-favorites";
// Import ApiClientError from the mock for use in tests
const { ApiClientError } = await import("@/lib/api/client");

describe("useFavorites", () => {
  const mockFavorite = {
    id: "fav-1",
    remedyId: "remedy-1",
    remedyName: "Vitamin D",
    createdAt: new Date("2024-01-01"),
  };

  const mockFavorite2 = {
    id: "fav-2",
    remedyId: "remedy-2",
    remedyName: "Melatonin",
    createdAt: new Date("2024-01-02"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDbUser.mockReturnValue({
      dbUserId: undefined,
      role: "user",
      isLoaded: true,
      isSignedIn: false,
    });
    mockUseSessionId.mockReturnValue(null);
  });

  describe("initial state", () => {
    it("should start with empty favorites array", () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual([]);
    });

    it("should start with isLoading as false when no identity is available", () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.isLoading).toBe(false);
    });

    it("should start with null error", () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.error).toBeNull();
    });
  });

  describe("fetching favorites on mount", () => {
    it("should fetch favorites when dbUserId is available", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockResolvedValue({
        favorites: [mockFavorite, mockFavorite2],
      });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining("/api/favorites?"),
      );
      expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining("userId=db-user-123"),
      );
      expect(result.current.favorites).toHaveLength(2);
      expect(result.current.favorites[0].remedyId).toBe("remedy-1");
    });

    it("should fetch favorites when sessionId is available (anonymous user)", async () => {
      mockUseSessionId.mockReturnValue("f47ac10b-58cc-4372-a567-0e02b2c3d479");

      mockApiGet.mockResolvedValue({
        favorites: [mockFavorite],
      });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiGet).toHaveBeenCalledWith(
        expect.stringContaining(
          "sessionId=f47ac10b-58cc-4372-a567-0e02b2c3d479",
        ),
      );
      expect(result.current.favorites).toHaveLength(1);
    });

    it("should not fetch when neither dbUserId nor sessionId is available", () => {
      renderHook(() => useFavorites());

      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it("should prefer dbUserId over sessionId when both are available", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });
      mockUseSessionId.mockReturnValue("f47ac10b-58cc-4372-a567-0e02b2c3d479");

      mockApiGet.mockResolvedValue({ favorites: [] });

      renderHook(() => useFavorites());

      await waitFor(() => {
        expect(mockApiGet).toHaveBeenCalled();
      });

      const fetchUrl = mockApiGet.mock.calls[0][0] as string;
      expect(fetchUrl).toContain("userId=db-user-123");
      expect(fetchUrl).not.toContain("sessionId=");
    });

    it("should handle fetch errors gracefully", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockRejectedValue(
        new ApiClientError(
          "Failed to fetch favorites: 500",
          "INTERNAL_ERROR",
          500,
        ),
      );

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to fetch favorites: 500");
      expect(result.current.favorites).toEqual([]);
    });

    it("should handle network errors gracefully", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.favorites).toEqual([]);
    });
  });

  describe("isFavorite", () => {
    it("should return true for a favorited remedy ID", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockResolvedValue({
        favorites: [mockFavorite, mockFavorite2],
      });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(2);
      });

      expect(result.current.isFavorite("remedy-1")).toBe(true);
      expect(result.current.isFavorite("remedy-2")).toBe(true);
    });

    it("should return false for a non-favorited remedy ID", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockResolvedValue({
        favorites: [mockFavorite],
      });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(1);
      });

      expect(result.current.isFavorite("remedy-999")).toBe(false);
    });

    it("should return false when favorites are empty", () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite("remedy-1")).toBe(false);
    });
  });

  describe("addFavorite", () => {
    it("should call apiClient.post and update state for authenticated user", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      // Initial fetch returns empty
      mockApiGet.mockResolvedValue({ favorites: [] });

      const newFavorite = {
        id: "fav-new",
        remedyId: "remedy-new",
        remedyName: "Turmeric",
        createdAt: new Date(),
      };

      mockApiPost.mockResolvedValue({ favorite: newFavorite });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite("remedy-new", "Turmeric");
      });

      expect(mockApiPost).toHaveBeenCalledWith(
        "/api/favorites",
        expect.objectContaining({
          remedyId: "remedy-new",
          remedyName: "Turmeric",
          userId: "db-user-123",
        }),
      );

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].remedyId).toBe("remedy-new");
      expect(mockToast.success).toHaveBeenCalledWith("Added to favorites");
    });

    it("should include sessionId for anonymous users", async () => {
      mockUseSessionId.mockReturnValue("f47ac10b-58cc-4372-a567-0e02b2c3d479");

      mockApiGet.mockResolvedValue({ favorites: [] });

      mockApiPost.mockResolvedValue({
        favorite: {
          id: "fav-anon",
          remedyId: "remedy-1",
          remedyName: "Vitamin D",
          createdAt: new Date(),
        },
      });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite("remedy-1", "Vitamin D");
      });

      expect(mockApiPost).toHaveBeenCalledWith(
        "/api/favorites",
        expect.objectContaining({
          sessionId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        }),
      );
      // userId should NOT be present
      const callBody = mockApiPost.mock.calls[0][1] as Record<string, unknown>;
      expect(callBody.userId).toBeUndefined();
    });

    it("should set error when no identity is available", async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.addFavorite("remedy-1", "Vitamin D");
      });

      expect(result.current.error).toBe("Please sign in to save favorites");
      expect(mockApiPost).not.toHaveBeenCalled();
    });

    it("should handle 409 conflict (already favorited) gracefully", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockResolvedValue({ favorites: [] });

      mockApiPost.mockRejectedValue(
        new ApiClientError("Already favorited", "CONFLICT", 409),
      );

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addFavorite("remedy-1", "Vitamin D");
      });

      // 409 should not set error or show toast
      expect(result.current.error).toBeNull();
      expect(mockToast.error).not.toHaveBeenCalled();
    });

    it("should handle non-409 errors and throw", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockResolvedValue({ favorites: [] });

      mockApiPost.mockRejectedValue(
        new ApiClientError("Server error", "INTERNAL_ERROR", 500),
      );

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.addFavorite("remedy-1", "Vitamin D"),
        ).rejects.toThrow("Server error");
      });

      expect(result.current.error).toBe("Server error");
      expect(mockToast.error).toHaveBeenCalledWith("Server error");
    });
  });

  describe("removeFavorite", () => {
    it("should call apiClient.delete and remove from state", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockResolvedValue({
        favorites: [mockFavorite, mockFavorite2],
      });

      mockApiDelete.mockResolvedValue(null);

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(2);
      });

      await act(async () => {
        await result.current.removeFavorite("remedy-1");
      });

      expect(mockApiDelete).toHaveBeenCalledWith("/api/favorites?id=fav-1");

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].remedyId).toBe("remedy-2");
      expect(mockToast.success).toHaveBeenCalledWith("Removed from favorites");
    });

    it("should do nothing if remedyId is not in favorites", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockResolvedValue({
        favorites: [mockFavorite],
      });

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(1);
      });

      await act(async () => {
        await result.current.removeFavorite("nonexistent-remedy");
      });

      expect(mockApiDelete).not.toHaveBeenCalled();
      expect(result.current.favorites).toHaveLength(1);
    });

    it("should handle remove errors and throw", async () => {
      mockUseDbUser.mockReturnValue({
        dbUserId: "db-user-123",
        role: "user",
        isLoaded: true,
        isSignedIn: true,
      });

      mockApiGet.mockResolvedValue({
        favorites: [mockFavorite],
      });

      mockApiDelete.mockRejectedValue(
        new ApiClientError("Delete failed", "INTERNAL_ERROR", 500),
      );

      const { result } = renderHook(() => useFavorites());

      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(1);
      });

      await act(async () => {
        await expect(result.current.removeFavorite("remedy-1")).rejects.toThrow(
          "Delete failed",
        );
      });

      expect(result.current.error).toBe("Delete failed");
      expect(mockToast.error).toHaveBeenCalledWith("Delete failed");
      // Favorites should remain unchanged on error
      expect(result.current.favorites).toHaveLength(1);
    });
  });
});
