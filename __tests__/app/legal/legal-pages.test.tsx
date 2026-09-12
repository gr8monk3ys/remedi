/**
 * Legal pages must disclose what the product actually collects, and must not
 * claim to have been updated today, every day.
 *
 * The privacy policy contained zero mentions of health profile, medication,
 * journal, symptoms, allergies or conditions — the GDPR Article 9 data the
 * dashboard collects through live forms. And all three pages rendered
 * `new Date()`, so the "Last updated" signal that section 9 promises to use
 * was permanently on and therefore meaningless.
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import PrivacyPage from "@/app/legal/privacy/page";
import TermsPage from "@/app/legal/terms/page";
import DisclaimerPage from "@/app/legal/disclaimer/page";

describe("privacy policy", () => {
  // Assert against the page's text rather than getByText: several of these
  // phrases now legitimately appear more than once, and a duplicate-match
  // error would look like a missing disclosure.
  const text = (): string =>
    render(<PrivacyPage />).container.textContent ?? "";

  it("names each category of health data the product collects", () => {
    const t = text();
    for (const term of [
      "allergies",
      "medical conditions",
      "Medication cabinet",
      "symptoms",
      "mood",
    ]) {
      expect(t.toLowerCase()).toContain(term.toLowerCase());
    }
  });

  it("states that health data is special category and names the legal basis", () => {
    const t = text();
    expect(t).toContain("special category data");
    expect(t).toContain("Article 9");
    expect(t).toContain("explicit consent");
  });

  it("promises not to sell health data or train models on it", () => {
    const t = text();
    expect(t).toContain("do not sell it");
    expect(t).toContain("train any model");
  });

  it("discloses Google Analytics and that it is gated on consent", () => {
    // The banner already gates it; the policy previously mentioned only
    // Plausible and claimed analytics needed no consent in most jurisdictions.
    const t = text();
    expect(t).toContain("Google Analytics");
    expect(t).toContain("only if you accept");
    expect(t).not.toContain("do not require consent");
  });

  it("says session replay is off rather than staying silent about it", () => {
    expect(text()).toContain("do not record your screen");
  });
});

describe("every legal page's last-updated date", () => {
  for (const [name, Page] of [
    ["privacy", PrivacyPage],
    ["terms", TermsPage],
    ["disclaimer", DisclaimerPage],
  ] as const) {
    it(`${name} does not move with the clock`, () => {
      // The property that matters is stability, not the value. Asserting
      // "not today" would itself be time-dependent, and would fail on the very
      // day a document is genuinely revised. Rendering under two wildly
      // different clocks and comparing the whole page catches `new Date()`
      // wherever it appears.
      vi.useFakeTimers();
      try {
        vi.setSystemTime(new Date("2027-04-01T12:00:00Z"));
        const first = render(<Page />);
        const a = first.container.textContent ?? "";
        first.unmount();

        vi.setSystemTime(new Date("2031-11-30T12:00:00Z"));
        const second = render(<Page />);
        const b = second.container.textContent ?? "";
        second.unmount();

        expect(a).toContain("Last updated:");
        expect(a).toBe(b);
      } finally {
        vi.useRealTimers();
      }
    });
  }
});
