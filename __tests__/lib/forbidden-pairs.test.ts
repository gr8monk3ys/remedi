/**
 * A pair we have already recorded as interacting must not also be offered as a
 * remedy for the drug.
 *
 * "No magnesium beside ciprofloxacin" was the one safety rule with no code at
 * all: a comment in the seed file, and a test doing exact string equality on
 * `"Ciprofloxacin"` while being titled after the whole fluoroquinolone class.
 * "Cipro", "Levofloxacin" and every other member escaped it.
 *
 * The fact was already in the database — DrugInteraction records
 * "Magnesium Supplements" against "Fluoroquinolone Antibiotics (Ciprofloxacin,
 * Levofloxacin)", curated and class-level. The mapping path had never asked.
 */

import { describe, it, expect } from "vitest";
import {
  interactionDrugGroups,
  interactionRemedyTerms,
  isRemedyForbidden,
  buildRemedyMappingsFor,
  forbiddenRemedyGroupsFor,
} from "@/lib/remedy-matcher";
import type { ProcessedDrug } from "@/lib/types";

describe("the drug side lists alternatives, so any of them matches", () => {
  it("keeps the class and the members it lists in parentheses", () => {
    // A record named "Ciprofloxacin" contains none of the word
    // "fluoroquinolone", so these have to be alternatives rather than one
    // phrase. Each is its own group, and matching any group is a match.
    expect(
      interactionDrugGroups(
        "Fluoroquinolone Antibiotics (Ciprofloxacin, Levofloxacin)",
      ),
    ).toEqual([["fluoroquinolone"], ["ciprofloxacin"], ["levofloxacin"]]);
  });

  it("drops words that identify no substance", () => {
    // A rule firing on "and" or "oral" would forbid everything.
    expect(
      interactionDrugGroups("Oral Contraceptives (Birth Control Pills)"),
    ).toEqual([["contraceptives"], ["birth"]]);
  });

  it("keeps a class phrase together so its words cannot fire alone", () => {
    // Each of these words used to be its own term, so "Calcium Channel
    // Blockers" fired on the "atorvastatin calcium" in a statin's ingredients
    // and "Valproic Acid" fired on anything whose name ends in "acid".
    expect(
      interactionDrugGroups("Calcium Channel Blockers (Felodipine)"),
    ).toEqual([["calcium", "channel", "blockers"], ["felodipine"]]);
    expect(
      interactionDrugGroups("Anticonvulsants (Valproic Acid, Carbamazepine)"),
    ).toEqual([["anticonvulsants"], ["valproic", "acid"], ["carbamazepine"]]);
  });

  it("splits on 'and', which joins two classes rather than naming one", () => {
    // "Sedatives and Sleep Medications" covers a drug that is either, so
    // requiring both words would drop every sleep aid not called a sedative.
    expect(
      interactionDrugGroups("Sedatives and Sleep Medications (Zolpidem)"),
    ).toEqual([["sedatives"], ["sleep"], ["zolpidem"]]);
  });
});

describe("the remedy side names one substance, so every word must match", () => {
  it("treats parentheses and slashes as aliases, not extra requirements", () => {
    // Requiring "coenzyme AND q10 AND coq10" would forbid nothing at all.
    expect(interactionRemedyTerms("Coenzyme Q10 (CoQ10)")).toEqual([
      ["coenzyme", "q10"],
      ["coq10"],
    ]);
    expect(interactionRemedyTerms("Turmeric/Curcumin")).toEqual([
      ["turmeric"],
      ["curcumin"],
    ]);
  });

  it("keeps short names that a length rule would silently erase", () => {
    // An earlier version required five characters, so these produced nothing
    // and forbade nothing — while the table records iron against
    // fluoroquinolones (the same chelation as magnesium) and St. John's Wort
    // against the only two contraindicated entries there are.
    expect(interactionRemedyTerms("Iron Supplements")).toEqual([["iron"]]);
    expect(interactionRemedyTerms("Kava")).toEqual([["kava"]]);
    expect(interactionRemedyTerms("St. John's Wort")).toEqual([
      ["st", "john", "s", "wort"],
    ]);
  });
});

describe("isRemedyForbidden matches a recorded substance to a product", () => {
  const magnesium = interactionRemedyTerms("Magnesium Supplements");

  it.each([
    "Magnesium Glycinate",
    "Magnesium Citrate",
    "Magnesium L-Threonate",
  ])("forbids %s", (remedy) => {
    expect(isRemedyForbidden(remedy, magnesium)).toBe(true);
  });

  it("forbids iron beside a fluoroquinolone, the same chelation as magnesium", () => {
    const iron = interactionRemedyTerms("Iron Supplements");
    expect(isRemedyForbidden("Iron Bisglycinate", iron)).toBe(true);
  });

  it("does not let one vitamin forbid a different one", () => {
    const vitaminD = interactionRemedyTerms("Vitamin D (High Dose)");
    expect(isRemedyForbidden("Vitamin D3", vitaminD)).toBe(true);
    expect(isRemedyForbidden("Vitamin E", vitaminD)).toBe(false);
  });

  it("holds the designator to its own word, not any stray letter", () => {
    // "vitamin" and a loose "e" both appear in "Vitamin B1 (Thiamine)", so as
    // substrings "Vitamin E" forbade most of the vitamin catalogue.
    const vitaminE = interactionRemedyTerms("Vitamin E (High Dose)");
    expect(isRemedyForbidden("Vitamin E (Tocopherol)", vitaminE)).toBe(true);
    expect(isRemedyForbidden("Vitamin B1 (Thiamine)", vitaminE)).toBe(false);
    expect(isRemedyForbidden("Vitamin A (Retinol)", vitaminE)).toBe(false);

    // A designator still covers its numbered forms.
    const vitaminD = interactionRemedyTerms("Vitamin D (High Dose)");
    expect(isRemedyForbidden("Vitamin D3 (Cholecalciferol)", vitaminD)).toBe(
      true,
    );
    expect(isRemedyForbidden("Vitamin B5 (Pantothenic Acid)", vitaminD)).toBe(
      false,
    );
  });

  it("does not let a dropped generic word forbid an unrelated remedy", () => {
    // "root" is a dosage-form word; without dropping it, "Licorice Root"
    // would forbid "Valerian Root".
    const licorice = interactionRemedyTerms("Licorice Root (Glycyrrhiza)");
    expect(isRemedyForbidden("Valerian Root", licorice)).toBe(false);
    expect(isRemedyForbidden("Licorice Extract", licorice)).toBe(true);
  });

  it("leaves unrelated remedies alone", () => {
    expect(isRemedyForbidden("Turmeric (Curcumin)", magnesium)).toBe(false);
    expect(isRemedyForbidden("Valerian Root", magnesium)).toBe(false);
  });

  it("forbids nothing when no interaction was recorded", () => {
    expect(isRemedyForbidden("Magnesium Glycinate", [])).toBe(false);
  });
});

describe("the policy drops a forbidden pair before scoring it", () => {
  const cipro: ProcessedDrug = {
    id: "d1",
    fdaId: "d1",
    name: "Ciprofloxacin",
    category: "Antibiotic",
    description: "",
    ingredients: ["ciprofloxacin hydrochloride"],
    benefits: ["bacterial infection"],
  };

  const candidates = [
    {
      id: "r1",
      name: "Magnesium Glycinate",
      description: null,
      imageUrl: null,
      category: "Mineral",
      ingredients: ["magnesium"],
      // Engineered to score well, so only the pair rule can stop it.
      benefits: ["bacterial infection"],
      evidenceLevel: "Strong",
    },
    {
      id: "r2",
      name: "Oregano Oil",
      description: null,
      imageUrl: null,
      category: "Herb",
      ingredients: ["carvacrol"],
      benefits: ["bacterial infection"],
      evidenceLevel: "Strong",
    },
  ];

  it("maps magnesium to ciprofloxacin when nothing forbids it", () => {
    // Establishes that the exclusion below is the pair rule and not the score.
    const outcome = buildRemedyMappingsFor(cipro, candidates, { minScore: 0 });
    if (outcome.kind !== "known") throw new Error("unreachable");

    expect(outcome.data.map((m) => m.name)).toContain("Magnesium Glycinate");
  });

  it("drops magnesium once the recorded interaction is supplied", () => {
    const outcome = buildRemedyMappingsFor(cipro, candidates, {
      minScore: 0,
      forbiddenRemedies: interactionRemedyTerms("Magnesium Supplements"),
    });
    if (outcome.kind !== "known") throw new Error("unreachable");

    const names = outcome.data.map((m) => m.name);
    expect(names).not.toContain("Magnesium Glycinate");
    // The rule is surgical: the other candidate is untouched.
    expect(names).toContain("Oregano Oil");
  });

  it("covers the whole class, not one spelled-out name", () => {
    // The old test matched `pharmaceuticalName === "Ciprofloxacin"` exactly.
    const levo: ProcessedDrug = {
      ...cipro,
      name: "LEVAQUIN",
      genericName: "LEVOFLOXACIN",
      category: "HUMAN PRESCRIPTION DRUG LABEL",
      ingredients: ["levofloxacin"],
    };

    // A brand-named levofloxacin label still resolves to the recorded class.
    const groups = forbiddenRemedyGroupsFor(levo, [
      {
        substanceA: "Magnesium Supplements",
        substanceB: "Fluoroquinolone Antibiotics (Ciprofloxacin, Levofloxacin)",
      },
    ]);

    expect(isRemedyForbidden("Magnesium Glycinate", groups)).toBe(true);
  });

  it("reaches a class written plural from a record written singular", () => {
    // The recorded row says "SSRIs" and every record's category says "(SSRI)",
    // so the severe St. John's Wort rule matched nothing at all and five
    // curated mappings shipped past it.
    const fluoxetine: ProcessedDrug = {
      ...cipro,
      name: "Fluoxetine",
      genericName: "fluoxetine",
      category: "Antidepressant (SSRI)",
      ingredients: ["fluoxetine hydrochloride"],
    };

    const groups = forbiddenRemedyGroupsFor(fluoxetine, [
      {
        substanceA: "St. John's Wort",
        substanceB: "SSRIs (Selective Serotonin Reuptake Inhibitors)",
      },
    ]);

    expect(
      isRemedyForbidden("St. Johns Wort (Hypericum perforatum)", groups),
    ).toBe(true);
  });

  it("does not read a remedy record as the drug its own row names", () => {
    // "Melatonin interacts with sedatives and sleep medications" matched a
    // melatonin record on the word "sleep" in its category, and so forbade
    // mapping melatonin to melatonin.
    const melatonin: ProcessedDrug = {
      ...cipro,
      name: "Melatonin Supplement",
      genericName: "melatonin",
      category: "Sleep Supplement",
      ingredients: ["Melatonin"],
    };

    const rows = [
      {
        substanceA: "Melatonin",
        substanceB: "Sedatives and Sleep Medications (Zolpidem, Zopiclone)",
      },
    ];

    expect(forbiddenRemedyGroupsFor(melatonin, rows)).toEqual([]);

    // The drugs the row is actually about are still covered.
    const zolpidem: ProcessedDrug = {
      ...cipro,
      name: "Zolpidem",
      genericName: "zolpidem",
      category: "Sleep Aid",
      ingredients: ["Zolpidem tartrate"],
    };
    expect(
      isRemedyForbidden("Melatonin", forbiddenRemedyGroupsFor(zolpidem, rows)),
    ).toBe(true);
  });
});
