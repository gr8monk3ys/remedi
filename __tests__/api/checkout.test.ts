import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockWithRateLimit = vi.fn();
const mockIsStripeConfigured = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockCreateCheckoutSession = vi.fn();
const mockGetOrCreateStripeCustomer = vi.fn();
const mockGetPlanByPriceId = vi.fn();
const mockIsTrialEligible = vi.fn();
const mockTrackConversionEvent = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: { checkout: { limit: 10, window: 60, identifier: "checkout" } },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/stripe", () => ({
  createCheckoutSession: (...args: unknown[]) =>
    mockCreateCheckoutSession(...args),
  getOrCreateStripeCustomer: (...args: unknown[]) =>
    mockGetOrCreateStripeCustomer(...args),
  isStripeConfigured: () => mockIsStripeConfigured(),
  getPlanByPriceId: (...args: unknown[]) => mockGetPlanByPriceId(...args),
  PRICE_IDS: {
    basic: { monthly: "price_basic_monthly", yearly: "price_basic_yearly" },
    premium: {
      monthly: "price_premium_monthly",
      yearly: "price_premium_yearly",
    },
  },
}));

vi.mock("@/lib/trial", () => ({
  isTrialEligible: (...args: unknown[]) => mockIsTrialEligible(...args),
}));

vi.mock("@/lib/analytics/conversion-events", () => ({
  trackConversionEvent: (...args: unknown[]) =>
    mockTrackConversionEvent(...args),
  CONVERSION_EVENT_TYPES: { CHECKOUT_STARTED: "checkout_started" },
  EVENT_SOURCES: { PRICING_PAGE: "pricing_page" },
}));

const authenticatedUser = {
  id: "user_123",
  email: "test@example.com",
  name: "Test User",
};

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithRateLimit.mockResolvedValue({ allowed: true, response: null });
    mockIsStripeConfigured.mockReturnValue(true);
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockGetOrCreateStripeCustomer.mockResolvedValue("cus_stripe_123");
    mockCreateCheckoutSession.mockResolvedValue({
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });
    mockGetPlanByPriceId.mockReturnValue("basic");
    mockIsTrialEligible.mockResolvedValue(false);
    mockTrackConversionEvent.mockResolvedValue(undefined);
  });

  describe("authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "month" }),
      );
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("stripe configuration", () => {
    it("should return 503 when Stripe is not configured", async () => {
      mockIsStripeConfigured.mockReturnValue(false);
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "month" }),
      );
      const data = await response.json();
      expect(response.status).toBe(503);
      expect(data.error.code).toBe("STRIPE_NOT_CONFIGURED");
    });
  });

  describe("input validation", () => {
    it("should return 400 when neither priceId nor plan+interval provided", async () => {
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(makeRequest({}));
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when plan provided without interval", async () => {
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(makeRequest({ plan: "basic" }));
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for invalid plan name", async () => {
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "enterprise", interval: "month" }),
      );
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for invalid interval value", async () => {
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "weekly" }),
      );
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("successful checkout with plan+interval", () => {
    it("should create checkout session for basic monthly plan", async () => {
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "month" }),
      );
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.url).toBe("https://checkout.stripe.com/pay/cs_test_123");
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "cus_stripe_123",
          priceId: "price_basic_monthly",
          userId: authenticatedUser.id,
        }),
      );
    });

    it("should create checkout session for premium yearly plan", async () => {
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "premium", interval: "year" }),
      );
      expect(response.status).toBe(200);
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ priceId: "price_premium_yearly" }),
      );
    });
  });

  describe("trial period", () => {
    it("should include trial period when user is eligible", async () => {
      mockIsTrialEligible.mockResolvedValue(true);
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "month", withTrial: true }),
      );
      expect(response.status).toBe(200);
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ trialPeriodDays: 7 }),
      );
    });

    it("should not include trial when user is not eligible", async () => {
      mockIsTrialEligible.mockResolvedValue(false);
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "month", withTrial: true }),
      );
      expect(response.status).toBe(200);
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ trialPeriodDays: undefined }),
      );
    });
  });

  describe("rate limiting", () => {
    it("should return 429 when rate limited", async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({
          success: false,
          error: { code: "RATE_LIMITED" },
        }),
        { status: 429 },
      );
      mockWithRateLimit.mockResolvedValue({
        allowed: false,
        response: rateLimitResponse,
      });
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "month" }),
      );
      expect(response.status).toBe(429);
    });
  });

  describe("error handling", () => {
    it("should return 500 when Stripe customer creation fails", async () => {
      mockGetOrCreateStripeCustomer.mockRejectedValue(
        new Error("Stripe error"),
      );
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "month" }),
      );
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.error.code).toBe("CHECKOUT_ERROR");
    });

    it("should return 500 when checkout session creation fails", async () => {
      mockCreateCheckoutSession.mockRejectedValue(
        new Error("Stripe API error"),
      );
      const { POST } = await import("@/app/api/checkout/route");
      const response = await POST(
        makeRequest({ plan: "basic", interval: "month" }),
      );
      const data = await response.json();
      expect(response.status).toBe(500);
      expect(data.error.code).toBe("CHECKOUT_ERROR");
    });
  });

  describe("conversion tracking", () => {
    it("should track checkout_started event on success", async () => {
      const { POST } = await import("@/app/api/checkout/route");
      await POST(makeRequest({ plan: "premium", interval: "month" }));
      expect(mockTrackConversionEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: authenticatedUser.id,
          eventType: "checkout_started",
          planTarget: "premium",
        }),
      );
    });
  });
});
