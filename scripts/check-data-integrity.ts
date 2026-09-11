import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for data integrity checks.");
  }
  const pool = new Pool({ connectionString: databaseUrl });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for data integrity checks.`);
  }
  return value;
}

async function main() {
  requireEnv("DATABASE_URL");

  const issues: string[] = [];

  // Ensure the key subscription feature tables are queryable.
  await Promise.all([
    prisma.healthProfile.count(),
    prisma.medicationCabinet.count(),
    prisma.remedyJournal.count(),
    prisma.remedyReport.count(),
  ]);

  const missingRemedyNames = await prisma.naturalRemedy.count({
    where: {
      name: { equals: "" },
    },
  });
  if (missingRemedyNames > 0) {
    issues.push(`Natural remedies with empty name: ${missingRemedyNames}`);
  }

  const missingCategories = await prisma.naturalRemedy.count({
    where: {
      category: { equals: "" },
    },
  });
  if (missingCategories > 0) {
    issues.push(`Natural remedies with empty category: ${missingCategories}`);
  }

  const emptyIngredients = await prisma.naturalRemedy.count({
    where: {
      ingredients: { equals: [] },
    },
  });
  if (emptyIngredients > 0) {
    issues.push(`Natural remedies with no ingredients: ${emptyIngredients}`);
  }

  const emptyBenefits = await prisma.naturalRemedy.count({
    where: {
      benefits: { equals: [] },
    },
  });
  if (emptyBenefits > 0) {
    issues.push(`Natural remedies with no benefits: ${emptyBenefits}`);
  }

  const badMappings = await prisma.naturalRemedyMapping.count({
    where: {
      similarityScore: { lt: 0 },
    },
  });
  if (badMappings > 0) {
    issues.push(`Mappings with negative similarity score: ${badMappings}`);
  }

  const outOfRangeJournalRatings = await prisma.remedyJournal.count({
    where: {
      OR: [{ rating: { lt: 1 } }, { rating: { gt: 5 } }],
    },
  });
  if (outOfRangeJournalRatings > 0) {
    issues.push(
      `Journal entries with out-of-range ratings: ${outOfRangeJournalRatings}`,
    );
  }

  const invalidReportStatuses = await prisma.remedyReport.count({
    where: {
      status: {
        notIn: ["generating", "complete", "failed"],
      },
    },
  });
  if (invalidReportStatuses > 0) {
    issues.push(`Reports with invalid status values: ${invalidReportStatuses}`);
  }

  // Severity is a free-text column, and the interaction UI can only present
  // the four values it knows. Anything else now renders as "Unknown severity"
  // rather than as a green "Mild" — correct, but a row that lands there is a
  // data defect, and this is what makes it visible instead of merely survivable.
  const unknownSeverities = await prisma.drugInteraction.findMany({
    where: {
      severity: { notIn: ["contraindicated", "severe", "moderate", "mild"] },
    },
    select: { substanceA: true, substanceB: true, severity: true },
    take: 20,
  });
  if (unknownSeverities.length > 0) {
    const sample = unknownSeverities
      .map((r) => `${r.substanceA}+${r.substanceB}="${r.severity}"`)
      .join(", ");
    issues.push(
      `Interactions with an unrecognised severity: ${unknownSeverities.length} (${sample})`,
    );
  }

  // Same argument for the claim-limiting label on a mapping. The column is
  // NOT NULL, but Postgres does not constrain its values, and
  // lib/db/remedies.ts coerces at read time — so a bad value survives
  // indefinitely and is never seen.
  const invalidReplacementTypes = await prisma.naturalRemedyMapping.count({
    where: {
      replacementType: {
        notIn: ["Alternative", "Complementary", "Supportive"],
      },
    },
  });
  if (invalidReplacementTypes > 0) {
    issues.push(
      `Mappings with an invalid replacement type: ${invalidReplacementTypes}`,
    );
  }

  // The schema documents similarityScore as 0-1. Only the lower bound was checked.
  const aboveRangeMappings = await prisma.naturalRemedyMapping.count({
    where: { similarityScore: { gt: 1 } },
  });
  if (aboveRangeMappings > 0) {
    issues.push(
      `Mappings with similarity score above 1: ${aboveRangeMappings}`,
    );
  }

  if (issues.length > 0) {
    console.error("Data integrity checks FAILED:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log("Data integrity checks OK.");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Data integrity checks FAILED.");
  console.error(error);
  process.exit(1);
});
