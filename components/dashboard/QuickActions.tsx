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
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/dashboard/favorites",
    label: "View Favorites",
    description: "See saved remedies",
    icon: Heart,
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/contribute",
    label: "Contribute",
    description: "Submit a remedy",
    icon: FileText,
    color: "bg-primary/10 text-primary",
  },
  {
    href: "/dashboard/subscription",
    label: "Subscription",
    description: "Manage billing & invoices",
    icon: CreditCard,
    color: "dashboard-accent-chip",
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
      className={cn("rounded-lg border border-border bg-card p-5", className)}
    >
      <h3 className="eyebrow eyebrow-muted mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:border-border-strong hover:bg-muted/60"
            >
              <div className={cn("rounded-md p-2", action.color)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
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
