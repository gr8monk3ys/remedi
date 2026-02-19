/**
 * Tests for /api/filter-preferences route
 *
 * Tests filter preference operations:
 * - GET: Fetch filter preferences for a session/user
 * - POST: Save or update filter preferences
 * - DELETE: Clear filter preferences
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { mockSessionId } from "../mocks";

const mockWithRateLimit = vi.fn();
const mockSaveFilterPreferences = vi.fn();
const mockGetFilterPreferences = vi.fn();
const mockClearFilterPreferences = vi.fn();

vi.mock("@/lib/db", () => ({
  saveFilterPreferences: (...args: unknown[]) =>
    mockSaveFilterPreferences(...args),
  getFilterPreferences: (...args: unknown[]) =>
    mockGetFilterPreferences(...args),
  clearFilterPreferences: (...args: unknown[]) =>
    mockClearFilterPreferences(...args),
}));

vi.mock("@/lib/authorization", () => ({
  verifyOwnership: vi.fn().mockResolvedValue({ authorized: true, error: null }),
}));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    filterPreferences: {
      limit: 30,
      window: 60,
      identifier: "filterPreferences",
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

import { verifyOwnership } from "@/lib/authorization";

const mockPreferences = {
  id: "pref-1",
  sessionId: mockSessionId,
  userId: null,
  categories: ["Herbal Remedy"],
  nutrients: ["Curcumin"],
  evidenceLevels: ["Strong"],
  sortBy: "relevance",
  sortOrder: "desc",
};

describe("/api/filter-preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyOwnership).mockResolvedValue({
      authorized: true,
      currentUserId: null,
    });
    mockWithRateLimit.mockResolvedValue({ allowed: true, response: null });
  });

  describe("GET /api/filter-preferences", () => {
    it("should return 400 when neither sessionId nor userId provided", async () => {
      const { GET } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        "http://localhost:3000/api/filter-preferences",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return saved preferences", async () => {
      mockGetFilterPreferences.mockResolvedValue(mockPreferences);
      const { GET } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        `http://localhost:3000/api/filter-preferences?sessionId=${mockSessionId}`,
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.preferences).toEqual(mockPreferences);
      expect(data.data.isDefault).toBe(false);
    });

    it("should return default preferences when none exist", async () => {
      mockGetFilterPreferences.mockResolvedValue(null);
      const { GET } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        `http://localhost:3000/api/filter-preferences?sessionId=${mockSessionId}`,
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isDefault).toBe(true);
      expect(data.data.preferences.categories).toEqual([]);
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
      const { GET } = await import("@/app/api/filter-preferences/route");
      // Use sessionId (not userId) — userId is now derived from session, not URL params
      const request = new NextRequest(
        `http://localhost:3000/api/filter-preferences?sessionId=${mockSessionId}`,
      );
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it("should return 500 on server error", async () => {
      mockGetFilterPreferences.mockRejectedValue(new Error("Database error"));
      const { GET } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        `http://localhost:3000/api/filter-preferences?sessionId=${mockSessionId}`,
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/filter-preferences", () => {
    const validBody = {
      sessionId: mockSessionId,
      categories: ["Herbal Remedy"],
      nutrients: ["Curcumin"],
      evidenceLevels: ["Strong"],
      sortBy: "similarity",
      sortOrder: "desc",
    };

    it("should return rate limit response when rate limited", async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({
          success: false,
          error: { code: "RATE_LIMITED" },
        }),
        { status: 429 },
      );
      mockWithRateLimit.mockResolvedValue({
        allowed: false,
        response: rateLimitResponse,
      });
      const { POST } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        "http://localhost:3000/api/filter-preferences",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(429);
    });

    it("should save filter preferences successfully", async () => {
      mockSaveFilterPreferences.mockResolvedValue(mockPreferences);
      const { POST } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        "http://localhost:3000/api/filter-preferences",
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
      expect(data.data.message).toContain("saved successfully");
    });

    it("should return 400 when neither sessionId nor userId provided", async () => {
      const { POST } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        "http://localhost:3000/api/filter-preferences",
        {
          method: "POST",
          body: JSON.stringify({
            categories: ["Herbal Remedy"],
          }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
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
      const { POST } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        "http://localhost:3000/api/filter-preferences",
        {
          method: "POST",
          body: JSON.stringify({
            ...validBody,
            userId: "other-user",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(403);
    });

    it("should return 500 on server error", async () => {
      mockSaveFilterPreferences.mockRejectedValue(new Error("Database error"));
      const { POST } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        "http://localhost:3000/api/filter-preferences",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("DELETE /api/filter-preferences", () => {
    it("should return rate limit response when rate limited", async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({
          success: false,
          error: { code: "RATE_LIMITED" },
        }),
        { status: 429 },
      );
      mockWithRateLimit.mockResolvedValue({
        allowed: false,
        response: rateLimitResponse,
      });
      const { DELETE } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        `http://localhost:3000/api/filter-preferences?sessionId=${mockSessionId}`,
        { method: "DELETE" },
      );
      const response = await DELETE(request);

      expect(response.status).toBe(429);
    });

    it("should return 400 when neither sessionId nor userId provided", async () => {
      const { DELETE } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        "http://localhost:3000/api/filter-preferences",
        { method: "DELETE" },
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should clear preferences successfully", async () => {
      mockClearFilterPreferences.mockResolvedValue(undefined);
      const { DELETE } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        `http://localhost:3000/api/filter-preferences?sessionId=${mockSessionId}`,
        { method: "DELETE" },
      );
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain("cleared successfully");
      expect(mockClearFilterPreferences).toHaveBeenCalledWith(
        mockSessionId,
        undefined,
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
      const { DELETE } = await import("@/app/api/filter-preferences/route");
      // Use sessionId (not userId) — userId is now derived from session, not URL params
      const request = new NextRequest(
        `http://localhost:3000/api/filter-preferences?sessionId=${mockSessionId}`,
        { method: "DELETE" },
      );
      const response = await DELETE(request);

      expect(response.status).toBe(403);
    });

    it("should return 500 on server error", async () => {
      mockClearFilterPreferences.mockRejectedValue(new Error("Database error"));
      const { DELETE } = await import("@/app/api/filter-preferences/route");
      const request = new NextRequest(
        `http://localhost:3000/api/filter-preferences?sessionId=${mockSessionId}`,
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
