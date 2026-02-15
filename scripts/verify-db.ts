import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for DB verification.");
  }
  const pool = new Pool({ connectionString: databaseUrl });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for DB verification.`);
  }
  return value;
}

async function main() {
  requireEnv("DATABASE_URL");

  await prisma.$queryRaw`SELECT 1`;

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.naturalRemedy.count(),
    prisma.pharmaceutical.count(),
    prisma.searchHistory.count(),
    prisma.healthProfile.count(),
    prisma.medicationCabinet.count(),
    prisma.remedyJournal.count(),
    prisma.remedyReport.count(),
    prisma.drugInteraction.count(),
  ]);

  const [
    users,
    remedies,
    pharmaceuticals,
    searches,
    healthProfiles,
    medications,
    journalEntries,
    reports,
    interactions,
  ] = counts;

  console.log("DB verification OK.");
  console.log(
    JSON.stringify(
      {
        users,
        remedies,
        pharmaceuticals,
        searches,
        healthProfiles,
        medications,
        journalEntries,
        reports,
        interactions,
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("DB verification FAILED.");
  console.error(error);
  process.exit(1);
});
