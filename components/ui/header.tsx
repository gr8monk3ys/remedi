"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { GitCompare } from "lucide-react";
import { SignInButton, UserMenu } from "@/components/auth";
import { useCompare } from "@/context/CompareContext";

export function Header() {
  const { data: session, status } = useSession();
  const { items, getCompareUrl } = useCompare();
  const isLoading = status === "loading";

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="font-bold text-xl">
          Remedi
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-sm hover:underline">
            Home
          </Link>
          <Link href="#about" className="text-sm hover:underline">
            About
          </Link>
          <Link href="/faq" className="text-sm hover:underline">
            FAQ
          </Link>

          {/* Compare link with badge */}
          <Link
            href={getCompareUrl()}
            className="relative flex items-center gap-1 text-sm hover:underline"
            aria-label={`Compare remedies${items.length > 0 ? ` (${items.length} selected)` : ''}`}
          >
            <GitCompare size={16} />
            <span className="hidden sm:inline">Compare</span>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 sm:relative sm:top-0 sm:right-0 sm:ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                {items.length}
              </span>
            )}
          </Link>

          {/* Authentication UI */}
          <div className="ml-4 flex items-center">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 animate-pulse" />
            ) : session ? (
              <UserMenu session={session} />
            ) : (
              <SignInButton />
            )}
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
