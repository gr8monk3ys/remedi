/**
 * The CSP must name the third-party hosts this deployment actually uses.
 *
 * Sentry's browser SDK shipped a real DSN and connect-src named no ingest host,
 * so every error event was blocked before it left the page. These tests import
 * the real derivation rather than a copy of it.
 */

import { describe, it, expect } from "vitest";
import { sentryIngestOrigin } from "@/lib/csp-origins";

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
