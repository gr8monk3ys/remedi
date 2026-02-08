import { PrismaClient } from "@prisma/client";
import { parseJsonArray } from "../lib/db/parsers";
import {
  allNaturalRemedies,
  pharmaceuticals,
  remedyMappings,
} from "./seed-data";
import { seedInteractions } from "./seeds/interactions";

const prisma = new PrismaClient();

// Batch size for database operations
const BATCH_SIZE = 50;

async function main(): Promise<void> {
  console.log("Starting database seed...");
  console.log(`Total natural remedies: ${allNaturalRemedies.length}`);
  console.log(`Total pharmaceuticals: ${pharmaceuticals.length}`);
  console.log(`Total mappings: ${remedyMappings.length}`);

  // Delete all existing records (to avoid duplicates during development)
  console.log("\nClearing existing data...");
  await prisma.naturalRemedyMapping.deleteMany({});
  await prisma.pharmaceutical.deleteMany({});
  await prisma.naturalRemedy.deleteMany({});
  console.log("Existing data cleared.");

  // Create pharmaceuticals in batches
  console.log("\nCreating pharmaceuticals...");
  for (let i = 0; i < pharmaceuticals.length; i += BATCH_SIZE) {
    const batch = pharmaceuticals.slice(i, i + BATCH_SIZE);
    await prisma.pharmaceutical.createMany({
      data: batch.map((pharm) => ({
        fdaId: pharm.fdaId || null,
        name: pharm.name,
        description: pharm.description || null,
        category: pharm.category,
        ingredients: parseJsonArray(pharm.ingredients),
        benefits: parseJsonArray(pharm.benefits),
        usage: pharm.usage || null,
        warnings: pharm.warnings || null,
        interactions: pharm.interactions || null,
      })),
      skipDuplicates: true,
    });
    console.log(
      `  Created pharmaceuticals ${i + 1} to ${Math.min(i + BATCH_SIZE, pharmaceuticals.length)}`,
    );
  }
  console.log(`Created ${pharmaceuticals.length} pharmaceuticals.`);

  // Create natural remedies in batches
  console.log("\nCreating natural remedies...");
  for (let i = 0; i < allNaturalRemedies.length; i += BATCH_SIZE) {
    const batch = allNaturalRemedies.slice(i, i + BATCH_SIZE);
    await prisma.naturalRemedy.createMany({
      data: batch.map((remedy) => ({
        name: remedy.name,
        description: remedy.description || null,
        category: remedy.category,
        ingredients: parseJsonArray(remedy.ingredients),
        benefits: parseJsonArray(remedy.benefits),
        imageUrl:
          "imageUrl" in remedy && typeof remedy.imageUrl === "string"
            ? remedy.imageUrl
            : null,
        usage: remedy.usage || null,
        dosage: remedy.dosage || null,
        precautions: remedy.precautions || null,
        scientificInfo: remedy.scientificInfo || null,
        references: parseJsonArray(remedy.references),
        relatedRemedies: parseJsonArray(remedy.relatedRemedies),
        sourceUrl:
          "sourceUrl" in remedy && typeof remedy.sourceUrl === "string"
            ? remedy.sourceUrl
            : null,
        evidenceLevel: remedy.evidenceLevel || null,
      })),
      skipDuplicates: true,
    });
    console.log(
      `  Created remedies ${i + 1} to ${Math.min(i + BATCH_SIZE, allNaturalRemedies.length)}`,
    );
  }
  console.log(`Created ${allNaturalRemedies.length} natural remedies.`);

  // Create mappings between pharmaceuticals and natural remedies
  console.log("\nCreating remedy mappings...");

  // First, fetch all pharmaceuticals and remedies for lookup
  const allPharms = await prisma.pharmaceutical.findMany({
    select: { id: true, name: true },
  });
  const allRemedies = await prisma.naturalRemedy.findMany({
    select: { id: true, name: true },
  });

  // Create lookup maps
  const pharmMap = new Map(allPharms.map((p) => [p.name, p.id]));
  const remedyMap = new Map(allRemedies.map((r) => [r.name, r.id]));

  // Filter valid mappings and prepare data
  const validMappings = remedyMappings
    .filter((mapping) => {
      const pharmId = pharmMap.get(mapping.pharmaceuticalName);
      const remedyId = remedyMap.get(mapping.naturalRemedyName);
      if (!pharmId) {
        console.warn(
          `  Warning: Pharmaceutical not found: ${mapping.pharmaceuticalName}`,
        );
        return false;
      }
      if (!remedyId) {
        console.warn(
          `  Warning: Remedy not found: ${mapping.naturalRemedyName}`,
        );
        return false;
      }
      return true;
    })
    .map((mapping) => ({
      pharmaceuticalId: pharmMap.get(mapping.pharmaceuticalName)!,
      naturalRemedyId: remedyMap.get(mapping.naturalRemedyName)!,
      similarityScore: mapping.similarityScore,
      matchingNutrients: parseJsonArray(mapping.matchingNutrients),
      replacementType: mapping.replacementType,
    }));

  // Create mappings in batches
  let createdMappings = 0;
  let skippedMappings = 0;

  for (let i = 0; i < validMappings.length; i += BATCH_SIZE) {
    const batch = validMappings.slice(i, i + BATCH_SIZE);

    // Use individual creates to handle duplicates gracefully
    for (const mapping of batch) {
      try {
        await prisma.naturalRemedyMapping.create({
          data: mapping,
        });
        createdMappings++;
      } catch {
        // Skip duplicates silently
        skippedMappings++;
      }
    }

    console.log(
      `  Processed mappings ${i + 1} to ${Math.min(i + BATCH_SIZE, validMappings.length)}`,
    );
  }

  console.log(
    `Created ${createdMappings} mappings (${skippedMappings} duplicates skipped).`,
  );

  // Print summary
  console.log("\n========================================");
  console.log("Seed completed successfully!");
  console.log("========================================");
  console.log(`Pharmaceuticals: ${pharmaceuticals.length}`);
  console.log(`Natural Remedies: ${allNaturalRemedies.length}`);
  console.log(`Mappings: ${createdMappings}`);
  console.log("========================================");

  // Seed drug interactions
  await seedInteractions(prisma);

  // Print category breakdown
  const categoryCounts = allNaturalRemedies.reduce(
    (acc, remedy) => {
      acc[remedy.category] = (acc[remedy.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("\nNatural Remedy Categories:");
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
