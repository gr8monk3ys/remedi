"use client";

import { cn } from "@/lib/utils";
import type { UsageData } from "@/types/dashboard";

interface UsageProgressProps {
  usage: UsageData;
  showPercentage?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Usage Progress Component
 *
 * Displays usage data with a progress bar.
 */
export function UsageProgress({
  usage,
  showPercentage = true,
  className,
  size = "md",
}: UsageProgressProps) {
  const { current, limit, label, unit } = usage;

  // Handle unlimited (-1)
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 100 : Math.min((current / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && percentage >= 100;

  const barHeight = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size];

  const getBarColor = (): string => {
    if (isUnlimited) return "bg-primary";
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {isUnlimited ? (
            <span className="text-primary font-medium">Unlimited</span>
          ) : (
            <>
              {current.toLocaleString()} / {limit.toLocaleString()}
              {unit && ` ${unit}`}
              {showPercentage && (
                <span className="ml-2 text-xs">
                  ({Math.round(percentage)}%)
                </span>
              )}
            </>
          )}
        </span>
      </div>

      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          barHeight,
        )}
        role="progressbar"
        aria-valuenow={isUnlimited ? 100 : current}
        aria-valuemin={0}
        aria-valuemax={isUnlimited ? 100 : limit}
        aria-label={`${label}: ${isUnlimited ? "Unlimited" : `${current} of ${limit}`}`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getBarColor(),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isAtLimit && !isUnlimited && (
        <p className="text-xs text-red-500 dark:text-red-400">
          You have reached your limit. Upgrade to continue.
        </p>
      )}
    </div>
  );
}

/**
 * Multiple usage progress bars
 */
interface UsageProgressListProps {
  usages: UsageData[];
  title?: string;
  className?: string;
}

export function UsageProgressList({
  usages,
  title,
  className,
}: UsageProgressListProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl shadow-sm border border-border p-6",
        className,
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      )}
      <div className="space-y-4">
        {usages.map((usage, index) => (
          <UsageProgress key={index} usage={usage} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for usage progress
 */
export function UsageProgressSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
      <div className="h-2 w-full bg-muted rounded-full" />
    </div>
  );
}
