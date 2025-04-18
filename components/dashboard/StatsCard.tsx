"use client";

import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

/**
 * Stats Card Component
 *
 * Displays a single statistic with optional trend indicator.
 * Used on the dashboard to show key metrics.
 */
export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  isLoading = false,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-card rounded-xl shadow-sm border border-border p-6",
          className,
        )}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 w-10 bg-muted rounded-lg" />
          </div>
          <div className="h-8 w-16 bg-muted rounded mb-2" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card rounded-xl shadow-sm border border-border p-6 transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {trend && (
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            <span aria-hidden="true">{trend.isPositive ? "+" : ""}</span>
            <span>{trend.value}%</span>
            <span className="sr-only">
              {trend.isPositive ? "increase" : "decrease"} from last period
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for stats cards
 */
export function StatsCardSkeleton() {
  return <StatsCard title="" value="" icon={Activity} isLoading />;
}

/**
 * Grid of stats card skeletons
 */
export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
