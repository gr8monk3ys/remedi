/**
 * Health Check Endpoint
 *
 * Provides a comprehensive health check for monitoring services,
 * load balancers, and Kubernetes probes.
 *
 * Checks:
 * - Database connection (PostgreSQL)
 * - Redis connection (if configured)
 * - Stripe API (if configured)
 * - Overall system status
 *
 * @example GET /api/health
 * @example GET /api/health?verbose=true
 */

import { NextRequest, NextResponse } from "next/server";
import { isConnected } from "@/lib/db/client";
import { hasUpstashRedis, getUpstashRedisCredentials } from "@/lib/env";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { Redis } from "@upstash/redis";
import { isAdmin } from "@/lib/auth";

/**
 * Health check status for individual services
 */
interface ServiceHealth {
  status: "healthy" | "unhealthy" | "degraded" | "not_configured";
  latency?: number;
  message?: string;
  version?: string;
}

/**
 * Overall health check response
 */
interface HealthCheckResponse {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    stripe: ServiceHealth;
  };
}

/**
 * Check database health
 */
async function checkDatabase(): Promise<ServiceHealth> {
  const startTime = Date.now();
  try {
    const connected = await isConnected();
    const latency = Date.now() - startTime;

    if (connected) {
      return {
        status: "healthy",
        latency,
        message: "Database connection successful",
      };
    }

    return {
      status: "unhealthy",
      latency,
      message: "Database connection failed",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - startTime,
      message:
        error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

/**
 * Check Redis health (if configured)
 */
async function checkRedis(): Promise<ServiceHealth> {
  if (!hasUpstashRedis()) {
    return {
      status: "not_configured",
      message: "Redis not configured (Upstash credentials missing)",
    };
  }

  const startTime = Date.now();
  try {
    const { url, token } = getUpstashRedisCredentials();
    if (!url || !token) {
      return {
        status: "not_configured",
        message: "Redis credentials incomplete",
      };
    }

    const redis = new Redis({ url, token });
    await redis.ping();
    const latency = Date.now() - startTime;

    return {
      status: "healthy",
      latency,
      message: "Redis connection successful",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown Redis error",
    };
  }
}

/**
 * Check Stripe API health (if configured)
 */
async function checkStripe(): Promise<ServiceHealth> {
  if (!isStripeConfigured()) {
    return {
      status: "not_configured",
      message: "Stripe not configured (API keys missing)",
    };
  }

  const startTime = Date.now();
  try {
    const stripe = getStripe();
    // List a single customer to verify API connectivity
    await stripe.customers.list({ limit: 1 });
    const latency = Date.now() - startTime;

    return {
      status: "healthy",
      latency,
      message: "Stripe API connection successful",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown Stripe error",
    };
  }
}

/**
 * Determine overall health status based on service statuses
 */
function determineOverallStatus(
  services: HealthCheckResponse["services"],
): HealthCheckResponse["status"] {
  // Database is critical - if unhealthy, system is unhealthy
  if (services.database.status === "unhealthy") {
    return "unhealthy";
  }

  // Check for any degraded or unhealthy services (excluding not_configured)
  const configuredServices = Object.values(services).filter(
    (s) => s.status !== "not_configured",
  );

  const hasUnhealthy = configuredServices.some((s) => s.status === "unhealthy");
  const hasDegraded = configuredServices.some((s) => s.status === "degraded");

  if (hasUnhealthy) {
    return "degraded"; // Non-critical service is down
  }

  if (hasDegraded) {
    return "degraded";
  }

  return "healthy";
}

/**
 * Get application version from package.json or environment
 */
function getVersion(): string {
  return (
    process.env.npm_package_version ||
    process.env.NEXT_PUBLIC_SENTRY_RELEASE ||
    "0.1.0"
  );
}

/**
 * Get process uptime in seconds
 */
function getUptime(): number {
  return Math.floor(process.uptime());
}

/**
 * Health check handler
 *
 * GET /api/health - Basic health check (fast, suitable for load balancers)
 * GET /api/health?verbose=true - Detailed health check with service statuses
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const verbose = searchParams.get("verbose") === "true";

  // Simple health check response helper (used for public probes and non-admin fallback)
  const simpleHealthCheck = async (): Promise<NextResponse> => {
    try {
      const dbHealthy = await isConnected();
      if (dbHealthy) {
        return NextResponse.json(
          { status: "healthy", timestamp: new Date().toISOString() },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { status: "unhealthy", timestamp: new Date().toISOString() },
        { status: 503 },
      );
    } catch {
      return NextResponse.json(
        { status: "unhealthy", timestamp: new Date().toISOString() },
        { status: 503 },
      );
    }
  };

  // For simple health checks (load balancer probes), just check database
  if (!verbose) {
    return simpleHealthCheck();
  }

  // Verbose mode reveals infrastructure details -- restrict to admin users
  const admin = await isAdmin();
  if (!admin) {
    // Non-admin callers get the simple health check instead of an error,
    // so load balancers and monitoring tools are not disrupted.
    return simpleHealthCheck();
  }

  // Verbose health check - check all services in parallel
  const [database, redis, stripe] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkStripe(),
  ]);

  const services = { database, redis, stripe };
  const overallStatus = determineOverallStatus(services);

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: getVersion(),
    environment: process.env.NODE_ENV || "development",
    uptime: getUptime(),
    services,
  };

  // Return appropriate HTTP status code
  const httpStatus = overallStatus === "unhealthy" ? 503 : 200;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

/**
 * HEAD request for simple uptime monitoring
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    const dbHealthy = await isConnected();
    return new NextResponse(null, { status: dbHealthy ? 200 : 503 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
