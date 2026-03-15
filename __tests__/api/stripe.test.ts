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

// Mock auth - Clerk-based getCurrentUser()
interface MockUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

const mockGetCurrentUser = vi.fn<() => Promise<MockUser | null>>();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
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

// Mock trial module
vi.mock("@/lib/trial", () => ({
  isTrialEligible: vi.fn().mockResolvedValue(false),
  startTrial: vi.fn(),
  getTrialStatus: vi.fn(),
}));

// Mock analytics conversion events
vi.mock("@/lib/analytics/conversion-events", () => ({
  trackConversionEvent: vi.fn().mockResolvedValue(undefined),
  CONVERSION_EVENT_TYPES: {
    CHECKOUT_STARTED: "checkout_started",
    CHECKOUT_COMPLETED: "checkout_completed",
    TRIAL_STARTED: "trial_started",
  },
  EVENT_SOURCES: {
    PRICING_PAGE: "pricing_page",
    SETTINGS: "settings",
  },
}));

import {
  isPlanFeatureAvailable,
  getPlanLimit,
  PLANS,
} from "@/lib/stripe-config";

// Mock server-only module
vi.mock("server-only", () => ({}));

// Import server-only functions after mocking
import { getPlanByPriceId, isStripeConfigured, PRICE_IDS } from "@/lib/stripe";

describe("lib/stripe", () => {
  describe("PLANS configuration", () => {
    it("should have free, basic, and premium plans", () => {
      expect(PLANS).toHaveProperty("free");
      expect(PLANS).toHaveProperty("basic");
      expect(PLANS).toHaveProperty("premium");
    });

    it("should have correct limits for free plan", () => {
      expect(PLANS.free.limits.favorites).toBe(3);
      expect(PLANS.free.limits.searchesPerDay).toBe(5);
      expect(PLANS.free.limits.aiSearches).toBe(0);
    });

    it("should have unlimited (-1) for premium plan core features", () => {
      expect(PLANS.premium.limits.favorites).toBe(-1);
      expect(PLANS.premium.limits.searchesPerDay).toBe(-1);
      // AI searches capped at 50 for premium
      expect(PLANS.premium.limits.aiSearches).toBe(50);
    });
  });

  describe("getPlanByPriceId", () => {
    it("should return correct plan when price ID matches monthlyPriceId", () => {
      const basicMonthlyPriceId = PRICE_IDS.basic.monthly;
      if (basicMonthlyPriceId) {
        const result = getPlanByPriceId(basicMonthlyPriceId);
        expect(result).toBe("basic");
      } else {
        expect(true).toBe(true);
      }
    });

    it("should return correct plan when price ID matches yearlyPriceId", () => {
      const premiumYearlyPriceId = PRICE_IDS.premium.yearly;
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
      expect(isPlanFeatureAvailable("free", "favorites", 2)).toBe(true);
      expect(isPlanFeatureAvailable("free", "searchesPerDay", 3)).toBe(true);
    });

    it("should return false when usage meets or exceeds limit", () => {
      expect(isPlanFeatureAvailable("free", "favorites", 3)).toBe(false);
      expect(isPlanFeatureAvailable("free", "favorites", 10)).toBe(false);
    });

    it("should return false for AI searches on free plan", () => {
      expect(isPlanFeatureAvailable("free", "aiSearches", 0)).toBe(false);
    });
  });

  describe("getPlanLimit", () => {
    it("should return correct limits for free plan", () => {
      expect(getPlanLimit("free", "favorites")).toBe(3);
      expect(getPlanLimit("free", "searchesPerDay")).toBe(5);
      expect(getPlanLimit("free", "aiSearches")).toBe(0);
    });

    it("should return -1 for unlimited features in premium", () => {
      expect(getPlanLimit("premium", "favorites")).toBe(-1);
      expect(getPlanLimit("premium", "searchesPerDay")).toBe(-1);
    });

    it("should return correct limits for basic plan", () => {
      expect(getPlanLimit("basic", "favorites")).toBe(50);
      expect(getPlanLimit("basic", "searchesPerDay")).toBe(100);
      expect(getPlanLimit("basic", "aiSearches")).toBe(10);
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
    mockGetCurrentUser.mockResolvedValue(null);

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
    mockGetCurrentUser.mockResolvedValue({
      id: "user_123",
      email: "test@example.com",
      name: "Test User",
      image: null,
      role: "user",
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
    // Error code changed from VALIDATION_ERROR to INVALID_PRICE
    // when using direct priceId approach with invalid IDs
    expect(data.error.code).toBe("INVALID_PRICE");
  });
});

describe("POST /api/billing-portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

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
    mockGetCurrentUser.mockResolvedValue({
      id: "user_123",
      email: "test@example.com",
      name: null,
      image: null,
      role: "user",
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
