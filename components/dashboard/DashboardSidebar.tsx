"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  History,
  Heart,
  CreditCard,
  Settings,
  ArrowLeft,
  Menu,
  X,
  User as UserIcon,
  UserCircle,
  BookOpen,
  FileText,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
interface DashboardUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}
import type { PlanType } from "@/lib/stripe-config";

interface DashboardSidebarProps {
  user: DashboardUser;
  currentPlan?: PlanType;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Dashboard overview",
  },
  {
    href: "/dashboard/history",
    label: "Search History",
    icon: History,
    description: "View past searches",
  },
  {
    href: "/dashboard/health-profile",
    label: "Health Profile",
    icon: UserCircle,
    description: "Profile & medications",
  },
  {
    href: "/dashboard/journal",
    label: "Journal",
    icon: BookOpen,
    description: "Track remedy effectiveness",
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: FileText,
    description: "AI-generated reports",
  },
  {
    href: "/dashboard/favorites",
    label: "Favorites",
    icon: Heart,
    description: "Saved remedies",
  },
  {
    href: "/dashboard/subscription",
    label: "Subscription",
    icon: CreditCard,
    description: "Manage your plan",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    description: "Account settings",
  },
];

/**
 * Dashboard Sidebar Component
 *
 * Provides navigation for the user dashboard.
 * Collapsible on mobile devices.
 */
export function DashboardSidebar({
  user,
  currentPlan = "free",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const displayName = user.name || user.email || "User";

  const planLabels: Record<PlanType, string> = {
    free: "Free Plan",
    basic: "Basic Plan",
    premium: "Premium Plan",
  };

  const NavContent = () => (
    <>
      {/* Header */}
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background">
            <Leaf className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          </span>
          Remedi
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Dashboard navigation">
        <p className="eyebrow eyebrow-muted px-2 pb-3">Dashboard</p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Back to Site */}
      <div className="border-t border-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Site</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-border"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
              <UserIcon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {planLabels[currentPlan]}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed top-3 left-3 z-50 rounded-md border border-border bg-card p-2 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
        aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Menu className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Mobile sidebar"
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="sticky top-0 hidden h-screen w-60 flex-col border-r border-border bg-card lg:flex"
        aria-label="Desktop sidebar"
      >
        <NavContent />
      </aside>
    </>
  );
}
