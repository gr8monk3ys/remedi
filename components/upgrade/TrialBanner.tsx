"use client";

/**
 * Trial Banner Component
 *
 * Shows trial status and countdown for users on a free trial.
 * Displays upgrade prompts as trial expiration approaches.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
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
        const data = await apiClient.get<TrialStatus>("/api/trial/check");
        setTrialStatus(data);
      } catch (error) {
        logger.warn("Failed to fetch trial status", { error });
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
          className={`border-b px-4 py-3 ${
            isUrgent
              ? "border-destructive/30 bg-destructive/10"
              : isWarning
                ? "border-warning/30 bg-warning/10"
                : "border-primary/30 bg-primary/10"
          } text-foreground`}
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles
                className={`h-4 w-4 shrink-0 ${
                  isUrgent
                    ? "text-destructive"
                    : isWarning
                      ? "text-warning"
                      : "text-primary"
                }`}
                aria-hidden="true"
              />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-sm font-medium">
                  {isUrgent
                    ? "Your trial ends soon!"
                    : `${trialStatus.daysRemaining} day${trialStatus.daysRemaining !== 1 ? "s" : ""} left in your Premium trial`}
                </span>
                {trialStatus.endDate && (
                  <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Ends {new Date(trialStatus.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUpgrade}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Upgrade Now
              </button>

              {dismissable && (
                <button
                  onClick={handleDismiss}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
        const data = await apiClient.get<TrialStatus>("/api/trial/check");
        setTrialStatus(data);
      } catch (error) {
        logger.warn("Failed to fetch trial status for badge", { error });
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
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] font-medium ${
        isUrgent
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-primary/20 bg-primary/10 text-primary"
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
        const data = await apiClient.get<{ isEligible: boolean }>(
          "/api/trial/check",
        );
        setIsEligible(data.isEligible);
      } catch (error) {
        logger.warn("Failed to check trial eligibility", { error });
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
      await apiClient.post("/api/trial/start");
      router.refresh();
    } catch (error) {
      logger.error("Trial start error", error);
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to start trial. Please try again.",
      );
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
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-muted text-foreground hover:bg-accent",
    outline:
      "border border-primary/25 bg-primary/5 text-primary hover:border-primary/45 hover:bg-primary/10",
  };

  return (
    <button
      onClick={handleStartTrial}
      disabled={isStarting}
      className={`inline-flex items-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
