"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type { PlanLimits } from "@/lib/stripe-config";

interface PlanData {
  plan: "free" | "basic" | "premium";
  isTrial: boolean;
  limits: PlanLimits;
}

const PLAN_KEY = ["plan"] as const;

/**
 * Fetches the current user's effective plan and feature limits.
 * Anonymous visitors receive the "free" plan.
 *
 * This data is read on nearly every page, so caching it with
 * React Query avoids redundant network requests on navigation.
 */
export function usePlanQuery() {
  return useQuery({
    queryKey: PLAN_KEY,
    queryFn: () => apiClient.get<PlanData>("/api/plan"),
  });
}
