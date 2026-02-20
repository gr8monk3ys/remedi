import { prisma } from "@/lib/db";

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

export type ProductionCheckResult = {
  ok: boolean;
  missingRequired: string[];
  missingRecommended: string[];
  dbOk: boolean;
};

function missingEnv(names: string[]) {
  return names.filter((name) => !process.env[name]);
}

export async function runProductionChecks(): Promise<ProductionCheckResult> {
  const missingRequired = missingEnv(REQUIRED_ENV);
  const missingRecommended = missingEnv(RECOMMENDED_ENV);

  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return {
    ok: missingRequired.length === 0 && dbOk,
    missingRequired,
    missingRecommended,
    dbOk,
  };
}
