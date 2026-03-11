import { describe, expect, it } from "vitest";
import { normalizeSearchQuery } from "@/lib/search/query-normalization";

describe("normalizeSearchQuery", () => {
  it("removes suffix words without regex interpolation", () => {
    expect(normalizeSearchQuery("Ibuprofen tablets")).toBe("ibuprofen");
  });

  it("normalizes common misspellings and aliases", () => {
    expect(normalizeSearchQuery("tylanol dose")).toBe("tylenol");
    expect(normalizeSearchQuery("ibuprofin capsule")).toBe("ibuprofen");
  });

  it("collapses multi-word variants to their standard form", () => {
    expect(normalizeSearchQuery("calcium carbonate pills")).toBe("calcium");
  });

  it("preserves non-suffix search terms", () => {
    expect(normalizeSearchQuery("Vitamin-D sleep support")).toBe(
      "vitamin d sleep support",
    );
  });
});
