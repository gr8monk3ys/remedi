import { prisma } from "../lib/db/client";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for health checks.`);
  }
  return value;
}

async function main() {
  requireEnv("DATABASE_URL");

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Health check OK: database connection successful.");
  } catch (error) {
    console.error("Health check FAILED: database connection error.");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Health check FAILED: unexpected error.");
  console.error(error);
  process.exit(1);
});
