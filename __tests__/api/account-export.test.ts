/**
 * Tests for /api/account/export route
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
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
    general: { limit: 60, window: 60, identifier: "general" },
  },
}));

const mockPrisma = {
  user: { findUnique: vi.fn() },
  emailPreference: { findUnique: vi.fn() },
  favorite: { findMany: vi.fn() },
  filterPreference: { findUnique: vi.fn() },
  searchHistory: { findMany: vi.fn() },
  healthProfile: { findUnique: vi.fn() },
  medicationCabinet: { findMany: vi.fn() },
  remedyJournal: { findMany: vi.fn() },
  remedyReport: { findMany: vi.fn() },
  subscription: { findUnique: vi.fn() },
  usageRecord: { findMany: vi.fn() },
  userEvent: { findMany: vi.fn() },
  conversionEvent: { findMany: vi.fn() },
  emailLog: { findMany: vi.fn() },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

describe("/api/account/export", () => {
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
      limits: { canExport: true },
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

    // Default prisma responses
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      clerkId: "user_clerk",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      trialStartDate: null,
      trialEndDate: null,
      hasUsedTrial: false,
    });
    mockPrisma.emailPreference.findUnique.mockResolvedValue(null);
    mockPrisma.favorite.findMany.mockResolvedValue([]);
    mockPrisma.filterPreference.findUnique.mockResolvedValue(null);
    mockPrisma.searchHistory.findMany.mockResolvedValue([]);
    mockPrisma.healthProfile.findUnique.mockResolvedValue(null);
    mockPrisma.medicationCabinet.findMany.mockResolvedValue([]);
    mockPrisma.remedyJournal.findMany.mockResolvedValue([]);
    mockPrisma.remedyReport.findMany.mockResolvedValue([]);
    mockPrisma.subscription.findUnique.mockResolvedValue(null);
    mockPrisma.usageRecord.findMany.mockResolvedValue([]);
    mockPrisma.userEvent.findMany.mockResolvedValue([]);
    mockPrisma.conversionEvent.findMany.mockResolvedValue([]);
    mockPrisma.emailLog.findMany.mockResolvedValue([]);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { GET } = await import("@/app/api/account/export/route");
    const request = new NextRequest("http://localhost:3000/api/account/export");
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns JSON export and increments usage", async () => {
    const { GET } = await import("@/app/api/account/export/route");
    const request = new NextRequest("http://localhost:3000/api/account/export");
    const response = await GET(request);
    const text = await response.text();
    const parsed = JSON.parse(text) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("Content-Disposition")).toContain(
      "remedi-data-export.json",
    );
    expect(parsed.exportedAt).toBeDefined();
    expect(parsed.user).toBeDefined();
    expect(parsed.plan).toBeDefined();
    expect(mockIncrementUsage).toHaveBeenCalledWith("user-1", "exports", 1);
  });
});
