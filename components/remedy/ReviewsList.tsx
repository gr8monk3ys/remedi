"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  averageRating: number;
  totalReviews: number;
}

interface ReviewsListProps {
  remedyId: string;
  refreshTrigger?: number;
}

export function ReviewsList({ remedyId, refreshTrigger }: ReviewsListProps) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reviews?remedyId=${remedyId}&page=${page}&limit=5`,
      );
      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || "Failed to load reviews");
        return;
      }

      setData(result.data);
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [remedyId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <p>{error}</p>
        <button
          onClick={fetchReviews}
          className="mt-2 text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground">No reviews yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Be the first to share your experience!
        </p>
      </div>
    );
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">
            {data.averageRating.toFixed(1)}
          </div>
          {renderStars(Math.round(data.averageRating))}
        </div>
        <div className="text-sm text-muted-foreground">
          Based on {data.totalReviews} review
          {data.totalReviews !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {data.reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-border pb-6 last:border-0"
          >
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  alt={review.user.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">
                    {review.user.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">
                    {review.user.name || "Anonymous"}
                  </span>
                  {review.verified && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {review.title && (
                  <h4 className="font-medium text-foreground mb-1">
                    {review.title}
                  </h4>
                )}

                <p className="text-muted-foreground text-sm">
                  {review.comment}
                </p>

                {review.helpful > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{review.helpful} found this helpful</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-3 py-1 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
