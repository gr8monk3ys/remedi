/**
 * Tests for /api/ai-search route
 *
 * Tests the AI-enhanced search endpoint:
 * - Rate limiting enforcement
 * - Authentication and authorization
 * - Input validation (Zod schema)
 * - Successful AI search flow (NLP + matching + interactions)
 * - Plan/subscription enforcement (canPerformAction)
 * - OpenAI API key configuration checks
 * - Error handling (OpenAI failures, database errors, usage tracking)
 * - GET health check endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Top-level mock fns (hoisted before vi.mock calls)
// ---------------------------------------------------------------------------
const mockGetCurrentUser = vi.fn();
const mockWithRateLimit = vi.fn();
const mockCanPerformAction = vi.fn();
const mockIncrementUsage = vi.fn();
const mockProcessNaturalLanguageQuery = vi.fn();
const mockEnhanceRemedyMatching = vi.fn();
const mockCheckDrugInteractions = vi.fn();

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (...args: unknown[]) => mockWithRateLimit(...args),
  RATE_LIMITS: {
    aiSearch: { limit: 10, window: 60, identifier: "ai-search" },
  },
}));

vi.mock("@/lib/analytics/usage-tracker", () => ({
  canPerformAction: (...args: unknown[]) => mockCanPerformAction(...args),
  incrementUsage: (...args: unknown[]) => mockIncrementUsage(...args),
}));

vi.mock("@/lib/ai-matching", () => ({
  processNaturalLanguageQuery: (...args: unknown[]) =>
    mockProcessNaturalLanguageQuery(...args),
  enhanceRemedyMatching: (...args: unknown[]) =>
    mockEnhanceRemedyMatching(...args),
  checkDrugInteractions: (...args: unknown[]) =>
    mockCheckDrugInteractions(...args),
}));

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const authenticatedUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  image: null,
  role: "user",
};

const mockNlpResult = {
  intent: "recommendation" as const,
  pharmaceuticalMentioned: "ibuprofen",
  symptomsMentioned: ["headache", "inflammation"],
  preferredCategories: ["herbal"],
  concerns: ["blood thinners"],
};

const mockRecommendation = {
  remedy: {
    id: "remedy-1",
    name: "Turmeric",
    description: "Natural anti-inflammatory spice",
    category: "Herbal Remedy",
    matchingNutrients: ["curcumin"],
    similarityScore: 0.85,
    imageUrl: "https://example.com/turmeric.jpg",
  },
  confidence: 0.85,
  reasoning: "Contains curcumin with strong anti-inflammatory properties",
  warnings: ["May interact with blood thinners"],
  interactions: [],
};

const mockInteractionResult = {
  hasInteractions: false,
  warnings: [],
  severity: "low" as const,
  recommendations: [],
};

// ---------------------------------------------------------------------------
// Helper to create POST requests
// ---------------------------------------------------------------------------

function createPostRequest(
  body: unknown,
  url = "http://localhost:3000/api/ai-search",
): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("/api/ai-search", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "sk-test-key-1234567890abcdef";

    // Default happy-path stubs
    mockWithRateLimit.mockResolvedValue({
      allowed: true,
      result: { success: true },
    });
    mockGetCurrentUser.mockResolvedValue(authenticatedUser);
    mockCanPerformAction.mockResolvedValue({
      allowed: true,
      currentUsage: 2,
      limit: 50,
      plan: "basic",
    });
    mockIncrementUsage.mockResolvedValue({
      newCount: 3,
      wasWithinLimit: true,
      isNowWithinLimit: true,
    });
    mockProcessNaturalLanguageQuery.mockResolvedValue(mockNlpResult);
    mockEnhanceRemedyMatching.mockResolvedValue([mockRecommendation]);
    mockCheckDrugInteractions.mockResolvedValue(mockInteractionResult);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ========================================================================
  // POST /api/ai-search
  // ========================================================================

  describe("POST /api/ai-search", () => {
    // ----------------------------------------------------------------------
    // Rate Limiting
    // ----------------------------------------------------------------------

    describe("Rate Limiting", () => {
      it("should return 429 when rate limit is exceeded", async () => {
        const rateLimitResponse = new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests. Please try again later.",
              statusCode: 429,
            },
          }),
          { status: 429 },
        );
        mockWithRateLimit.mockResolvedValue({
          allowed: false,
          response: rateLimitResponse,
        });

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);

        expect(response.status).toBe(429);
      });

      it("should pass the aiSearch rate limit config", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        await POST(request);

        expect(mockWithRateLimit).toHaveBeenCalledWith(
          request,
          expect.objectContaining({ identifier: "ai-search" }),
        );
      });
    });

    // ----------------------------------------------------------------------
    // Authentication & Authorization
    // ----------------------------------------------------------------------

    describe("Authentication & Authorization", () => {
      it("should return 401 when user is not authenticated", async () => {
        mockGetCurrentUser.mockResolvedValue(null);

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("UNAUTHORIZED");
        expect(data.error.message).toMatch(/signed in/i);
      });

      it("should return 403 when user plan does not include AI search (limit 0)", async () => {
        mockCanPerformAction.mockResolvedValue({
          allowed: false,
          currentUsage: 0,
          limit: 0,
          plan: "free",
        });

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("FORBIDDEN");
        expect(data.error.message).toMatch(/Basic plan/i);
      });

      it("should return 429 when daily AI search limit is exceeded", async () => {
        mockCanPerformAction.mockResolvedValue({
          allowed: false,
          currentUsage: 50,
          limit: 50,
          plan: "basic",
        });

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(429);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("LIMIT_EXCEEDED");
        expect(data.error.message).toMatch(/daily limit/i);
        expect(data.error.details).toEqual(
          expect.objectContaining({
            currentUsage: 50,
            limit: 50,
            plan: "basic",
          }),
        );
      });

      it("should call canPerformAction with the user id and aiSearches type", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        await POST(request);

        expect(mockCanPerformAction).toHaveBeenCalledWith(
          "user-123",
          "aiSearches",
        );
      });
    });

    // ----------------------------------------------------------------------
    // OpenAI API Key Configuration
    // ----------------------------------------------------------------------

    describe("OpenAI API Key Configuration", () => {
      it("should return 503 when OPENAI_API_KEY is not set", async () => {
        delete process.env.OPENAI_API_KEY;

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("SERVICE_UNAVAILABLE");
        expect(data.error.message).toMatch(/OPENAI_API_KEY/i);
      });
    });

    // ----------------------------------------------------------------------
    // Input Validation
    // ----------------------------------------------------------------------

    describe("Input Validation", () => {
      it("should return 400 for missing query field", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({});
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("INVALID_INPUT");
      });

      it("should return 400 for empty query string", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("INVALID_INPUT");
      });

      it("should return 400 when query exceeds 500 characters", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const longQuery = "a".repeat(501);
        const request = createPostRequest({ query: longQuery });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("INVALID_INPUT");
        expect(data.error.message).toMatch(/too long/i);
      });

      it("should return 400 when query is not a string", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: 12345 });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("INVALID_INPUT");
      });

      it("should accept a query at exactly 500 characters", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const borderlineQuery = "a".repeat(500);
        const request = createPostRequest({ query: borderlineQuery });
        const response = await POST(request);

        expect(response.status).toBe(200);
      });

      it("should accept optional fields (userHistory, currentMedications, symptoms, preferences)", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({
          query: "headache remedies",
          userHistory: ["aspirin"],
          currentMedications: ["warfarin"],
          symptoms: ["headache"],
          preferences: {
            evidenceLevel: "strong",
            category: ["herbal"],
          },
          checkInteractions: true,
        });
        const response = await POST(request);

        expect(response.status).toBe(200);
      });

      it("should return 400 for invalid preferences.evidenceLevel value", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({
          query: "headache remedies",
          preferences: {
            evidenceLevel: "invalid_level",
          },
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("INVALID_INPUT");
      });
    });

    // ----------------------------------------------------------------------
    // Successful Responses
    // ----------------------------------------------------------------------

    describe("Successful Responses", () => {
      it("should process a valid query and return recommendations with intent", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.intent).toBe("recommendation");
        expect(data.data.recommendations).toHaveLength(1);
        expect(data.data.recommendations[0].remedy.name).toBe("Turmeric");
        expect(data.data.recommendations[0].confidence).toBe(0.85);
      });

      it("should include extracted NLP info in the response", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(data.data.extractedInfo).toEqual({
          pharmaceutical: "ibuprofen",
          symptoms: ["headache", "inflammation"],
          categories: ["herbal"],
          concerns: ["blood thinners"],
        });
      });

      it("should return null interactions when checkInteractions is false", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({
          query: "headache remedies",
          checkInteractions: false,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(data.data.interactions).toBeNull();
        expect(mockCheckDrugInteractions).not.toHaveBeenCalled();
      });

      it("should check drug interactions when checkInteractions is true and medications are provided", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({
          query: "headache remedies",
          checkInteractions: true,
          currentMedications: ["warfarin"],
        });
        const response = await POST(request);
        const data = await response.json();

        expect(mockCheckDrugInteractions).toHaveBeenCalledWith("Turmeric", [
          "warfarin",
        ]);
        expect(data.data.interactions).toHaveLength(1);
        expect(data.data.interactions[0].remedyName).toBe("Turmeric");
      });

      it("should not check interactions when checkInteractions is true but no medications", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({
          query: "headache remedies",
          checkInteractions: true,
        });
        const response = await POST(request);
        const data = await response.json();

        expect(mockCheckDrugInteractions).not.toHaveBeenCalled();
        expect(data.data.interactions).toBeNull();
      });

      it("should pass NLP-extracted data to enhanceRemedyMatching when user does not provide explicit values", async () => {
        mockProcessNaturalLanguageQuery.mockResolvedValue({
          intent: "search",
          pharmaceuticalMentioned: "aspirin",
          symptomsMentioned: ["pain"],
          preferredCategories: ["supplements"],
          concerns: [],
        });

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "natural aspirin" });
        await POST(request);

        expect(mockEnhanceRemedyMatching).toHaveBeenCalledWith(
          expect.objectContaining({
            query: "natural aspirin",
            currentMedications: ["aspirin"],
            symptoms: ["pain"],
            preferences: expect.objectContaining({
              category: ["supplements"],
            }),
          }),
        );
      });

      it("should prefer user-provided medications/symptoms over NLP-extracted ones", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({
          query: "headache remedies",
          currentMedications: ["metformin"],
          symptoms: ["joint pain"],
          preferences: { category: ["vitamins"] },
        });
        await POST(request);

        expect(mockEnhanceRemedyMatching).toHaveBeenCalledWith(
          expect.objectContaining({
            currentMedications: ["metformin"],
            symptoms: ["joint pain"],
            preferences: expect.objectContaining({
              category: ["vitamins"],
            }),
          }),
        );
      });
    });

    // ----------------------------------------------------------------------
    // Usage Tracking
    // ----------------------------------------------------------------------

    describe("Usage Tracking", () => {
      it("should increment usage after a successful AI search", async () => {
        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        await POST(request);

        expect(mockIncrementUsage).toHaveBeenCalledWith(
          "user-123",
          "aiSearches",
          1,
        );
      });

      it("should still return success even if usage tracking fails", async () => {
        mockIncrementUsage.mockRejectedValue(
          new Error("Database connection lost"),
        );

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.recommendations).toHaveLength(1);
      });
    });

    // ----------------------------------------------------------------------
    // Error Handling
    // ----------------------------------------------------------------------

    describe("Error Handling", () => {
      it("should return 401 when error message mentions API key", async () => {
        mockProcessNaturalLanguageQuery.mockRejectedValue(
          new Error("Invalid API key provided"),
        );

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("UNAUTHORIZED");
        expect(data.error.message).toMatch(/API key/i);
      });

      it("should return 500 for generic OpenAI errors", async () => {
        mockProcessNaturalLanguageQuery.mockRejectedValue(
          new Error("OpenAI service timeout"),
        );

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("INTERNAL_ERROR");
        expect(data.error.message).toMatch(/Failed to process/i);
      });

      it("should return 500 when enhanceRemedyMatching throws", async () => {
        mockEnhanceRemedyMatching.mockRejectedValue(
          new Error("Database query failed"),
        );

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("INTERNAL_ERROR");
      });

      it("should return 500 when checkDrugInteractions throws", async () => {
        mockCheckDrugInteractions.mockRejectedValue(
          new Error("Interaction check failed"),
        );

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({
          query: "headache remedies",
          checkInteractions: true,
          currentMedications: ["warfarin"],
        });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("INTERNAL_ERROR");
      });

      it("should not increment usage when AI processing throws", async () => {
        mockEnhanceRemedyMatching.mockRejectedValue(
          new Error("AI service down"),
        );

        const { POST } = await import("@/app/api/ai-search/route");
        const request = createPostRequest({ query: "headache remedies" });
        await POST(request);

        expect(mockIncrementUsage).not.toHaveBeenCalled();
      });
    });
  });

  // ========================================================================
  // GET /api/ai-search (health check)
  // ========================================================================

  describe("GET /api/ai-search", () => {
    it("should return available status when OPENAI_API_KEY is configured and valid", async () => {
      process.env.OPENAI_API_KEY = "sk-real-key-abcdefghijklmnopq";

      const { GET } = await import("@/app/api/ai-search/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("available");
      expect(data.data.features.naturalLanguageProcessing).toBe(true);
      expect(data.data.features.intelligentMatching).toBe(true);
      expect(data.data.features.drugInteractionChecking).toBe(true);
      expect(data.data.features.personalizedRecommendations).toBe(true);
    });

    it("should return not_configured when OPENAI_API_KEY is missing", async () => {
      delete process.env.OPENAI_API_KEY;

      const { GET } = await import("@/app/api/ai-search/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("not_configured");
      expect(data.data.features.naturalLanguageProcessing).toBe(false);
    });

    it("should return not_configured when OPENAI_API_KEY contains a dummy value", async () => {
      process.env.OPENAI_API_KEY = "sk-dummy-key-for-testing-1234";

      const { GET } = await import("@/app/api/ai-search/route");
      const response = await GET();
      const data = await response.json();

      expect(data.data.status).toBe("not_configured");
    });

    it("should return not_configured when OPENAI_API_KEY does not start with sk-", async () => {
      process.env.OPENAI_API_KEY = "not-a-valid-key-1234567890abcdef";

      const { GET } = await import("@/app/api/ai-search/route");
      const response = await GET();
      const data = await response.json();

      expect(data.data.status).toBe("not_configured");
    });

    it("should return not_configured when OPENAI_API_KEY is too short", async () => {
      process.env.OPENAI_API_KEY = "sk-short";

      const { GET } = await import("@/app/api/ai-search/route");
      const response = await GET();
      const data = await response.json();

      expect(data.data.status).toBe("not_configured");
    });

    it("should return not_configured when OPENAI_API_KEY contains your- placeholder", async () => {
      process.env.OPENAI_API_KEY = "sk-your-api-key-goes-here-1234567890";

      const { GET } = await import("@/app/api/ai-search/route");
      const response = await GET();
      const data = await response.json();

      expect(data.data.status).toBe("not_configured");
    });
  });
});
