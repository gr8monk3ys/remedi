import { afterEach, describe, expect, it, vi } from "vitest";

import {
  sentryEnabled,
  sentryEnvironment,
  sentryEnvironmentTag,
} from "@/lib/sentry-gate";

const DSN = "https://public@o0.ingest.example.invalid/1";

function setVercelEnv(value: string | undefined): void {
  // Both spellings: the browser bundle reads the NEXT_PUBLIC_ alias, the
  // server reads the raw one.
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", value as string);
  vi.stubEnv("VERCEL_ENV", value as string);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sentryEnabled", () => {
  it("stays shut on a local production build", () => {
    // The case that burned 36% of the shared org error quota: NODE_ENV is
    // "production" for `next build && next start`, so every NODE_ENV-based
    // guard in the SDK config passes, and there is no VERCEL_ENV.
    setVercelEnv(undefined);
    vi.stubEnv("NODE_ENV", "production");

    expect(sentryEnabled(DSN)).toBe(false);
  });

  it("stays shut in local development", () => {
    setVercelEnv(undefined);
    vi.stubEnv("NODE_ENV", "development");

    expect(sentryEnabled(DSN)).toBe(false);
  });

  it("stays shut for Vercel's own development environment", () => {
    // `vercel dev` sets VERCEL_ENV=development — still a laptop.
    setVercelEnv("development");

    expect(sentryEnabled(DSN)).toBe(false);
  });

  it("opens on a production deploy", () => {
    setVercelEnv("production");

    expect(sentryEnabled(DSN)).toBe(true);
    expect(sentryEnvironmentTag()).toBe("production");
  });

  it("opens on a preview deploy, tagged apart from production", () => {
    setVercelEnv("preview");

    expect(sentryEnabled(DSN)).toBe(true);
    expect(sentryEnvironment()).toBe("preview");
    expect(sentryEnvironmentTag()).toBe("preview");
  });

  it("stays shut without a DSN, deployed or not", () => {
    setVercelEnv("production");

    expect(sentryEnabled(undefined)).toBe(false);
    expect(sentryEnabled("")).toBe(false);
  });

  it("can be forced on locally for deliberate testing", () => {
    setVercelEnv(undefined);
    vi.stubEnv("NEXT_PUBLIC_SENTRY_FORCE_ENABLE", "1");

    expect(sentryEnabled(DSN)).toBe(true);
  });

  it("can be forced off on a deploy, which beats everything else", () => {
    setVercelEnv("production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_FORCE_ENABLE", "1");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_FORCE_DISABLE", "1");

    expect(sentryEnabled(DSN)).toBe(false);
  });
});
