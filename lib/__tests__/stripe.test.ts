/**
 * Extended Unit Tests for Stripe Utilities
 *
 * Tests additional Stripe helper functions not covered in api/stripe.test.ts.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Stripe module
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
};

vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      customers = mockStripe.customers;
      subscriptions = mockStripe.subscriptions;
      checkout = mockStripe.checkout;
      billingPortal = mockStripe.billingPortal;
    },
  };
});

// Mock Prisma
vi.mock("../db", () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe("Stripe Utilities", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: "sk_test_mock",
      STRIPE_PUBLISHABLE_KEY: "pk_test_mock",
      STRIPE_BASIC_MONTHLY_PRICE_ID: "price_basic_monthly",
      STRIPE_BASIC_YEARLY_PRICE_ID: "price_basic_yearly",
      STRIPE_PREMIUM_MONTHLY_PRICE_ID: "price_premium_monthly",
      STRIPE_PREMIUM_YEARLY_PRICE_ID: "price_premium_yearly",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  describe("getStripe", () => {
    it("should throw error when STRIPE_SECRET_KEY is missing", async () => {
      delete process.env.STRIPE_SECRET_KEY;
      vi.resetModules();

      const { getStripe } = await import("../stripe");

      expect(() => getStripe()).toThrow("STRIPE_SECRET_KEY is not configured");
    });

    it("should return Stripe client when configured", async () => {
      const { getStripe } = await import("../stripe");

      const client = getStripe();
      expect(client).toBeDefined();
    });

    it("should reuse the same client instance", async () => {
      const { getStripe } = await import("../stripe");

      const client1 = getStripe();
      const client2 = getStripe();

      expect(client1).toBe(client2);
    });
  });

  describe("getOrCreateStripeCustomer", () => {
    it("should return existing customer ID from database", async () => {
      const { prisma } = await import("../db");
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        customerId: "cus_existing",
        userId: "user-123",
        plan: "basic",
        status: "active",
      } as never);

      const { getOrCreateStripeCustomer } = await import("../stripe");

      const customerId = await getOrCreateStripeCustomer(
        "user-123",
        "test@example.com",
      );

      expect(customerId).toBe("cus_existing");
      expect(mockStripe.customers.list).not.toHaveBeenCalled();
    });

    it("should find existing Stripe customer by email", async () => {
      const { prisma } = await import("../db");
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.subscription.upsert).mockResolvedValue({} as never);

      mockStripe.customers.list.mockResolvedValue({
        data: [{ id: "cus_found_by_email" }],
      });

      const { getOrCreateStripeCustomer } = await import("../stripe");

      const customerId = await getOrCreateStripeCustomer(
        "user-123",
        "test@example.com",
      );

      expect(customerId).toBe("cus_found_by_email");
      expect(mockStripe.customers.list).toHaveBeenCalledWith({
        email: "test@example.com",
        limit: 1,
      });
    });

    it("should create new customer when not found", async () => {
      const { prisma } = await import("../db");
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.subscription.upsert).mockResolvedValue({} as never);

      mockStripe.customers.list.mockResolvedValue({ data: [] });
      mockStripe.customers.create.mockResolvedValue({ id: "cus_new" });

      const { getOrCreateStripeCustomer } = await import("../stripe");

      const customerId = await getOrCreateStripeCustomer(
        "user-123",
        "test@example.com",
        "Test User",
      );

      expect(customerId).toBe("cus_new");
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        metadata: { userId: "user-123" },
      });
    });
  });

  describe("createCheckoutSession", () => {
    it("should create checkout session with correct parameters", async () => {
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/pay/cs_test_123",
      });

      const { createCheckoutSession } = await import("../stripe");

      const session = await createCheckoutSession({
        customerId: "cus_123",
        priceId: "price_basic_monthly",
        userId: "user-123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      expect(session.id).toBe("cs_test_123");
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: "cus_123",
          mode: "subscription",
          line_items: [{ price: "price_basic_monthly", quantity: 1 }],
        }),
      );
    });
  });

  describe("createBillingPortalSession", () => {
    it("should create billing portal session", async () => {
      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        id: "bps_test_123",
        url: "https://billing.stripe.com/session/bps_test_123",
      });

      const { createBillingPortalSession } = await import("../stripe");

      const session = await createBillingPortalSession(
        "cus_123",
        "https://example.com/account",
      );

      expect(session.url).toContain("billing.stripe.com");
      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: "cus_123",
        return_url: "https://example.com/account",
      });
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel subscription at period end", async () => {
      mockStripe.subscriptions.update.mockResolvedValue({
        id: "sub_123",
        cancel_at_period_end: true,
      });

      const { cancelSubscription } = await import("../stripe");

      const result = await cancelSubscription("sub_123");

      expect(result.cancel_at_period_end).toBe(true);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith("sub_123", {
        cancel_at_period_end: true,
      });
    });
  });

  describe("reactivateSubscription", () => {
    it("should reactivate cancelled subscription", async () => {
      mockStripe.subscriptions.update.mockResolvedValue({
        id: "sub_123",
        cancel_at_period_end: false,
      });

      const { reactivateSubscription } = await import("../stripe");

      const result = await reactivateSubscription("sub_123");

      expect(result.cancel_at_period_end).toBe(false);
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith("sub_123", {
        cancel_at_period_end: false,
      });
    });
  });

  describe("isStripeConfigured", () => {
    it("should return true when both keys are set", async () => {
      const { isStripeConfigured } = await import("../stripe");

      expect(isStripeConfigured()).toBe(true);
    });

    it("should return false when secret key is missing", async () => {
      delete process.env.STRIPE_SECRET_KEY;
      vi.resetModules();

      const { isStripeConfigured } = await import("../stripe");

      expect(isStripeConfigured()).toBe(false);
    });

    it("should return false when publishable key is missing", async () => {
      delete process.env.STRIPE_PUBLISHABLE_KEY;
      vi.resetModules();

      const { isStripeConfigured } = await import("../stripe");

      expect(isStripeConfigured()).toBe(false);
    });
  });
});
