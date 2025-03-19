"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="font-bold text-xl">
          RemediFind
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-sm hover:underline">
            Home
          </Link>
          <Link href="#about" className="text-sm hover:underline">
            About
          </Link>
          <Link href="#faq" className="text-sm hover:underline">
            FAQ
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
