"use client";

import { useState } from "react";
import { Star, Send, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { fetchWithCSRF } from "@/lib/fetch";

interface ReviewFormProps {
  remedyId: string;
  remedyName: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ remedyId, remedyName, onReviewSubmitted, onCancel }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (comment.length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithCSRF("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remedyId,
          remedyName,
          rating,
          title: title || undefined,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error?.message || "Failed to submit review");
        return;
      }

      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      onReviewSubmitted?.();
    } catch {
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Sign in to write a review and share your experience with this remedy.
        </p>
        <Link
          href="/auth/signin"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Sign In to Review
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Write a Review
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 self-center">
            {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select rating"}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label
          htmlFor="review-title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Title (optional)
        </label>
        <input
          type="text"
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Your Review *
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this remedy. What worked well? Any tips for others?"
          rows={4}
          minLength={10}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {comment.length}/10 minimum characters
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Review
          </>
        )}
      </button>
    </form>
  );
}
