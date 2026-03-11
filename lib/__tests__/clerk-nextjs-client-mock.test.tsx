import { describe, expect, it } from "vitest";
import { sanitizeRedirectPath } from "../e2e/clerk-nextjs-client-mock";

describe("clerk-nextjs-client-mock", () => {
  it("uses a safe default when redirect_url points off-origin", () => {
    expect(sanitizeRedirectPath("https://evil.example/phish")).toBe("/");
  });

  it("preserves same-origin relative redirects", () => {
    expect(sanitizeRedirectPath("/pricing?plan=premium#compare")).toBe(
      "/pricing?plan=premium#compare",
    );
  });

  it("sanitizes non-http schemes the same way", () => {
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/");
  });
});
