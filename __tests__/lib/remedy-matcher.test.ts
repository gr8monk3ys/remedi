/**
 * Tests for the Remedy Mapping policy.
 *
 * This module decides what a generated Remedy Mapping is allowed to claim
 * about a drug. It is pure and needs no mocks, and until now it had no direct
 * test at all — the safety rules held only because the scorer happened to
 * return little. These tests assert the rules themselves.
 */

import { describe, it, expect } from "vitest";
import {
  buildRemedyMappingsFor,
  isNeverMapped,
  MIN_DISPLAY_SIMILARITY,
  NEVER_MAPPED,
  NEVER_ALTERNATIVE,
  type RemedyMatchCandidate,
} from "@/lib/remedy-matcher";
import type { ProcessedDrug } from "@/lib/types";

function drug(overrides: Partial<ProcessedDrug> = {}): ProcessedDrug {
  return {
    id: "d1",
    fdaId: "fda-1",
    name: "Testonium",
    description: "",
    category: "Analgesic",
    ingredients: ["curcumin", "piperine"],
    benefits: ["pain relief", "inflammation"],
    ...overrides,
  };
}

/** A candidate that overlaps the default drug on every axis, scoring 1.0. */
function twin(
  overrides: Partial<RemedyMatchCandidate> = {},
): RemedyMatchCandidate {
  return {
    id: "r1",
    name: "Testonium",
    description: "A remedy",
    imageUrl: null,
    category: "Analgesic",
    ingredients: ["curcumin", "piperine"],
    benefits: ["pain relief", "inflammation"],
    evidenceLevel: "strong",
    ...overrides,
  };
}

describe("never-mapped drugs", () => {
  it.each(Object.keys(NEVER_MAPPED))(
    "returns no mappings at all for %s",
    (name) => {
      const result = buildRemedyMappingsFor(drug({ name }), [twin()]);
      expect(result).toEqual([]);
    },
  );

  it("covers FDA-style name variants, not just the exact seed name", () => {
    expect(isNeverMapped({ name: "Warfarin Sodium", category: "" })).toBe(true);
    expect(isNeverMapped({ name: "WARFARIN", category: "" })).toBe(true);
    expect(
      isNeverMapped({
        name: "Oral Tablet",
        category: "Anticoagulant — warfarin",
      }),
    ).toBe(true);
  });

  it("does not suppress an unrelated drug", () => {
    expect(isNeverMapped({ name: "Ibuprofen", category: "NSAID" })).toBe(false);
    expect(buildRemedyMappingsFor(drug(), [twin()])).not.toEqual([]);
  });
});

describe("never-alternative drugs", () => {
  it.each([...NEVER_ALTERNATIVE])(
    "never labels a remedy Alternative for %s, even at a perfect score",
    (name) => {
      const result = buildRemedyMappingsFor(drug({ name }), [twin({ name })]);

      expect(result.length).toBeGreaterThan(0);
      expect(result.map((r) => r.replacementType)).not.toContain("Alternative");
    },
  );

  it("still allows a lesser label rather than dropping the mapping", () => {
    const result = buildRemedyMappingsFor(drug({ name: "Tramadol" }), [
      twin({ name: "Tramadol" }),
    ]);
    expect(result[0]?.replacementType).toBe("Complementary");
  });
});

describe("high-risk downgrade", () => {
  it.each([
    ["anticoagulant", "warnings"],
    ["chemotherapy", "warnings"],
    ["antiretroviral", "interactions"],
    ["immunosuppressant", "interactions"],
    ["transplant", "description"],
  ])("forces Supportive when %s appears in %s", (keyword, field) => {
    const result = buildRemedyMappingsFor(
      drug({
        [field]: `Caution: ${keyword} therapy`,
      } as Partial<ProcessedDrug>),
      [twin()],
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((r) => r.replacementType === "Supportive")).toBe(true);
  });
});

describe("labelling", () => {
  it("always sets a replacementType", () => {
    const result = buildRemedyMappingsFor(drug(), [
      twin(),
      twin({ id: "r2", name: "Partial", benefits: ["pain relief"] }),
    ]);

    expect(result.length).toBeGreaterThan(0);
    for (const remedy of result) {
      expect(["Alternative", "Complementary", "Supportive"]).toContain(
        remedy.replacementType,
      );
    }
  });

  it("labels a perfect overlap an Alternative for an ordinary drug", () => {
    const result = buildRemedyMappingsFor(drug(), [twin()]);
    expect(result[0]?.replacementType).toBe("Alternative");
  });
});

describe("scoring contract", () => {
  it("drops candidates below the display floor", () => {
    const unrelated = twin({
      id: "r9",
      name: "Zzz",
      category: "Sleep",
      ingredients: ["valerian"],
      benefits: ["sleep quality"],
      evidenceLevel: null,
    });

    const result = buildRemedyMappingsFor(drug(), [unrelated]);
    expect(result).toEqual([]);
  });

  it("respects an explicit minScore above the default", () => {
    const result = buildRemedyMappingsFor(drug(), [twin()], { minScore: 1.1 });
    expect(result).toEqual([]);
  });

  it("honours the limit and sorts by score descending", () => {
    const candidates = [
      twin({ id: "a", benefits: ["pain relief"] }),
      twin({ id: "b" }),
      twin({ id: "c", benefits: ["inflammation"] }),
    ];

    const result = buildRemedyMappingsFor(drug(), candidates, { limit: 2 });

    expect(result).toHaveLength(2);
    expect(result[0]!.similarityScore).toBeGreaterThanOrEqual(
      result[1]!.similarityScore,
    );
    expect(result[0]!.id).toBe("b");
  });

  it("keeps every returned score at or above the display floor", () => {
    const result = buildRemedyMappingsFor(drug(), [
      twin(),
      twin({ id: "r2", benefits: ["pain relief"] }),
    ]);

    for (const remedy of result) {
      expect(remedy.similarityScore).toBeGreaterThanOrEqual(
        MIN_DISPLAY_SIMILARITY,
      );
    }
  });
});
