import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for production checks.");
  }
  const pool = new Pool({ connectionString: databaseUrl });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const prisma = createClient();

const REQUIRED_ENV = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_APP_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_BASIC_MONTHLY_PRICE_ID",
  "STRIPE_BASIC_YEARLY_PRICE_ID",
  "STRIPE_PREMIUM_MONTHLY_PRICE_ID",
  "STRIPE_PREMIUM_YEARLY_PRICE_ID",
];

const RECOMMENDED_ENV = [
  "CLERK_WEBHOOK_SECRET",
  "AUTH_SECRET",
  "OPENAI_API_KEY",
  "OPENFDA_API_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_RELEASE",
  "SENTRY_AUTH_TOKEN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "ANALYTICS_IP_SALT",
];

function missingEnv(names: string[]) {
  return names.filter((name) => !process.env[name]);
}

async function main() {
  const missingRequired = missingEnv(REQUIRED_ENV);
  const missingRecommended = missingEnv(RECOMMENDED_ENV);

  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  } finally {
    await prisma.$disconnect();
  }

  if (!dbOk) {
    console.error("Database connectivity FAILED.");
    process.exit(1);
  }

  if (missingRequired.length > 0) {
    console.error("Missing required production env vars:");
    for (const name of missingRequired) {
      console.error(`- ${name}`);
    }
    process.exit(1);
  }

  if (missingRecommended.length > 0) {
    console.warn("Missing recommended production env vars:");
    for (const name of missingRecommended) {
      console.warn(`- ${name}`);
    }
  }

  console.log("Production readiness checks passed.");
}

main().catch((error) => {
  console.error("Production readiness checks FAILED.");
  console.error(error);
  process.exit(1);
});
