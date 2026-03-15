/**
 * Tests for /api/medication-cabinet/interactions route
 *
 * Tests authenticated, plan-gated cabinet interaction checks.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockCheckCabinetInteractions = vi.fn();
const mockPrismaSubscriptionFindUnique = vi.fn();
const mockGetTrialStatus = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

vi.mock("@/lib/trial", () => ({
  getTrialStatus: (...args: unknown[]) => mockGetTrialStatus(...args),
}));

vi.mock("@/lib/db", () => ({
  checkCabinetInteractions: (...args: unknown[]) =>
    mockCheckCabinetInteractions(...args),
  prisma: {
    subscription: {
      findUnique: (...args: unknown[]) =>
        mockPrismaSubscriptionFindUnique(...args),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

import { GET } from "@/app/api/medication-cabinet/interactions/route";

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

describe("/api/medication-cabinet/interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockGetTrialStatus.mockResolvedValue({
      isActive: false,
      isEligible: true,
      hasUsedTrial: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0,
      plan: "basic",
    });
    mockPrismaSubscriptionFindUnique.mockResolvedValue({
      plan: "basic",
      status: "active",
    });
  });

  it("should return 401 when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 403 for free users", async () => {
    mockGetTrialStatus.mockResolvedValue({
      isActive: false,
      isEligible: true,
      hasUsedTrial: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0,
      plan: "free",
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");
  });

  it("should return interactions and count", async () => {
    const interactions = [
      {
        id: "int-1",
        substanceA: "Warfarin",
        substanceAType: "pharmaceutical",
        substanceB: "Ginkgo Biloba",
        substanceBType: "natural_remedy",
        severity: "severe",
      },
    ];
    mockCheckCabinetInteractions.mockResolvedValue(interactions);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.interactions).toEqual(interactions);
    expect(data.data.count).toBe(1);
    expect(mockCheckCabinetInteractions).toHaveBeenCalledWith("user-123");
  });

  it("should return 500 on database failure", async () => {
    mockCheckCabinetInteractions.mockRejectedValue(new Error("DB failure"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INTERNAL_ERROR");
  });
});
