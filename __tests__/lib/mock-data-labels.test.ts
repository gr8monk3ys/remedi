/**
 * Every result a user can see carries its claim-limiting label.
 *
 * The demo catalogue is served by /api/search whenever isDemoDataEnabled() is
 * true, and its entries had a similarityScore with no replacementType — so a
 * demo result rendered a relevance bar with no badge beside it, which is the
 * least cautious presentation available.
 *
 * Demo rows are labelled "Supportive" on purpose: fabricated data must never
 * present itself as a candidate substitute for a medication.
 */

import { describe, it, expect } from "vitest";
import { MOCK_REMEDY_MAPPINGS } from "@/lib/mock-data";

const VOCABULARY = ["Alternative", "Complementary", "Supportive"];

describe("demo remedy mappings", () => {
  it("is not empty, so the assertions below mean something", () => {
    const all = Object.values(MOCK_REMEDY_MAPPINGS).flat();
    expect(all.length).toBeGreaterThan(0);
  });

  it("labels every entry with a replacement type", () => {
    for (const [drugId, remedies] of Object.entries(MOCK_REMEDY_MAPPINGS)) {
      for (const remedy of remedies) {
        expect(
          remedy.replacementType,
          `demo mapping ${drugId} -> ${remedy.name} has no replacement type`,
        ).toBeTruthy();
      }
    }
  });

  it("uses only the three labels the vocabulary allows", () => {
    for (const remedy of Object.values(MOCK_REMEDY_MAPPINGS).flat()) {
      expect(VOCABULARY).toContain(remedy.replacementType);
    }
  });

  it("never lets demo data claim to be an Alternative", () => {
    for (const remedy of Object.values(MOCK_REMEDY_MAPPINGS).flat()) {
      expect(
        remedy.replacementType,
        `${remedy.name} is fabricated data claiming to substitute for a medication`,
      ).toBe("Supportive");
    }
  });
});
