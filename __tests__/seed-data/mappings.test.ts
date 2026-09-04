import { describe, expect, it } from "vitest";
import {
  allNaturalRemedies,
  pharmaceuticals,
  remedyMappings,
} from "@/prisma/seed-data";
import {
  MIN_DISPLAY_SIMILARITY,
  NEVER_ALTERNATIVE,
  NEVER_MAPPED,
  isNeverMapped,
  neverMappedReason,
} from "@/lib/remedy-matcher";

/**
 * Drugs deliberately seeded with NO remedy mappings. For these classes,
 * suggesting anything is worse than suggesting nothing — an empty result is
 * the curated content, not a gap. Removing an entry from this list without
 * adding honest mappings will fail the coverage test below, which is the
 * point: emptiness must be a decision, never an accident.
 */
/**
 * The safety policy now lives in lib/remedy-matcher.ts, where both write paths
 * enforce it. These tests assert the curated seed data agrees with it, so the
 * data and the code can never drift apart.
 */
const isUnmappedDrug = (name: string): boolean =>
  isNeverMapped({ name, category: "" });

const isNoAlternativeDrug = (name: string): boolean =>
  NEVER_ALTERNATIVE.some((entry) => name.toLowerCase().includes(entry));

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
      .filter((name) => !displayable.has(name) && !isUnmappedDrug(name));
    // A drug listed here would render an empty result page by accident.
    // Either curate honest mappings for it or add it to NEVER_MAPPED in
    // lib/remedy-matcher.ts with a reason.
    expect(orphans).toEqual([]);
  });

  it("keeps deliberately unmapped drugs actually unmapped", () => {
    const mapped = Object.keys(NEVER_MAPPED).filter((entry) =>
      remedyMappings.some((m) =>
        m.pharmaceuticalName.toLowerCase().includes(entry),
      ),
    );
    expect(mapped).toEqual([]);
  });

  it("never labels a remedy an Alternative for rescue, opioid, seizure, antibiotic, incretin or contraceptive drugs", () => {
    const violations = remedyMappings
      .filter(
        (m) =>
          isNoAlternativeDrug(m.pharmaceuticalName) &&
          m.replacementType === "Alternative",
      )
      .map((m) => `${m.pharmaceuticalName} -> ${m.naturalRemedyName}`);
    expect(violations).toEqual([]);
  });

  it("curates nothing under the display floor", () => {
    // The seed now drops these rather than persisting a row that can never be
    // shown. Pinning the data means that gate never has to fire.
    const violations = remedyMappings
      .filter((m) => m.similarityScore < MIN_DISPLAY_SIMILARITY)
      .map(
        (m) =>
          `${m.pharmaceuticalName} -> ${m.naturalRemedyName} (${m.similarityScore})`,
      );
    expect(violations).toEqual([]);
  });

  it("offers no serotonergic remedy beside an SSRI", () => {
    // The recorded interaction covers only St. John's Wort, and the catalogue
    // also carried SAMe as an "Alternative" and 5-HTP as "Complementary" —
    // the same serotonin-syndrome mechanism, unrecorded, so no gate could ever
    // catch them. The class is the unsafe unit, not the pair.
    const ssris = [
      "Sertraline",
      "Fluoxetine",
      "Paroxetine",
      "Citalopram",
      "Escitalopram",
    ];

    const offered = remedyMappings
      .filter((m) => ssris.includes(m.pharmaceuticalName))
      .map((m) => `${m.pharmaceuticalName} -> ${m.naturalRemedyName}`);
    expect(offered).toEqual([]);

    // Unmapped because it is a decision, and the decision states its reason.
    for (const name of ssris) {
      expect(neverMappedReason({ name, category: "" })).toMatch(/SSRI/);
    }
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
