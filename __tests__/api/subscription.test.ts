import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockPrismaSubscriptionFindUnique = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    subscription: {
      findUnique: (...args: unknown[]) =>
        mockPrismaSubscriptionFindUnique(...args),
    },
  },
}));

vi.mock("@/lib/stripe", () => ({
  PLANS: {
    free: { name: "Free", limits: { searches: 10 } },
    basic: { name: "Basic", limits: { searches: 100 } },
    premium: { name: "Premium", limits: { searches: 1000 } },
    enterprise: { name: "Enterprise", limits: { searches: -1 } },
  },
  parsePlanType: (value: string | null | undefined) => {
    const valid = ["free", "basic", "premium", "enterprise"];
    const plan = (value || "free").toLowerCase();
    return valid.includes(plan) ? plan : "free";
  },
}));

const authenticatedUser = {
  id: "user_123",
  email: "test@example.com",
  name: "Test User",
};

describe("GET /api/subscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockPrismaSubscriptionFindUnique.mockResolvedValue(null);
  });

  it("should return 401 when user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { GET } = await import("@/app/api/subscription/route");
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return free plan when no subscription exists", async () => {
    const { GET } = await import("@/app/api/subscription/route");
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.plan).toBe("free");
    expect(data.data.isActive).toBe(true);
    expect(data.data.canUpgrade).toBe(true);
  });

  it("should return subscription data for subscribed user", async () => {
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      id: "sub_123",
      plan: "basic",
      status: "active",
      interval: "month",
      currentPeriodEnd: new Date("2026-03-01"),
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: "sub_stripe_123",
    });
    const { GET } = await import("@/app/api/subscription/route");
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.data.plan).toBe("basic");
    expect(data.data.isActive).toBe(true);
    expect(data.data.canUpgrade).toBe(true);
    expect(data.data.canManage).toBe(true);
  });

  it("should return canUpgrade=false for premium users", async () => {
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      id: "sub_456",
      plan: "premium",
      status: "active",
      interval: "year",
      currentPeriodEnd: new Date("2027-01-01"),
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: "sub_stripe_456",
    });
    const { GET } = await import("@/app/api/subscription/route");
    const response = await GET();
    const data = await response.json();
    expect(data.data.plan).toBe("premium");
    expect(data.data.canUpgrade).toBe(false);
  });

  it("should handle unknown plan type by defaulting to free", async () => {
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      id: "sub_789",
      plan: "unknown_plan",
      status: "active",
      interval: "month",
      currentPeriodEnd: new Date("2026-03-01"),
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
    });
    const { GET } = await import("@/app/api/subscription/route");
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.data.plan).toBe("free");
  });

  it("should return 500 on database error", async () => {
    mockPrismaSubscriptionFindUnique.mockRejectedValue(
      new Error("Database connection error"),
    );
    const { GET } = await import("@/app/api/subscription/route");
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.error.code).toBe("SUBSCRIPTION_ERROR");
  });
});
