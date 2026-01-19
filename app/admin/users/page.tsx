import { prisma } from "@/lib/db";
import { UserTable } from "@/components/admin/UserTable";

async function getUsers(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            reviews: true,
            contributions: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    total,
    pages: Math.ceil(total / limit),
  };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const { users, total, pages } = await getUsers(page);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {total} total users
          </p>
        </div>
      </div>

      {/* User Table */}
      <UserTable users={users} currentPage={page} totalPages={pages} />
    </div>
  );
}
