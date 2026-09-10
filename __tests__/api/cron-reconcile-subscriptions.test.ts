/**
 * The reconciliation job.
 *
 * The webhook returns 200 even when a handler throws, so Stripe does not
 * retry. Nothing read WebhookEvent back, and nothing compared a subscription's
 * period end against the clock — so one dropped `subscription.deleted` left
 * someone on a paid plan permanently. This is what notices.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindMany = vi.fn();
const mockUpdate = vi.fn();
const mockEventCount = vi.fn();
const mockRetrieve = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findMany: (...a: unknown[]) => mockFindMany(...a),
      update: (...a: unknown[]) => mockUpdate(...a),
    },
    webhookEvent: { count: (...a: unknown[]) => mockEventCount(...a) },
  },
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    subscriptions: { retrieve: (...a: unknown[]) => mockRetrieve(...a) },
  }),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

const STALE = {
  id: "sub-row-1",
  userId: "user-1",
  plan: "premium",
  status: "active",
  stripeSubscriptionId: "sub_stripe_1",
  currentPeriodEnd: new Date("2020-01-01"),
};

const req = (qs = "", auth = "Bearer test-secret") =>
  new NextRequest(
    `http://localhost:3000/api/cron/reconcile-subscriptions${qs}`,
    { headers: auth ? { authorization: auth } : {} },
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CRON_SECRET", "test-secret");
  mockEventCount.mockResolvedValue(0);
  mockFindMany.mockResolvedValue([]);
});

describe("cron auth", () => {
  it("rejects a request with no secret", async () => {
    const { GET } =
      await import("@/app/api/cron/reconcile-subscriptions/route");
    const res = await GET(req("", ""));
    expect(res.status).toBe(401);
  });

  it("rejects a wrong secret", async () => {
    const { GET } =
      await import("@/app/api/cron/reconcile-subscriptions/route");
    const res = await GET(req("", "Bearer wrong"));
    expect(res.status).toBe(401);
  });

  it("fails closed when CRON_SECRET is unset, rather than opening up", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const { GET } =
      await import("@/app/api/cron/reconcile-subscriptions/route");
    const res = await GET(req());
    expect(res.status).toBe(503);
  });
});

describe("reconciliation", () => {
  it("expires a row Stripe says is cancelled", async () => {
    // The dropped-webhook case: our row still says active, Stripe does not.
    mockFindMany.mockResolvedValue([STALE]);
    mockRetrieve.mockResolvedValue({ status: "canceled" });

    const { GET } =
      await import("@/app/api/cron/reconcile-subscriptions/route");
    const json = await (await GET(req())).json();

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "cancelled" }),
      }),
    );
    expect(json.data.corrected).toBe(1);
  });

  it("leaves a row alone when Stripe agrees", async () => {
    mockFindMany.mockResolvedValue([STALE]);
    mockRetrieve.mockResolvedValue({
      status: "active",
      current_period_end: Math.floor(STALE.currentPeriodEnd.getTime() / 1000),
    });

    const { GET } =
      await import("@/app/api/cron/reconcile-subscriptions/route");
    const json = await (await GET(req())).json();

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(json.data.corrected).toBe(0);
  });

  it("writes nothing on a dry run", async () => {
    mockFindMany.mockResolvedValue([STALE]);
    mockRetrieve.mockResolvedValue({ status: "canceled" });

    const { GET } =
      await import("@/app/api/cron/reconcile-subscriptions/route");
    const json = await (await GET(req("?dryRun=1"))).json();

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(json.data.corrected).toBe(1);
    expect(json.data.dryRun).toBe(true);
  });

  it("does not guess when Stripe cannot be read", async () => {
    // A transient API failure must not be turned into an entitlement change.
    mockFindMany.mockResolvedValue([STALE]);
    mockRetrieve.mockRejectedValue(new Error("stripe down"));

    const { GET } =
      await import("@/app/api/cron/reconcile-subscriptions/route");
    const json = await (await GET(req())).json();

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(json.data.unreachable).toBe(1);
  });

  it("surfaces webhook handler failures nothing else reads", async () => {
    mockEventCount.mockResolvedValue(3);

    const { GET } =
      await import("@/app/api/cron/reconcile-subscriptions/route");
    const json = await (await GET(req())).json();

    expect(json.data.failedWebhookEvents).toBe(3);
  });
});
