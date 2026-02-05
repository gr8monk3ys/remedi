import { prisma } from "../lib/db/client";

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
