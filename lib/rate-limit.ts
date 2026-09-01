/**
 * Rate Limiting
 *
 * Thin app-specific layer over `@gr8monk3ys/next-kit/rate-limit`. This module
 * owns the things that are remedi's: the per-endpoint limits, the response
 * shape our routes already destructure, and the Sentry breadcrumb. The window
 * accounting, the store implementations and the client-identifier rules live in
 * the kit.
 *
 * Uses Upstash Redis for distributed rate limiting that works across serverless
 * functions. Falls back to an in-memory limiter when Redis is not configured,
 * or when Redis is configured but unreachable.
 */

import {
  createRateLimiter,
  getClientId,
  MemoryStore,
  RedisStore,
  type RateLimiter,
  type RateLimitStore,
} from "@gr8monk3ys/next-kit/rate-limit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { hasUpstashRedis, getUpstashRedisCredentials } from "@/lib/env";
import { createLogger } from "@/lib/logger";

const logger = createLogger("rate-limit");

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

type RateLimitSource = "upstash" | "in-memory";

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

  // Admin actions: 20 requests per minute (protects against automation on sensitive endpoints)
  adminActions: { limit: 20, window: 60, identifier: "admin-actions" },
} as const;

/**
 * Check if Upstash Redis is configured
 */
export function isRateLimitEnabled(): boolean {
  return hasUpstashRedis();
}

/**
 * Module-level singleton Redis store.
 *
 * The Upstash REST client already satisfies the kit's `RedisLike` shape
 * (`incr` / `pexpire` / `pttl` / `del`), so no adapter is needed. Created once
 * and reused across all requests to avoid connection churn.
 */
let redisStore: RateLimitStore | null = null;

function getRedisStore(): RateLimitStore | null {
  if (redisStore) return redisStore;
  if (!isRateLimitEnabled()) return null;

  const { url, token } = getUpstashRedisCredentials();
  if (!url || !token) return null;

  redisStore = new RedisStore(new Redis({ url, token }), {
    prefix: "remedi:ratelimit:",
    // Surface the failure to checkRateLimit so it can fall back to the
    // in-memory limiter, which still enforces the configured limits per
    // instance, rather than failing open entirely.
    onError: "closed",
  });
  return redisStore;
}

/**
 * In-memory fallback for when Redis is not configured or is unreachable.
 * Does not persist across serverless cold starts, which is acceptable as a
 * degraded-but-still-protective fallback.
 */
const memoryStore = new MemoryStore();

/**
 * Caches of limiter instances keyed by identifier + limit + window, so a new
 * one is not built per request.
 */
const redisLimiters = new Map<string, RateLimiter>();
const memoryLimiters = new Map<string, RateLimiter>();

function getLimiter(
  cache: Map<string, RateLimiter>,
  store: RateLimitStore,
  config: RateLimitConfig,
): RateLimiter {
  const cacheKey = `${config.identifier}:${config.limit}:${config.window}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const limiter = createRateLimiter({
    store,
    limit: config.limit,
    windowMs: config.window * 1000,
    prefix: config.identifier,
  });
  cache.set(cacheKey, limiter);
  return limiter;
}

/**
 * Get client identifier for rate limiting.
 *
 * Prefers headers the platform sets itself and a client cannot forge, then the
 * RIGHT-most `x-forwarded-for` entry (the hop our own edge appended — taking
 * `[0]` would let anyone mint a fresh bucket per request by rotating the
 * header), then a session cookie so unidentified callers get their own bucket
 * instead of sharing one global "anonymous" bucket that any single client could
 * exhaust for everyone.
 */
export function getClientIdentifier(request: NextRequest): string {
  return getClientId(request, {
    sessionCookieNames: ["sessionId", "__session"],
    fallback: "anonymous",
  });
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
  source?: RateLimitSource;
}

async function check(
  cache: Map<string, RateLimiter>,
  store: RateLimitStore,
  source: RateLimitSource,
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const result = await getLimiter(cache, store, config).check(identifier);

  return {
    success: result.ok,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.resetAt,
    retryAfter: result.retryAfter,
    source,
  };
}

/**
 * Check rate limit for a request.
 * Uses the Redis-backed store when configured, otherwise falls back
 * to an in-memory store that enforces the same limits.
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.general,
): Promise<RateLimitResult> {
  const identifier = getClientIdentifier(request);
  const store = getRedisStore();

  if (!store) {
    return check(memoryLimiters, memoryStore, "in-memory", identifier, config);
  }

  try {
    return await check(redisLimiters, store, "upstash", identifier, config);
  } catch (error) {
    // An Upstash outage must not turn every request into a 500. Fall back to
    // the in-memory limiter, which still enforces the configured limits
    // (per instance) rather than failing open entirely.
    logger.error("Rate limiter unavailable, falling back to in-memory", error);
    return check(memoryLimiters, memoryStore, "in-memory", identifier, config);
  }
}

function inferAIContext(identifier: string): {
  provider: string;
  model: string;
} | null {
  if (identifier === RATE_LIMITS.aiSearch.identifier) {
    return {
      provider: "openai",
      model: "gpt-4-turbo-preview",
    };
  }

  return null;
}

function captureRateLimitExceeded(
  request: NextRequest,
  config: RateLimitConfig,
  result: RateLimitResult,
): void {
  if (process.env.NODE_ENV !== "production") return;

  const endpoint = request.nextUrl.pathname;
  const retryAfter =
    result.retryAfter ??
    Math.max(Math.ceil((result.reset - Date.now()) / 1000), 0);
  const aiContext = inferAIContext(config.identifier);

  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.withScope((scope) => {
        scope.setLevel("warning");
        scope.setTag("http.method", request.method);
        scope.setTag("http.route", endpoint);
        scope.setTag("rate_limit.identifier", config.identifier);
        scope.setTag("rate_limit.source", result.source ?? "unknown");

        if (aiContext) {
          scope.setTag("ai.provider", aiContext.provider);
          scope.setTag("ai.model", aiContext.model);
        }

        scope.setContext("rate_limit", {
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          retryAfter,
          endpoint,
        });

        Sentry.captureMessage("API rate limit exceeded");
      });
    })
    .catch(() => {
      // Ignore Sentry transport/load failures.
    });
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
        statusCode: 429,
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
    captureRateLimitExceeded(request, config, result);

    return {
      allowed: false,
      response: rateLimitExceededResponse(result),
      result,
    };
  }

  return { allowed: true, result };
}
