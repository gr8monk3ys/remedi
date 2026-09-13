"use client";

/**
 * Feature access check, kept apart from `FeatureGate` on purpose.
 *
 * `FeatureGate.tsx` imports framer-motion for its lock overlay. The search
 * component only needs this hook, but importing it from there dragged
 * framer-motion (and the gate) into the search chunk on the home page —
 * ~30 KiB of JavaScript that never ran. `FeatureGate` re-exports the hook, so
 * existing imports keep working.
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { type PlanType, PLAN_LIMITS } from "@/lib/stripe-config";
import { apiClient } from "@/lib/api/client";
import { logger } from "@/lib/logger";

export type FeatureKey =
  | "canExport"
  | "canCompare"
  | "canAccessHistory"
  | "prioritySupport"
  | "canViewCabinetInteractions"
  | "canTrackJournal";

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
