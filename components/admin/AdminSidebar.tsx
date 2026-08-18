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
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {userRole}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Site</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground font-medium">
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
