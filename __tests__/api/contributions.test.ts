/**
 * Tests for /api/contributions route
 *
 * Tests contribution operations:
 * - GET: List user's contributions (paginated, filterable by status)
 * - POST: Create a new remedy contribution (with rate limiting)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockWithRateLimit = vi.fn();
const mockPrismaContributionFindMany = vi.fn();
const mockPrismaContributionCount = vi.fn();
const mockPrismaContributionCreate = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    remedyContribution: {
      findMany: (...args: unknown[]) => mockPrismaContributionFindMany(...args),
      count: (...args: unknown[]) => mockPrismaContributionCount(...args),
      create: (...args: unknown[]) => mockPrismaContributionCreate(...args),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    contributions: { limit: 5, window: 60, identifier: "contributions" },
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

const mockContribution = {
  id: "contrib-1",
  userId: "user-123",
  name: "Chamomile Tea",
  description: "A soothing herbal tea used for centuries to promote relaxation",
  category: "Herbal Remedy",
  ingredients: ["chamomile flowers"],
  benefits: ["relaxation", "sleep aid"],
  usage: "Steep in hot water for 5 minutes",
  dosage: "1-2 cups daily",
  precautions: "May cause allergic reactions in sensitive individuals",
  scientificInfo: null,
  references: [],
  imageUrl: null,
  status: "pending",
  createdAt: new Date("2024-06-15"),
  updatedAt: new Date("2024-06-15"),
};

describe("/api/contributions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockWithRateLimit.mockResolvedValue({ allowed: true, response: null });
  });

  describe("GET /api/contributions", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { GET } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should return paginated contributions", async () => {
      mockPrismaContributionFindMany.mockResolvedValue([mockContribution]);
      mockPrismaContributionCount.mockResolvedValue(1);
      const { GET } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.contributions).toHaveLength(1);
      expect(data.data.total).toBe(1);
      expect(data.data.page).toBe(1);
    });

    it("should filter by status", async () => {
      mockPrismaContributionFindMany.mockResolvedValue([mockContribution]);
      mockPrismaContributionCount.mockResolvedValue(1);
      const { GET } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions?status=pending",
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrismaContributionFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "pending" }),
        }),
      );
    });

    it("should accept page and limit parameters", async () => {
      mockPrismaContributionFindMany.mockResolvedValue([]);
      mockPrismaContributionCount.mockResolvedValue(0);
      const { GET } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions?page=2&limit=5",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.page).toBe(2);
      expect(mockPrismaContributionFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it("should return 500 on server error", async () => {
      mockPrismaContributionFindMany.mockRejectedValue(
        new Error("Database error"),
      );
      const { GET } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/contributions", () => {
    const validBody = {
      name: "Chamomile Tea",
      description:
        "A soothing herbal tea used for centuries to promote relaxation and sleep",
      category: "Herbal Remedy",
      ingredients: ["chamomile flowers"],
      benefits: ["relaxation", "sleep aid"],
      usage: "Steep in hot water for 5 minutes",
      dosage: "1-2 cups daily",
    };

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
      const { POST } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);

      expect(response.status).toBe(429);
    });

    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { POST } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should create contribution successfully", async () => {
      mockPrismaContributionCreate.mockResolvedValue(mockContribution);
      const { POST } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockPrismaContributionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            name: "Chamomile Tea",
            status: "pending",
          }),
        }),
      );
    });

    it("should return 400 for missing required fields", async () => {
      const { POST } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
        {
          method: "POST",
          body: JSON.stringify({ name: "X" }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for description too short", async () => {
      const { POST } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
        {
          method: "POST",
          body: JSON.stringify({
            ...validBody,
            description: "Too short",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for empty ingredients", async () => {
      const { POST } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
        {
          method: "POST",
          body: JSON.stringify({
            ...validBody,
            ingredients: [],
          }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 500 on server error", async () => {
      mockPrismaContributionCreate.mockRejectedValue(
        new Error("Database error"),
      );
      const { POST } = await import("@/app/api/contributions/route");
      const request = new NextRequest(
        "http://localhost:3000/api/contributions",
        {
          method: "POST",
          body: JSON.stringify(validBody),
          headers: { "Content-Type": "application/json" },
        },
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
