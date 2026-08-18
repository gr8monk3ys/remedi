/**
 * Prisma Client Singleton
 *
 * Provides a singleton PrismaClient instance optimized for both development
 * and production environments.
 *
 * Features:
 * - Singleton pattern prevents connection exhaustion during hot reloading
 * - Production-optimized connection pooling configuration
 * - Graceful shutdown handling
 * - Query logging in development
 *
 * PostgreSQL Connection Pooling:
 * - For serverless (Vercel, Netlify): Use Prisma Data Proxy or external pooler
 * - For traditional servers: Connection pool is managed by Prisma
 * - For high-load: Consider pgBouncer (see docker-compose.yml)
 *
 * IMPORTANT: This module is server-only and cannot be imported in client components.
 */

import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Extend global type for development singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
};

/**
 * Prisma Client Configuration
 *
 * In development: Enable query logging for debugging
 * In production: Minimal logging, optimized for performance
 */
function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl =
    process.env.DATABASE_URL ||
    (process.env.NODE_ENV === "test"
      ? "postgresql://test:test@localhost:5432/test"
      : undefined);

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to initialize Prisma Client.");
  }

  const pool =
    globalForPrisma.prismaPool ??
    new Pool({
      connectionString: databaseUrl,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

  if (!isProduction) {
    globalForPrisma.prismaPool = pool;
  }

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: isProduction ? ["error", "warn"] : ["query", "error", "warn"],
    // Connection pool settings are configured via DATABASE_URL query params
    // Example: ?connection_limit=10&pool_timeout=20
  });
}

/**
 * Singleton Prisma Client
 *
 * In development: Reuses the same instance across hot reloads
 * In production: Creates a new instance (singleton per process)
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Store in global for development hot reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Disconnect Prisma client
 *
 * Use this for graceful shutdown in serverless functions or tests.
 * Not typically needed in long-running servers (Next.js API routes).
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Health check for database connection
 *
 * Useful for:
 * - Kubernetes readiness probes
 * - Load balancer health checks
 * - Monitoring systems
 *
 * @returns true if connected, false otherwise
 */
export async function isConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Handle process termination gracefully
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
