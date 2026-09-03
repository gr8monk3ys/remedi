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
import type { NaturalRemedy, ProcessedDrug } from "@/lib/types";

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

/**
 * The mappings a drug may carry, failing loudly if the policy refused it.
 *
 * buildRemedyMappingsFor returns an outcome now: a refusal for a never-mapped
 * drug is a different arm from "nothing scored high enough". Tests about
 * labelling want the data, and want a refusal to be an obvious test failure
 * rather than a silently empty array.
 */
function mappings(
  ...args: Parameters<typeof buildRemedyMappingsFor>
): NaturalRemedy[] {
  const outcome = buildRemedyMappingsFor(...args);
  if (outcome.kind !== "known") {
    throw new Error(`expected mappings, got a refusal: ${outcome.message}`);
  }
  return outcome.data;
}

describe("never-mapped drugs", () => {
  it.each(Object.keys(NEVER_MAPPED))(
    "refuses %s outright rather than returning an empty list",
    (name) => {
      const outcome = buildRemedyMappingsFor(drug({ name }), [twin()]);
      expect(outcome.kind).toBe("unknown");
      if (outcome.kind !== "unknown") throw new Error("unreachable");
      expect(outcome.reason).toBe("never-mapped");
      expect(outcome.message).not.toBe("");
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
    expect(mappings(drug(), [twin()])).not.toEqual([]);
  });
});

describe("never-alternative drugs", () => {
  it.each([...NEVER_ALTERNATIVE])(
    "never labels a remedy Alternative for %s, even at a perfect score",
    (name) => {
      const result = mappings(drug({ name }), [twin({ name })]);

      expect(result.length).toBeGreaterThan(0);
      expect(result.map((r) => r.replacementType)).not.toContain("Alternative");
    },
  );

  it("still allows a lesser label rather than dropping the mapping", () => {
    const result = mappings(drug({ name: "Tramadol" }), [
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
    const result = mappings(
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
    const result = mappings(drug(), [
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
    const result = mappings(drug(), [twin()]);
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

    const result = mappings(drug(), [unrelated]);
    expect(result).toEqual([]);
  });

  it("respects an explicit minScore above the default", () => {
    const result = mappings(drug(), [twin()], { minScore: 1.1 });
    expect(result).toEqual([]);
  });

  it("honours the limit and sorts by score descending", () => {
    const candidates = [
      twin({ id: "a", benefits: ["pain relief"] }),
      twin({ id: "b" }),
      twin({ id: "c", benefits: ["inflammation"] }),
    ];

    const result = mappings(drug(), candidates, { limit: 2 });

    expect(result).toHaveLength(2);
    expect(result[0]!.similarityScore).toBeGreaterThanOrEqual(
      result[1]!.similarityScore,
    );
    expect(result[0]!.id).toBe("b");
  });

  it("keeps every returned score at or above the display floor", () => {
    const result = mappings(drug(), [
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
