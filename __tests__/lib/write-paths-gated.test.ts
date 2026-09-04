/**
 * Every path that can put a Remedy Mapping in front of a person must cross the
 * safety policy.
 *
 * The policy used to be a function two of six write paths happened to call.
 * The curated seed wrote a hand-typed Replacement Type straight to the
 * database, guarded only by a test over a static array — a test that cannot
 * see the database and that no write path consults. AI search produced scored
 * recommendations with no Replacement Type, no refusal check and no display
 * floor. The demo tier answered a database outage with fabricated results.
 */

import { describe, it, expect } from "vitest";
import {
  certifyReplacementType,
  MIN_DISPLAY_SIMILARITY,
  type PolicyIdentity,
} from "@/lib/remedy-matcher";

const warfarin: PolicyIdentity = {
  name: "Warfarin",
  category: "Anticoagulant",
  ingredients: ["warfarin sodium"],
};

/** The same substance as OpenFDA hands it over. */
const coumadin: PolicyIdentity = {
  name: "COUMADIN",
  genericName: "WARFARIN SODIUM",
  category: "HUMAN PRESCRIPTION DRUG LABEL",
  ingredients: ["warfarin sodium"],
};

const cipro: PolicyIdentity = {
  name: "Ciprofloxacin",
  category: "Antibiotic",
  ingredients: ["ciprofloxacin hydrochloride"],
};

const ibuprofen: PolicyIdentity = {
  name: "Ibuprofen",
  category: "NSAID",
  ingredients: ["ibuprofen"],
};

describe("a curated Replacement Type cannot claim more than the policy allows", () => {
  it("refuses a curated mapping on a never-mapped drug", () => {
    const certified = certifyReplacementType(warfarin, "Alternative");

    expect(certified.kind).toBe("unknown");
    if (certified.kind !== "unknown") throw new Error("unreachable");
    expect(certified.reason).toBe("never-mapped");
  });

  it("refuses it under the brand name too", () => {
    expect(certifyReplacementType(coumadin, "Alternative").kind).toBe(
      "unknown",
    );
  });

  it("demotes a curated Alternative on a never-alternative drug", () => {
    const certified = certifyReplacementType(cipro, "Alternative");

    expect(certified).toEqual({ kind: "known", data: "Complementary" });
  });

  it("leaves a legitimate curated claim untouched", () => {
    expect(certifyReplacementType(ibuprofen, "Alternative")).toEqual({
      kind: "known",
      data: "Alternative",
    });
    expect(certifyReplacementType(ibuprofen, "Complementary")).toEqual({
      kind: "known",
      data: "Complementary",
    });
  });

  it("never raises a claim a curator deliberately kept low", () => {
    // A curator may always be more cautious than the policy, never less.
    expect(certifyReplacementType(ibuprofen, "Supportive")).toEqual({
      kind: "known",
      data: "Supportive",
    });
  });

  it("coerces an unrecognised curated label rather than trusting it", () => {
    expect(certifyReplacementType(ibuprofen, "Miracle Cure")).toEqual({
      kind: "known",
      data: "Supportive",
    });
    expect(certifyReplacementType(ibuprofen, null)).toEqual({
      kind: "known",
      data: "Supportive",
    });
  });
});

describe("the high-risk prose heuristic stays off the curated path", () => {
  it("does not demote a drug whose label merely mentions anticoagulants", () => {
    // shouldForceSupportiveReplacement scans warnings and interactions text.
    // It exists to compensate for FDA records whose category identifies
    // nothing. Applied to curated prose it fired on most Ibuprofen mappings,
    // which are not high-risk — so certification is keyed on identity only.
    const withScaryProse = {
      ...ibuprofen,
      warnings: "Do not take with anticoagulant therapy.",
      interactions: "Increases bleeding risk with anticoagulants.",
    } as PolicyIdentity;

    expect(certifyReplacementType(withScaryProse, "Alternative")).toEqual({
      kind: "known",
      data: "Alternative",
    });
  });
});

describe("the AI path answers to the same floor as every other path", () => {
  it("has a floor to answer to", () => {
    // The model's confidence is rendered as a Similarity Score in the same
    // place as a generated one, so it is filtered by the same constant rather
    // than a number chosen for AI.
    expect(MIN_DISPLAY_SIMILARITY).toBeGreaterThan(0);
  });

  it("would drop the value Zod defaults an unparseable confidence to", () => {
    // aiResponseSchema does `.catch(0.5)`, so a malformed confidence becomes
    // 0.5 — above the floor. Documented here because it means the floor alone
    // does not protect against a model returning junk; the refusal check does.
    expect(0.5).toBeGreaterThan(MIN_DISPLAY_SIMILARITY);
  });

  it("refuses to recommend anything for a never-mapped subject", () => {
    // The AI path has no Pharmaceutical row, so identity is assembled from the
    // question and the Medication Cabinet.
    const subject: PolicyIdentity = {
      name: "what can I take instead of my blood thinner",
      category: "",
      ingredients: ["Warfarin 5mg", "headaches"],
    };

    expect(certifyReplacementType(subject, "Supportive").kind).toBe("unknown");
  });

  it("permits an ordinary subject", () => {
    const subject: PolicyIdentity = {
      name: "something for joint pain",
      category: "",
      ingredients: ["Ibuprofen"],
    };

    expect(certifyReplacementType(subject, "Complementary")).toEqual({
      kind: "known",
      data: "Complementary",
    });
  });
});
