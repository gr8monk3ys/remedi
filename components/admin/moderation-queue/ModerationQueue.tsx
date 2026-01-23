"use client";

/**
 * Moderation Queue Component
 *
 * Admin interface for moderating user contributions and reviews.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { fetchWithCSRF } from "@/lib/fetch";
import { UserAvatar } from "./UserAvatar";
import { ModerationActions } from "./ModerationActions";
import type { ModerationQueueProps, ModerationItemType } from "./types";

/**
 * Parse JSON string safely
 */
function parseJSON(str: string): string[] {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

export function ModerationQueue({
  contributions,
  reviews,
}: ModerationQueueProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"contributions" | "reviews">(
    "contributions",
  );
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [moderatorNote, setModeratorNote] = useState("");

  const handleApprove = async (id: string, type: ModerationItemType) => {
    setProcessing(id);
    try {
      const response = await fetchWithCSRF(`/api/admin/moderation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          action: "approve",
          note: moderatorNote || undefined,
        }),
      });

      if (response.ok) {
        router.refresh();
        setModeratorNote("");
      }
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string, type: ModerationItemType) => {
    if (!moderatorNote.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    setProcessing(id);
    try {
      const response = await fetchWithCSRF(`/api/admin/moderation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          action: "reject",
          note: moderatorNote,
        }),
      });

      if (response.ok) {
        router.refresh();
        setModeratorNote("");
      }
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("contributions")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "contributions"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Contributions ({contributions.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "contributions" && (
          <div className="space-y-4">
            {contributions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No pending contributions
              </p>
            ) : (
              contributions.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {/* Header */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                    onClick={() =>
                      setExpandedItem(expandedItem === item.id ? null : item.id)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <UserAvatar user={item.user} />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {item.user.name || item.user.email} •{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                        {item.category}
                      </span>
                      {expandedItem === item.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItem === item.id && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Description
                        </h4>
                        <p className="text-gray-900 dark:text-white">
                          {item.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Ingredients
                          </h4>
                          <ul className="list-disc list-inside text-gray-900 dark:text-white">
                            {parseJSON(item.ingredients).map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Benefits
                          </h4>
                          <ul className="list-disc list-inside text-gray-900 dark:text-white">
                            {parseJSON(item.benefits).map((ben, i) => (
                              <li key={i}>{ben}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {item.usage && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Usage
                          </h4>
                          <p className="text-gray-900 dark:text-white">
                            {item.usage}
                          </p>
                        </div>
                      )}

                      {item.dosage && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Dosage
                          </h4>
                          <p className="text-gray-900 dark:text-white">
                            {item.dosage}
                          </p>
                        </div>
                      )}

                      {item.precautions && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Precautions
                          </h4>
                          <p className="text-gray-900 dark:text-white">
                            {item.precautions}
                          </p>
                        </div>
                      )}

                      {/* Moderation Actions */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <textarea
                          value={moderatorNote}
                          onChange={(e) => setModeratorNote(e.target.value)}
                          placeholder="Moderator note (required for rejection)"
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                          rows={2}
                        />
                        <ModerationActions
                          onApprove={() =>
                            handleApprove(item.id, "contribution")
                          }
                          onReject={() => handleReject(item.id, "contribution")}
                          disabled={processing === item.id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No unverified reviews
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <UserAvatar user={review.user} />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {review.title || "Review"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          for {review.remedyName} • by{" "}
                          {review.user.name || review.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700 dark:text-gray-300">
                    {review.comment}
                  </p>
                  <div className="mt-4">
                    <ModerationActions
                      onApprove={() => handleApprove(review.id, "review")}
                      onReject={() => handleReject(review.id, "review")}
                      disabled={processing === review.id}
                      approveLabel="Verify"
                      rejectLabel="Remove"
                      size="sm"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
