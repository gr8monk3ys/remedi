/**
 * Unit Tests for Rate Limiting Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  RATE_LIMITS,
  isRateLimitEnabled,
  getClientIdentifier,
  rateLimitExceededResponse,
  addRateLimitHeaders,
} from "../rate-limit";

// Mock NextRequest for testing
function createMockRequest(headers: Record<string, string> = {}): NextRequest {
  return {
    headers: new Headers(headers),
    url: "http://localhost:3000/api/test",
    nextUrl: new URL("http://localhost:3000/api/test"),
  } as unknown as NextRequest;
}

describe("Rate Limiting Utilities", () => {
  describe("RATE_LIMITS configuration", () => {
    it("should have correct search rate limit", () => {
      expect(RATE_LIMITS.search).toEqual({
        limit: 30,
        window: 60,
        identifier: "search",
      });
    });

    it("should have stricter AI search rate limit", () => {
      expect(RATE_LIMITS.aiSearch.limit).toBeLessThan(RATE_LIMITS.search.limit);
      expect(RATE_LIMITS.aiSearch).toEqual({
        limit: 10,
        window: 60,
        identifier: "ai-search",
      });
    });

    it("should have strict auth rate limit to prevent brute force", () => {
      expect(RATE_LIMITS.auth.limit).toBeLessThanOrEqual(5);
    });
  });

  describe("isRateLimitEnabled", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should return false when Redis URL is missing", () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      expect(isRateLimitEnabled()).toBe(false);
    });

    it("should return false when Redis token is missing", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      expect(isRateLimitEnabled()).toBe(false);
    });

    it("should return true when both Redis URL and token are set", () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
      expect(isRateLimitEnabled()).toBe(true);
    });
  });

  describe("getClientIdentifier", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = createMockRequest({
        "x-forwarded-for": "192.168.1.1, 10.0.0.1",
      });
      expect(getClientIdentifier(request)).toBe("192.168.1.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const request = createMockRequest({
        "x-real-ip": "192.168.1.2",
      });
      expect(getClientIdentifier(request)).toBe("192.168.1.2");
    });

    it("should extract IP from cf-connecting-ip header (Cloudflare)", () => {
      const request = createMockRequest({
        "cf-connecting-ip": "192.168.1.3",
      });
      expect(getClientIdentifier(request)).toBe("192.168.1.3");
    });

    it("should prefer x-forwarded-for over other headers", () => {
      const request = createMockRequest({
        "x-forwarded-for": "192.168.1.1",
        "x-real-ip": "192.168.1.2",
        "cf-connecting-ip": "192.168.1.3",
      });
      expect(getClientIdentifier(request)).toBe("192.168.1.1");
    });

    it('should return "anonymous" when no IP headers are present', () => {
      const request = createMockRequest({});
      expect(getClientIdentifier(request)).toBe("anonymous");
    });
  });

  describe("rateLimitExceededResponse", () => {
    it("should return 429 status code", () => {
      const result = {
        success: false,
        limit: 30,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 60,
      };

      const response = rateLimitExceededResponse(result);
      expect(response.status).toBe(429);
    });

    it("should include rate limit headers", () => {
      const result = {
        success: false,
        limit: 30,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 45,
      };

      const response = rateLimitExceededResponse(result);
      expect(response.headers.get("X-RateLimit-Limit")).toBe("30");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(response.headers.get("Retry-After")).toBe("45");
    });
  });

  describe("addRateLimitHeaders", () => {
    it("should add rate limit headers to response", async () => {
      const { NextResponse } = await import("next/server");
      const response = NextResponse.json({ data: "test" });
      const result = {
        success: true,
        limit: 30,
        remaining: 29,
        reset: Date.now() + 60000,
      };

      const modifiedResponse = addRateLimitHeaders(response, result);

      expect(modifiedResponse.headers.get("X-RateLimit-Limit")).toBe("30");
      expect(modifiedResponse.headers.get("X-RateLimit-Remaining")).toBe("29");
      expect(modifiedResponse.headers.get("X-RateLimit-Reset")).toBeTruthy();
    });
  });
});
