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
        className={cn("rounded-lg border border-border bg-card p-5", className)}
      >
        <div className="animate-pulse">
          <div className="mb-5 flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-8 w-8 rounded-md bg-muted" />
          </div>
          <div className="mb-2 h-8 w-16 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-lg border border-border bg-card p-5", className)}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="eyebrow eyebrow-muted">{title}</h3>
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="tabular text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {trend && (
          <div
            className={cn(
              "tabular flex items-center font-mono text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive",
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
