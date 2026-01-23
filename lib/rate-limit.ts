/**
 * Rate Limiting with Upstash Redis
 *
 * Provides rate limiting for API routes to prevent abuse and control costs.
 * Uses Upstash Redis for distributed rate limiting that works across serverless functions.
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { hasUpstashRedis, getUpstashRedisCredentials } from "@/lib/env";

// Types for rate limit configuration
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  limit: number;

  /**
   * Time window in seconds
   */
  window: number;

  /**
   * Identifier for the rate limit (e.g., "search", "ai-search")
   */
  identifier: string;
}

// Default rate limits for different endpoints
export const RATE_LIMITS = {
  // Standard search: 30 requests per minute
  search: { limit: 30, window: 60, identifier: "search" },

  // AI search: 10 requests per minute (more expensive)
  aiSearch: { limit: 10, window: 60, identifier: "ai-search" },

  // Favorites: 20 requests per minute
  favorites: { limit: 20, window: 60, identifier: "favorites" },

  // Auth: 5 requests per minute (prevent brute force)
  auth: { limit: 5, window: 60, identifier: "auth" },

  // Checkout: 10 requests per minute (prevent payment abuse)
  checkout: { limit: 10, window: 60, identifier: "checkout" },

  // Billing portal: 5 requests per minute
  billingPortal: { limit: 5, window: 60, identifier: "billing-portal" },

  // General API: 60 requests per minute
  general: { limit: 60, window: 60, identifier: "general" },
} as const;

/**
 * Check if Upstash Redis is configured
 */
export function isRateLimitEnabled(): boolean {
  return hasUpstashRedis();
}

/**
 * Create Redis client for rate limiting
 */
function createRedisClient(): Redis | null {
  if (!isRateLimitEnabled()) {
    return null;
  }

  const { url, token } = getUpstashRedisCredentials();
  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

/**
 * Create rate limiter for a specific endpoint
 */
function createRateLimiter(config: RateLimitConfig): Ratelimit | null {
  const redis = createRedisClient();
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
    analytics: true,
    prefix: `remedi:ratelimit:${config.identifier}`,
  });
}

/**
 * Get client identifier for rate limiting
 * Uses IP address, falling back to a session ID if available
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (works with proxies/CDNs)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || cfConnectingIp;

  // Fall back to a generic identifier if no IP
  return ip || "anonymous";
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.general,
): Promise<RateLimitResult> {
  const ratelimiter = createRateLimiter(config);

  // If rate limiting is not configured, allow all requests
  if (!ratelimiter) {
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit,
      reset: Date.now() + config.window * 1000,
    };
  }

  const identifier = getClientIdentifier(request);
  const result = await ratelimiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.success
      ? undefined
      : Math.ceil((result.reset - Date.now()) / 1000),
  };
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceededResponse(
  result: RateLimitResult,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        retryAfter: result.retryAfter,
      },
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": result.retryAfter?.toString() || "60",
      },
    },
  );
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());
  return response;
}

/**
 * Rate limiting middleware helper
 * Use in API routes to check rate limits
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.search);
 *   if (!rateLimitResult.success) {
 *     return rateLimitExceededResponse(rateLimitResult);
 *   }
 *   // ... handle request
 * }
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.general,
): Promise<{
  allowed: boolean;
  response?: NextResponse;
  result: RateLimitResult;
}> {
  const result = await checkRateLimit(request, config);

  if (!result.success) {
    return {
      allowed: false,
      response: rateLimitExceededResponse(result),
      result,
    };
  }

  return { allowed: true, result };
}
