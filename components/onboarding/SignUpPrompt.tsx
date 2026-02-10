"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  History,
  Sparkles,
  Cloud,
  Check,
  Clock,
  Bell,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useOnboarding } from "@/context/OnboardingContext";
import { cn } from "@/lib/utils";

interface SignUpPromptProps {
  onSignIn?: () => void;
  onDismiss?: () => void;
  variant?: "modal" | "banner" | "inline";
  className?: string;
}

// Benefits of creating an account
const ACCOUNT_BENEFITS = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Save Favorites",
    description: "Keep your favorite remedies organized and accessible",
    color: "red",
  },
  {
    icon: <History className="w-5 h-5" />,
    title: "Search History",
    description: "Track and revisit your previous searches easily",
    color: "blue",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Recommendations",
    description: "Get personalized suggestions based on your preferences",
    color: "purple",
  },
  {
    icon: <Cloud className="w-5 h-5" />,
    title: "Sync Everywhere",
    description: "Access your data from any device, anytime",
    color: "green",
  },
];

export function SignUpPrompt({
  onSignIn,
  onDismiss,
  variant = "modal",
  className,
}: SignUpPromptProps) {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const {
    shouldShowSignupPrompt,
    guestSearchCount,
    dismissSignupPrompt,
    isLoaded,
  } = useOnboarding();

  const [isVisible, setIsVisible] = useState(true);
  const [remindLater, setRemindLater] = useState(false);

  // Handle dismiss
  const handleDismiss = useCallback((): void => {
    setIsVisible(false);
    if (!remindLater) {
      dismissSignupPrompt();
    }
    onDismiss?.();
  }, [remindLater, dismissSignupPrompt, onDismiss]);

  // Handle remind later
  const handleRemindLater = useCallback((): void => {
    setRemindLater(true);
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  // Handle sign in click
  const handleSignIn = useCallback((): void => {
    handleDismiss();
    onSignIn?.();
  }, [handleDismiss, onSignIn]);

  // Don't render if not loaded, user is signed in, shouldn't show, or dismissed
  if (
    !isLoaded ||
    !isAuthLoaded ||
    isSignedIn ||
    !shouldShowSignupPrompt ||
    !isVisible
  ) {
    return null;
  }

  // Color classes mapping
  const colorClasses: Record<string, { bg: string; text: string }> = {
    red: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
    },
  };

  // Banner variant
  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4",
          className,
        )}
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              <span className="font-medium">
                You have made {guestSearchCount} searches!
              </span>{" "}
              Create a free account to save favorites and track history.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/sign-in"
              onClick={handleSignIn}
              className="px-4 py-1.5 bg-white text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors"
            >
              Sign Up Free
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 text-white/70 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "bg-card rounded-xl shadow-lg border border-border p-4",
          className,
        )}
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
            <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground">Enjoying Remedi?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Create a free account to save your progress and unlock more
              features.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                onClick={handleSignIn}
                className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign Up Free
              </Link>
              <button
                onClick={handleRemindLater}
                className="px-3 py-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Modal variant (default)
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-prompt-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "bg-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden",
            className,
          )}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-green-500 to-emerald-600">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2
                  id="signup-prompt-title"
                  className="text-2xl font-bold text-white"
                >
                  You are on a roll!
                </h2>
                <p className="text-white/80">
                  {guestSearchCount} searches and counting
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <p className="text-muted-foreground">
              Create a free account to unlock these features and enhance your
              experience:
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-2 gap-3">
              {ACCOUNT_BENEFITS.map((benefit) => {
                const colors = colorClasses[benefit.color];
                return (
                  <div key={benefit.title} className="p-3 bg-muted rounded-xl">
                    <div
                      className={cn(
                        "inline-flex p-2 rounded-lg mb-2",
                        colors.bg,
                      )}
                    >
                      <span className={colors.text}>{benefit.icon}</span>
                    </div>
                    <h4 className="font-medium text-foreground text-sm">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Sign up buttons */}
            <div className="space-y-3">
              <Link
                href="/sign-in"
                onClick={handleSignIn}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Check className="w-5 h-5" />
                Create Free Account
              </Link>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth redirects require <a> tags */}
                <a
                  href="/sign-in"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-foreground">
                    Google
                  </span>
                </a>

                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth redirects require <a> tags */}
                <a
                  href="/sign-in"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted border-t border-border">
            <div className="flex items-center justify-between">
              <button
                onClick={handleRemindLater}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Clock className="w-4 h-4" />
                Remind me later
              </button>
              <button
                onClick={handleDismiss}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="w-4 h-4" />
                Do not show again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
