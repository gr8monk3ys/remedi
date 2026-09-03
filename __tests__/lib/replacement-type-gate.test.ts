/**
 * A Remedy Mapping's Replacement Type must be a decision the policy made, and
 * a refusal to map must not look like an absence of matches.
 *
 * Two failure modes are under test:
 *
 * 1. The policy returned a bare array, so "we deliberately withhold remedies
 *    for this anticoagulant" and "nothing scored high enough" were the same
 *    empty value.
 * 2. `replacementType` was a plain optional string at every boundary, so the
 *    three-value union the policy guarantees was erased the moment a mapping
 *    round-tripped through the database — and a missing label renders as no
 *    badge at all, the least cautious presentation available.
 */

import { describe, it, expect } from "vitest";
import {
  buildRemedyMappingsFor,
  parseReplacementType,
  neverMappedReason,
  MIN_DISPLAY_SIMILARITY,
} from "@/lib/remedy-matcher";
import { known, unknown, dataOr, type Outcome } from "@/lib/outcome";
import type { ProcessedDrug } from "@/lib/types";

const anticoagulant: ProcessedDrug = {
  id: "d1",
  fdaId: "d1",
  name: "COUMADIN",
  genericName: "WARFARIN SODIUM",
  category: "HUMAN PRESCRIPTION DRUG LABEL",
  description: "",
  ingredients: ["warfarin sodium"],
  benefits: ["anticoagulation"],
};

const ordinary: ProcessedDrug = {
  id: "d2",
  fdaId: "d2",
  name: "ADVIL",
  genericName: "IBUPROFEN",
  category: "HUMAN PRESCRIPTION DRUG LABEL",
  description: "",
  ingredients: ["ibuprofen"],
  benefits: ["pain relief", "inflammation"],
};

const candidates = [
  {
    id: "r1",
    name: "Turmeric",
    description: null,
    imageUrl: null,
    category: "Herb",
    ingredients: ["curcumin"],
    benefits: ["pain relief", "inflammation"],
    evidenceLevel: "Strong",
  },
];

describe("a refusal is not an empty result", () => {
  it("refuses an anticoagulant with a stated reason", () => {
    const outcome = buildRemedyMappingsFor(anticoagulant, candidates, {
      minScore: 0,
    });

    expect(outcome.kind).toBe("unknown");
    if (outcome.kind !== "unknown") throw new Error("unreachable");
    expect(outcome.reason).toBe("never-mapped");
    // The reason NEVER_MAPPED has always recorded, now actually reachable.
    expect(outcome.message).toMatch(/anticoagulant/i);
  });

  it("reports no matches as a known, empty answer", () => {
    // Nothing in the catalogue overlaps this drug, so the honest answer is
    // "we looked and found none" — a different arm from a refusal.
    const outcome = buildRemedyMappingsFor(
      { ...ordinary, benefits: ["nothing overlaps this"] },
      candidates,
    );

    expect(outcome.kind).toBe("known");
    expect(dataOr(outcome, [{ id: "sentinel" }] as never)).toEqual([]);
  });

  it("distinguishes the two arms — the whole point", () => {
    const refused = buildRemedyMappingsFor(anticoagulant, candidates, {
      minScore: 0,
    });
    const empty = buildRemedyMappingsFor(
      { ...ordinary, benefits: ["nothing overlaps this"] },
      candidates,
    );

    expect(refused.kind).not.toBe(empty.kind);
    // Both collapse to [] if a caller reaches for the data and ignores kind,
    // which is exactly why callers must branch on kind first.
    expect(dataOr(refused, [])).toEqual(dataOr(empty, []));
  });

  it("returns mappings for a drug the policy permits", () => {
    const outcome = buildRemedyMappingsFor(ordinary, candidates, {
      minScore: 0,
    });

    expect(outcome.kind).toBe("known");
    if (outcome.kind !== "known") throw new Error("unreachable");
    expect(outcome.data.length).toBeGreaterThan(0);
  });
});

describe("every produced mapping carries a Replacement Type", () => {
  it("never yields a mapping without one", () => {
    const outcome = buildRemedyMappingsFor(ordinary, candidates, {
      minScore: 0,
    });
    if (outcome.kind !== "known") throw new Error("unreachable");

    for (const mapping of outcome.data) {
      expect(["Alternative", "Complementary", "Supportive"]).toContain(
        mapping.replacementType,
      );
    }
  });

  it("applies the display floor by default", () => {
    const outcome = buildRemedyMappingsFor(ordinary, candidates);
    if (outcome.kind !== "known") throw new Error("unreachable");

    for (const mapping of outcome.data) {
      expect(mapping.similarityScore).toBeGreaterThanOrEqual(
        MIN_DISPLAY_SIMILARITY,
      );
    }
  });
});

describe("parseReplacementType degrades to the weakest claim", () => {
  it.each(["Alternative", "Complementary", "Supportive"] as const)(
    "passes %s through unchanged",
    (value) => {
      expect(parseReplacementType(value)).toBe(value);
    },
  );

  it.each([
    [null, "a row that predates the column being required"],
    [undefined, "an absent value"],
    ["", "an empty string"],
    ["LegacyLabel", "a label from an older vocabulary"],
    ["alternative", "the right word in the wrong case"],
    [42, "a value of the wrong type entirely"],
  ])("coerces %s (%s) to Supportive", (value) => {
    expect(parseReplacementType(value)).toBe("Supportive");
  });

  it("never throws, whatever it is given", () => {
    // A page must not 500 over one stale row.
    expect(() => parseReplacementType(Symbol("x"))).not.toThrow();
    expect(() => parseReplacementType({ nested: true })).not.toThrow();
  });
});

describe("neverMappedReason surfaces the rule's own words", () => {
  it("returns null for a drug the policy permits", () => {
    expect(neverMappedReason(ordinary)).toBeNull();
  });

  it("returns the recorded reason for a refused drug", () => {
    expect(neverMappedReason(anticoagulant)).toMatch(/bleeding risk/i);
  });
});

describe("the Outcome union itself", () => {
  it("carries data on the known arm", () => {
    const o: Outcome<number[], "nope"> = known([1, 2]);
    expect(o).toEqual({ kind: "known", data: [1, 2] });
  });

  it("carries a reason and message on the unknown arm", () => {
    const o: Outcome<number[], "nope"> = unknown("nope", "because");
    expect(o).toEqual({ kind: "unknown", reason: "nope", message: "because" });
  });

  it("dataOr returns the fallback only for unknown", () => {
    expect(dataOr(known([1]), [9])).toEqual([1]);
    expect(dataOr(unknown<number[], "nope">("nope", "m"), [9])).toEqual([9]);
  });
});
