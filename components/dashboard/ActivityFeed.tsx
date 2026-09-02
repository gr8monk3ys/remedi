"use client";

import { formatDistanceToNow } from "date-fns";
import { Search, Heart, Star, FileText, HeartOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types/dashboard";

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
  className?: string;
}

const activityIcons = {
  search: Search,
  favorite_add: Heart,
  favorite_remove: HeartOff,
  review: Star,
  contribution: FileText,
};

const activityColors = {
  search: "bg-primary/10 text-primary",
  favorite_add: "bg-primary/10 text-primary",
  favorite_remove: "bg-muted text-muted-foreground",
  review: "bg-premium-surface text-premium",
  contribution: "bg-primary/10 text-primary",
};

/**
 * Activity Feed Component
 *
 * Displays a list of recent user activities.
 */
export function ActivityFeed({
  activities,
  isLoading = false,
  maxItems = 5,
  className,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  if (isLoading) {
    return <ActivityFeedSkeleton count={maxItems} className={className} />;
  }

  if (activities.length === 0) {
    return (
      <div
        className={cn("rounded-lg border border-border bg-card p-5", className)}
      >
        <h3 className="eyebrow eyebrow-muted mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
          <p className="text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start searching to see your activity here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-5", className)}
    >
      <h3 className="eyebrow eyebrow-muted mb-4">Recent Activity</h3>

      <div className="space-y-1">
        {displayedActivities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted/60"
            >
              <div className={cn("shrink-0 rounded-md p-2", colorClass)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  <time dateTime={activity.timestamp.toISOString()}>
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                    })}
                  </time>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for activity feed
 */
export function ActivityFeedSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-5", className)}
    >
      <div className="mb-4 h-3 w-32 animate-pulse rounded bg-muted" />

      <div className="space-y-1">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
