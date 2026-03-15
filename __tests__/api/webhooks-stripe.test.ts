/**
 * Tests for /api/webhooks/stripe route
 *
 * Tests Stripe webhook event handling:
 * - Signature verification
 * - Checkout session completed
 * - Subscription created/updated/deleted
 * - Invoice payment succeeded/failed
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  mockStripeSession,
  mockStripeSubscription,
  mockStripeInvoice,
  mockSubscription,
} from "../mocks";

// Mock headers
const mockHeaders = vi.fn();
vi.mock("next/headers", () => ({
  headers: () => mockHeaders(),
}));

// Mock Stripe
const mockConstructEvent = vi.fn();
const mockRetrieve = vi.fn();

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
    subscriptions: {
      retrieve: mockRetrieve,
    },
  },
  getPlanByPriceId: vi.fn((priceId: string) => {
    if (priceId.includes("basic")) return "basic";
    if (priceId.includes("premium")) return "premium";
    return null;
  }),
  PLANS: {
    free: { name: "Free", price: 0 },
    basic: { name: "Basic", price: 9.99, yearlyPrice: 99 },
    premium: { name: "Premium", price: 19.99, yearlyPrice: 199 },
  },
  extractBillingPeriod: vi.fn().mockReturnValue({
    currentPeriodStart: new Date("2024-01-01"),
    currentPeriodEnd: new Date("2024-02-01"),
  }),
}));

// Mock Prisma
const mockFindUnique = vi.fn();
const mockUpsert = vi.fn();
const mockUpdate = vi.fn();
const mockWebhookStatusUpsert = vi.fn().mockResolvedValue({});
const mockUserFindUnique = vi.fn().mockResolvedValue(null);
const mockWebhookEventUpsert = vi
  .fn()
  .mockResolvedValue({ id: "dlq_123", attempts: 1 });
const mockWebhookEventUpdate = vi.fn().mockResolvedValue({});

vi.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    webhookStatus: {
      upsert: (...args: unknown[]) => mockWebhookStatusUpsert(...args),
    },
    webhookEvent: {
      upsert: (...args: unknown[]) => mockWebhookEventUpsert(...args),
      update: (...args: unknown[]) => mockWebhookEventUpdate(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock email service
vi.mock("@/lib/email", () => ({
  sendSubscriptionConfirmation: vi.fn().mockResolvedValue({ success: true }),
  sendSubscriptionCancelled: vi.fn().mockResolvedValue({ success: true }),
}));

// Import module with mock env vars
beforeEach(() => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_secret");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_key");

  // Default: return valid signature header
  mockHeaders.mockResolvedValue({
    get: (name: string) =>
      name === "stripe-signature" ? "test_signature" : null,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("/api/webhooks/stripe", () => {
  describe("POST /api/webhooks/stripe", () => {
    it("should return 400 when signature is missing", async () => {
      // Override headers to return null signature
      mockHeaders.mockResolvedValueOnce({
        get: () => null,
      });

      const { POST } = await import("@/app/api/webhooks/stripe/route");

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain("signature");
    });

    it("should return 400 when signature verification fails", async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const { POST } = await import("@/app/api/webhooks/stripe/route");

      const request = new NextRequest(
        "http://localhost:3000/api/webhooks/stripe",
        {
          method: "POST",
          body: "test body",
        },
      );

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain("Invalid signature");
    });

    describe("checkout.session.completed", () => {
      it("should create subscription when checkout completes", async () => {
        mockConstructEvent.mockReturnValue({
          type: "checkout.session.completed",
          data: { object: mockStripeSession },
        });

        mockFindUnique.mockResolvedValue(null);
        mockRetrieve.mockResolvedValue(mockStripeSubscription);
        mockUpsert.mockResolvedValue(mockSubscription);

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.received).toBe(true);
        expect(mockUpsert).toHaveBeenCalled();
      });

      it("should skip if subscription already processed", async () => {
        mockConstructEvent.mockReturnValue({
          type: "checkout.session.completed",
          data: { object: mockStripeSession },
        });

        mockFindUnique.mockResolvedValue({
          ...mockSubscription,
          status: "active",
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockRetrieve).not.toHaveBeenCalled();
      });

      it("should handle missing userId in session metadata", async () => {
        mockConstructEvent.mockReturnValue({
          type: "checkout.session.completed",
          data: {
            object: {
              ...mockStripeSession,
              metadata: {},
            },
          },
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUpsert).not.toHaveBeenCalled();
      });
    });

    describe("customer.subscription.updated", () => {
      it("should update subscription status", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.subscription.updated",
          data: {
            object: {
              ...mockStripeSubscription,
              status: "active",
            },
          },
        });

        mockFindUnique.mockResolvedValue(mockSubscription);
        mockUpdate.mockResolvedValue(mockSubscription);

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalled();
      });

      it("should handle cancelled subscription status", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.subscription.updated",
          data: {
            object: {
              ...mockStripeSubscription,
              status: "canceled",
              canceled_at: Math.floor(Date.now() / 1000),
            },
          },
        });

        mockFindUnique.mockResolvedValue(mockSubscription);
        mockUpdate.mockResolvedValue({
          ...mockSubscription,
          status: "cancelled",
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
      });

      it("should handle past_due subscription status", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.subscription.updated",
          data: {
            object: {
              ...mockStripeSubscription,
              status: "past_due",
            },
          },
        });

        mockFindUnique.mockResolvedValue(mockSubscription);
        mockUpdate.mockResolvedValue({
          ...mockSubscription,
          status: "expired",
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
      });

      it("should handle subscription not found in database", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.subscription.updated",
          data: { object: mockStripeSubscription },
        });

        mockFindUnique.mockResolvedValue(null);

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUpdate).not.toHaveBeenCalled();
      });
    });

    describe("customer.subscription.deleted", () => {
      it("should downgrade to free plan when subscription deleted", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.subscription.deleted",
          data: { object: mockStripeSubscription },
        });

        mockFindUnique.mockResolvedValue(mockSubscription);
        mockUpdate.mockResolvedValue({
          ...mockSubscription,
          plan: "free",
          status: "cancelled",
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              plan: "free",
              status: "cancelled",
            }),
          }),
        );
      });

      it("should handle subscription not found", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.subscription.deleted",
          data: { object: mockStripeSubscription },
        });

        mockFindUnique.mockResolvedValue(null);

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUpdate).not.toHaveBeenCalled();
      });
    });

    describe("invoice.payment_succeeded", () => {
      it("should update subscription status to active on successful payment", async () => {
        mockConstructEvent.mockReturnValue({
          type: "invoice.payment_succeeded",
          data: { object: mockStripeInvoice },
        });

        mockFindUnique.mockResolvedValue(mockSubscription);
        mockUpdate.mockResolvedValue({ ...mockSubscription, status: "active" });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { status: "active" },
          }),
        );
      });

      it("should handle invoice without subscription", async () => {
        mockConstructEvent.mockReturnValue({
          type: "invoice.payment_succeeded",
          data: {
            object: {
              ...mockStripeInvoice,
              parent: null,
            },
          },
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUpdate).not.toHaveBeenCalled();
      });
    });

    describe("invoice.payment_failed", () => {
      it("should update subscription status to expired on failed payment", async () => {
        mockConstructEvent.mockReturnValue({
          type: "invoice.payment_failed",
          data: { object: mockStripeInvoice },
        });

        mockFindUnique.mockResolvedValue(mockSubscription);
        mockUpdate.mockResolvedValue({
          ...mockSubscription,
          status: "expired",
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { status: "expired" },
          }),
        );
      });
    });

    describe("DLQ (WebhookEvent) behavior", () => {
      it("should mark event as processed on success", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.created", // unhandled but valid
          data: { object: {} },
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          { method: "POST", body: JSON.stringify({}) },
        );

        await POST(request);

        expect(mockWebhookEventUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            create: expect.objectContaining({ status: "pending", attempts: 1 }),
          }),
        );
        expect(mockWebhookEventUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              status: "processed",
              processedAt: expect.any(Date),
            }),
          }),
        );
      });

      it("should mark event as failed and still return 200 when handler throws", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.subscription.updated",
          data: {
            object: { id: "sub_test", metadata: {}, items: { data: [] } },
          },
        });
        // Force handler to throw
        mockFindUnique.mockRejectedValue(new Error("DB unavailable"));

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          { method: "POST", body: JSON.stringify({}) },
        );

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.received).toBe(true);
        expect(mockWebhookEventUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              status: "failed",
              lastError: "DB unavailable",
            }),
          }),
        );
      });

      it("should increment attempts on duplicate event replay", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.created",
          data: { object: {} },
        });
        // Simulate Stripe replaying the same event — upsert's update path runs
        mockWebhookEventUpsert.mockResolvedValueOnce({
          id: "dlq_123",
          attempts: 2,
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          { method: "POST", body: JSON.stringify({}) },
        );

        await POST(request);

        expect(mockWebhookEventUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            update: expect.objectContaining({
              attempts: { increment: 1 },
            }),
          }),
        );
      });

      it("should proceed with handler even if DLQ write fails", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.created",
          data: { object: {} },
        });
        // DLQ table unavailable
        mockWebhookEventUpsert.mockRejectedValueOnce(
          new Error("DLQ unavailable"),
        );

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          { method: "POST", body: JSON.stringify({}) },
        );

        const response = await POST(request);

        // Fail-open: handler still runs and returns 200
        expect(response.status).toBe(200);
      });
    });

    describe("Unhandled events", () => {
      it("should acknowledge unhandled event types", async () => {
        mockConstructEvent.mockReturnValue({
          type: "customer.created",
          data: { object: {} },
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.received).toBe(true);
      });
    });

    describe("Error handling", () => {
      it("should return 400 on signature verification errors", async () => {
        // When constructEvent throws, it means signature verification failed
        mockConstructEvent.mockImplementation(() => {
          throw new Error("Signature verification failed");
        });

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);
        const json = await response.json();

        // Signature verification errors return 400
        expect(response.status).toBe(400);
        expect(json.error).toContain("Invalid signature");
      });

      it("should return 200 and store failed event in DLQ when handler throws", async () => {
        mockConstructEvent.mockReturnValue({
          type: "checkout.session.completed",
          data: { object: mockStripeSession },
        });

        mockFindUnique.mockResolvedValue(null);
        mockRetrieve.mockResolvedValue(mockStripeSubscription);
        // Simulate a DB error mid-handler
        mockUpsert.mockRejectedValue(new Error("Database error"));

        const { POST } = await import("@/app/api/webhooks/stripe/route");

        const request = new NextRequest(
          "http://localhost:3000/api/webhooks/stripe",
          {
            method: "POST",
            body: JSON.stringify({}),
          },
        );

        const response = await POST(request);

        // Handler errors are caught by the DLQ — webhook returns 200 so
        // Stripe stops retrying. The event is stored with status="failed"
        // for manual replay via WHERE status='failed' query.
        expect(response.status).toBe(200);
        expect(mockWebhookEventUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ status: "failed" }),
          }),
        );
      });
    });
  });
});
