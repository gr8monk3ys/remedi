import { prisma } from "@/lib/db";

const REQUIRED_ENV = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  // Sign-in requires a verified email, so without Resend nobody can sign up.
  "RESEND_API_KEY",
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
  const dbOk = await prisma.$queryRaw`SELECT 1`
    .then(() => true)
    .catch(() => false);

  return {
    ok: missingRequired.length === 0 && dbOk,
    missingRequired,
    missingRecommended,
    dbOk,
  };
}
