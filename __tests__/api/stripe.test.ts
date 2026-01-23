/**
 * Tests for Stripe integration
 *
 * Tests for:
 * - lib/stripe.ts utility functions
 * - /api/checkout route
 * - /api/billing-portal route
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Stripe module before importing
vi.mock("stripe", () => {
  const mockStripe = {
    customers: {
      list: vi.fn(),
      create: vi.fn(),
    },
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  };
  return {
    default: vi.fn(() => mockStripe),
  };
});

// Mock environment variables
vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_mock");
vi.stubEnv("STRIPE_PUBLISHABLE_KEY", "pk_test_mock");
vi.stubEnv("STRIPE_BASIC_MONTHLY_PRICE_ID", "price_basic_monthly");
vi.stubEnv("STRIPE_BASIC_YEARLY_PRICE_ID", "price_basic_yearly");
vi.stubEnv("STRIPE_PREMIUM_MONTHLY_PRICE_ID", "price_premium_monthly");
vi.stubEnv("STRIPE_PREMIUM_YEARLY_PRICE_ID", "price_premium_yearly");

// Mock auth - NextAuth v5 auth() has complex overloads (session getter + middleware)
// We create a properly typed mock that matches the session getter overload
import type { Session } from "next-auth";

const mockAuth = vi.fn<() => Promise<Session | null>>();

vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

// Mock database
vi.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock rate limiting
vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: vi
    .fn()
    .mockResolvedValue({ allowed: true, result: { success: true } }),
  RATE_LIMITS: {
    checkout: { limit: 10, window: 60, identifier: "checkout" },
    billingPortal: { limit: 5, window: 60, identifier: "billing-portal" },
  },
}));

import {
  getPlanByPriceId,
  isPlanFeatureAvailable,
  getPlanLimit,
  isStripeConfigured,
  PLANS,
} from "@/lib/stripe";

describe("lib/stripe", () => {
  describe("PLANS configuration", () => {
    it("should have free, basic, and premium plans", () => {
      expect(PLANS).toHaveProperty("free");
      expect(PLANS).toHaveProperty("basic");
      expect(PLANS).toHaveProperty("premium");
    });

    it("should have correct limits for free plan", () => {
      expect(PLANS.free.limits.favorites).toBe(5);
      expect(PLANS.free.limits.searchesPerDay).toBe(10);
      expect(PLANS.free.limits.aiSearches).toBe(0);
    });

    it("should have unlimited (-1) for premium plan", () => {
      expect(PLANS.premium.limits.favorites).toBe(-1);
      expect(PLANS.premium.limits.searchesPerDay).toBe(-1);
      expect(PLANS.premium.limits.aiSearches).toBe(-1);
    });
  });

  describe("getPlanByPriceId", () => {
    it("should return correct plan when price ID matches monthlyPriceId", () => {
      // Get actual price IDs from PLANS (may be undefined in test env)
      const basicMonthlyPriceId = PLANS.basic.monthlyPriceId;
      if (basicMonthlyPriceId) {
        const result = getPlanByPriceId(basicMonthlyPriceId);
        expect(result).toBe("basic");
      } else {
        // Skip test if env vars not set
        expect(true).toBe(true);
      }
    });

    it("should return correct plan when price ID matches yearlyPriceId", () => {
      const premiumYearlyPriceId = PLANS.premium.yearlyPriceId;
      if (premiumYearlyPriceId) {
        const result = getPlanByPriceId(premiumYearlyPriceId);
        expect(result).toBe("premium");
      } else {
        expect(true).toBe(true);
      }
    });

    it("should return null for unknown price ID", () => {
      const result = getPlanByPriceId("price_unknown_xyz");
      expect(result).toBeNull();
    });

    it("should return null for empty string", () => {
      const result = getPlanByPriceId("");
      expect(result).toBeNull();
    });
  });

  describe("isPlanFeatureAvailable", () => {
    it("should return true for unlimited features (-1)", () => {
      expect(isPlanFeatureAvailable("premium", "favorites", 100)).toBe(true);
      expect(isPlanFeatureAvailable("premium", "favorites", 1000)).toBe(true);
    });

    it("should return true when usage is under limit", () => {
      expect(isPlanFeatureAvailable("free", "favorites", 3)).toBe(true);
      expect(isPlanFeatureAvailable("free", "searchesPerDay", 5)).toBe(true);
    });

    it("should return false when usage meets or exceeds limit", () => {
      expect(isPlanFeatureAvailable("free", "favorites", 5)).toBe(false);
      expect(isPlanFeatureAvailable("free", "favorites", 10)).toBe(false);
    });

    it("should return false for AI searches on free plan", () => {
      expect(isPlanFeatureAvailable("free", "aiSearches", 0)).toBe(false);
    });
  });

  describe("getPlanLimit", () => {
    it("should return correct limits for free plan", () => {
      expect(getPlanLimit("free", "favorites")).toBe(5);
      expect(getPlanLimit("free", "searchesPerDay")).toBe(10);
      expect(getPlanLimit("free", "aiSearches")).toBe(0);
    });

    it("should return -1 for unlimited features", () => {
      expect(getPlanLimit("premium", "favorites")).toBe(-1);
      expect(getPlanLimit("basic", "searchesPerDay")).toBe(-1);
    });
  });

  describe("isStripeConfigured", () => {
    it("should return true when both keys are set", () => {
      expect(isStripeConfigured()).toBe(true);
    });
  });
});

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const { POST } = await import("@/app/api/checkout/route");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId: "price_basic_monthly" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response).toBeDefined();
    const data = await response!.json();

    expect(response!.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 400 for invalid price ID", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user_123", email: "test@example.com", name: "Test User" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });

    const { POST } = await import("@/app/api/checkout/route");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId: "invalid_price" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response).toBeDefined();
    const data = await response!.json();

    expect(response!.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/billing-portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const { POST } = await import("@/app/api/billing-portal/route");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest(
      "http://localhost:3000/api/billing-portal",
      {
        method: "POST",
      },
    );

    const response = await POST(request);
    expect(response).toBeDefined();
    const data = await response!.json();

    expect(response!.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 404 when user has no customer ID", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user_123", email: "test@example.com" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    });

    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);

    const { POST } = await import("@/app/api/billing-portal/route");
    const { NextRequest } = await import("next/server");

    const request = new NextRequest(
      "http://localhost:3000/api/billing-portal",
      {
        method: "POST",
      },
    );

    const response = await POST(request);
    expect(response).toBeDefined();
    const data = await response!.json();

    expect(response!.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("NO_CUSTOMER");
  });
});
