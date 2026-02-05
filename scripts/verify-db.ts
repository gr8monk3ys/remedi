import { prisma } from "../lib/db/client";

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
  ]);

  const [users, remedies, pharmaceuticals, searches] = counts;

  console.log("DB verification OK.");
  console.log(
    JSON.stringify(
      {
        users,
        remedies,
        pharmaceuticals,
        searches,
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
