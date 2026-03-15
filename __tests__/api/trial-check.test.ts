/**
 * Tests for /api/trial/check route
 *
 * Tests trial eligibility check:
 * - GET: Check user's trial eligibility and status
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetCurrentUser = vi.fn();
const mockIsTrialEligible = vi.fn();
const mockGetTrialStatus = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/trial", () => ({
  isTrialEligible: (...args: unknown[]) => mockIsTrialEligible(...args),
  getTrialStatus: (...args: unknown[]) => mockGetTrialStatus(...args),
  TRIAL_CONFIG: {
    durationDays: 7,
    plan: "premium",
    features: [
      "Unlimited searches",
      "Unlimited favorites",
      "50 AI-powered searches per day",
    ],
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

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

const mockTrialStatus = {
  isActive: false,
  isEligible: true,
  hasUsedTrial: false,
  startDate: null,
  endDate: null,
  daysRemaining: 0,
  plan: "free" as const,
};

describe("GET /api/trial/check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockIsTrialEligible.mockResolvedValue(true);
    mockGetTrialStatus.mockResolvedValue(mockTrialStatus);
  });

  it("should return 401 when user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { GET } = await import("@/app/api/trial/check/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return trial eligibility for eligible user", async () => {
    const { GET } = await import("@/app/api/trial/check/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.isEligible).toBe(true);
    expect(data.data.isActive).toBe(false);
    expect(data.data.hasUsedTrial).toBe(false);
    expect(data.data.trialConfig).toEqual({
      durationDays: 7,
      plan: "premium",
      features: expect.any(Array),
    });
  });

  it("should return active trial status", async () => {
    const activeTrialStatus = {
      isActive: true,
      isEligible: false,
      hasUsedTrial: true,
      startDate: new Date("2024-06-15"),
      endDate: new Date("2024-06-22"),
      daysRemaining: 5,
      plan: "premium",
    };
    mockIsTrialEligible.mockResolvedValue(false);
    mockGetTrialStatus.mockResolvedValue(activeTrialStatus);
    const { GET } = await import("@/app/api/trial/check/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.isEligible).toBe(false);
    expect(data.data.isActive).toBe(true);
    expect(data.data.daysRemaining).toBe(5);
    expect(data.data.currentPlan).toBe("premium");
  });

  it("should return ineligible status for user who already used trial", async () => {
    const usedTrialStatus = {
      isActive: false,
      isEligible: false,
      hasUsedTrial: true,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-06-08"),
      daysRemaining: 0,
      plan: "free",
    };
    mockIsTrialEligible.mockResolvedValue(false);
    mockGetTrialStatus.mockResolvedValue(usedTrialStatus);
    const { GET } = await import("@/app/api/trial/check/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.isEligible).toBe(false);
    expect(data.data.hasUsedTrial).toBe(true);
    expect(data.data.isActive).toBe(false);
  });

  it("should return 500 on server error", async () => {
    mockIsTrialEligible.mockRejectedValue(new Error("Database error"));
    const { GET } = await import("@/app/api/trial/check/route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INTERNAL_ERROR");
  });
});
