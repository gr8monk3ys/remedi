/**
 * Tests for /api/favorites route
 *
 * Tests CRUD operations for favorites:
 * - GET: Fetch favorites, check if favorited, get collections
 * - POST: Add to favorites
 * - PUT: Update favorite notes/collection
 * - DELETE: Remove from favorites
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { mockSessionId, mockFavorite } from "../mocks";

// Mock database functions
const mockFavoriteCount = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    favorite: {
      count: (...args: unknown[]) => mockFavoriteCount(...args),
    },
  },
  addFavorite: vi.fn(),
  getFavorites: vi.fn(),
  updateFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  isFavorite: vi.fn(),
  getCollectionNames: vi.fn(),
  getFavoriteById: vi.fn(),
}));

// Mock authorization
vi.mock("@/lib/authorization", () => ({
  verifyOwnership: vi.fn().mockResolvedValue({ authorized: true, error: null }),
  verifyResourceOwnership: vi
    .fn()
    .mockResolvedValue({ authorized: true, error: null }),
}));

// Mock rate limiting
vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, result: { success: true } }),
  RATE_LIMITS: {
    favorites: { limit: 30, window: 60, identifier: "favorites" },
  },
}));

// Mock analytics
vi.mock("@/lib/analytics/user-events", () => ({
  trackUserEventSafe: vi.fn().mockResolvedValue(undefined),
}));

import {
  addFavorite,
  getFavorites,
  updateFavorite,
  removeFavorite,
  isFavorite,
  getCollectionNames,
  getFavoriteById,
} from "@/lib/db";
import { verifyOwnership, verifyResourceOwnership } from "@/lib/authorization";
import { GET, POST, PUT, DELETE } from "@/app/api/favorites/route";

describe("/api/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFavoriteCount.mockResolvedValue(0);
    vi.mocked(verifyOwnership).mockResolvedValue({
      authorized: true,
      currentUserId: null,
    });
    vi.mocked(verifyResourceOwnership).mockResolvedValue({ authorized: true });
  });

  describe("GET /api/favorites", () => {
    it("should return list of favorites", async () => {
      vi.mocked(getFavorites).mockResolvedValue({
        favorites: [mockFavorite],
        total: 1,
      });

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?sessionId=${mockSessionId}`,
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.favorites).toHaveLength(1);
      expect(json.data.favorites[0].remedyName).toBe("Turmeric");
      expect(getFavorites).toHaveBeenCalledWith(
        mockSessionId,
        undefined,
        undefined,
        0,
        20,
      );
    });

    it("should check if remedy is favorited", async () => {
      vi.mocked(isFavorite).mockResolvedValue(true);

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?sessionId=${mockSessionId}&check=remedy-1`,
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.isFavorite).toBe(true);
      expect(json.data.remedyId).toBe("remedy-1");
      expect(isFavorite).toHaveBeenCalledWith(
        "remedy-1",
        mockSessionId,
        undefined,
      );
    });

    it("should return collection names", async () => {
      vi.mocked(getCollectionNames).mockResolvedValue([
        "Pain Relief",
        "Sleep Aids",
      ]);

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?sessionId=${mockSessionId}&collections=true`,
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.collections).toEqual(["Pain Relief", "Sleep Aids"]);
    });

    it("should filter favorites by collection name", async () => {
      vi.mocked(getFavorites).mockResolvedValue({
        favorites: [mockFavorite],
        total: 1,
      });

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?sessionId=${mockSessionId}&collectionName=Pain%20Relief`,
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(getFavorites).toHaveBeenCalledWith(
        mockSessionId,
        undefined,
        "Pain Relief",
        0,
        20,
      );
    });

    it("should return 403 when user is unauthorized", async () => {
      const mockError = NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 },
      );
      vi.mocked(verifyOwnership).mockResolvedValue({
        authorized: false,
        currentUserId: null,
        error: mockError,
      });

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?userId=other-user`,
      );
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it("should handle database errors", async () => {
      vi.mocked(getFavorites).mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?sessionId=${mockSessionId}`,
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/favorites", () => {
    it("should add a new favorite", async () => {
      vi.mocked(addFavorite).mockResolvedValue(mockFavorite);

      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "POST",
        body: JSON.stringify({
          remedyId: "turmeric",
          remedyName: "Turmeric",
          sessionId: mockSessionId,
          notes: "Good for joints",
          collectionName: "Pain Relief",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.message).toContain("added to favorites");
      expect(addFavorite).toHaveBeenCalled();
    });

    it("should reject invalid request body", async () => {
      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "POST",
        body: JSON.stringify({
          remedyId: "turmeric",
          // Missing required remedyName
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should handle duplicate favorites", async () => {
      vi.mocked(addFavorite).mockRejectedValue(
        new Error("Unique constraint failed"),
      );

      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "POST",
        body: JSON.stringify({
          remedyId: "turmeric",
          remedyName: "Turmeric",
          sessionId: mockSessionId,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("CONFLICT");
    });

    it("should verify ownership before adding", async () => {
      const mockError = NextResponse.json(
        { success: false, error: { code: "FORBIDDEN" } },
        { status: 403 },
      );
      vi.mocked(verifyOwnership).mockResolvedValue({
        authorized: false,
        currentUserId: null,
        error: mockError,
      });

      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "POST",
        body: JSON.stringify({
          remedyId: "test",
          remedyName: "Test",
          userId: "other-user",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it("should handle generic server errors", async () => {
      vi.mocked(addFavorite).mockRejectedValue(new Error("Unexpected error"));

      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "POST",
        body: JSON.stringify({
          remedyId: "test",
          remedyName: "Test",
          sessionId: mockSessionId,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
    });
  });

  describe("PUT /api/favorites", () => {
    it("should update favorite notes", async () => {
      vi.mocked(getFavoriteById).mockResolvedValue(mockFavorite);
      vi.mocked(updateFavorite).mockResolvedValue({
        ...mockFavorite,
        notes: "Updated notes",
      });

      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "PUT",
        body: JSON.stringify({
          id: mockFavorite.id,
          notes: "Updated notes",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.message).toContain("updated successfully");
    });

    it("should update favorite collection", async () => {
      vi.mocked(getFavoriteById).mockResolvedValue(mockFavorite);
      vi.mocked(updateFavorite).mockResolvedValue({
        ...mockFavorite,
        collectionName: "New Collection",
      });

      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "PUT",
        body: JSON.stringify({
          id: mockFavorite.id,
          collectionName: "New Collection",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it("should return 404 when favorite not found", async () => {
      vi.mocked(getFavoriteById).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "PUT",
        body: JSON.stringify({
          id: "550e8400-e29b-41d4-a716-000000000000",
          notes: "New notes",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should verify resource ownership before updating", async () => {
      vi.mocked(getFavoriteById).mockResolvedValue({
        ...mockFavorite,
        userId: "other-user",
      });
      const mockError = NextResponse.json(
        { success: false, error: { code: "FORBIDDEN" } },
        { status: 403 },
      );
      vi.mocked(verifyResourceOwnership).mockResolvedValue({
        authorized: false,
        error: mockError,
      });

      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "PUT",
        body: JSON.stringify({
          id: mockFavorite.id,
          notes: "Trying to update",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      expect(response.status).toBe(403);
    });

    it("should reject invalid UUID for id", async () => {
      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "PUT",
        body: JSON.stringify({
          id: "not-a-uuid",
          notes: "Test",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });
  });

  describe("DELETE /api/favorites", () => {
    it("should delete a favorite", async () => {
      vi.mocked(getFavoriteById).mockResolvedValue(mockFavorite);
      vi.mocked(removeFavorite).mockResolvedValue();

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?id=${mockFavorite.id}`,
        { method: "DELETE" },
      );

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.message).toContain("removed successfully");
      expect(removeFavorite).toHaveBeenCalledWith(mockFavorite.id);
    });

    it("should return 400 when id is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/favorites", {
        method: "DELETE",
      });

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("INVALID_INPUT");
    });

    it("should return 404 when favorite not found", async () => {
      vi.mocked(getFavoriteById).mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?id=${mockFavorite.id}`,
        { method: "DELETE" },
      );

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should verify resource ownership before deleting", async () => {
      vi.mocked(getFavoriteById).mockResolvedValue({
        ...mockFavorite,
        userId: "other-user",
      });
      const mockError = NextResponse.json(
        { success: false, error: { code: "FORBIDDEN" } },
        { status: 403 },
      );
      vi.mocked(verifyResourceOwnership).mockResolvedValue({
        authorized: false,
        error: mockError,
      });

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?id=${mockFavorite.id}`,
        { method: "DELETE" },
      );

      const response = await DELETE(request);
      expect(response.status).toBe(403);
    });

    it("should handle record not existing during delete", async () => {
      vi.mocked(getFavoriteById).mockResolvedValue(mockFavorite);
      vi.mocked(removeFavorite).mockRejectedValue(
        new Error("Record to delete does not exist"),
      );

      const request = new NextRequest(
        `http://localhost:3000/api/favorites?id=${mockFavorite.id}`,
        { method: "DELETE" },
      );

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should reject invalid UUID for id", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/favorites?id=invalid-uuid",
        { method: "DELETE" },
      );

      const response = await DELETE(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe("INVALID_INPUT");
    });
  });
});
