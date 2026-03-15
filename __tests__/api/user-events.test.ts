/**
 * Tests for /api/user-events route
 *
 * Tests validation, rate limiting, and event forwarding.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockTrackUserEventSafe = vi.fn();
const mockWithRateLimit = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: (...args: unknown[]) => mockGetCurrentUser(...args),
}));

vi.mock("@/lib/analytics/user-events", () => ({
  trackUserEventSafe: (...args: unknown[]) => mockTrackUserEventSafe(...args),
}));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    analytics: { limit: 120, window: 60, identifier: "analytics" },
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

import { POST } from "@/app/api/user-events/route";

function allowedRateLimit() {
  return {
    allowed: true,
    result: {
      success: true,
      limit: 120,
      remaining: 119,
      reset: Date.now() + 60_000,
    },
  };
}

describe("/api/user-events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithRateLimit.mockResolvedValue(allowedRateLimit());
    mockGetCurrentUser.mockResolvedValue({
      id: "user-123",
      email: "test@example.com",
      role: "user",
    });
    mockTrackUserEventSafe.mockResolvedValue(undefined);
  });

  it("should return 429 when rate-limited", async () => {
    mockWithRateLimit.mockResolvedValue({
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" },
        },
        { status: 429 },
      ),
      result: {
        success: false,
        limit: 120,
        remaining: 0,
        reset: Date.now() + 60_000,
      },
    });

    const request = new NextRequest("http://localhost:3000/api/user-events", {
      method: "POST",
      body: JSON.stringify({
        eventType: "search",
        eventData: { query: "turmeric" },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(mockTrackUserEventSafe).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid event payload", async () => {
    const request = new NextRequest("http://localhost:3000/api/user-events", {
      method: "POST",
      body: JSON.stringify({
        eventType: "not_a_real_event",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("should track a valid event for an authenticated user", async () => {
    const request = new NextRequest("http://localhost:3000/api/user-events", {
      method: "POST",
      body: JSON.stringify({
        eventType: "search",
        eventData: { query: "turmeric" },
        page: "/",
        referrer: "https://example.com",
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockTrackUserEventSafe).toHaveBeenCalledWith(
      expect.objectContaining({
        request,
        userId: "user-123",
        eventType: "search",
      }),
    );
  });

  it("should allow anonymous tracking when no user is present", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/user-events", {
      method: "POST",
      body: JSON.stringify({
        eventType: "landing_view",
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockTrackUserEventSafe).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: undefined,
        eventType: "landing_view",
      }),
    );
  });

  it("should return 500 when tracking throws", async () => {
    mockTrackUserEventSafe.mockRejectedValue(new Error("Tracking failure"));

    const request = new NextRequest("http://localhost:3000/api/user-events", {
      method: "POST",
      body: JSON.stringify({
        eventType: "search",
        eventData: { query: "ginger" },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INTERNAL_ERROR");
  });
});
