"use client";

import Link from "next/link";
import { Search, Heart, FileText, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const defaultActions: QuickAction[] = [
  {
    href: "/",
    label: "Search Remedies",
    description: "Find natural alternatives",
    icon: Search,
    color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  },
  {
    href: "/dashboard/favorites",
    label: "View Favorites",
    description: "See saved remedies",
    icon: Heart,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  },
  {
    href: "/contribute",
    label: "Contribute",
    description: "Submit a remedy",
    icon: FileText,
    color:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    href: "/dashboard/subscription",
    label: "Subscription",
    description: "Manage billing & invoices",
    icon: CreditCard,
    color:
      "bg-[color:color-mix(in_srgb,var(--accent-dark)_16%,white)] text-[var(--accent-dark)] dark:bg-[color:color-mix(in_srgb,var(--accent-dark)_22%,black)] dark:text-[var(--accent-light)]",
  },
];

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
}

/**
 * Quick Actions Component
 *
 * Displays quick action buttons for common tasks.
 */
export function QuickActions({
  actions = defaultActions,
  className,
}: QuickActionsProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl shadow-sm border border-border p-6",
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary dark:hover:border-primary hover:shadow-sm transition-all group"
            >
              <div className={cn("p-2 rounded-lg", action.color)}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
