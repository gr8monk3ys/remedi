/**
 * Tests for /api/reviews route
 *
 * Tests review operations:
 * - GET: Fetch reviews for a remedy (paginated, with ratings)
 * - POST: Create a new review (with rate limiting, duplicate check)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetCurrentUser = vi.fn();
const mockWithRateLimit = vi.fn();
const mockTrackUserEventSafe = vi.fn();
const mockPrismaReviewFindMany = vi.fn();
const mockPrismaReviewCount = vi.fn();
const mockPrismaReviewAggregate = vi.fn();
const mockPrismaReviewFindFirst = vi.fn();
const mockPrismaReviewCreate = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    remedyReview: {
      findMany: (...args: unknown[]) => mockPrismaReviewFindMany(...args),
      count: (...args: unknown[]) => mockPrismaReviewCount(...args),
      aggregate: (...args: unknown[]) => mockPrismaReviewAggregate(...args),
      findFirst: (...args: unknown[]) => mockPrismaReviewFindFirst(...args),
      create: (...args: unknown[]) => mockPrismaReviewCreate(...args),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    reviews: { limit: 10, window: 60, identifier: "reviews" },
  },
}));

vi.mock("@/lib/analytics/user-events", () => ({
  trackUserEventSafe: (...args: unknown[]) => mockTrackUserEventSafe(...args),
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

const mockReview = {
  id: "review-1",
  remedyId: "remedy-1",
  remedyName: "Turmeric",
  rating: 4,
  title: "Great for joint pain",
  comment: "I have been using turmeric for joint pain and it works really well",
  userId: "user-123",
  user: {
    id: "user-123",
    name: "Test User",
    image: null,
  },
  createdAt: new Date("2024-06-15"),
  updatedAt: new Date("2024-06-15"),
};

describe("/api/reviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockWithRateLimit.mockResolvedValue({ allowed: true, response: null });
    mockTrackUserEventSafe.mockResolvedValue(undefined);
  });

  describe("GET /api/reviews", () => {
    it("should return 400 when remedyId is missing", async () => {
      const { GET } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INVALID_INPUT");
    });

    it("should return paginated reviews with ratings", async () => {
      mockPrismaReviewFindMany.mockResolvedValue([mockReview]);
      mockPrismaReviewCount.mockResolvedValue(1);
      mockPrismaReviewAggregate.mockResolvedValue({
        _avg: { rating: 4.0 },
        _count: { rating: 1 },
      });
      const { GET } = await import("@/app/api/reviews/route");
      const request = new NextRequest(
        "http://localhost:3000/api/reviews?remedyId=remedy-1",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.reviews).toHaveLength(1);
      expect(data.data.total).toBe(1);
      expect(data.data.averageRating).toBe(4.0);
      expect(data.data.totalReviews).toBe(1);
    });

    it("should accept page and limit parameters", async () => {
      mockPrismaReviewFindMany.mockResolvedValue([]);
      mockPrismaReviewCount.mockResolvedValue(0);
      mockPrismaReviewAggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      });
      const { GET } = await import("@/app/api/reviews/route");
      const request = new NextRequest(
        "http://localhost:3000/api/reviews?remedyId=remedy-1&page=2&limit=5",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.page).toBe(2);
      expect(mockPrismaReviewFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it("should return 500 on server error", async () => {
      mockPrismaReviewFindMany.mockRejectedValue(new Error("Database error"));
      const { GET } = await import("@/app/api/reviews/route");
      const request = new NextRequest(
        "http://localhost:3000/api/reviews?remedyId=remedy-1",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/reviews", () => {
    const validBody = {
      remedyId: "remedy-1",
      remedyName: "Turmeric",
      rating: 4,
      title: "Great for joint pain",
      comment:
        "I have been using turmeric for joint pain and it works really well",
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
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);

      expect(response.status).toBe(429);
    });

    it("should return 401 when user is not authenticated", async () => {
      mockGetCurrentUser.mockResolvedValue(null);
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("UNAUTHORIZED");
    });

    it("should create a review successfully", async () => {
      mockPrismaReviewFindFirst.mockResolvedValue(null); // no existing review
      mockPrismaReviewCreate.mockResolvedValue(mockReview);
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(mockPrismaReviewCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            remedyId: "remedy-1",
            userId: "user-123",
            rating: 4,
          }),
        }),
      );
    });

    it("should track review_submitted event on success", async () => {
      mockPrismaReviewFindFirst.mockResolvedValue(null);
      mockPrismaReviewCreate.mockResolvedValue(mockReview);
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      await POST(request);

      expect(mockTrackUserEventSafe).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          eventType: "review_submitted",
          eventData: expect.objectContaining({
            remedyId: "remedy-1",
            rating: 4,
          }),
        }),
      );
    });

    it("should return 400 for duplicate review", async () => {
      mockPrismaReviewFindFirst.mockResolvedValue(mockReview); // already reviewed
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("DUPLICATE_REVIEW");
    });

    it("should return 400 for invalid rating", async () => {
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({ ...validBody, rating: 6 }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for comment too short", async () => {
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({ ...validBody, comment: "Short" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 for missing required fields", async () => {
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify({ remedyId: "remedy-1" }),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 500 on server error", async () => {
      mockPrismaReviewFindFirst.mockResolvedValue(null);
      mockPrismaReviewCreate.mockRejectedValue(new Error("Database error"));
      const { POST } = await import("@/app/api/reviews/route");
      const request = new NextRequest("http://localhost:3000/api/reviews", {
        method: "POST",
        body: JSON.stringify(validBody),
        headers: { "Content-Type": "application/json" },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
