import { prisma } from "@/lib/db";
import { ModerationQueue } from "@/components/admin/ModerationQueue";
export const dynamic = 'force-dynamic';



async function getPendingItems() {
  const [contributions, reviews] = await Promise.all([
    prisma.remedyContribution.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    }),
    prisma.remedyReview.findMany({
      where: { verified: false },
      orderBy: { createdAt: "asc" },
      take: 50,
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    }),
  ]);

  return { contributions, reviews };
}

export default async function ModerationPage() {
  const { contributions, reviews } = await getPendingItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Content Moderation
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Review and approve user-submitted content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending Contributions
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {contributions.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unverified Reviews
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {reviews.length}
          </p>
        </div>
      </div>

      {/* Moderation Queue */}
      <ModerationQueue contributions={contributions} reviews={reviews} />
    </div>
  );
}
