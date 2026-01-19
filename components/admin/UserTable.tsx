"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreVertical, Shield, User as UserIcon, Crown, Trash2 } from "lucide-react";
import { fetchWithCSRF } from "@/lib/fetch";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: Date;
  _count: {
    reviews: number;
    contributions: number;
  };
  subscription: {
    plan: string;
    status: string;
  } | null;
}

interface UserTableProps {
  users: User[];
  currentPage: number;
  totalPages: number;
}

export function UserTable({ users, currentPage, totalPages }: UserTableProps) {
  const router = useRouter();
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const response = await fetchWithCSRF(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setUpdating(null);
      setActionMenuOpen(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      moderator: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      user: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  const getPlanBadge = (plan: string | undefined) => {
    if (!plan || plan === "free") return null;
    const colors = {
      basic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      premium: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      enterprise: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return colors[plan as keyof typeof colors] || null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || "Unnamed User"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.subscription ? (
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${
                        getPlanBadge(user.subscription.plan) ||
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {user.subscription.plan}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Free</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex gap-4">
                    <span>{user._count.reviews} reviews</span>
                    <span>{user._count.contributions} contributions</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)
                      }
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      disabled={updating === user.id}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {actionMenuOpen === user.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleRoleChange(user.id, "user")}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <UserIcon className="w-4 h-4" />
                            Set as User
                          </button>
                          <button
                            onClick={() => handleRoleChange(user.id, "moderator")}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Shield className="w-4 h-4" />
                            Set as Moderator
                          </button>
                          <button
                            onClick={() => handleRoleChange(user.id, "admin")}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Crown className="w-4 h-4" />
                            Set as Admin
                          </button>
                          <hr className="my-1 border-gray-200 dark:border-gray-700" />
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/admin/users?page=${currentPage - 1}`}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/admin/users?page=${currentPage + 1}`}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
