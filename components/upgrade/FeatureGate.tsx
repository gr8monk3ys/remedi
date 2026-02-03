"use client";

/**
 * Feature Gate Component
 *
 * A wrapper component that gates premium features.
 * Shows a blur/lock overlay for non-subscribers with an upgrade prompt.
 */

import { useState, useEffect, type ReactNode } from "react";
import { Lock, Sparkles, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { type PlanType, PLAN_LIMITS } from "@/lib/stripe-config";
import { UpgradeModal } from "./UpgradeModal";

type FeatureKey =
  | "canExport"
  | "canCompare"
  | "canAccessHistory"
  | "prioritySupport";

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
};

// Feature descriptions
const featureDescriptions: Record<FeatureKey, string> = {
  canExport: "Export your saved remedies and search data",
  canCompare: "Compare multiple remedies side by side",
  canAccessHistory: "Access your complete search history",
  prioritySupport: "Get priority customer support",
};

// Minimum plan required for each feature
const featureMinPlan: Record<FeatureKey, PlanType> = {
  canExport: "basic",
  canCompare: "basic",
  canAccessHistory: "basic",
  prioritySupport: "premium",
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
  const { status } = useSession();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check access when session changes
  useEffect(() => {
    const checkAccess = async () => {
      // Not logged in - no access to premium features
      if (status === "unauthenticated") {
        setHasAccess(false);
        setCurrentPlan("free");
        setIsLoading(false);
        return;
      }

      // Still loading auth
      if (status === "loading") {
        return;
      }

      // User is authenticated - check their plan (session used for auth status above)
      try {
        const response = await fetch("/api/usage");
        const data = await response.json();

        if (data.success) {
          const userPlan = data.data.plan as PlanType;
          setCurrentPlan(userPlan);

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

          setHasAccess(hasFeatureAccess && meetsMinPlan);
        } else {
          setHasAccess(false);
        }
      } catch {
        setHasAccess(false);
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [status, feature, requiredPlan]);

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    }

    if (status === "unauthenticated") {
      router.push(
        "/auth/signin?callbackUrl=" +
          encodeURIComponent(window.location.pathname),
      );
      return;
    }

    setShowUpgradeModal(true);
  };

  // Still checking access
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // User has access
  if (hasAccess) {
    return <>{children}</>;
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
            className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-lg"
          >
            <div className="text-center p-6 max-w-sm">
              {/* Lock icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 dark:bg-zinc-800 mb-4">
                <Lock className="w-7 h-7 text-gray-400 dark:text-gray-500" />
              </div>

              {/* Message */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {featureNames[feature]}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {featureDescriptions[feature]}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                {message}
              </p>

              {/* Upgrade button */}
              <motion.button
                onClick={handleUpgradeClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                Unlock Feature
              </motion.button>

              {status === "unauthenticated" && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
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
              className="absolute inset-0 ring-2 ring-blue-500/50 rounded-lg pointer-events-none"
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
  const { status } = useSession();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "unauthenticated") {
        setHasAccess(false);
        setCurrentPlan("free");
        setIsLoading(false);
        return;
      }

      if (status === "loading") {
        return;
      }

      try {
        const response = await fetch("/api/usage");
        const data = await response.json();

        if (data.success) {
          const userPlan = data.data.plan as PlanType;
          setCurrentPlan(userPlan);

          const planLimits =
            PLAN_LIMITS[userPlan.toUpperCase() as keyof typeof PLAN_LIMITS];
          setHasAccess(planLimits[feature] === true);
        } else {
          setHasAccess(false);
        }
      } catch {
        setHasAccess(false);
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [status, feature]);

  return { hasAccess, isLoading, currentPlan };
}

export default FeatureGate;
