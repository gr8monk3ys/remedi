import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "../setup/setup";
import {
  getNaturalRemedyById,
  searchNaturalRemedies,
  getNaturalRemediesForPharmaceutical,
} from "@/lib/db/remedies";

describe("Remedies DB Integration", () => {
  let remedyId: string;
  let pharmaceuticalId: string;

  beforeEach(async () => {
    const remedy = await prisma.naturalRemedy.create({
      data: {
        name: `Test Remedy ${Date.now()}`,
        category: "Herbal",
        ingredients: ["chamomile", "lavender"],
        benefits: ["relaxation", "sleep"],
        references: [],
        relatedRemedies: [],
        evidenceLevel: "Moderate",
      },
    });
    remedyId = remedy.id;

    const pharma = await prisma.pharmaceutical.create({
      data: {
        name: `Test Drug ${Date.now()}`,
        category: "Sedative",
        ingredients: ["active-ingredient"],
        benefits: ["sleep-aid"],
      },
    });
    pharmaceuticalId = pharma.id;
  });

  afterEach(async () => {
    await prisma.naturalRemedyMapping.deleteMany({
      where: { pharmaceuticalId },
    });
    await prisma.naturalRemedy.deleteMany({ where: { id: remedyId } });
    await prisma.pharmaceutical.deleteMany({ where: { id: pharmaceuticalId } });
  });

  it("getNaturalRemedyById returns remedy by ID", async () => {
    const remedy = await getNaturalRemedyById(remedyId);

    expect(remedy).not.toBeNull();
    expect(remedy!.id).toBe(remedyId);
    expect(remedy!.category).toBe("Herbal");
    expect(remedy!.evidenceLevel).toBe("Moderate");
  });

  it("getNaturalRemedyById returns null for non-existent ID", async () => {
    const remedy = await getNaturalRemedyById(
      "00000000-0000-0000-0000-000000000000",
    );
    expect(remedy).toBeNull();
  });

  it("searchNaturalRemedies finds by name substring", async () => {
    // The remedy name contains "Test Remedy" + timestamp — search lowercase to verify
    // case-insensitive matching works correctly on PostgreSQL.
    const results = await searchNaturalRemedies("test remedy");

    expect(results.length).toBeGreaterThanOrEqual(1);
    const found = results.find((r) => r.id === remedyId);
    expect(found).toBeDefined();
    expect(found!.category).toBe("Herbal");
  });

  it("searchNaturalRemedies returns empty for no matches", async () => {
    const results = await searchNaturalRemedies(
      "zzz-no-match-xyzzy-integration-test-query",
    );
    expect(results).toEqual([]);
  });

  it("getNaturalRemediesForPharmaceutical returns mapped remedies", async () => {
    // Create a mapping between the pharmaceutical and the remedy
    await prisma.naturalRemedyMapping.create({
      data: {
        pharmaceuticalId,
        naturalRemedyId: remedyId,
        similarityScore: 0.85,
        matchingNutrients: ["chamomile"],
        replacementType: "Supportive",
      },
    });

    const remedies =
      await getNaturalRemediesForPharmaceutical(pharmaceuticalId);

    expect(remedies).toHaveLength(1);
    expect(remedies[0].id).toBe(remedyId);
    expect(remedies[0].similarityScore).toBe(0.85);
    expect(remedies[0].matchingNutrients).toContain("chamomile");
  });

  it("getNaturalRemediesForPharmaceutical returns empty for no mappings", async () => {
    const remedies =
      await getNaturalRemediesForPharmaceutical(pharmaceuticalId);
    expect(remedies).toEqual([]);
  });
});
