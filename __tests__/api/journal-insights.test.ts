/**
 * Tests for /api/journal/insights route
 *
 * Tests plan-gated insights retrieval.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockGetRemedyInsights = vi.fn();
const mockPrismaSubscriptionFindUnique = vi.fn();
const mockGetTrialStatus = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

vi.mock("@/lib/trial", () => ({
  getTrialStatus: (...args: unknown[]) => mockGetTrialStatus(...args),
}));

vi.mock("@/lib/db", () => ({
  getRemedyInsights: (...args: unknown[]) => mockGetRemedyInsights(...args),
  prisma: {
    subscription: {
      findUnique: (...args: unknown[]) =>
        mockPrismaSubscriptionFindUnique(...args),
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

import { GET } from "@/app/api/journal/insights/route";

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

describe("/api/journal/insights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockGetTrialStatus.mockResolvedValue({
      isActive: false,
      isEligible: true,
      hasUsedTrial: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0,
      plan: "basic",
    });
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      plan: "basic",
      status: "active",
    });
  });

  it("should return 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/journal/insights?remedyId=remedy-1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 403 for free users", async () => {
    mockGetTrialStatus.mockResolvedValue({
      isActive: false,
      isEligible: true,
      hasUsedTrial: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0,
      plan: "free",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/journal/insights?remedyId=remedy-1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");
  });

  it("should return 400 when remedyId is missing", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/journal/insights",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INVALID_INPUT");
  });

  it("should return 404 when there are no insights", async () => {
    mockGetRemedyInsights.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/journal/insights?remedyId=remedy-1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("RESOURCE_NOT_FOUND");
  });

  it("should return insights for a valid request", async () => {
    const insights = {
      remedyId: "remedy-1",
      remedyName: "Turmeric",
      totalEntries: 5,
      avgRating: 4.2,
      trend: "improving",
      topSymptoms: [{ symptom: "Pain", count: 3 }],
      topSideEffects: [],
      ratingHistory: [{ date: "2026-02-01", rating: 4 }],
    };
    mockGetRemedyInsights.mockResolvedValue(insights);

    const request = new NextRequest(
      "http://localhost:3000/api/journal/insights?remedyId=remedy-1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.insights).toEqual(insights);
    expect(mockGetRemedyInsights).toHaveBeenCalledWith("user-123", "remedy-1");
  });

  it("should return 500 when the query fails", async () => {
    mockGetRemedyInsights.mockRejectedValue(new Error("DB failure"));

    const request = new NextRequest(
      "http://localhost:3000/api/journal/insights?remedyId=remedy-1",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INTERNAL_ERROR");
  });
});
