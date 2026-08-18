import { describe, expect, it } from "vitest";
import {
  allNaturalRemedies,
  pharmaceuticals,
  remedyMappings,
} from "@/prisma/seed-data";
import { MIN_DISPLAY_SIMILARITY } from "@/lib/remedy-matcher";

/**
 * Drugs deliberately seeded with NO remedy mappings. For these classes,
 * suggesting anything is worse than suggesting nothing — an empty result is
 * the curated content, not a gap. Removing an entry from this list without
 * adding honest mappings will fail the coverage test below, which is the
 * point: emptiness must be a decision, never an accident.
 */
const DELIBERATELY_UNMAPPED: Record<string, string> = {
  Warfarin: "anticoagulant — even 'supportive' additions alter bleeding risk",
  Apixaban: "anticoagulant — even 'supportive' additions alter bleeding risk",
  Rivaroxaban:
    "anticoagulant — even 'supportive' additions alter bleeding risk",
  Dabigatran: "anticoagulant — even 'supportive' additions alter bleeding risk",
  Clopidogrel: "antiplatelet — even 'supportive' additions alter bleeding risk",
  Quetiapine:
    "antipsychotic — discontinuation or substitution suggestions are unsafe",
};

/**
 * Drugs whose class rules out labelling any remedy an "Alternative":
 * emergency/rescue medication, opioids, seizure medication, antibiotics,
 * incretin therapy, and hormonal contraception. Supportive/Complementary
 * entries are allowed; an "Alternative" label is a test failure.
 */
const NO_ALTERNATIVE_ALLOWED = [
  "Albuterol",
  "Tramadol",
  "Clonazepam",
  "Doxycycline",
  "Amoxicillin",
  "Azithromycin",
  "Ciprofloxacin",
  "Liraglutide",
  "Ethinyl Estradiol/Levonorgestrel",
];

const VALID_REPLACEMENT_TYPES = ["Alternative", "Complementary", "Supportive"];

const pharmaceuticalNames = new Set(pharmaceuticals.map((p) => p.name));
const remedyNames = new Set(allNaturalRemedies.map((r) => r.name));

describe("seed remedy mappings", () => {
  it("references only pharmaceuticals that exist in the seed", () => {
    const unknown = remedyMappings
      .map((m) => m.pharmaceuticalName)
      .filter((name) => !pharmaceuticalNames.has(name));
    expect(unknown).toEqual([]);
  });

  it("references only remedies that exist in the catalogue", () => {
    const unknown = remedyMappings
      .map((m) => m.naturalRemedyName)
      .filter((name) => !remedyNames.has(name));
    expect(unknown).toEqual([]);
  });

  it("contains no duplicate pharmaceutical/remedy pairs", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const m of remedyMappings) {
      const key = `${m.pharmaceuticalName} -> ${m.naturalRemedyName}`;
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
    }
    expect(duplicates).toEqual([]);
  });

  it("keeps every score in (0, 1] and every replacementType valid", () => {
    for (const m of remedyMappings) {
      expect(m.similarityScore, m.pharmaceuticalName).toBeGreaterThan(0);
      expect(m.similarityScore, m.pharmaceuticalName).toBeLessThanOrEqual(1);
      expect(VALID_REPLACEMENT_TYPES).toContain(m.replacementType);
    }
  });

  it("gives every seeded drug a displayable mapping unless deliberately unmapped", () => {
    const displayable = new Set(
      remedyMappings
        .filter((m) => m.similarityScore >= MIN_DISPLAY_SIMILARITY)
        .map((m) => m.pharmaceuticalName),
    );
    const orphans = pharmaceuticals
      .map((p) => p.name)
      .filter(
        (name) => !displayable.has(name) && !(name in DELIBERATELY_UNMAPPED),
      );
    // A drug listed here would render an empty result page by accident.
    // Either curate honest mappings for it or add it to DELIBERATELY_UNMAPPED
    // with a reason.
    expect(orphans).toEqual([]);
  });

  it("keeps deliberately unmapped drugs actually unmapped", () => {
    const mapped = Object.keys(DELIBERATELY_UNMAPPED).filter((name) =>
      remedyMappings.some((m) => m.pharmaceuticalName === name),
    );
    expect(mapped).toEqual([]);
  });

  it("never labels a remedy an Alternative for rescue, opioid, seizure, antibiotic, incretin or contraceptive drugs", () => {
    const violations = remedyMappings
      .filter(
        (m) =>
          NO_ALTERNATIVE_ALLOWED.includes(m.pharmaceuticalName) &&
          m.replacementType === "Alternative",
      )
      .map((m) => `${m.pharmaceuticalName} -> ${m.naturalRemedyName}`);
    expect(violations).toEqual([]);
  });

  it("suggests no magnesium alongside fluoroquinolones (absorption chelation)", () => {
    const violations = remedyMappings
      .filter(
        (m) =>
          m.pharmaceuticalName === "Ciprofloxacin" &&
          m.naturalRemedyName.toLowerCase().includes("magnesium"),
      )
      .map((m) => m.naturalRemedyName);
    expect(violations).toEqual([]);
  });
});
