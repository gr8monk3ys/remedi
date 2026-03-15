/**
 * Tests for /api/dashboard/history/export route
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

const mockFindMany = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    searchHistory: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

const mockGetEffectivePlanLimits = vi.fn();
vi.mock("@/lib/trial", () => ({
  getEffectivePlanLimits: (...args: unknown[]) =>
    mockGetEffectivePlanLimits(...args),
}));

const mockCanPerformAction = vi.fn();
const mockIncrementUsage = vi.fn();
vi.mock("@/lib/analytics/usage-tracker", () => ({
  canPerformAction: (...args: unknown[]) => mockCanPerformAction(...args),
  incrementUsage: (...args: unknown[]) => mockIncrementUsage(...args),
}));

const mockWithRateLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    searchHistory: { limit: 30, window: 60, identifier: "search-history" },
  },
}));

describe("/api/dashboard/history/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithRateLimit.mockResolvedValue({ allowed: true });
    mockGetCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      image: null,
      role: "user",
    });
    mockGetEffectivePlanLimits.mockResolvedValue({
      limits: { canAccessHistory: true, canExport: true, maxCompareItems: 4 },
      plan: "basic",
      isTrial: false,
    });
    mockCanPerformAction.mockResolvedValue({
      allowed: true,
      currentUsage: 0,
      limit: -1,
      plan: "basic",
    });
    mockIncrementUsage.mockResolvedValue({
      newCount: 1,
      wasWithinLimit: true,
      isNowWithinLimit: true,
    });
    mockFindMany.mockResolvedValue([
      {
        query: "ibuprofen",
        resultsCount: 2,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { GET } = await import("@/app/api/dashboard/history/export/route");
    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/history/export",
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("exports CSV by default", async () => {
    const { GET } = await import("@/app/api/dashboard/history/export/route");
    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/history/export",
    );
    const response = await GET(request);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(response.headers.get("Content-Disposition")).toContain(
      "search-history.csv",
    );
    expect(text).toContain("query,resultsCount,createdAt");
    expect(text).toContain("ibuprofen,2,2026-01-01T00:00:00.000Z");
    expect(mockIncrementUsage).toHaveBeenCalledWith("user-1", "exports", 1);
  });

  it("exports JSON when format=json", async () => {
    const { GET } = await import("@/app/api/dashboard/history/export/route");
    const request = new NextRequest(
      "http://localhost:3000/api/dashboard/history/export?format=json",
    );
    const response = await GET(request);
    const text = await response.text();
    const parsed = JSON.parse(text) as Array<{
      query: string;
      resultsCount: number;
      createdAt: string;
    }>;

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("Content-Disposition")).toContain(
      "search-history.json",
    );
    expect(parsed[0]?.query).toBe("ibuprofen");
  });
});
