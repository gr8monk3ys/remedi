"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { GitCompare } from "lucide-react";
import { useCompare } from "@/context/CompareContext";

export function Header() {
  const { isLoaded } = useUser();
  const { items, getCompareUrl } = useCompare();
  const isLoading = !isLoaded;

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--surface) 85%, transparent)",
        boxShadow: "0 4px 12px var(--shadow-dark)",
        borderBottom: "1px solid var(--shadow-light)",
      }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link
          href="/"
          className="font-bold text-xl"
          style={{ color: "var(--primary)" }}
        >
          Remedi
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "var(--foreground-muted)" }}
          >
            Home
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "var(--foreground-muted)" }}
          >
            About
          </Link>
          <Link
            href="/faq"
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "var(--foreground-muted)" }}
          >
            FAQ
          </Link>

          {/* Compare link with badge */}
          <Link
            href={getCompareUrl()}
            className="relative flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "var(--foreground-muted)" }}
            aria-label={`Compare remedies${items.length > 0 ? ` (${items.length} selected)` : ""}`}
          >
            <GitCompare size={16} />
            <span className="hidden sm:inline">Compare</span>
            {items.length > 0 && (
              <span
                className="absolute -top-2 -right-2 sm:relative sm:top-0 sm:right-0 sm:ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
                style={{ background: "var(--primary)" }}
              >
                {items.length}
              </span>
            )}
          </Link>

          {/* Authentication UI */}
          <div className="ml-4 flex items-center">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full neu-pressed animate-pulse" />
            ) : (
              <>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="neu-btn px-5 py-2 text-sm">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
