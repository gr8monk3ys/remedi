"use client";

import { Component, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { GitCompare, Leaf, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCompare } from "@/lib/context/CompareContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Error boundary for auth section -- if Clerk hooks throw,
 * fall back to a simple sign-in link.
 */
class AuthErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      );
    }
    return this.props.children;
  }
}

function AuthSection(): ReactNode {
  const { isLoaded, isSignedIn } = useUser();
  const [showFallbackSignIn, setShowFallbackSignIn] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setShowFallbackSignIn(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowFallbackSignIn(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (!isLoaded) {
    if (showFallbackSignIn) {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      );
    }

    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  return isSignedIn ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <Button variant="outline" size="sm">
        Sign In
      </Button>
    </SignInButton>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  // The interaction checker is a core safety feature but had no entry point in
  // any nav, so it was only reachable by typing the URL.
  { href: "/interactions", label: "Interactions" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * Route prefixes that render their own sidebar chrome. The marketing header is
 * fixed-position, so leaving it mounted there overlapped the sidebar heading
 * and put a second hamburger button on top of the dashboard's own.
 */
const APP_CHROME_PREFIXES = ["/dashboard", "/admin"];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const { items, getCompareUrl } = useCompare();

  const hideHeader = APP_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (hideHeader) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
            <Leaf className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          </span>
          Remedi
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                isActivePath(pathname, link.href) ? "page" : undefined
              }
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors hover:text-foreground",
                isActivePath(pathname, link.href)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Compare link */}
          <Link
            href={getCompareUrl()}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors hover:text-foreground",
              isActivePath(pathname, "/compare")
                ? "text-foreground"
                : "text-muted-foreground",
            )}
            aria-label={`Compare remedies${items.length > 0 ? ` (${items.length} selected)` : ""}`}
          >
            <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
            Compare
            {items.length > 0 && (
              <Badge className="h-5 px-1.5">{items.length}</Badge>
            )}
          </Link>

          <Separator orientation="vertical" className="mx-2 h-5" />

          <ThemeToggle />

          <div className="ml-1">
            <AuthErrorBoundary>
              <AuthSection />
            </AuthErrorBoundary>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-primary" aria-hidden="true" />
                  Remedi
                </SheetTitle>
                <SheetDescription className="text-sm">
                  Natural alternatives to pharmaceuticals
                </SheetDescription>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={getCompareUrl()} className="gap-1.5">
                    <GitCompare className="h-4 w-4" />
                    Compare
                    {items.length > 0 && (
                      <Badge className="h-5 px-1.5">{items.length}</Badge>
                    )}
                  </Link>
                </Button>

                <Separator className="my-2" />

                <div className="px-3 py-2">
                  <AuthErrorBoundary>
                    <AuthSection />
                  </AuthErrorBoundary>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
