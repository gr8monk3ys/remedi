/**
 * The safety policy must recognise a substance regardless of which name the
 * source chose to lead with.
 *
 * OpenFDA labels are brand-first — `lib/openFDA.ts` sets
 * `name = brandName || genericName` — while every rule in the policy is keyed
 * on generic names. Matching on `[name, category]` alone therefore refused to
 * map "Warfarin" and happily mapped "COUMADIN", the same molecule.
 *
 * The property under test: two records for one substance get one answer.
 */

import { describe, it, expect } from "vitest";
import {
  isNeverMapped,
  buildRemedyMappingsFor,
  NEVER_MAPPED,
  NEVER_ALTERNATIVE,
} from "@/lib/remedy-matcher";
import type { ProcessedDrug } from "@/lib/types";

/** A record shaped the way lib/openFDA.ts builds one from a label. */
function fromOpenFda(
  brand: string,
  generic: string,
  ingredients: string[] = [],
): ProcessedDrug {
  return {
    id: `fda-${brand}`,
    fdaId: `fda-${brand}`,
    name: brand,
    genericName: generic,
    // What openfda.product_type actually contains — it identifies nothing.
    category: "HUMAN PRESCRIPTION DRUG LABEL",
    description: "",
    ingredients,
    benefits: ["anticoagulation"],
  };
}

/** The same substance as the curated seed carries it. */
function curated(name: string, category: string): ProcessedDrug {
  return {
    id: `seed-${name}`,
    fdaId: `seed-${name}`,
    name,
    category,
    description: "",
    ingredients: [],
    benefits: ["anticoagulation"],
  };
}

const BRANDS: ReadonlyArray<[brand: string, generic: string]> = [
  ["COUMADIN", "WARFARIN SODIUM"],
  ["ELIQUIS", "APIXABAN"],
  ["XARELTO", "RIVAROXABAN"],
  ["PRADAXA", "DABIGATRAN ETEXILATE"],
  ["PLAVIX", "CLOPIDOGREL BISULFATE"],
  ["SEROQUEL", "QUETIAPINE FUMARATE"],
];

describe("NEVER_MAPPED recognises the substance, not the label's name", () => {
  it.each(BRANDS)("refuses %s (%s)", (brand, generic) => {
    expect(isNeverMapped(fromOpenFda(brand, generic))).toBe(true);
  });

  it("still refuses the curated generic record", () => {
    expect(isNeverMapped(curated("Warfarin", "Anticoagulant"))).toBe(true);
  });

  it("gives one answer for two records of one substance", () => {
    for (const [brand, generic] of BRANDS) {
      expect(isNeverMapped(fromOpenFda(brand, generic))).toBe(
        isNeverMapped(curated(generic, "Anticoagulant")),
      );
    }
  });

  it("does not refuse an unrelated drug", () => {
    expect(isNeverMapped(fromOpenFda("ADVIL", "IBUPROFEN"))).toBe(false);
  });

  it("recognises the substance from ingredients when no generic name is given", () => {
    // Combination products and older label formats omit generic_name; the
    // active ingredient is still the substance.
    const noGeneric: ProcessedDrug = {
      ...fromOpenFda("COUMADIN", ""),
      genericName: undefined,
      ingredients: ["WARFARIN SODIUM 5 MG"],
    };
    expect(isNeverMapped(noGeneric)).toBe(true);
  });
});

describe("a refused drug carries no generated Remedy Mapping", () => {
  const candidates = [
    {
      id: "r1",
      name: "Nattokinase",
      description: null,
      imageUrl: null,
      category: "Enzyme",
      ingredients: ["nattokinase"],
      benefits: ["anticoagulation"],
      evidenceLevel: "Strong",
    },
  ];

  it.each(BRANDS)(
    "%s produces no mapping even with the score floor removed",
    (brand, generic) => {
      const mappings = buildRemedyMappingsFor(
        fromOpenFda(brand, generic),
        candidates,
        { minScore: 0 },
      );
      expect(mappings).toEqual([]);
    },
  );
});

describe("NEVER_ALTERNATIVE recognises brand names too", () => {
  it("does not label a remedy an Alternative for a branded fluoroquinolone", () => {
    const candidates = [
      {
        id: "r2",
        name: "Oregano Oil",
        description: null,
        imageUrl: null,
        category: "Herb",
        // Engineered to score above the Alternative threshold.
        ingredients: ["carvacrol"],
        benefits: ["antibacterial", "infection"],
        evidenceLevel: "Strong",
      },
    ];
    const cipro: ProcessedDrug = {
      ...fromOpenFda("CIPRO", "CIPROFLOXACIN HYDROCHLORIDE"),
      benefits: ["antibacterial", "infection"],
    };

    const mappings = buildRemedyMappingsFor(cipro, candidates, { minScore: 0 });
    expect(mappings.every((m) => m.replacementType !== "Alternative")).toBe(
      true,
    );
  });
});

describe("the policy lists stay generic-named", () => {
  it("keys NEVER_MAPPED on lowercase generic names", () => {
    for (const key of Object.keys(NEVER_MAPPED)) {
      expect(key).toBe(key.toLowerCase());
    }
  });

  it("keys NEVER_ALTERNATIVE on lowercase generic names", () => {
    for (const name of NEVER_ALTERNATIVE) {
      expect(name).toBe(name.toLowerCase());
    }
  });
});
