/**
 * The CSP must name the third-party hosts this deployment actually uses.
 *
 * Both of these went wrong the same way. Clerk's script was blocked in
 * production because the policy listed only *.clerk.accounts.dev and
 * *.clerk.com while the publishable key pointed at clerk.lscaturchio.xyz —
 * sign-in failed and ClerkErrorBoundary swallowed it (#137). Sentry's browser
 * SDK shipped a real DSN and connect-src named no ingest host, so every error
 * event was blocked before it left the page.
 *
 * These tests import the real derivations. The previous version re-implemented
 * the Clerk one inside the test file and asserted against its own copy, so it
 * would have passed even if proxy.ts had been deleted.
 */

import { describe, it, expect } from "vitest";
import { clerkFrontendOrigin, sentryIngestOrigin } from "@/lib/csp-origins";

describe("clerkFrontendOrigin", () => {
  it("derives the custom domain the live key points at", () => {
    // This exact key is what production runs; it decodes to a host that
    // matched neither wildcard in the old policy.
    const origin = clerkFrontendOrigin(
      "pk_live_Y2xlcmsubHNjYXR1cmNoaW8ueHl6JA",
    );
    expect(origin).toBe("https://clerk.lscaturchio.xyz");
    expect(origin).not.toMatch(/clerk\.(com|accounts\.dev)$/);
  });

  it("still resolves a stock clerk.accounts.dev key", () => {
    const key = `pk_test_${Buffer.from("cheerful-cat-42.clerk.accounts.dev$").toString("base64")}`;
    expect(clerkFrontendOrigin(key)).toBe(
      "https://cheerful-cat-42.clerk.accounts.dev",
    );
  });

  it("returns null for a malformed key rather than injecting junk into the CSP", () => {
    expect(clerkFrontendOrigin("pk_live_not-base64!!")).toBeNull();
    expect(clerkFrontendOrigin("garbage")).toBeNull();
    expect(clerkFrontendOrigin(undefined)).toBeNull();
  });
});

describe("sentryIngestOrigin", () => {
  it("derives the ingest host from the DSN production actually ships", () => {
    // Taken from the live client bundle, where the DSN was found while
    // connect-src named no Sentry host at all.
    expect(
      sentryIngestOrigin(
        "https://b6ad8fd4501828a62942088ae1313017@o4510740601503744.ingest.us.sentry.io/4510915607068672",
      ),
    ).toBe("https://o4510740601503744.ingest.us.sentry.io");
  });

  it("keeps only the origin, never the project path or the public key", () => {
    const origin = sentryIngestOrigin(
      "https://abc123@o1.ingest.sentry.io/98765",
    );
    expect(origin).toBe("https://o1.ingest.sentry.io");
    expect(origin).not.toContain("98765");
    expect(origin).not.toContain("abc123");
  });

  it("refuses a plaintext DSN rather than downgrading the policy", () => {
    expect(sentryIngestOrigin("http://abc@o1.ingest.sentry.io/1")).toBeNull();
  });

  it("returns null for a malformed or absent DSN", () => {
    expect(sentryIngestOrigin("not a url")).toBeNull();
    expect(sentryIngestOrigin("")).toBeNull();
    expect(sentryIngestOrigin(undefined)).toBeNull();
  });
});
