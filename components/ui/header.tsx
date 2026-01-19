"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { SignInButton, UserMenu } from "@/components/auth";

export function Header() {
  const { data: session, status } = useSession();
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
