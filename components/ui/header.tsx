"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";
import {
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { GitCompare, Leaf, Menu } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
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
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  return (
    <>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const { items, getCompareUrl } = useCompare();

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 font-bold text-lg">
          <Leaf className="h-5 w-5 text-primary" />
          <span>Remedi</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}

          {/* Compare link */}
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={getCompareUrl()}
              className="gap-1.5"
              aria-label={`Compare remedies${items.length > 0 ? ` (${items.length} selected)` : ""}`}
            >
              <GitCompare className="h-4 w-4" />
              Compare
              {items.length > 0 && (
                <Badge className="h-5 px-1.5 text-xs">{items.length}</Badge>
              )}
            </Link>
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

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
                <SheetTitle className="flex items-center gap-1.5">
                  <Leaf className="h-5 w-5 text-primary" />
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
                      <Badge className="h-5 px-1.5 text-xs">
                        {items.length}
                      </Badge>
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
