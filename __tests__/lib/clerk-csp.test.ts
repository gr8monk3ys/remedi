/**
 * The CSP must allow the Clerk domain this deployment actually uses.
 *
 * Production allowed only *.clerk.accounts.dev and *.clerk.com, while the
 * publishable key pointed at the custom domain clerk.lscaturchio.xyz. Clerk's
 * script was blocked, it retried and failed, and ClerkErrorBoundary swallowed
 * the error and rendered the signed-out view — so sign-in was broken and
 * nothing said so.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** Mirrors the derivation in proxy.ts. */
function decodeFrontendOrigin(key: string | undefined): string | null {
  if (!key) return null;
  const encoded = key.split("_").slice(2).join("_");
  if (!encoded) return null;
  try {
    const host = Buffer.from(encoded, "base64")
      .toString("utf8")
      .replace(/\$$/, "");
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host) ? `https://${host}` : null;
  } catch {
    return null;
  }
}

beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllEnvs());

describe("Clerk CSP origin", () => {
  it("derives the custom domain the live key points at", () => {
    // This exact key is what production runs; it decodes to a host that
    // matched neither wildcard in the old policy.
    const origin = decodeFrontendOrigin(
      "pk_live_Y2xlcmsubHNjYXR1cmNoaW8ueHl6JA",
    );
    expect(origin).toBe("https://clerk.lscaturchio.xyz");
    expect(origin).not.toMatch(/clerk\.(com|accounts\.dev)$/);
  });

  it("returns null for a malformed key rather than injecting junk into the CSP", () => {
    expect(decodeFrontendOrigin("pk_live_not-base64!!")).toBeNull();
    expect(decodeFrontendOrigin("garbage")).toBeNull();
    expect(decodeFrontendOrigin(undefined)).toBeNull();
  });

  it("still resolves a stock clerk.accounts.dev key", () => {
    const key = `pk_test_${Buffer.from("cheerful-cat-42.clerk.accounts.dev$").toString("base64")}`;
    expect(decodeFrontendOrigin(key)).toBe(
      "https://cheerful-cat-42.clerk.accounts.dev",
    );
  });
});
