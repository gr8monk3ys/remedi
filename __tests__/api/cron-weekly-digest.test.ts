/**
 * Tests for /api/cron/weekly-digest route
 *
 * Tests the weekly digest cron job:
 * - CRON_SECRET auth guard (missing in production, wrong header)
 * - No opted-in users short-circuits without building digests
 * - Users are batched, digests built, and emails sent
 * - Users with no digest data (buildDigestData returns null) are skipped
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock Prisma
const mockUserFindMany = vi.fn();

vi.mock("@/lib/db/client", () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
    },
  },
}));

// Mock email service
const mockSendWeeklyDigest = vi.fn();
const mockSendBatchEmails = vi.fn();

vi.mock("@/lib/email", () => ({
  sendWeeklyDigest: (...args: unknown[]) => mockSendWeeklyDigest(...args),
  sendBatchEmails: (...args: unknown[]) => mockSendBatchEmails(...args),
}));

// Mock digest builder
const mockFetchSharedDigestData = vi.fn();
const mockBuildDigestData = vi.fn();

vi.mock("@/lib/email/digest-builder", () => ({
  fetchSharedDigestData: (...args: unknown[]) =>
    mockFetchSharedDigestData(...args),
  buildDigestData: (...args: unknown[]) => mockBuildDigestData(...args),
}));

const sharedData = {
  newRemedies: [],
  topSearches: [],
  weekAgo: new Date("2026-07-03"),
  periodStart: "Jul 3",
  periodEnd: "Jul 10, 2026",
};

function makeRequest(authHeader?: string) {
  return new Request("http://localhost:3000/api/cron/weekly-digest", {
    method: "GET",
    headers: authHeader ? { authorization: authHeader } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchSharedDigestData.mockResolvedValue(sharedData);
  mockSendBatchEmails.mockResolvedValue({ sent: 0, failed: 0, errors: [] });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("/api/cron/weekly-digest", () => {
  describe("GET /api/cron/weekly-digest", () => {
    it("returns 503 in production when CRON_SECRET is not configured", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CRON_SECRET", "");

      const { GET } = await import("@/app/api/cron/weekly-digest/route");
      const response = await GET(makeRequest());
      const json = await response.json();

      expect(response.status).toBe(503);
      expect(json.error).toBe("CRON_SECRET is not configured");
      expect(mockUserFindMany).not.toHaveBeenCalled();
    });

    it("refuses to run without CRON_SECRET outside production too", async () => {
      // This endpoint triggers a mass-email job, so an unset secret must fail
      // closed in every environment rather than disabling the check.
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("CRON_SECRET", "");
      mockUserFindMany.mockResolvedValue([]);

      const { GET } = await import("@/app/api/cron/weekly-digest/route");
      const response = await GET(makeRequest());
      const json = await response.json();

      expect(response.status).toBe(503);
      expect(json.error).toBe("CRON_SECRET is not configured");
      expect(mockUserFindMany).not.toHaveBeenCalled();
    });

    it("rejects an unauthenticated request outside production", async () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("CRON_SECRET", "secret-123");
      mockUserFindMany.mockResolvedValue([]);

      const { GET } = await import("@/app/api/cron/weekly-digest/route");
      const response = await GET(makeRequest());

      expect(response.status).toBe(401);
      expect(mockUserFindMany).not.toHaveBeenCalled();
    });

    it("returns 401 when the bearer token does not match CRON_SECRET", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CRON_SECRET", "secret-123");

      const { GET } = await import("@/app/api/cron/weekly-digest/route");
      const response = await GET(makeRequest("Bearer wrong-secret"));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
      expect(mockUserFindMany).not.toHaveBeenCalled();
    });

    it("returns sent:0 without building digests when no users opted in", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CRON_SECRET", "secret-123");
      mockUserFindMany.mockResolvedValue([]);

      const { GET } = await import("@/app/api/cron/weekly-digest/route");
      const response = await GET(makeRequest("Bearer secret-123"));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ sent: 0, failed: 0 });
      expect(mockFetchSharedDigestData).not.toHaveBeenCalled();
      expect(mockSendBatchEmails).not.toHaveBeenCalled();
    });

    it("builds digests for opted-in users and sends them in a batch", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CRON_SECRET", "secret-123");

      const users = [
        {
          id: "user-1",
          email: "one@example.com",
          subscription: { plan: "premium", status: "active" },
        },
        {
          id: "user-2",
          email: "two@example.com",
          subscription: null,
        },
      ];
      mockUserFindMany.mockResolvedValue(users);
      mockBuildDigestData.mockImplementation(async (userId: string) => ({
        name: userId,
        newRemedies: [],
        topSearches: [],
        savedRemedies: 0,
        searchCount: 0,
        periodStart: sharedData.periodStart,
        periodEnd: sharedData.periodEnd,
      }));
      mockSendBatchEmails.mockResolvedValue({ sent: 2, failed: 0, errors: [] });

      const { GET } = await import("@/app/api/cron/weekly-digest/route");
      const response = await GET(makeRequest("Bearer secret-123"));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ sent: 2, failed: 0, total: 2 });

      expect(mockFetchSharedDigestData).toHaveBeenCalledTimes(1);
      expect(mockBuildDigestData).toHaveBeenCalledWith(
        "user-1",
        "premium",
        sharedData,
      );
      // Users without an active subscription fall back to the free plan.
      expect(mockBuildDigestData).toHaveBeenCalledWith(
        "user-2",
        "free",
        sharedData,
      );

      const sentFns = mockSendBatchEmails.mock.calls[0][0] as Array<
        () => unknown
      >;
      expect(sentFns).toHaveLength(2);
      await sentFns[0]();
      expect(mockSendWeeklyDigest).toHaveBeenCalledWith(
        "one@example.com",
        expect.objectContaining({ name: "user-1" }),
        "user-1",
      );
    });

    it("skips users for whom buildDigestData returns null", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CRON_SECRET", "secret-123");

      mockUserFindMany.mockResolvedValue([
        { id: "user-1", email: "one@example.com", subscription: null },
      ]);
      mockBuildDigestData.mockResolvedValue(null);
      mockSendBatchEmails.mockResolvedValue({ sent: 0, failed: 0, errors: [] });

      const { GET } = await import("@/app/api/cron/weekly-digest/route");
      const response = await GET(makeRequest("Bearer secret-123"));

      expect(response.status).toBe(200);
      expect(mockSendBatchEmails).toHaveBeenCalledWith([], 100);
    });

    it("returns 500 when the cron job throws unexpectedly", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CRON_SECRET", "secret-123");
      mockUserFindMany.mockRejectedValue(new Error("db unavailable"));

      const { GET } = await import("@/app/api/cron/weekly-digest/route");
      const response = await GET(makeRequest("Bearer secret-123"));
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe("Internal server error");
    });
  });
});
