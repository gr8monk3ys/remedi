"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreVertical, RefreshCw, XCircle, ArrowUp } from "lucide-react";
import { fetchWithCSRF } from "@/lib/fetch";

interface User {
  name: string | null;
  email: string;
  image: string | null;
}

interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  interval: string | null;
  startedAt: Date;
  expiresAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  user: User;
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
}

export function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  const router = useRouter();
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAction = async (id: string, action: string, data?: object) => {
    setProcessing(id);
    try {
      const response = await fetchWithCSRF(`/api/admin/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update subscription:", error);
    } finally {
      setProcessing(null);
      setActionMenuOpen(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      suspended: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return colors[status as keyof typeof colors] || colors.cancelled;
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      basic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      premium: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      enterprise: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return colors[plan as keyof typeof colors] || colors.free;
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
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Billing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {subscriptions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No subscriptions found
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {sub.user.image ? (
                        <Image
                          src={sub.user.image}
                          alt={sub.user.name || "User"}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {sub.user.name?.charAt(0) ||
                              sub.user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {sub.user.name || "Unnamed User"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {sub.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${getPlanBadge(
                        sub.plan
                      )}`}
                    >
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadge(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {sub.interval || "One-time"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sub.expiresAt
                      ? new Date(sub.expiresAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuOpen(
                            actionMenuOpen === sub.id ? null : sub.id
                          )
                        }
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        disabled={processing === sub.id}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuOpen === sub.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <div className="py-1">
                            {sub.plan !== "premium" && (
                              <button
                                onClick={() =>
                                  handleAction(sub.id, "upgrade", {
                                    plan: "premium",
                                  })
                                }
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <ArrowUp className="w-4 h-4" />
                                Upgrade to Premium
                              </button>
                            )}
                            {sub.status === "active" && (
                              <button
                                onClick={() => handleAction(sub.id, "cancel")}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel Subscription
                              </button>
                            )}
                            {sub.status === "cancelled" && (
                              <button
                                onClick={() => handleAction(sub.id, "reactivate")}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Reactivate
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
