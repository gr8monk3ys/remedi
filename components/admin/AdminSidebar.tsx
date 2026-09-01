"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  BarChart3,
  CreditCard,
  ArrowLeft,
  Shield,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
interface AdminUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface AdminSidebarProps {
  user: AdminUser;
}

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "moderator"],
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/admin/moderation",
    label: "Moderation",
    icon: FileCheck,
    roles: ["admin", "moderator"],
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    href: "/admin/production",
    label: "Production",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    roles: ["admin"],
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const userRole = user.role || "user";

  const accessibleItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  function SidebarContent() {
    return (
      <>
        {/* Header */}
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background">
            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          </span>
          <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
            Admin Panel
          </h1>
          <span className="ml-auto rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[11px] capitalize text-muted-foreground">
            {userRole}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
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
                alt={user.name || "User"}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full border border-border"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background">
                <span className="text-sm font-medium text-muted-foreground">
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile menu button — the admin panel previously rendered a fixed
          256px sidebar at every width, leaving almost no room for content
          on a phone. */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 rounded-lg border border-border bg-card p-2 shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-expanded={isMobileOpen}
        aria-controls="admin-mobile-sidebar"
        aria-label={isMobileOpen ? "Close admin menu" : "Open admin menu"}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-muted-foreground" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        id="admin-mobile-sidebar"
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Admin navigation"
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden w-64 flex-col border-r border-border bg-card lg:flex"
        aria-label="Admin navigation"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
