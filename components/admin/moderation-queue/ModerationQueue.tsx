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
import { createLogger } from "@/lib/logger";
import { UserAvatar } from "./UserAvatar";

const logger = createLogger("moderation-queue");
import { ModerationActions } from "./ModerationActions";
import type { ModerationQueueProps, ModerationItemType } from "./types";

/**
 * Normalize list-like fields (string[] or JSON string)
 */
function normalizeList(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
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
      logger.error("Failed to approve", error);
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
      logger.error("Failed to reject", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border">
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("contributions")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "contributions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Contributions ({contributions.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
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
              <p className="text-center text-muted-foreground py-8">
                No pending contributions
              </p>
            ) : (
              contributions.map((item) => (
                <div key={item.id} className="border border-border rounded-lg">
                  {/* Header */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted"
                    onClick={() =>
                      setExpandedItem(expandedItem === item.id ? null : item.id)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <UserAvatar user={item.user} />
                      <div>
                        <h3 className="font-medium text-foreground">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {item.user.name || item.user.email} •{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-muted rounded">
                        {item.category}
                      </span>
                      {expandedItem === item.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedItem === item.id && (
                    <div className="p-4 border-t border-border space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-1">
                          Description
                        </h4>
                        <p className="text-foreground">{item.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Ingredients
                          </h4>
                          <ul className="list-disc list-inside text-foreground">
                            {normalizeList(item.ingredients).map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Benefits
                          </h4>
                          <ul className="list-disc list-inside text-foreground">
                            {normalizeList(item.benefits).map((ben, i) => (
                              <li key={i}>{ben}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {item.usage && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Usage
                          </h4>
                          <p className="text-foreground">{item.usage}</p>
                        </div>
                      )}

                      {item.dosage && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Dosage
                          </h4>
                          <p className="text-foreground">{item.dosage}</p>
                        </div>
                      )}

                      {item.precautions && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Precautions
                          </h4>
                          <p className="text-foreground">{item.precautions}</p>
                        </div>
                      )}

                      {/* Moderation Actions */}
                      <div className="pt-4 border-t border-border">
                        <textarea
                          value={moderatorNote}
                          onChange={(e) => setModeratorNote(e.target.value)}
                          placeholder="Moderator note (required for rejection)"
                          className="w-full p-3 border border-border rounded-lg bg-card text-foreground mb-3"
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
              <p className="text-center text-muted-foreground py-8">
                No unverified reviews
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <UserAvatar user={review.user} />
                      <div>
                        <h3 className="font-medium text-foreground">
                          {review.title || "Review"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
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
                              : "text-muted-foreground/40"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-foreground">{review.comment}</p>
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
