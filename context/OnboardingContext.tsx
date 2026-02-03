"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

// Storage keys
const STORAGE_KEYS = {
  WELCOME_COMPLETED: "remedi_onboarding_welcome_completed",
  TOUR_COMPLETED: "remedi_onboarding_tour_completed",
  FIRST_SEARCH_COMPLETED: "remedi_onboarding_first_search",
  SIGNUP_PROMPT_DISMISSED: "remedi_signup_prompt_dismissed",
  PREMIUM_UPSELL_DISMISSED: "remedi_premium_upsell_dismissed",
  GUEST_SEARCH_COUNT: "remedi_guest_search_count",
  HEALTH_INTERESTS: "remedi_health_interests",
  ONBOARDING_STEP: "remedi_onboarding_step",
  DONT_SHOW_WELCOME: "remedi_welcome_dismissed",
  DONT_SHOW_TOUR: "remedi_tour_dismissed",
} as const;

// Types
interface HealthInterests {
  categories: string[];
  goals: string[];
}

interface OnboardingState {
  // Completion flags
  welcomeCompleted: boolean;
  tourCompleted: boolean;
  firstSearchCompleted: boolean;
  signupPromptDismissed: boolean;
  premiumUpsellDismissed: boolean;
  // User preferences
  dontShowWelcome: boolean;
  dontShowTour: boolean;
  healthInterests: HealthInterests | null;
  // Progress tracking
  currentWelcomeStep: number;
  guestSearchCount: number;
  // Feature flags for A/B testing
  featureFlags: Record<string, boolean>;
}

interface OnboardingContextValue extends OnboardingState {
  // Actions
  completeWelcome: () => void;
  completeTour: () => void;
  completeFirstSearch: () => void;
  dismissSignupPrompt: () => void;
  dismissPremiumUpsell: () => void;
  setWelcomeStep: (step: number) => void;
  setHealthInterests: (interests: HealthInterests) => void;
  incrementSearchCount: () => void;
  resetOnboarding: () => void;
  setDontShowWelcome: (value: boolean) => void;
  setDontShowTour: (value: boolean) => void;
  // Visibility flags
  shouldShowWelcome: boolean;
  shouldShowTour: boolean;
  shouldShowFirstSearchGuide: boolean;
  shouldShowSignupPrompt: boolean;
  shouldShowPremiumUpsell: boolean;
  // Utility
  isFirstTimeUser: boolean;
  isLoaded: boolean;
}

const defaultState: OnboardingState = {
  welcomeCompleted: false,
  tourCompleted: false,
  firstSearchCompleted: false,
  signupPromptDismissed: false,
  premiumUpsellDismissed: false,
  dontShowWelcome: false,
  dontShowTour: false,
  healthInterests: null,
  currentWelcomeStep: 0,
  guestSearchCount: 0,
  featureFlags: {},
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined,
);

interface OnboardingProviderProps {
  children: ReactNode;
  featureFlags?: Record<string, boolean>;
}

/**
 * OnboardingProvider manages the onboarding flow state and persistence
 * All state is persisted to localStorage for cross-session continuity
 */
export function OnboardingProvider({
  children,
  featureFlags = {},
}: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>({
    ...defaultState,
    featureFlags,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = (): void => {
      try {
        const welcomeCompleted =
          localStorage.getItem(STORAGE_KEYS.WELCOME_COMPLETED) === "true";
        const tourCompleted =
          localStorage.getItem(STORAGE_KEYS.TOUR_COMPLETED) === "true";
        const firstSearchCompleted =
          localStorage.getItem(STORAGE_KEYS.FIRST_SEARCH_COMPLETED) === "true";
        const signupPromptDismissed =
          localStorage.getItem(STORAGE_KEYS.SIGNUP_PROMPT_DISMISSED) === "true";
        const premiumUpsellDismissed =
          localStorage.getItem(STORAGE_KEYS.PREMIUM_UPSELL_DISMISSED) ===
          "true";
        const dontShowWelcome =
          localStorage.getItem(STORAGE_KEYS.DONT_SHOW_WELCOME) === "true";
        const dontShowTour =
          localStorage.getItem(STORAGE_KEYS.DONT_SHOW_TOUR) === "true";
        const currentWelcomeStep = parseInt(
          localStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP) || "0",
          10,
        );
        const guestSearchCount = parseInt(
          localStorage.getItem(STORAGE_KEYS.GUEST_SEARCH_COUNT) || "0",
          10,
        );

        let healthInterests: HealthInterests | null = null;
        const storedInterests = localStorage.getItem(
          STORAGE_KEYS.HEALTH_INTERESTS,
        );
        if (storedInterests) {
          try {
            healthInterests = JSON.parse(storedInterests) as HealthInterests;
          } catch {
            healthInterests = null;
          }
        }

        setState({
          welcomeCompleted,
          tourCompleted,
          firstSearchCompleted,
          signupPromptDismissed,
          premiumUpsellDismissed,
          dontShowWelcome,
          dontShowTour,
          healthInterests,
          currentWelcomeStep,
          guestSearchCount,
          featureFlags,
        });
      } catch (error) {
        // localStorage not available (SSR or private browsing)
        console.warn("Failed to load onboarding state:", error);
      }
      setIsLoaded(true);
    };

    loadState();
  }, [featureFlags]);

  // Action creators
  const completeWelcome = useCallback((): void => {
    localStorage.setItem(STORAGE_KEYS.WELCOME_COMPLETED, "true");
    setState((prev) => ({ ...prev, welcomeCompleted: true }));
  }, []);

  const completeTour = useCallback((): void => {
    localStorage.setItem(STORAGE_KEYS.TOUR_COMPLETED, "true");
    setState((prev) => ({ ...prev, tourCompleted: true }));
  }, []);

  const completeFirstSearch = useCallback((): void => {
    localStorage.setItem(STORAGE_KEYS.FIRST_SEARCH_COMPLETED, "true");
    setState((prev) => ({ ...prev, firstSearchCompleted: true }));
  }, []);

  const dismissSignupPrompt = useCallback((): void => {
    localStorage.setItem(STORAGE_KEYS.SIGNUP_PROMPT_DISMISSED, "true");
    setState((prev) => ({ ...prev, signupPromptDismissed: true }));
  }, []);

  const dismissPremiumUpsell = useCallback((): void => {
    localStorage.setItem(STORAGE_KEYS.PREMIUM_UPSELL_DISMISSED, "true");
    setState((prev) => ({ ...prev, premiumUpsellDismissed: true }));
  }, []);

  const setWelcomeStep = useCallback((step: number): void => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, step.toString());
    setState((prev) => ({ ...prev, currentWelcomeStep: step }));
  }, []);

  const setHealthInterests = useCallback((interests: HealthInterests): void => {
    localStorage.setItem(
      STORAGE_KEYS.HEALTH_INTERESTS,
      JSON.stringify(interests),
    );
    setState((prev) => ({ ...prev, healthInterests: interests }));
  }, []);

  const incrementSearchCount = useCallback((): void => {
    const newCount = state.guestSearchCount + 1;
    localStorage.setItem(STORAGE_KEYS.GUEST_SEARCH_COUNT, newCount.toString());
    setState((prev) => ({ ...prev, guestSearchCount: newCount }));
  }, [state.guestSearchCount]);

  const setDontShowWelcome = useCallback((value: boolean): void => {
    localStorage.setItem(STORAGE_KEYS.DONT_SHOW_WELCOME, value.toString());
    setState((prev) => ({ ...prev, dontShowWelcome: value }));
  }, []);

  const setDontShowTour = useCallback((value: boolean): void => {
    localStorage.setItem(STORAGE_KEYS.DONT_SHOW_TOUR, value.toString());
    setState((prev) => ({ ...prev, dontShowTour: value }));
  }, []);

  const resetOnboarding = useCallback((): void => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    setState({ ...defaultState, featureFlags });
  }, [featureFlags]);

  // Computed visibility flags
  const isFirstTimeUser = !state.welcomeCompleted && !state.dontShowWelcome;

  const shouldShowWelcome = useMemo(() => {
    return isLoaded && !state.welcomeCompleted && !state.dontShowWelcome;
  }, [isLoaded, state.welcomeCompleted, state.dontShowWelcome]);

  const shouldShowTour = useMemo(() => {
    return (
      isLoaded &&
      state.welcomeCompleted &&
      !state.tourCompleted &&
      !state.dontShowTour
    );
  }, [
    isLoaded,
    state.welcomeCompleted,
    state.tourCompleted,
    state.dontShowTour,
  ]);

  const shouldShowFirstSearchGuide = useMemo(() => {
    return isLoaded && !state.firstSearchCompleted;
  }, [isLoaded, state.firstSearchCompleted]);

  // Show signup prompt after 3 searches as guest
  const shouldShowSignupPrompt = useMemo(() => {
    return (
      isLoaded && state.guestSearchCount >= 3 && !state.signupPromptDismissed
    );
  }, [isLoaded, state.guestSearchCount, state.signupPromptDismissed]);

  // Show premium upsell after 10 searches (simulating free tier limit)
  const shouldShowPremiumUpsell = useMemo(() => {
    return (
      isLoaded && state.guestSearchCount >= 10 && !state.premiumUpsellDismissed
    );
  }, [isLoaded, state.guestSearchCount, state.premiumUpsellDismissed]);

  const contextValue = useMemo<OnboardingContextValue>(
    () => ({
      ...state,
      completeWelcome,
      completeTour,
      completeFirstSearch,
      dismissSignupPrompt,
      dismissPremiumUpsell,
      setWelcomeStep,
      setHealthInterests,
      incrementSearchCount,
      resetOnboarding,
      setDontShowWelcome,
      setDontShowTour,
      shouldShowWelcome,
      shouldShowTour,
      shouldShowFirstSearchGuide,
      shouldShowSignupPrompt,
      shouldShowPremiumUpsell,
      isFirstTimeUser,
      isLoaded,
    }),
    [
      state,
      completeWelcome,
      completeTour,
      completeFirstSearch,
      dismissSignupPrompt,
      dismissPremiumUpsell,
      setWelcomeStep,
      setHealthInterests,
      incrementSearchCount,
      resetOnboarding,
      setDontShowWelcome,
      setDontShowTour,
      shouldShowWelcome,
      shouldShowTour,
      shouldShowFirstSearchGuide,
      shouldShowSignupPrompt,
      shouldShowPremiumUpsell,
      isFirstTimeUser,
      isLoaded,
    ],
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook to access onboarding context
 * Must be used within an OnboardingProvider
 */
export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

// Export types for external use
export type { OnboardingState, OnboardingContextValue, HealthInterests };
