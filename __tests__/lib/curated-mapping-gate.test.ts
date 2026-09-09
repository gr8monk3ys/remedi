/**
 * The curated write path, as one composition.
 *
 * The seed and scripts/remediate-mappings.ts both apply the same four checks
 * in the same order: may this drug be mapped at all, is this pair forbidden by
 * a recorded interaction, does the score clear the display floor, does the
 * hand-typed Replacement Type overclaim. They used to spell that out
 * separately, so the *composition* could drift even though the primitives
 * could not. These test the shared function both now call.
 *
 * They also pin the boundary recorded in docs/adr/0001: the high-risk
 * free-text scan is deliberately NOT part of this gate.
 */

import { describe, it, expect } from "vitest";
import { certifyCuratedMapping } from "@/lib/remedy-matcher";

const IBUPROFEN = {
  name: "Ibuprofen",
  category: "Pain Reliever (NSAID)",
  ingredients: ["Ibuprofen"],
};

const WARFARIN = {
  name: "Warfarin",
  category: "Anticoagulant",
  ingredients: ["Warfarin"],
};

const CIPRO = {
  name: "Ciprofloxacin",
  category: "Antibiotic",
  ingredients: ["Ciprofloxacin"],
};

const base = {
  remedyName: "Turmeric",
  similarityScore: 0.8,
  claimedReplacementType: "Alternative" as const,
  forbiddenRemedies: [] as string[][],
};

describe("certifyCuratedMapping", () => {
  it("accepts a curated mapping the policy has nothing against", () => {
    const verdict = certifyCuratedMapping({ ...base, drug: IBUPROFEN });

    expect(verdict).toEqual({
      kind: "accepted",
      replacementType: "Alternative",
    });
  });

  it("refuses a drug that may carry no mapping at all", () => {
    const verdict = certifyCuratedMapping({ ...base, drug: WARFARIN });

    expect(verdict.kind).toBe("refused");
  });

  it("refuses before considering the pair or the score", () => {
    // Order matters: a refused drug must not be reported as merely forbidden
    // or below-floor, because those read as fixable and this one is not.
    const verdict = certifyCuratedMapping({
      ...base,
      drug: WARFARIN,
      similarityScore: 0.01,
      forbiddenRemedies: [["turmeric"]],
    });

    expect(verdict.kind).toBe("refused");
  });

  it("forbids a pair a recorded interaction covers", () => {
    const verdict = certifyCuratedMapping({
      ...base,
      drug: CIPRO,
      remedyName: "Magnesium",
      forbiddenRemedies: [["magnesium"]],
    });

    expect(verdict).toEqual({ kind: "forbidden" });
  });

  it("drops a mapping under the display floor", () => {
    const verdict = certifyCuratedMapping({
      ...base,
      drug: IBUPROFEN,
      similarityScore: 0.1,
    });

    expect(verdict).toMatchObject({ kind: "below-floor", score: 0.1 });
  });

  it("demotes a claim the drug's class does not allow", () => {
    // Ciprofloxacin is an antibiotic: Complementary is permitted, Alternative
    // is not.
    const verdict = certifyCuratedMapping({ ...base, drug: CIPRO });

    expect(verdict).toEqual({
      kind: "demoted",
      replacementType: "Complementary",
      claimed: "Alternative",
    });
  });

  it("reports a legacy stored label as a demotion rather than passing it", () => {
    // Compared raw: coercing first would make an unrecognised label equal
    // "Supportive" and quietly pass, so the row would never be fixed.
    const verdict = certifyCuratedMapping({
      ...base,
      drug: IBUPROFEN,
      claimedReplacementType: "Supplement",
    });

    expect(verdict).toMatchObject({
      kind: "demoted",
      replacementType: "Supportive",
    });
  });

  it("never raises a claim above what was curated", () => {
    const verdict = certifyCuratedMapping({
      ...base,
      drug: IBUPROFEN,
      claimedReplacementType: "Supportive",
      similarityScore: 0.99,
    });

    // A curator may always be more cautious than the policy, never less.
    expect(verdict).toEqual({
      kind: "accepted",
      replacementType: "Supportive",
    });
  });

  it("does NOT apply the high-risk free-text scan (docs/adr/0001)", () => {
    // Ibuprofen's curated interactions text mentions blood thinners. The
    // generated path's keyword scan would demote it for that; the curated path
    // must not, because interacting with an anticoagulant is not being one.
    // Measured: applying that scan here demoted 20 curated mappings, 18 of
    // them wrongly.
    const verdict = certifyCuratedMapping({
      ...base,
      drug: {
        ...IBUPROFEN,
        ingredients: ["Ibuprofen"],
      },
      claimedReplacementType: "Alternative",
    });

    expect(verdict).toEqual({
      kind: "accepted",
      replacementType: "Alternative",
    });
  });
});
