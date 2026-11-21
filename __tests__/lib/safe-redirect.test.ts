import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-redirect";

describe("safeRedirectPath", () => {
  it("uses a safe default when redirect_url points off-origin", () => {
    expect(safeRedirectPath("https://evil.example/phish")).toBe("/");
    expect(safeRedirectPath("//evil.example/phish")).toBe("/");
    expect(safeRedirectPath("/\\evil.example")).toBe("/");
  });

  it("preserves same-origin relative redirects", () => {
    expect(safeRedirectPath("/pricing?plan=premium#compare")).toBe(
      "/pricing?plan=premium#compare",
    );
  });

  it("sanitizes non-http schemes the same way", () => {
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/");
  });

  it("falls back to / when there is nothing to redirect to", () => {
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath("")).toBe("/");
  });
});
