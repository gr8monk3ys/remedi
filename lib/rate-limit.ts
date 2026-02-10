/**
 * Rate Limiting with Upstash Redis
 *
 * Provides rate limiting for API routes to prevent abuse and control costs.
 * Uses Upstash Redis for distributed rate limiting that works across serverless functions.
 * Falls back to an in-memory rate limiter when Redis is not configured.
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

  // Favorites: 30 requests per minute
  favorites: { limit: 30, window: 60, identifier: "favorites" },

  // Search history: 30 requests per minute
  searchHistory: { limit: 30, window: 60, identifier: "search-history" },

  // Filter preferences: 20 requests per minute
  filterPreferences: {
    limit: 20,
    window: 60,
    identifier: "filter-preferences",
  },

  // Reviews: 10 requests per minute
  reviews: { limit: 10, window: 60, identifier: "reviews" },

  // Contributions: 10 requests per minute
  contributions: { limit: 10, window: 60, identifier: "contributions" },

  // Trial start: 5 requests per minute (prevent abuse)
  trialStart: { limit: 5, window: 60, identifier: "trial-start" },

  // Auth: 5 requests per minute (prevent brute force)
  auth: { limit: 5, window: 60, identifier: "auth" },

  // Checkout: 10 requests per minute (prevent payment abuse)
  checkout: { limit: 10, window: 60, identifier: "checkout" },

  // Billing portal: 5 requests per minute
  billingPortal: { limit: 5, window: 60, identifier: "billing-portal" },

  // General API: 60 requests per minute
  general: { limit: 60, window: 60, identifier: "general" },

  // Analytics events: 120 requests per minute
  analytics: { limit: 120, window: 60, identifier: "analytics" },

  // Interactions lookup: 30 requests per minute
  interactions: { limit: 30, window: 60, identifier: "interactions" },

  // Interactions multi-check: 15 requests per minute (computationally expensive)
  interactionsCheck: {
    limit: 15,
    window: 60,
    identifier: "interactions-check",
  },
} as const;

/**
 * Check if Upstash Redis is configured
 */
export function isRateLimitEnabled(): boolean {
  return hasUpstashRedis();
}

/**
 * Module-level singleton Redis client.
 * Created once and reused across all requests to avoid connection churn.
 */
let redisClient: Redis | null = null;

/**
 * Get or create the singleton Redis client
 */
function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  if (!isRateLimitEnabled()) {
    return null;
  }

  const { url, token } = getUpstashRedisCredentials();
  if (!url || !token) {
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

/**
 * Cache of Ratelimit instances keyed by identifier.
 * Avoids creating a new Ratelimit instance per request.
 */
const rateLimiterCache = new Map<string, Ratelimit>();

/**
 * Get or create a cached rate limiter for a specific endpoint
 */
function getRateLimiter(config: RateLimitConfig): Ratelimit | null {
  const cacheKey = `${config.identifier}:${config.limit}:${config.window}`;

  const cached = rateLimiterCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
    analytics: true,
    prefix: `remedi:ratelimit:${config.identifier}`,
  });

  rateLimiterCache.set(cacheKey, limiter);
  return limiter;
}

/**
 * In-memory rate limiter fallback for when Redis is not configured.
 * Tracks request counts per client identifier with automatic window expiry.
 * Note: This does not persist across serverless cold starts, which is acceptable
 * as a degraded-but-still-protective fallback.
 */
interface InMemoryEntry {
  count: number;
  resetTime: number;
}

const inMemoryStore = new Map<string, InMemoryEntry>();

/**
 * Periodically clean up expired entries to prevent memory leaks.
 * Runs at most once per 60 seconds.
 */
let lastCleanup = 0;
const CLEANUP_INTERVAL_MS = 60_000;

function cleanupInMemoryStore(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanup = now;
  for (const [key, entry] of inMemoryStore) {
    if (now >= entry.resetTime) {
      inMemoryStore.delete(key);
    }
  }
}

function checkInMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  cleanupInMemoryStore();

  const now = Date.now();
  const key = `${config.identifier}:${identifier}`;
  const entry = inMemoryStore.get(key);

  // If no entry or window has expired, start a new window
  if (!entry || now >= entry.resetTime) {
    const resetTime = now + config.window * 1000;
    inMemoryStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: resetTime,
    };
  }

  // Increment count within current window
  entry.count += 1;

  if (entry.count > config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
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
 * Check rate limit for a request.
 * Uses Redis-backed Ratelimit when configured, otherwise falls back
 * to an in-memory rate limiter that enforces the same limits.
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.general,
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request);
  const ratelimiter = getRateLimiter(config);

  // Fall back to in-memory rate limiting when Redis is not configured
  if (!ratelimiter) {
    return checkInMemoryRateLimit(identifier, config);
  }

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
