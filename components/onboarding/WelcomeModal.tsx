"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Leaf,
  Search,
  Heart,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Shield,
  Users,
} from "lucide-react";
import { useOnboarding, type HealthInterests } from "@/context/OnboardingContext";
import { cn } from "@/lib/utils";

interface WelcomeModalProps {
  onClose?: () => void;
  onStartTour?: () => void;
  onTrySearch?: (query: string) => void;
}

// Health interest categories for the survey
const HEALTH_CATEGORIES = [
  { id: "pain", label: "Pain Relief", icon: "shield" },
  { id: "sleep", label: "Sleep & Relaxation", icon: "moon" },
  { id: "energy", label: "Energy & Focus", icon: "zap" },
  { id: "digestion", label: "Digestive Health", icon: "heart" },
  { id: "immunity", label: "Immune Support", icon: "shield" },
  { id: "mood", label: "Mood & Stress", icon: "smile" },
  { id: "skin", label: "Skin & Hair", icon: "sparkles" },
  { id: "joints", label: "Joint Health", icon: "activity" },
] as const;

// Health goals
const HEALTH_GOALS = [
  { id: "reduce-pharma", label: "Reduce pharmaceutical use" },
  { id: "natural-first", label: "Try natural options first" },
  { id: "complement", label: "Complement existing treatments" },
  { id: "research", label: "Research alternatives" },
  { id: "prevention", label: "Preventive health" },
] as const;

// Sample search suggestions
const SAMPLE_SEARCHES = [
  "Natural alternatives to ibuprofen",
  "Herbal sleep aids",
  "Natural anti-inflammatory",
  "Vitamin supplements",
];

// Total steps in the wizard
const TOTAL_STEPS = 5;

export function WelcomeModal({
  onClose,
  onStartTour,
  onTrySearch,
}: WelcomeModalProps): JSX.Element | null {
  const {
    shouldShowWelcome,
    currentWelcomeStep,
    setWelcomeStep,
    setHealthInterests,
    completeWelcome,
    setDontShowWelcome,
    isLoaded,
  } = useOnboarding();

  const [step, setStep] = useState(currentWelcomeStep);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [demoQuery, setDemoQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync with context step on mount
  useEffect(() => {
    if (currentWelcomeStep > 0) {
      setStep(currentWelcomeStep);
    }
  }, [currentWelcomeStep]);

  // Handle close
  const handleClose = useCallback((): void => {
    if (dontShowAgain) {
      setDontShowWelcome(true);
    }
    completeWelcome();
    onClose?.();
  }, [dontShowAgain, setDontShowWelcome, completeWelcome, onClose]);

  // Handle skip
  const handleSkip = useCallback((): void => {
    completeWelcome();
    onClose?.();
  }, [completeWelcome, onClose]);

  // Navigate steps
  const goToStep = useCallback(
    (newStep: number): void => {
      if (isAnimating) return;
      setIsAnimating(true);
      setStep(newStep);
      setWelcomeStep(newStep);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating, setWelcomeStep]
  );

  const nextStep = useCallback((): void => {
    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1);
    } else {
      // Complete the wizard
      if (selectedCategories.length > 0 || selectedGoals.length > 0) {
        const interests: HealthInterests = {
          categories: selectedCategories,
          goals: selectedGoals,
        };
        setHealthInterests(interests);
      }
      handleClose();
      onStartTour?.();
    }
  }, [
    step,
    goToStep,
    selectedCategories,
    selectedGoals,
    setHealthInterests,
    handleClose,
    onStartTour,
  ]);

  const prevStep = useCallback((): void => {
    if (step > 0) {
      goToStep(step - 1);
    }
  }, [step, goToStep]);

  // Toggle category selection
  const toggleCategory = useCallback((categoryId: string): void => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Toggle goal selection
  const toggleGoal = useCallback((goalId: string): void => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  }, []);

  // Handle demo search
  const handleDemoSearch = useCallback(
    (query: string): void => {
      setDemoQuery(query);
      onTrySearch?.(query);
    },
    [onTrySearch]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip, nextStep, prevStep]);

  // Don't render if not loaded or shouldn't show
  if (!isLoaded || !shouldShowWelcome) {
    return null;
  }

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close welcome modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress indicator */}
          <div className="flex gap-1.5 mb-4" role="progressbar" aria-valuenow={step + 1} aria-valuemax={TOTAL_STEPS}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={cn(
                  "h-1.5 rounded-full flex-1 transition-all duration-300",
                  index === step
                    ? "bg-green-500"
                    : index < step
                      ? "bg-green-500/50"
                      : "bg-gray-200 dark:bg-gray-700"
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 id="welcome-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                {step === 0 && "Welcome to Remedi"}
                {step === 1 && "Tell Us About You"}
                {step === 2 && "Powerful Features"}
                {step === 3 && "Try It Out"}
                {step === 4 && "Get Started"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Step {step + 1} of {TOTAL_STEPS}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait" custom={step}>
            <motion.div
              key={step}
              custom={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Discover natural alternatives to pharmaceuticals and supplements.
                    Our platform helps you find evidence-based natural remedies
                    tailored to your needs.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                      <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Evidence-Based
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        All remedies backed by research
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        AI-Powered
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Smart recommendations for you
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                      <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Community
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Join 10,000+ wellness seekers
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                      <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Instant Results
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Find alternatives in seconds
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Health Interests Survey */}
              {step === 1 && (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Help us personalize your experience. What health areas interest you?
                    <span className="text-sm text-gray-400 ml-1">(Optional)</span>
                  </p>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Health Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {HEALTH_CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => toggleCategory(category.id)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            selectedCategories.includes(category.id)
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          )}
                        >
                          {selectedCategories.includes(category.id) && (
                            <Check className="w-4 h-4 inline mr-1" />
                          )}
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Your Goals
                    </h3>
                    <div className="space-y-2">
                      {HEALTH_GOALS.map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                            selectedGoals.includes(goal.id)
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          )}
                        >
                          {goal.label}
                          {selectedGoals.includes(goal.id) && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Feature Highlights */}
              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Explore our powerful features designed to help you on your wellness journey.
                  </p>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl"
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg shrink-0">
                        <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Smart Search
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Search any pharmaceutical or supplement to find natural alternatives.
                          Our database includes FDA-approved drugs and evidence-based remedies.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg shrink-0">
                        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          AI-Powered Matching
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Describe your symptoms in natural language. Our AI understands
                          queries like &quot;I have trouble sleeping&quot; or &quot;natural pain relief.&quot;
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl"
                    >
                      <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg shrink-0">
                        <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Save Favorites
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Build your personal collection of natural remedies.
                          Access your favorites anytime, from any device.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Step 3: Interactive Demo */}
              {step === 3 && (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Try a search to see how Remedi works. Click on any suggestion below:
                  </p>

                  <div className="relative">
                    <div className="flex items-center gap-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={demoQuery}
                        onChange={(e) => setDemoQuery(e.target.value)}
                        placeholder="Try searching for a remedy..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && demoQuery.trim()) {
                            handleDemoSearch(demoQuery);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Popular searches:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_SEARCHES.map((search) => (
                        <button
                          key={search}
                          onClick={() => handleDemoSearch(search)}
                          className={cn(
                            "px-4 py-2 text-sm rounded-full transition-all",
                            demoQuery === search
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          )}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>

                  {demoQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">
                          Great choice! You will see results for &quot;{demoQuery}&quot; after completing
                          the setup.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 4: Sign Up / Continue */}
              {step === 4 && (
                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Create a free account to unlock all features, or continue exploring as a guest.
                  </p>

                  <div className="space-y-3">
                    <a
                      href="/auth/signin"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <Leaf className="w-5 h-5" />
                      Create Free Account
                    </a>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                          or sign up with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href="/api/auth/signin/google"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Google
                        </span>
                      </a>

                      <a
                        href="/api/auth/signin/github"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Benefits of an account:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Save favorites across devices
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Track your search history
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Get personalized recommendations
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Access premium AI features
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className={cn(
                "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                step === 0
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-1 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              {step === TOTAL_STEPS - 1 ? (
                "Get Started"
              ) : (
                <>
                  {step === 1 ? "Skip / Continue" : "Continue"}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
            />
            Do not show this again
          </label>
        </div>
      </motion.div>
    </div>
  );
}
