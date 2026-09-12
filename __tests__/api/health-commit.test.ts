/**
 * The public health response must say which commit it is.
 *
 * On 2026-09-11 Vercel's git integration stopped creating deployments. Seven
 * commits merged to main, CI was green on all of them, and production served
 * twenty-hour-old code for twenty hours. Nothing noticed, because nothing
 * anywhere stated which commit production was actually running.
 *
 * .github/workflows/deploy-check.yml reads this field back after every push to
 * main and fails when it does not catch up.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db/client", () => ({ isConnected: vi.fn(async () => true) }));
vi.mock("@/lib/env", () => ({
  hasUpstashRedis: () => false,
  getUpstashRedisCredentials: () => null,
}));
vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: () => false,
  getStripe: () => ({}),
}));
vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@/lib/auth", () => ({ isAdmin: vi.fn(async () => false) }));

import { isConnected } from "@/lib/db/client";

const ORIGINAL = process.env.VERCEL_GIT_COMMIT_SHA;

const probe = async (): Promise<Response> => {
  const { GET } = await import("@/app/api/health/route");
  return GET(new NextRequest("http://localhost:3000/api/health"));
};

describe("public health probe", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.VERCEL_GIT_COMMIT_SHA;
    else process.env.VERCEL_GIT_COMMIT_SHA = ORIGINAL;
  });

  it("reports the commit the deployment was built from", async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "abc123def456";
    vi.mocked(isConnected).mockResolvedValue(true);

    const body = await (await probe()).json();

    expect(body.status).toBe("healthy");
    expect(body.commit).toBe("abc123def456");
  });

  it("reports null rather than a wrong commit when the build had no git metadata", async () => {
    // Guessing here would let the drift check pass against an unknown build.
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    vi.mocked(isConnected).mockResolvedValue(true);

    const body = await (await probe()).json();

    expect(body.commit).toBeNull();
  });

  it("still fails closed when the database is unreachable", async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "abc123def456";
    vi.mocked(isConnected).mockResolvedValue(false);

    const response = await probe();

    expect(response.status).toBe(503);
    expect((await response.json()).status).toBe("unhealthy");
  });
});
