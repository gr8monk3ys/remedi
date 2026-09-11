"use client";

/**
 * Feature Gate Component
 *
 * A wrapper component that gates premium features.
 * Shows a blur/lock overlay for non-subscribers with an upgrade prompt.
 */

import { useState, useEffect, type ReactNode } from "react";
import { Lock, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { type PlanType, PLAN_LIMITS } from "@/lib/stripe-config";
import { apiClient } from "@/lib/api/client";
import { logger } from "@/lib/logger";
import { UpgradeModal } from "./UpgradeModal";

type FeatureKey =
  | "canExport"
  | "canCompare"
  | "canAccessHistory"
  | "prioritySupport"
  | "canViewCabinetInteractions"
  | "canTrackJournal";

/**
 * What the gate established about this user's access.
 *
 * The point of the union is the last arm. `denied` and `unavailable` used to
 * be the same value — `hasAccess === false` — so one failed /api/usage call
 * rendered a Premium subscriber a lock overlay and an Upgrade button for a
 * feature they already pay for. Whether someone has access and whether we
 * could find out are different facts, and only the first may be presented as
 * a limit on their account.
 */
type GateState =
  | { kind: "checking" }
  | { kind: "granted" }
  | { kind: "denied"; plan: PlanType }
  | { kind: "unavailable" };

interface FeatureGateProps {
  /**
   * The feature to check access for
   */
  feature: FeatureKey;
  /**
   * The minimum plan required for this feature
   */
  requiredPlan?: PlanType;
  /**
   * Children to render when access is granted
   */
  children: ReactNode;
  /**
   * Fallback content when access is denied (optional)
   * If not provided, shows a locked overlay
   */
  fallback?: ReactNode;
  /**
   * Custom message to show in the locked state
   */
  lockedMessage?: string;
  /**
   * Whether to show a blurred preview of the content
   */
  showBlurredPreview?: boolean;
  /**
   * Callback when the upgrade button is clicked
   */
  onUpgradeClick?: () => void;
  /**
   * Custom className for the wrapper
   */
  className?: string;
}

// Feature display names
const featureNames: Record<FeatureKey, string> = {
  canExport: "Export Data",
  canCompare: "Compare Remedies",
  canAccessHistory: "Search History",
  prioritySupport: "Priority Support",
  canViewCabinetInteractions: "Cabinet Interaction Alerts",
  canTrackJournal: "Remedy Journal",
};

// Feature descriptions
const featureDescriptions: Record<FeatureKey, string> = {
  canExport: "Export your saved remedies and search data",
  canCompare: "Compare multiple remedies side by side",
  canAccessHistory: "Access your complete search history",
  prioritySupport: "Get priority customer support",
  canViewCabinetInteractions:
    "Auto-check interactions between remedies and your medications",
  canTrackJournal: "Track remedy effectiveness over time with charts",
};

// Minimum plan required for each feature
const featureMinPlan: Record<FeatureKey, PlanType> = {
  canExport: "basic",
  canCompare: "basic",
  canAccessHistory: "basic",
  prioritySupport: "premium",
  canViewCabinetInteractions: "basic",
  canTrackJournal: "basic",
};

export function FeatureGate({
  feature,
  requiredPlan,
  children,
  fallback,
  lockedMessage,
  showBlurredPreview = true,
  onUpgradeClick,
  className = "",
}: FeatureGateProps) {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [gate, setGate] = useState<GateState>({ kind: "checking" });
  const [attempt, setAttempt] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentPlan = gate.kind === "denied" ? gate.plan : "free";

  // Check access when session changes
  useEffect(() => {
    const checkAccess = async () => {
      // Not logged in - no access to premium features. This is a genuine
      // denial: we know the answer.
      if (!isSignedIn && isAuthLoaded) {
        setGate({ kind: "denied", plan: "free" });
        return;
      }

      // Still loading auth
      if (!isAuthLoaded) {
        return;
      }

      // User is authenticated - check their plan (session used for auth status above)
      try {
        const data = await apiClient.get<{ plan: string }>("/api/usage");
        const userPlan = data.plan as PlanType;

        // Check if user's plan has access to this feature
        const planLimits =
          PLAN_LIMITS[userPlan.toUpperCase() as keyof typeof PLAN_LIMITS];
        const hasFeatureAccess = planLimits[feature] === true;

        // Also check minimum plan requirement
        const minPlan = requiredPlan || featureMinPlan[feature];
        const planOrder: PlanType[] = ["free", "basic", "premium"];
        const userPlanIndex = planOrder.indexOf(userPlan);
        const requiredPlanIndex = planOrder.indexOf(minPlan);
        const meetsMinPlan = userPlanIndex >= requiredPlanIndex;

        setGate(
          hasFeatureAccess && meetsMinPlan
            ? { kind: "granted" }
            : { kind: "denied", plan: userPlan },
        );
      } catch (error) {
        // We could not establish the plan. That is not the same fact as "this
        // plan does not include the feature", and it must not be rendered as
        // one — the previous `setHasAccess(false)` showed a Premium subscriber
        // a lock and an Upgrade button for something they already pay for.
        logger.warn("Feature gate check failed", { error, feature });
        setGate({ kind: "unavailable" });
      }
    };

    checkAccess();
  }, [isAuthLoaded, isSignedIn, feature, requiredPlan, attempt]);

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    }

    if (!isSignedIn && isAuthLoaded) {
      router.push(
        "/sign-in?redirect_url=" + encodeURIComponent(window.location.pathname),
      );
      return;
    }

    setShowUpgradeModal(true);
  };

  // Still checking access
  if (gate.kind === "checking") {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // User has access
  if (gate.kind === "granted") {
    return <>{children}</>;
  }

  // We could not find out. Say so, and offer to try again — never a lock and
  // an upsell, which tells a paying subscriber they do not have what they pay
  // for. One of these features is Cabinet Interaction Alerts, so guessing
  // "denied" also hides a safety feature behind a sales pitch.
  if (gate.kind === "unavailable") {
    return (
      <div className={`relative ${className}`}>
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-center"
        >
          <p className="text-sm text-foreground">
            We could not check your plan just now, so this is not showing.
          </p>
          <p className="text-xs text-muted-foreground">
            This is a problem on our side, not a limit on your account.
          </p>
          <button
            type="button"
            onClick={() => {
              setGate({ kind: "checking" });
              setAttempt((n) => n + 1);
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked overlay
  const minPlan = requiredPlan || featureMinPlan[feature];
  const message =
    lockedMessage ||
    `${featureNames[feature]} requires a ${minPlan} plan or higher`;

  return (
    <>
      <div
        className={`relative ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Blurred preview of content */}
        {showBlurredPreview && (
          <div className="filter blur-sm pointer-events-none select-none">
            {children}
          </div>
        )}

        {/* Locked overlay */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-background/85 backdrop-blur-[2px]"
          >
            <div className="text-center p-6 max-w-sm">
              {/* Lock icon */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Message */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {featureNames[feature]}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {featureDescriptions[feature]}
              </p>
              <p className="mb-4 font-mono text-xs text-muted-foreground">
                {message}
              </p>

              {/* Upgrade button */}
              <motion.button
                onClick={handleUpgradeClick}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                Unlock Feature
              </motion.button>

              {!isSignedIn && isAuthLoaded && (
                <p className="text-xs text-muted-foreground mt-3">
                  Sign in required
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hover effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-primary/50"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerReason="feature"
        currentPlan={currentPlan}
        featureName={featureNames[feature]}
      />
    </>
  );
}

/**
 * Hook to check feature access
 */
export function useFeatureAccess(feature: FeatureKey): {
  hasAccess: boolean | null;
  isLoading: boolean;
  currentPlan: PlanType;
} {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isSignedIn && isAuthLoaded) {
        setHasAccess(false);
        setCurrentPlan("free");
        setIsLoading(false);
        return;
      }

      if (!isAuthLoaded) {
        return;
      }

      try {
        const data = await apiClient.get<{ plan: string }>("/api/usage");
        const userPlan = data.plan as PlanType;
        setCurrentPlan(userPlan);

        const planLimits =
          PLAN_LIMITS[userPlan.toUpperCase() as keyof typeof PLAN_LIMITS];
        setHasAccess(planLimits[feature] === true);
      } catch (error) {
        logger.warn("Feature access check failed", { error, feature });
        setHasAccess(false);
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [isAuthLoaded, isSignedIn, feature]);

  return { hasAccess, isLoading, currentPlan };
}
