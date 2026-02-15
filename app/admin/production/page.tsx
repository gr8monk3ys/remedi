import { isConnected, prisma } from "@/lib/db";
import { hasUpstashRedis } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { isSentryConfigured } from "@/lib/observability";
import { HealthStatus } from "./health-status";
import { SentryStatus } from "./sentry-status";
import { ProductionCheckButton } from "./production-check";

export const dynamic = "force-dynamic";

const REQUIRED_ENV = [
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
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "EMAIL_SERVER",
  "EMAIL_FROM",
];

function checkEnvStatus(names: string[]) {
  return names.map((name) => ({
    name,
    present: Boolean(process.env[name]),
  }));
}

export default async function ProductionReadinessPage() {
  const required = checkEnvStatus(REQUIRED_ENV);
  const recommended = checkEnvStatus(RECOMMENDED_ENV);
  const dbOk = await isConnected();
  const upstashOk = hasUpstashRedis();
  const sentryOk = isSentryConfigured();
  const webhookStatus = await prisma.webhookStatus.findUnique({
    where: { provider: "stripe" },
    select: { lastReceivedAt: true, lastEventType: true },
  });
  let stripeOk = false;
  try {
    await getStripe().products.list({ limit: 1 });
    stripeOk = true;
  } catch {
    stripeOk = false;
  }

  const missingRequired = required.filter((item) => !item.present).length;
  const missingRecommended = recommended.filter((item) => !item.present).length;
  const deployReady = dbOk && stripeOk && missingRequired === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Production Readiness
        </h1>
        <p className="text-muted-foreground mt-1">
          Deployment checklist and environment validation.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          label="Database connectivity"
          value={dbOk ? "Connected" : "Not reachable"}
          status={dbOk ? "good" : "bad"}
        />
        <StatusCard
          label="Required secrets"
          value={
            missingRequired === 0 ? "Complete" : `${missingRequired} missing`
          }
          status={missingRequired === 0 ? "good" : "bad"}
        />
        <StatusCard
          label="Optional services"
          value={
            missingRecommended === 0
              ? "Complete"
              : `${missingRecommended} missing`
          }
          status={missingRecommended === 0 ? "good" : "warn"}
        />
        <StatusCard
          label="Deploy Ready"
          value={deployReady ? "Ready" : "Not Ready"}
          status={deployReady ? "good" : "bad"}
        />
      </section>

      <section className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Required Environment Variables
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {required.map((item) => (
            <ChecklistRow
              key={item.name}
              name={item.name}
              present={item.present}
            />
          ))}
        </div>
      </section>

      <section className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Recommended Services
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {recommended.map((item) => (
            <ChecklistRow
              key={item.name}
              name={item.name}
              present={item.present}
            />
          ))}
        </div>
      </section>

      <section className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Runtime Services
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <ServiceRow
            label="Database"
            value={dbOk ? "Healthy" : "Unavailable"}
            status={dbOk ? "good" : "bad"}
          />
          <ServiceRow
            label="Upstash Redis"
            value={upstashOk ? "Configured" : "Not configured"}
            status={upstashOk ? "good" : "warn"}
          />
          <ServiceRow
            label="Stripe"
            value={stripeOk ? "Reachable" : "Unavailable"}
            status={stripeOk ? "good" : "warn"}
          />
          <ServiceRow
            label="Sentry"
            value={sentryOk ? "Configured" : "Not configured"}
            status={sentryOk ? "good" : "warn"}
          />
          <ServiceRow
            label="Stripe Webhook"
            value={
              webhookStatus?.lastReceivedAt
                ? `Last: ${webhookStatus.lastReceivedAt.toISOString()}`
                : "No events recorded"
            }
            status={webhookStatus?.lastReceivedAt ? "good" : "warn"}
            subtitle={webhookStatus?.lastEventType || undefined}
          />
          <HealthStatus />
          <SentryStatus />
        </div>
      </section>

      <section className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Production Checks
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <ProductionCheckButton />
        </div>
      </section>

      <section className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Ops Links & Webhooks
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <LinkRow label="Status Page" envKey="STATUSPAGE_URL" />
          <LinkRow label="Uptime Checks" envKey="UPTIME_STATUS_URL" />
          <LinkRow
            label="Stripe Webhooks"
            envKey="STRIPE_WEBHOOK_DASHBOARD_URL"
          />
          <LinkRow label="Sentry Project" envKey="SENTRY_PROJECT_URL" />
        </div>
      </section>
    </div>
  );
}

function StatusCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "good" | "warn" | "bad";
}) {
  const colors = {
    good: "text-green-600 dark:text-green-400",
    warn: "text-yellow-600 dark:text-yellow-400",
    bad: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[status]}`}>{value}</p>
    </div>
  );
}

function ChecklistRow({ name, present }: { name: string; present: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
      <span className="text-sm text-foreground">{name}</span>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded-full ${
          present
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        }`}
      >
        {present ? "Set" : "Missing"}
      </span>
    </div>
  );
}

function ServiceRow({
  label,
  value,
  status,
  subtitle,
}: {
  label: string;
  value: string;
  status: "good" | "warn" | "bad";
  subtitle?: string;
}) {
  const colors = {
    good: "text-green-600 dark:text-green-400",
    warn: "text-yellow-600 dark:text-yellow-400",
    bad: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${colors[status]}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function LinkRow({ label, envKey }: { label: string; envKey: string }) {
  const value = process.env[envKey];

  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      {value ? (
        <a
          href={value}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">Not configured</p>
      )}
    </div>
  );
}
