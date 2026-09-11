/**
 * The daily search allowance, enforced.
 *
 * PLAN_LIMITS has carried maxSearchesPerDay since the plans were written and
 * nothing enforced it: /api/search never consulted it, and the counter only
 * moved if a client voluntarily POSTed /api/usage, which no client does.
 *
 * These drive the route with an authenticated user, which search.test.ts does
 * not — it never mocks getCurrentUser, so `userId` is undefined there and this
 * path is skipped entirely.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockTryConsumeUsage = vi.fn();
const mockRefundUsage = vi.fn();
const mockSearchPharmaceuticals = vi.fn();
const mockSearchFdaDrugs = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/analytics/usage-tracker", () => ({
  tryConsumeUsage: (...a: unknown[]) => mockTryConsumeUsage(...a),
  refundUsage: (...a: unknown[]) => mockRefundUsage(...a),
}));

vi.mock("@/lib/db", () => ({
  searchPharmaceuticals: (...a: unknown[]) => mockSearchPharmaceuticals(...a),
  getNaturalRemediesForPharmaceutical: vi.fn().mockResolvedValue([]),
  generateRemedyMappingsForPharmaceutical: vi
    .fn()
    .mockResolvedValue({ kind: "known", data: [] }),
  upsertPharmaceutical: vi.fn(),
  saveSearchHistory: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/openFDA", () => ({
  searchFdaDrugs: (...a: unknown[]) => mockSearchFdaDrugs(...a),
}));

vi.mock("@/lib/fuzzy-search", () => ({ fuzzySearch: vi.fn(() => []) }));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: vi.fn().mockResolvedValue({ allowed: true, result: {} }),
  RATE_LIMITS: { search: { limit: 30, window: 60, identifier: "search" } },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

vi.mock("@/lib/analytics/user-events", () => ({
  trackUserEventSafe: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/mock-data", () => ({
  MOCK_PHARMACEUTICALS: [],
  MOCK_REMEDY_MAPPINGS: {},
}));

vi.mock("@/lib/constants", () => ({
  COMMON_SUFFIXES: [],
  SPELLING_VARIANTS: {},
}));

const req = () =>
  new NextRequest("http://localhost:3000/api/search?query=ibuprofen");

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue({ id: "user-1" });
  mockSearchPharmaceuticals.mockResolvedValue([]);
  mockSearchFdaDrugs.mockResolvedValue({ kind: "known", data: [] });
  mockTryConsumeUsage.mockResolvedValue({
    allowed: true,
    plan: "free",
    limit: 5,
    newCount: 1,
    date: new Date("2026-01-01"),
  });
});

describe("daily search allowance", () => {
  it("refuses a search once the allowance is spent", async () => {
    mockTryConsumeUsage.mockResolvedValue({
      allowed: false,
      plan: "free",
      limit: 5,
      currentUsage: 5,
      reason: "limit_reached",
    });
    const { GET } = await import("@/app/api/search/route");

    const res = await GET(req());
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error.code).toBe("LIMIT_EXCEEDED");
    // Refused before any lookup happens — the point is not doing the work.
    expect(mockSearchPharmaceuticals).not.toHaveBeenCalled();
  });

  it("meters an authenticated search against the user", async () => {
    const { GET } = await import("@/app/api/search/route");

    await GET(req());

    expect(mockTryConsumeUsage).toHaveBeenCalledWith("user-1", "searches", 1);
  });

  it("does not meter an anonymous visitor", async () => {
    // /api/search is public. There is no user to meter against; anonymous
    // callers stay bounded by the per-IP rate limit instead.
    mockGetCurrentUser.mockResolvedValue(null);
    const { GET } = await import("@/app/api/search/route");

    const res = await GET(req());

    expect(res.status).toBe(200);
    expect(mockTryConsumeUsage).not.toHaveBeenCalled();
  });

  it("gives the allowance back when a tier could not be reached", async () => {
    // An outage is not a search. Charging for one would let a bad afternoon
    // eat a free user's whole day.
    mockSearchPharmaceuticals.mockRejectedValue(new Error("db down"));
    const { GET } = await import("@/app/api/search/route");

    const res = await GET(req());

    expect(res.status).toBe(503);
    expect(mockRefundUsage).toHaveBeenCalledWith(
      "user-1",
      "searches",
      expect.any(Date),
      1,
    );
  });
});
