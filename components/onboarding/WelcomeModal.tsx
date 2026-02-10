"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Leaf, ChevronRight, ChevronLeft } from "lucide-react";
import {
  useOnboarding,
  type HealthInterests,
} from "@/context/OnboardingContext";
import { cn } from "@/lib/utils";
import {
  WelcomeStep,
  HealthInterestsStep,
  FeaturesStep,
  DemoSearchStep,
  GetStartedStep,
} from "@/components/onboarding/steps";

interface WelcomeModalProps {
  onClose?: () => void;
  onStartTour?: () => void;
  onTrySearch?: (query: string) => void;
}

// Total steps in the wizard
const TOTAL_STEPS = 5;

const STEP_TITLES: Record<number, string> = {
  0: "Welcome to Remedi",
  1: "Tell Us About You",
  2: "Powerful Features",
  3: "Try It Out",
  4: "Get Started",
};

export function WelcomeModal({
  onClose,
  onStartTour,
  onTrySearch,
}: WelcomeModalProps) {
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

  // Sync with context step on initial mount only
  useEffect(() => {
    if (currentWelcomeStep > 0) {
      setStep(currentWelcomeStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    [isAnimating, setWelcomeStep],
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
        : [...prev, categoryId],
    );
  }, []);

  // Toggle goal selection
  const toggleGoal = useCallback((goalId: string): void => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId],
    );
  }, []);

  // Handle demo search
  const handleDemoSearch = useCallback(
    (query: string): void => {
      setDemoQuery(query);
      onTrySearch?.(query);
    },
    [onTrySearch],
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

  function renderStepContent(): React.ReactNode {
    switch (step) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return (
          <HealthInterestsStep
            selectedCategories={selectedCategories}
            selectedGoals={selectedGoals}
            toggleCategory={toggleCategory}
            toggleGoal={toggleGoal}
          />
        );
      case 2:
        return <FeaturesStep />;
      case 3:
        return (
          <DemoSearchStep
            demoQuery={demoQuery}
            setDemoQuery={setDemoQuery}
            handleDemoSearch={handleDemoSearch}
          />
        );
      case 4:
        return <GetStartedStep />;
      default:
        return null;
    }
  }

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
        className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-border">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            aria-label="Close welcome modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress indicator */}
          <div
            className="flex gap-1.5 mb-4"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemax={TOTAL_STEPS}
          >
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
                      : "bg-muted",
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
              <h2
                id="welcome-modal-title"
                className="text-2xl font-bold text-foreground"
              >
                {STEP_TITLES[step]}
              </h2>
              <p className="text-muted-foreground text-sm">
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
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevStep}
              disabled={step === 0}
              className={cn(
                "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                step === 0
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:bg-muted",
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

          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
            />
            Do not show this again
          </label>
        </div>
      </motion.div>
    </div>
  );
}
