import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getBaseUrl, PRODUCTION_URL } from "@/lib/url";

const KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_BASE_URL",
  "VERCEL_ENV",
  "VERCEL_URL",
] as const;

describe("getBaseUrl", () => {
  const saved: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

  beforeEach(() => {
    for (const key of KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("prefers NEXT_PUBLIC_APP_URL over everything", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://override.example";
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_URL = "remedi-abc123.vercel.app";
    expect(getBaseUrl()).toBe("https://override.example");
  });

  it("uses the canonical domain on a Vercel production deployment", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_URL = "remedi-abc123.vercel.app";
    expect(getBaseUrl()).toBe(PRODUCTION_URL);
    expect(PRODUCTION_URL).toBe("https://remedi.vivancedata.com");
  });

  it("keeps the deployment URL for preview deployments", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "remedi-git-branch.vercel.app";
    expect(getBaseUrl()).toBe("https://remedi-git-branch.vercel.app");
  });

  it("falls back to localhost with nothing set", () => {
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });
});
