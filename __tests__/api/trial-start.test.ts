/**
 * Tests for /api/trial/start route
 *
 * Tests trial start:
 * - POST: Start a 7-day premium trial (auth, eligibility, rate limiting)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockWithRateLimit = vi.fn();
const mockIsTrialEligible = vi.fn();
const mockStartTrial = vi.fn();
const mockTrackTrialStarted = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/trial", () => ({
  isTrialEligible: (...args: unknown[]) => mockIsTrialEligible(...args),
  startTrial: (...args: unknown[]) => mockStartTrial(...args),
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

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    trialStart: { limit: 3, window: 60, identifier: "trialStart" },
  },
}));

vi.mock("@/lib/analytics/conversion-events", () => ({
  trackTrialStarted: (...args: unknown[]) => mockTrackTrialStarted(...args),
  EVENT_SOURCES: { API: "api" },
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

function makeRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/trial/start", {
    method: "POST",
  });
}

describe("POST /api/trial/start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockWithRateLimit.mockResolvedValue({ allowed: true, response: null });
    mockIsTrialEligible.mockResolvedValue(true);
    mockStartTrial.mockResolvedValue({
      trialEndDate: new Date("2024-06-22"),
      daysRemaining: 7,
    });
    mockTrackTrialStarted.mockResolvedValue(undefined);
  });

  it("should return rate limit response when rate limited", async () => {
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
    const { POST } = await import("@/app/api/trial/start/route");
    const response = await POST(makeRequest());

    expect(response.status).toBe(429);
  });

  it("should return 401 when user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const { POST } = await import("@/app/api/trial/start/route");
    const response = await POST(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("should return 400 when user is not eligible for trial", async () => {
    mockIsTrialEligible.mockResolvedValue(false);
    const { POST } = await import("@/app/api/trial/start/route");
    const response = await POST(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("TRIAL_NOT_ELIGIBLE");
  });

  it("should start trial successfully", async () => {
    const { POST } = await import("@/app/api/trial/start/route");
    const response = await POST(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.message).toContain("Trial started successfully");
    expect(data.data.daysRemaining).toBe(7);
    expect(data.data.plan).toBe("premium");
    expect(data.data.features).toBeDefined();
    expect(mockStartTrial).toHaveBeenCalledWith("user-123");
  });

  it("should track conversion event on success", async () => {
    const { POST } = await import("@/app/api/trial/start/route");
    await POST(makeRequest());

    expect(mockTrackTrialStarted).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        source: "api",
        metadata: expect.objectContaining({
          daysInTrial: 7,
        }),
      }),
    );
  });

  it("should return 400 when startTrial throws not eligible error", async () => {
    mockStartTrial.mockRejectedValue(
      new Error("User is not eligible for trial"),
    );
    const { POST } = await import("@/app/api/trial/start/route");
    const response = await POST(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("TRIAL_NOT_ELIGIBLE");
  });

  it("should return 500 on unexpected server error", async () => {
    mockStartTrial.mockRejectedValue(new Error("Database connection failed"));
    const { POST } = await import("@/app/api/trial/start/route");
    const response = await POST(makeRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INTERNAL_ERROR");
  });
});
