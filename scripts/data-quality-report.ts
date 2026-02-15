import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for data quality reporting.");
  }
  const pool = new Pool({ connectionString: databaseUrl });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

async function main() {
  const [remedyCount, pharmaCount, mappingCount, interactionCount] =
    await Promise.all([
      prisma.naturalRemedy.count(),
      prisma.pharmaceutical.count(),
      prisma.naturalRemedyMapping.count(),
      prisma.drugInteraction.count(),
    ]);

  const [
    missingRemedyDescription,
    missingRemedyUsage,
    missingRemedyDosage,
    missingRemedyPrecautions,
    missingRemedyScientificInfo,
    missingRemedyEvidenceLevel,
    missingRemedySourceUrl,
  ] = await Promise.all([
    prisma.naturalRemedy.count({
      where: { OR: [{ description: null }, { description: "" }] },
    }),
    prisma.naturalRemedy.count({
      where: { OR: [{ usage: null }, { usage: "" }] },
    }),
    prisma.naturalRemedy.count({
      where: { OR: [{ dosage: null }, { dosage: "" }] },
    }),
    prisma.naturalRemedy.count({
      where: { OR: [{ precautions: null }, { precautions: "" }] },
    }),
    prisma.naturalRemedy.count({
      where: { OR: [{ scientificInfo: null }, { scientificInfo: "" }] },
    }),
    prisma.naturalRemedy.count({
      where: { OR: [{ evidenceLevel: null }, { evidenceLevel: "" }] },
    }),
    prisma.naturalRemedy.count({
      where: { OR: [{ sourceUrl: null }, { sourceUrl: "" }] },
    }),
  ]);

  const [remedyCategoryGroups, remedyEvidenceGroups] = await Promise.all([
    prisma.naturalRemedy.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
    prisma.naturalRemedy.groupBy({
      by: ["evidenceLevel"],
      _count: { _all: true },
    }),
  ]);

  remedyCategoryGroups.sort((a, b) => b._count._all - a._count._all);
  remedyEvidenceGroups.sort((a, b) => b._count._all - a._count._all);

  const pharmaGroups = await prisma.pharmaceutical.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  pharmaGroups.sort((a, b) => b._count._all - a._count._all);

  const [interactionSeverityGroups, interactionEvidenceGroups] =
    await Promise.all([
      prisma.drugInteraction.groupBy({
        by: ["severity"],
        _count: { _all: true },
      }),
      prisma.drugInteraction.groupBy({
        by: ["evidence"],
        _count: { _all: true },
      }),
    ]);
  interactionSeverityGroups.sort((a, b) => b._count._all - a._count._all);
  interactionEvidenceGroups.sort((a, b) => b._count._all - a._count._all);

  const remedies = await prisma.naturalRemedy.findMany({
    select: {
      id: true,
      name: true,
      ingredients: true,
      benefits: true,
      references: true,
    },
  });

  let remediesWithRefs = 0;
  let totalRefs = 0;
  let remediesWithIngredients = 0;
  let totalIngredients = 0;
  let remediesWithBenefits = 0;
  let totalBenefits = 0;

  for (const r of remedies) {
    const refs = Array.isArray(r.references) ? r.references : [];
    const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
    const benefits = Array.isArray(r.benefits) ? r.benefits : [];

    if (refs.length > 0) remediesWithRefs += 1;
    totalRefs += refs.length;

    if (ingredients.length > 0) remediesWithIngredients += 1;
    totalIngredients += ingredients.length;

    if (benefits.length > 0) remediesWithBenefits += 1;
    totalBenefits += benefits.length;
  }

  const pharmaMissing = await Promise.all([
    prisma.pharmaceutical.count({
      where: { OR: [{ description: null }, { description: "" }] },
    }),
    prisma.pharmaceutical.count({
      where: { OR: [{ usage: null }, { usage: "" }] },
    }),
    prisma.pharmaceutical.count({
      where: { OR: [{ warnings: null }, { warnings: "" }] },
    }),
    prisma.pharmaceutical.count({
      where: { OR: [{ interactions: null }, { interactions: "" }] },
    }),
  ]);

  const mappings = await prisma.naturalRemedyMapping.findMany({
    select: { similarityScore: true, matchingNutrients: true },
  });

  let avgSimilarity = 0;
  let mappingsWithNutrients = 0;
  let totalMatchingNutrients = 0;
  if (mappings.length > 0) {
    avgSimilarity =
      Math.round(
        (mappings.reduce((sum, m) => sum + m.similarityScore, 0) /
          mappings.length) *
          1000,
      ) / 1000;

    for (const m of mappings) {
      const nutrients = Array.isArray(m.matchingNutrients)
        ? m.matchingNutrients
        : [];
      if (nutrients.length > 0) mappingsWithNutrients += 1;
      totalMatchingNutrients += nutrients.length;
    }
  }

  const report = {
    counts: {
      naturalRemedies: remedyCount,
      pharmaceuticals: pharmaCount,
      remedyMappings: mappingCount,
      drugInteractions: interactionCount,
    },
    naturalRemedies: {
      completeness: {
        description: {
          missing: missingRemedyDescription,
          missingPct: pct(missingRemedyDescription, remedyCount),
        },
        usage: {
          missing: missingRemedyUsage,
          missingPct: pct(missingRemedyUsage, remedyCount),
        },
        dosage: {
          missing: missingRemedyDosage,
          missingPct: pct(missingRemedyDosage, remedyCount),
        },
        precautions: {
          missing: missingRemedyPrecautions,
          missingPct: pct(missingRemedyPrecautions, remedyCount),
        },
        scientificInfo: {
          missing: missingRemedyScientificInfo,
          missingPct: pct(missingRemedyScientificInfo, remedyCount),
        },
        evidenceLevel: {
          missing: missingRemedyEvidenceLevel,
          missingPct: pct(missingRemedyEvidenceLevel, remedyCount),
        },
        sourceUrl: {
          missing: missingRemedySourceUrl,
          missingPct: pct(missingRemedySourceUrl, remedyCount),
        },
      },
      arrays: {
        references: {
          withAny: remediesWithRefs,
          withAnyPct: pct(remediesWithRefs, remedyCount),
          avgPerRemedy: remedyCount ? totalRefs / remedyCount : 0,
        },
        ingredients: {
          withAny: remediesWithIngredients,
          withAnyPct: pct(remediesWithIngredients, remedyCount),
          avgPerRemedy: remedyCount ? totalIngredients / remedyCount : 0,
        },
        benefits: {
          withAny: remediesWithBenefits,
          withAnyPct: pct(remediesWithBenefits, remedyCount),
          avgPerRemedy: remedyCount ? totalBenefits / remedyCount : 0,
        },
      },
      distributions: {
        categories: remedyCategoryGroups.map((row) => ({
          category: row.category,
          count: row._count._all,
          pct: pct(row._count._all, remedyCount),
        })),
        evidenceLevels: remedyEvidenceGroups.map((row) => ({
          evidenceLevel: isBlank(row.evidenceLevel) ? null : row.evidenceLevel,
          count: row._count._all,
          pct: pct(row._count._all, remedyCount),
        })),
      },
    },
    pharmaceuticals: {
      completeness: {
        description: {
          missing: pharmaMissing[0],
          missingPct: pct(pharmaMissing[0], pharmaCount),
        },
        usage: {
          missing: pharmaMissing[1],
          missingPct: pct(pharmaMissing[1], pharmaCount),
        },
        warnings: {
          missing: pharmaMissing[2],
          missingPct: pct(pharmaMissing[2], pharmaCount),
        },
        interactions: {
          missing: pharmaMissing[3],
          missingPct: pct(pharmaMissing[3], pharmaCount),
        },
      },
      distributions: {
        categories: pharmaGroups.map((row) => ({
          category: row.category,
          count: row._count._all,
          pct: pct(row._count._all, pharmaCount),
        })),
      },
    },
    remedyMappings: {
      avgSimilarityScore: avgSimilarity,
      matchingNutrients: {
        withAny: mappingsWithNutrients,
        withAnyPct: pct(mappingsWithNutrients, mappingCount),
        avgPerMapping: mappingCount ? totalMatchingNutrients / mappingCount : 0,
      },
    },
    drugInteractions: {
      distributions: {
        severity: interactionSeverityGroups.map((row) => ({
          severity: row.severity,
          count: row._count._all,
          pct: pct(row._count._all, interactionCount),
        })),
        evidence: interactionEvidenceGroups.map((row) => ({
          evidence: isBlank(row.evidence) ? null : row.evidence,
          count: row._count._all,
          pct: pct(row._count._all, interactionCount),
        })),
      },
    },
  };

  console.log(JSON.stringify(report, null, 2));
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Data quality report FAILED.");
  console.error(error);
  process.exit(1);
});
