/**
 * Quota reservation, atomically.
 *
 * The old shape was a read (`canPerformAction`) followed by a separate write
 * (`incrementUsage`) with no transaction between them, so N concurrent
 * requests all passed the check against the same stale count. A user at 9 of
 * 10 AI searches could fire ten at once and have all ten succeed — each one a
 * paid GPT-4 call.
 *
 * The limit now lives in the UPDATE's WHERE clause. These assert the contract
 * that makes that work.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpsert = vi.fn();
const mockUpdateMany = vi.fn();
const mockFindUnique = vi.fn();
const mockSubFindUnique = vi.fn();
const mockGetTrialStatus = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    usageRecord: {
      upsert: (...a: unknown[]) => mockUpsert(...a),
      updateMany: (...a: unknown[]) => mockUpdateMany(...a),
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
    },
    subscription: { findUnique: (...a: unknown[]) => mockSubFindUnique(...a) },
  },
}));

vi.mock("@/lib/trial", () => ({
  getTrialStatus: (...a: unknown[]) => mockGetTrialStatus(...a),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTrialStatus.mockResolvedValue({ isActive: false });
  mockSubFindUnique.mockResolvedValue({ plan: "basic", status: "active" });
  mockUpsert.mockResolvedValue({ aiSearches: 1, searches: 1 });
  mockFindUnique.mockResolvedValue({ aiSearches: 5, searches: 5 });
});

describe("tryConsumeUsage", () => {
  it("enforces the limit inside the UPDATE, not in application code", async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });
    const { tryConsumeUsage } = await import("@/lib/analytics/usage-tracker");

    const result = await tryConsumeUsage("user-1", "aiSearches", 1);

    expect(result.allowed).toBe(true);
    // This predicate is what makes concurrent requests serialise: Postgres
    // takes the row lock, and only rows still under the limit are updated.
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          aiSearches: { lt: 10 },
        }),
      }),
    );
  });

  it("refuses when the conditional update matches nothing", async () => {
    // count === 0 means another request already took the last slot.
    mockUpdateMany.mockResolvedValue({ count: 0 });
    mockFindUnique.mockResolvedValue({ aiSearches: 10 });
    const { tryConsumeUsage } = await import("@/lib/analytics/usage-tracker");

    const result = await tryConsumeUsage("user-1", "aiSearches", 1);

    expect(result.allowed).toBe(false);
    if (result.allowed) throw new Error("unreachable");
    expect(result.reason).toBe("limit_reached");
  });

  it("distinguishes a plan that lacks the feature from a spent allowance", async () => {
    // Free has maxAiSearchesPerDay: 0. That is a 403 (upgrade helps), not a
    // 429 (come back tomorrow).
    mockSubFindUnique.mockResolvedValue(null);
    const { tryConsumeUsage } = await import("@/lib/analytics/usage-tracker");

    const result = await tryConsumeUsage("user-1", "aiSearches", 1);

    expect(result.allowed).toBe(false);
    if (result.allowed) throw new Error("unreachable");
    expect(result.reason).toBe("not_in_plan");
    // No write attempted for a feature the plan does not include.
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("skips the predicate entirely when the plan is unlimited", async () => {
    // Premium has maxSearchesPerDay: -1. A conditional update would match
    // nothing sensible, so it increments directly.
    mockSubFindUnique.mockResolvedValue({ plan: "premium", status: "active" });
    mockUpsert.mockResolvedValue({ searches: 900 });
    const { tryConsumeUsage } = await import("@/lib/analytics/usage-tracker");

    const result = await tryConsumeUsage("user-1", "searches", 1);

    expect(result.allowed).toBe(true);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });
});

describe("refundUsage", () => {
  it("cannot drive a counter negative", async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });
    const { refundUsage } = await import("@/lib/analytics/usage-tracker");

    await refundUsage("user-1", "aiSearches", new Date("2026-01-01"), 1);

    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ aiSearches: { gte: 1 } }),
        data: { aiSearches: { decrement: 1 } },
      }),
    );
  });

  it("refunds against the date the reservation was made", async () => {
    // A refund landing after UTC midnight must not decrement the new day.
    mockUpdateMany.mockResolvedValue({ count: 1 });
    const reservedOn = new Date("2026-01-01T00:00:00.000Z");
    const { refundUsage } = await import("@/lib/analytics/usage-tracker");

    await refundUsage("user-1", "aiSearches", reservedOn, 1);

    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ date: reservedOn }),
      }),
    );
  });
});
