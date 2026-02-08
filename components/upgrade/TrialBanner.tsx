"use client";

/**
 * Trial Banner Component
 *
 * Shows trial status and countdown for users on a free trial.
 * Displays upgrade prompts as trial expiration approaches.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { fetchWithCSRF } from "@/lib/fetch";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, X, Loader2 } from "lucide-react";

interface TrialStatus {
  isActive: boolean;
  isEligible: boolean;
  daysRemaining: number;
  endDate: string | null;
}

interface TrialBannerProps {
  /**
   * Where the banner is being displayed (for analytics)
   * Reserved for future analytics integration
   */
  location?: string;
  /**
   * Whether the banner can be dismissed
   */
  dismissable?: boolean;
  /**
   * Callback when dismissed
   */
  onDismiss?: () => void;
  /**
   * Custom className
   */
  className?: string;
}

export function TrialBanner({
  location: _location = "header", // Reserved for future analytics
  dismissable = true,
  onDismiss,
  className = "",
}: TrialBannerProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    const fetchTrialStatus = async () => {
      try {
        const response = await fetch("/api/trial/check");
        const data = await response.json();

        if (data.success) {
          setTrialStatus(data.data);
        }
      } catch {
        // Silently fail
      }

      setIsLoading(false);
    };

    fetchTrialStatus();
  }, [isSignedIn]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  // Don't show if loading, dismissed, not authenticated, or no active trial
  if (isLoading || isDismissed || !isSignedIn || !trialStatus?.isActive) {
    return null;
  }

  const isUrgent = trialStatus.daysRemaining <= 2;
  const isWarning = trialStatus.daysRemaining <= 5;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${className}`}
      >
        <div
          className={`px-4 py-3 ${
            isUrgent
              ? "bg-gradient-to-r from-red-500 to-orange-500"
              : isWarning
                ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                : "bg-gradient-to-r from-blue-500 to-purple-500"
          } text-white`}
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-medium">
                  {isUrgent
                    ? "Your trial ends soon!"
                    : `${trialStatus.daysRemaining} day${trialStatus.daysRemaining !== 1 ? "s" : ""} left in your Premium trial`}
                </span>
                {trialStatus.endDate && (
                  <span className="text-white/80 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Ends {new Date(trialStatus.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUpgrade}
                className="px-4 py-1.5 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-1.5"
              >
                Upgrade Now
              </button>

              {dismissable && (
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact trial badge for headers/navbars
 */
export function TrialBadge({ className = "" }: { className?: string }) {
  const { isSignedIn } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    const fetchTrialStatus = async () => {
      try {
        const response = await fetch("/api/trial/check");
        const data = await response.json();

        if (data.success) {
          setTrialStatus(data.data);
        }
      } catch {
        // Silently fail
      }

      setIsLoading(false);
    };

    fetchTrialStatus();
  }, [isSignedIn]);

  if (isLoading || !isSignedIn || !trialStatus?.isActive) {
    return null;
  }

  const isUrgent = trialStatus.daysRemaining <= 2;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isUrgent
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      } ${className}`}
    >
      <Sparkles className="w-3 h-3" />
      Trial: {trialStatus.daysRemaining}d left
    </span>
  );
}

/**
 * Start Trial Button for eligible users
 */
export function StartTrialButton({
  className = "",
  variant = "primary",
  size = "md",
}: {
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    const checkEligibility = async () => {
      try {
        const response = await fetch("/api/trial/check");
        const data = await response.json();

        if (data.success) {
          setIsEligible(data.data.isEligible);
        }
      } catch {
        // Silently fail
      }

      setIsLoading(false);
    };

    checkEligibility();
  }, [isSignedIn]);

  const handleStartTrial = async () => {
    if (!isSignedIn) {
      router.push(
        "/sign-in?redirect_url=" + encodeURIComponent(window.location.pathname),
      );
      return;
    }

    setIsStarting(true);
    try {
      const response = await fetchWithCSRF("/api/trial/start", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        router.refresh();
      } else {
        alert(data.error?.message || "Failed to start trial");
      }
    } catch (error) {
      console.error("Trial start error:", error);
      alert("Failed to start trial. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading || !isEligible) {
    return null;
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white",
    secondary:
      "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700",
    outline:
      "border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  };

  return (
    <button
      onClick={handleStartTrial}
      disabled={isStarting}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {isStarting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      Start Free Trial
    </button>
  );
}

export default TrialBanner;
