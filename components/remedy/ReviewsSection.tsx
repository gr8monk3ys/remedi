"use client";

import { useState } from "react";
import { MessageSquare, PenSquare } from "lucide-react";
import { ReviewForm, ReviewsList } from "@/components/remedy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewsSectionProps {
  remedyId: string;
  remedyName: string;
}

export function ReviewsSection({ remedyId, remedyName }: ReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Reviews
        </CardTitle>
        {!showReviewForm && (
          <Button
            size="sm"
            onClick={() => setShowReviewForm(true)}
            className="gap-1.5"
          >
            <PenSquare className="h-4 w-4" />
            Write a Review
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showReviewForm && (
          <div className="mb-6">
            <ReviewForm
              remedyId={remedyId}
              remedyName={remedyName}
              onReviewSubmitted={() => {
                setShowReviewForm(false);
                setReviewRefreshTrigger((prev) => prev + 1);
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}

        <ReviewsList
          remedyId={remedyId}
          refreshTrigger={reviewRefreshTrigger}
        />
      </CardContent>
    </Card>
  );
}
