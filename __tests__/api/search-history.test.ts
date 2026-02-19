/**
 * Tests for /api/search-history route
 *
 * Tests popular/history retrieval, creation, and clearing behavior.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mockSaveSearchHistory = vi.fn();
const mockGetSearchHistory = vi.fn();
const mockClearSearchHistory = vi.fn();
const mockGetPopularSearches = vi.fn();
const mockVerifyOwnership = vi.fn();
const mockWithRateLimit = vi.fn();
const mockGetEffectivePlanLimits = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

vi.mock("@/lib/db", () => ({
  saveSearchHistory: (...args: unknown[]) => mockSaveSearchHistory(...args),
  getSearchHistory: (...args: unknown[]) => mockGetSearchHistory(...args),
  clearSearchHistory: (...args: unknown[]) => mockClearSearchHistory(...args),
  getPopularSearches: (...args: unknown[]) => mockGetPopularSearches(...args),
}));

vi.mock("@/lib/authorization", () => ({
  verifyOwnership: (...args: unknown[]) => mockVerifyOwnership(...args),
}));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    searchHistory: { limit: 30, window: 60, identifier: "search-history" },
  },
}));

vi.mock("@/lib/trial", () => ({
  getEffectivePlanLimits: (...args: unknown[]) =>
    mockGetEffectivePlanLimits(...args),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

import { DELETE, GET, POST } from "@/app/api/search-history/route";

const sessionId = "550e8400-e29b-41d4-a716-446655440000";

function allowedRateLimit() {
  return {
    allowed: true,
    result: {
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 60_000,
    },
  };
}

function deniedRateLimit() {
  return {
    allowed: false,
    response: NextResponse.json(
      {
        success: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" },
      },
      { status: 429 },
    ),
    result: {
      success: false,
      limit: 30,
      remaining: 0,
      reset: Date.now() + 60_000,
    },
  };
}

describe("/api/search-history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithRateLimit.mockResolvedValue(allowedRateLimit());
    mockVerifyOwnership.mockResolvedValue({
      authorized: true,
      currentUserId: null,
    });
    mockGetEffectivePlanLimits.mockResolvedValue({
      limits: { canAccessHistory: true },
      plan: "basic",
      isTrial: false,
    });
    // Default: unauthenticated (userId derived from session, not URL params)
    mockGetCurrentUser.mockResolvedValue(null);
  });

  describe("GET /api/search-history", () => {
    it("should return popular searches without ownership checks", async () => {
      const popular = [
        { query: "vitamin d", count: 20 },
        { query: "turmeric", count: 12 },
      ];
      mockGetPopularSearches.mockResolvedValue(popular);

      const request = new NextRequest(
        "http://localhost:3000/api/search-history?popular=true&limit=2",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.popular).toEqual(popular);
      expect(mockGetPopularSearches).toHaveBeenCalledWith(2);
      expect(mockVerifyOwnership).not.toHaveBeenCalled();
    });

    it("should forbid session-based history retrieval (paid feature)", async () => {
      mockGetSearchHistory.mockResolvedValue([]);

      const request = new NextRequest(
        `http://localhost:3000/api/search-history?sessionId=${sessionId}&limit=5`,
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
      expect(mockVerifyOwnership).toHaveBeenCalledWith(undefined, sessionId);
      expect(mockGetSearchHistory).not.toHaveBeenCalled();
    });

    it("should return history for an authorized user with access", async () => {
      // Simulate authenticated user — userId comes from session, not URL params
      mockGetCurrentUser.mockResolvedValueOnce({
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        image: null,
        role: "user",
      });
      const history = [
        {
          id: "history-1",
          query: "turmeric",
          resultsCount: 3,
          createdAt: new Date("2026-02-01T00:00:00.000Z"),
        },
      ];
      mockGetSearchHistory.mockResolvedValue(history);

      const request = new NextRequest(
        "http://localhost:3000/api/search-history?limit=5",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.history).toEqual([
        {
          ...history[0],
          createdAt: history[0]?.createdAt.toISOString(),
        },
      ]);
      expect(mockGetEffectivePlanLimits).toHaveBeenCalledWith("user-1");
      expect(mockGetSearchHistory).toHaveBeenCalledWith(undefined, "user-1", 5);
    });

    it("should return authorization error from verifyOwnership", async () => {
      mockVerifyOwnership.mockResolvedValue({
        authorized: false,
        currentUserId: null,
        error: NextResponse.json(
          {
            success: false,
            error: { code: "FORBIDDEN", message: "No access" },
          },
          { status: 403 },
        ),
      });

      const request = new NextRequest(
        `http://localhost:3000/api/search-history?sessionId=${sessionId}`,
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
    });

    it("should return 400 for invalid limit", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/search-history?sessionId=${sessionId}&limit=0`,
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return 500 when history query fails", async () => {
      // Simulate authenticated user so the request reaches the DB query
      mockGetCurrentUser.mockResolvedValueOnce({
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        image: null,
        role: "user",
      });
      mockGetSearchHistory.mockRejectedValue(new Error("DB failure"));

      const request = new NextRequest(
        "http://localhost:3000/api/search-history",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/search-history", () => {
    const validBody = {
      query: "turmeric",
      resultsCount: 4,
      sessionId,
    };

    it("should return 429 when rate-limited", async () => {
      mockWithRateLimit.mockResolvedValue(deniedRateLimit());

      const request = new NextRequest(
        "http://localhost:3000/api/search-history",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(mockSaveSearchHistory).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid payload", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/search-history",
        {
          method: "POST",
          body: JSON.stringify({ query: "" }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return authorization error from verifyOwnership", async () => {
      mockVerifyOwnership.mockResolvedValue({
        authorized: false,
        currentUserId: null,
        error: NextResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "No access" },
          },
          { status: 401 },
        ),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/search-history",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
      expect(mockSaveSearchHistory).not.toHaveBeenCalled();
    });

    it("should save history and return 201", async () => {
      mockSaveSearchHistory.mockResolvedValue(undefined);

      const request = new NextRequest(
        "http://localhost:3000/api/search-history",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockSaveSearchHistory).toHaveBeenCalledWith(
        "turmeric",
        4,
        sessionId,
        undefined,
      );
    });

    it("should return 409 for duplicate entries", async () => {
      mockSaveSearchHistory.mockRejectedValue(
        new Error("Unique constraint failed"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/search-history",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CONFLICT");
    });
  });

  describe("DELETE /api/search-history", () => {
    it("should return 429 when rate-limited", async () => {
      mockWithRateLimit.mockResolvedValue(deniedRateLimit());

      const request = new NextRequest(
        `http://localhost:3000/api/search-history?sessionId=${sessionId}`,
        { method: "DELETE" },
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
    });

    it("should return 400 when neither sessionId nor userId is provided", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/search-history",
        {
          method: "DELETE",
        },
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return authorization error from verifyOwnership", async () => {
      mockVerifyOwnership.mockResolvedValue({
        authorized: false,
        currentUserId: null,
        error: NextResponse.json(
          {
            success: false,
            error: { code: "FORBIDDEN", message: "No access" },
          },
          { status: 403 },
        ),
      });

      const request = new NextRequest(
        `http://localhost:3000/api/search-history?sessionId=${sessionId}`,
        { method: "DELETE" },
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("FORBIDDEN");
      expect(mockClearSearchHistory).not.toHaveBeenCalled();
    });

    it("should clear history and return deleted count", async () => {
      mockClearSearchHistory.mockResolvedValue(7);

      const request = new NextRequest(
        `http://localhost:3000/api/search-history?sessionId=${sessionId}`,
        { method: "DELETE" },
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.deletedCount).toBe(7);
      expect(mockClearSearchHistory).toHaveBeenCalledWith(sessionId, undefined);
    });

    it("should return 500 when delete fails", async () => {
      mockClearSearchHistory.mockRejectedValue(new Error("DB failure"));

      const request = new NextRequest(
        `http://localhost:3000/api/search-history?sessionId=${sessionId}`,
        { method: "DELETE" },
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
