import { beforeAll, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Set DATABASE_URL at module level — before test files are imported and before
// lib/db/client.ts creates its singleton. setupFiles module-level code runs
// before any test file import, so this guarantees the correct URL is used.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

// Mock server-only FIRST before any imports that use it
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: null }),
  currentUser: vi.fn().mockResolvedValue(null),
  clerkClient: vi
    .fn()
    .mockResolvedValue({ users: { updateUserMetadata: vi.fn() } }),
  clerkMiddleware: vi.fn(),
  createRouteMatcher: vi.fn(() => () => false),
}));
vi.mock("@/lib/email", () => ({
  sendContributionApproved: vi.fn().mockResolvedValue(undefined),
  sendContributionRejected: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/analytics/user-events", () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/analytics/conversion-events", () => ({
  trackTrialStarted: vi.fn().mockResolvedValue(undefined),
  EVENT_SOURCES: { API: "api" },
}));
vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: vi.fn().mockResolvedValue({ allowed: true, response: null }),
  RATE_LIMITS: { contributions: {}, adminActions: {}, trialStart: {} },
}));
vi.mock("@/lib/email/config", () => ({
  getEmailUrl: vi.fn((path: string) => "http://localhost:3000" + path),
}));
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Use module-level variables; assigned in beforeAll.
let pool: Pool;
export let prisma: PrismaClient;

beforeAll(async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL or TEST_DATABASE_URL must be set for integration tests",
    );
  }
  // Mirror lib/db/client.ts: use PrismaPg adapter (required by Prisma v7 + pg driver).
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  await prisma.$connect();
});

afterAll(async () => {
  await prisma?.$disconnect();
  await pool?.end();
});

let userCounter = 0;
export async function createTestUser(
  overrides: {
    email?: string;
    name?: string;
    role?: "user" | "admin";
  } = {},
) {
  const uniqueEmail =
    overrides.email ?? `test-${Date.now()}-${++userCounter}@integration.test`;
  return prisma.user.create({
    data: {
      email: uniqueEmail,
      name: overrides.name ?? "Test User",
      role: (overrides.role ?? "user") as "user" | "admin",
    },
  });
}
