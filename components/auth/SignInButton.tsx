"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

interface SignInButtonProps {
  className?: string;
}

/**
 * Sign-in button that links to the sign-in page
 */
export function SignInButton({ className = "" }: SignInButtonProps) {
  return (
    <Link
      href="/sign-in"
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg
        bg-primary hover:bg-primary/90
        text-white font-medium text-sm
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        dark:focus:ring-offset-zinc-900
        ${className}
      `}
      aria-label="Sign in"
    >
      <LogIn className="w-4 h-4" />
      <span>Sign In</span>
    </Link>
  );
}
