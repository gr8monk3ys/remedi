import { prisma } from "@/lib/db";
import { SubscriptionTable } from "@/components/admin/SubscriptionTable";

interface SubscriptionGroupStat {
  plan: string;
  status: string;
  _count: { plan: number };
}

async function getSubscriptions() {
  const [subscriptions, stats] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    }),
    prisma.subscription.groupBy({
      by: ["plan", "status"],
      _count: { plan: true },
    }),
  ]);

  // Calculate stats
  const planCounts = stats.reduce(
    (acc: Record<string, { total: number; active: number }>, s: SubscriptionGroupStat) => {
      if (!acc[s.plan]) acc[s.plan] = { total: 0, active: 0 };
      acc[s.plan].total += s._count.plan;
      if (s.status === "active") acc[s.plan].active += s._count.plan;
      return acc;
    },
    {} as Record<string, { total: number; active: number }>
  );

  return { subscriptions, planCounts };
}

export default async function SubscriptionsPage() {
  const { subscriptions, planCounts } = await getSubscriptions();

  const plans = ["free", "basic", "premium", "enterprise"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Subscription Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage user subscriptions and plans
        </p>
      </div>

      {/* Plan Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const data = planCounts[plan] || { total: 0, active: 0 };
          const colors = {
            free: "bg-gray-500",
            basic: "bg-green-500",
            premium: "bg-purple-500",
            enterprise: "bg-indigo-500",
          };

          return (
            <div
              key={plan}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {plan} Plan
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {data.active}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {data.total} total ({data.total - data.active} inactive)
                  </p>
                </div>
                <div
                  className={`${colors[plan as keyof typeof colors]} w-3 h-3 rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Table */}
      <SubscriptionTable subscriptions={subscriptions} />
    </div>
  );
}
