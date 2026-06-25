/**
 * Tests for /api/plan route
 *
 * Tests the lightweight plan-resolution endpoint that gates paid features:
 * - GET: anonymous visitors are treated as "free"
 * - GET: authenticated users get their effective (trial/subscription-aware) plan
 * - GET: server errors surface as INTERNAL_ERROR
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PLAN_LIMITS } from "@/lib/stripe-config";

const mockGetCurrentUser = vi.fn();
const mockGetEffectivePlanLimits = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/trial", () => ({
  getEffectivePlanLimits: (...args: unknown[]) =>
    mockGetEffectivePlanLimits(...args),
}));

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

describe("/api/plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/plan", () => {
    it("should return the free plan for anonymous visitors", async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const { GET } = await import("@/app/api/plan/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.plan).toBe("free");
      expect(data.data.isTrial).toBe(false);
      expect(data.data.limits).toEqual(PLAN_LIMITS.FREE);
      // Anonymous visitors must not trigger a database lookup.
      expect(mockGetEffectivePlanLimits).not.toHaveBeenCalled();
    });

    it("should return the effective plan for an authenticated subscriber", async () => {
      mockGetCurrentUser.mockResolvedValue(authenticatedUser);
      mockGetEffectivePlanLimits.mockResolvedValue({
        limits: PLAN_LIMITS.BASIC,
        plan: "basic",
        isTrial: false,
      });

      const { GET } = await import("@/app/api/plan/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.plan).toBe("basic");
      expect(data.data.isTrial).toBe(false);
      expect(data.data.limits).toEqual(PLAN_LIMITS.BASIC);
      expect(mockGetEffectivePlanLimits).toHaveBeenCalledWith("user-123");
    });

    it("should report trial status for a user on an active trial", async () => {
      mockGetCurrentUser.mockResolvedValue(authenticatedUser);
      mockGetEffectivePlanLimits.mockResolvedValue({
        limits: PLAN_LIMITS.PREMIUM,
        plan: "premium",
        isTrial: true,
      });

      const { GET } = await import("@/app/api/plan/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.plan).toBe("premium");
      expect(data.data.isTrial).toBe(true);
      expect(data.data.limits).toEqual(PLAN_LIMITS.PREMIUM);
    });

    it("should return 500 with INTERNAL_ERROR when plan resolution fails", async () => {
      mockGetCurrentUser.mockResolvedValue(authenticatedUser);
      mockGetEffectivePlanLimits.mockRejectedValue(new Error("Database error"));

      const { GET } = await import("@/app/api/plan/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
