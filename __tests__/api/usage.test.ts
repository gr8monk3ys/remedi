/**
 * Tests for /api/usage route
 *
 * Tests usage operations:
 * - GET: Get current usage summary with optional history/aggregate
 * - POST: Record a usage event (with limit checking)
 * - HEAD: Check if a specific action can be performed
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockGetUsageSummary = vi.fn();
const mockIncrementUsage = vi.fn();
const mockCanPerformAction = vi.fn();
const mockGetUsageHistory = vi.fn();
const mockGetAggregateUsage = vi.fn();
const mockGetTrialStatus = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/analytics/usage-tracker", () => ({
  getUsageSummary: (...args: unknown[]) => mockGetUsageSummary(...args),
  incrementUsage: (...args: unknown[]) => mockIncrementUsage(...args),
  canPerformAction: (...args: unknown[]) => mockCanPerformAction(...args),
  getUsageHistory: (...args: unknown[]) => mockGetUsageHistory(...args),
  getAggregateUsage: (...args: unknown[]) => mockGetAggregateUsage(...args),
}));

vi.mock("@/lib/trial", () => ({
  getTrialStatus: (...args: unknown[]) => mockGetTrialStatus(...args),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

const mockUsageSummary = {
  plan: "basic",
  searches: { used: 10, limit: 100 },
  aiSearches: { used: 2, limit: 10 },
  exports: { used: 0, limit: -1 },
  comparisons: { used: 1, limit: -1 },
};

const mockTrialStatusData = {
  isActive: false,
  isEligible: true,
  daysRemaining: 0,
  endDate: null,
};

describe("/api/usage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockGetTrialStatus.mockResolvedValue(mockTrialStatusData);
  });

  describe("GET /api/usage", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { GET } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return usage summary", async () => {
      mockGetUsageSummary.mockResolvedValue(mockUsageSummary);
      const { GET } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.plan).toBe("basic");
      expect(data.data.trial).toBeDefined();
      expect(data.data.trial.isActive).toBe(false);
      expect(mockGetUsageSummary).toHaveBeenCalledWith("user-123");
    });

    it("should include history when history=true", async () => {
      const mockHistory = [{ date: "2024-06-15", searches: 5 }];
      mockGetUsageSummary.mockResolvedValue(mockUsageSummary);
      mockGetUsageHistory.mockResolvedValue(mockHistory);
      const { GET } = await import("@/app/api/usage/route");
      const request = new NextRequest(
        "http://localhost:3000/api/usage?history=true",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.history).toEqual(mockHistory);
      expect(mockGetUsageHistory).toHaveBeenCalledWith("user-123", 30);
    });

    it("should include aggregate when aggregate=true", async () => {
      const mockAggregate = { totalSearches: 100, totalAiSearches: 20 };
      mockGetUsageSummary.mockResolvedValue(mockUsageSummary);
      mockGetAggregateUsage.mockResolvedValue(mockAggregate);
      const { GET } = await import("@/app/api/usage/route");
      const request = new NextRequest(
        "http://localhost:3000/api/usage?aggregate=true",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.aggregate).toEqual(mockAggregate);
      expect(mockGetAggregateUsage).toHaveBeenCalledWith("user-123", 30);
    });

    it("should accept custom days parameter", async () => {
      mockGetUsageSummary.mockResolvedValue(mockUsageSummary);
      mockGetUsageHistory.mockResolvedValue([]);
      const { GET } = await import("@/app/api/usage/route");
      const request = new NextRequest(
        "http://localhost:3000/api/usage?history=true&days=7",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockGetUsageHistory).toHaveBeenCalledWith("user-123", 7);
    });

    it("should return 500 on server error", async () => {
      mockGetUsageSummary.mockRejectedValue(new Error("Database error"));
      const { GET } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/usage", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { POST } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage", {
        method: "POST",
        body: JSON.stringify({ type: "searches" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should record usage successfully", async () => {
      mockCanPerformAction.mockResolvedValue({
        allowed: true,
        currentUsage: 10,
        limit: 100,
        plan: "basic",
      });
      mockIncrementUsage.mockResolvedValue({
        newCount: 11,
        isNowWithinLimit: true,
      });
      const { POST } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage", {
        method: "POST",
        body: JSON.stringify({ type: "searches" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.recorded).toBe(true);
      expect(data.data.newCount).toBe(11);
      expect(data.data.limitReached).toBe(false);
    });

    it("should return 429 when limit is exceeded", async () => {
      mockCanPerformAction.mockResolvedValue({
        allowed: false,
        currentUsage: 100,
        limit: 100,
        plan: "basic",
      });
      const { POST } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage", {
        method: "POST",
        body: JSON.stringify({ type: "searches" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("LIMIT_EXCEEDED");
    });

    it("should indicate when limit is reached after increment", async () => {
      mockCanPerformAction.mockResolvedValue({
        allowed: true,
        currentUsage: 99,
        limit: 100,
        plan: "basic",
      });
      mockIncrementUsage.mockResolvedValue({
        newCount: 100,
        isNowWithinLimit: false,
      });
      const { POST } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage", {
        method: "POST",
        body: JSON.stringify({ type: "searches" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.limitReached).toBe(true);
    });

    it("should return 400 for invalid usage type", async () => {
      const { POST } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage", {
        method: "POST",
        body: JSON.stringify({ type: "invalid_type" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing type", async () => {
      const { POST } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 500 on server error", async () => {
      mockCanPerformAction.mockRejectedValue(new Error("Database error"));
      const { POST } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage", {
        method: "POST",
        body: JSON.stringify({ type: "searches" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("HEAD /api/usage", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { HEAD } = await import("@/app/api/usage/route");
      const request = new NextRequest(
        "http://localhost:3000/api/usage?type=searches",
        { method: "HEAD" },
      );
      const response = await HEAD(request);

      expect(response.status).toBe(401);
    });

    it("should return 200 when action is allowed", async () => {
      mockCanPerformAction.mockResolvedValue({
        allowed: true,
        currentUsage: 5,
        limit: 100,
        plan: "basic",
      });
      const { HEAD } = await import("@/app/api/usage/route");
      const request = new NextRequest(
        "http://localhost:3000/api/usage?type=searches",
        { method: "HEAD" },
      );
      const response = await HEAD(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("X-Usage-Current")).toBe("5");
      expect(response.headers.get("X-Usage-Limit")).toBe("100");
      expect(response.headers.get("X-Usage-Plan")).toBe("basic");
    });

    it("should return 429 when action is not allowed", async () => {
      mockCanPerformAction.mockResolvedValue({
        allowed: false,
        currentUsage: 100,
        limit: 100,
        plan: "basic",
      });
      const { HEAD } = await import("@/app/api/usage/route");
      const request = new NextRequest(
        "http://localhost:3000/api/usage?type=searches",
        { method: "HEAD" },
      );
      const response = await HEAD(request);

      expect(response.status).toBe(429);
      expect(response.headers.get("X-Usage-Current")).toBe("100");
    });

    it("should return 400 for invalid type", async () => {
      const { HEAD } = await import("@/app/api/usage/route");
      const request = new NextRequest(
        "http://localhost:3000/api/usage?type=invalid",
        { method: "HEAD" },
      );
      const response = await HEAD(request);

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing type", async () => {
      const { HEAD } = await import("@/app/api/usage/route");
      const request = new NextRequest("http://localhost:3000/api/usage", {
        method: "HEAD",
      });
      const response = await HEAD(request);

      expect(response.status).toBe(400);
    });

    it("should return 500 on server error", async () => {
      mockCanPerformAction.mockRejectedValue(new Error("Database error"));
      const { HEAD } = await import("@/app/api/usage/route");
      const request = new NextRequest(
        "http://localhost:3000/api/usage?type=searches",
        { method: "HEAD" },
      );
      const response = await HEAD(request);

      expect(response.status).toBe(500);
    });
  });
});
