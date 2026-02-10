import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockWithRateLimit = vi.fn();
const mockIsStripeConfigured = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockCreateBillingPortalSession = vi.fn();
const mockPrismaSubscriptionFindUnique = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    billingPortal: { limit: 5, window: 60, identifier: "billing-portal" },
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/stripe", () => ({
  createBillingPortalSession: (...args: unknown[]) =>
    mockCreateBillingPortalSession(...args),
  isStripeConfigured: () => mockIsStripeConfigured(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findUnique: (...args: unknown[]) =>
        mockPrismaSubscriptionFindUnique(...args),
    },
  },
}));

const authenticatedUser = {
  id: "user_123",
  email: "test@example.com",
  name: "Test User",
};

function makeRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/billing-portal", {
    method: "POST",
  });
}

describe("POST /api/billing-portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithRateLimit.mockResolvedValue({ allowed: true, response: null });
    mockIsStripeConfigured.mockReturnValue(true);
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      customerId: "cus_stripe_123",
    });
    mockCreateBillingPortalSession.mockResolvedValue({
      url: "https://billing.stripe.com/session/bps_test_123",
    });
  });

  it("should return 401 when user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { POST } = await import("@/app/api/billing-portal/route");
    const response = await POST(makeRequest());
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 503 when Stripe is not configured", async () => {
    mockIsStripeConfigured.mockReturnValue(false);
    const { POST } = await import("@/app/api/billing-portal/route");
    const response = await POST(makeRequest());
    const data = await response.json();
    expect(response.status).toBe(503);
    expect(data.error.code).toBe("STRIPE_NOT_CONFIGURED");
  });

  it("should return 404 when user has no subscription", async () => {
    mockPrismaSubscriptionFindUnique.mockResolvedValue(null);
    const { POST } = await import("@/app/api/billing-portal/route");
    const response = await POST(makeRequest());
    const data = await response.json();
    expect(response.status).toBe(404);
    expect(data.error.code).toBe("NO_CUSTOMER");
  });

  it("should return 404 when subscription has no customerId", async () => {
    mockPrismaSubscriptionFindUnique.mockResolvedValue({ customerId: null });
    const { POST } = await import("@/app/api/billing-portal/route");
    const response = await POST(makeRequest());
    const data = await response.json();
    expect(response.status).toBe(404);
    expect(data.error.code).toBe("NO_CUSTOMER");
  });

  it("should create billing portal session successfully", async () => {
    const { POST } = await import("@/app/api/billing-portal/route");
    const response = await POST(makeRequest());
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.url).toBe(
      "https://billing.stripe.com/session/bps_test_123",
    );
    expect(mockCreateBillingPortalSession).toHaveBeenCalledWith(
      "cus_stripe_123",
      expect.stringContaining("/billing"),
    );
  });

  it("should return 500 when Stripe API fails", async () => {
    mockCreateBillingPortalSession.mockRejectedValue(
      new Error("Stripe API error"),
    );
    const { POST } = await import("@/app/api/billing-portal/route");
    const response = await POST(makeRequest());
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.error.code).toBe("PORTAL_ERROR");
  });

  it("should return 429 when rate limited", async () => {
    const rateLimitResponse = new Response(
      JSON.stringify({ success: false, error: { code: "RATE_LIMITED" } }),
      { status: 429 },
    );
    mockWithRateLimit.mockResolvedValue({
      allowed: false,
      response: rateLimitResponse,
    });
    const { POST } = await import("@/app/api/billing-portal/route");
    const response = await POST(makeRequest());
    expect(response.status).toBe(429);
  });
});
