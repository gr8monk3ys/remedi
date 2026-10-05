"use client";

import { useState, useEffect, useCallback } from "react";
import { safeGetItem, safeSetItem, safeRemoveItem } from "@/lib/safe-storage";

const STORAGE_KEY = "remedi_first_visit";
const TUTORIAL_KEY = "remedi_tutorial_completed";

interface FirstVisitState {
  isFirstVisit: boolean;
  hasCompletedTutorial: boolean;
  loading: boolean;
}

interface UseFirstVisitReturn extends FirstVisitState {
  dismissFirstVisit: () => void;
  completeTutorial: () => void;
  resetOnboarding: () => void;
}

/**
 * Hook to track first-time visitors using localStorage
 */
export function useFirstVisit(): UseFirstVisitReturn {
  const [state, setState] = useState<FirstVisitState>({
    isFirstVisit: false,
    hasCompletedTutorial: false,
    loading: true,
  });

  useEffect(() => {
    // Check localStorage on mount
    const hasVisited = safeGetItem(STORAGE_KEY);
    const tutorialCompleted = safeGetItem(TUTORIAL_KEY);

    setState({
      isFirstVisit: !hasVisited,
      hasCompletedTutorial: tutorialCompleted === "true",
      loading: false,
    });
  }, []);

  const dismissFirstVisit = useCallback(() => {
    safeSetItem(STORAGE_KEY, "true");
    setState((prev) => ({ ...prev, isFirstVisit: false }));
  }, []);

  const completeTutorial = useCallback(() => {
    safeSetItem(TUTORIAL_KEY, "true");
    setState((prev) => ({ ...prev, hasCompletedTutorial: true }));
  }, []);

  const resetOnboarding = useCallback(() => {
    safeRemoveItem(STORAGE_KEY);
    safeRemoveItem(TUTORIAL_KEY);
    setState({
      isFirstVisit: true,
      hasCompletedTutorial: false,
      loading: false,
    });
  }, []);

  return {
    ...state,
    dismissFirstVisit,
    completeTutorial,
    resetOnboarding,
  };
}
