"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { cn } from "@/lib/utils";
import { TOUR_STEPS } from "./feature-tour.constants";

interface FeatureTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function FeatureTour({ onComplete, onSkip }: FeatureTourProps) {
  const { shouldShowTour, completeTour, setDontShowTour, isLoaded } =
    useOnboarding();

  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isVisible] = useState(true);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Update highlight position
  const updateHighlight = useCallback((): void => {
    if (!step?.targetSelector) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(step.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      // Scroll element into view if needed
      const isInView =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;

      if (!isInView) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Update rect after scroll
        setTimeout(() => {
          const newRect = element.getBoundingClientRect();
          setHighlightRect(newRect);
        }, 300);
      }
    } else {
      setHighlightRect(null);
    }
  }, [step?.targetSelector]);

  // Update highlight on mount and step change
  useEffect(() => {
    updateHighlight();

    const handleResize = (): void => updateHighlight();
    const handleScroll = (): void => updateHighlight();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [updateHighlight, currentStep]);

  // Handle complete
  const handleComplete = useCallback((): void => {
    if (dontShowAgain) {
      setDontShowTour(true);
    }
    completeTour();
    onComplete?.();
  }, [dontShowAgain, setDontShowTour, completeTour, onComplete]);

  // Handle skip
  const handleSkip = useCallback((): void => {
    if (dontShowAgain) {
      setDontShowTour(true);
    }
    completeTour();
    onSkip?.();
  }, [dontShowAgain, setDontShowTour, completeTour, onSkip]);

  // Navigation
  const nextStep = useCallback((): void => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, handleComplete]);

  const prevStep = useCallback((): void => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  // Keyboard navigation
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

  // Calculate tooltip position
  const getTooltipPosition = useCallback((): React.CSSProperties => {
    if (!highlightRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const tooltipWidth = 340;
    const tooltipHeight = 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    switch (step?.position) {
      case "bottom":
        return {
          top: `${highlightRect.bottom + padding}px`,
          left: `${Math.max(
            padding,
            Math.min(
              viewportWidth - tooltipWidth - padding,
              highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
            ),
          )}px`,
        };
      case "top":
        return {
          top: `${Math.max(padding, highlightRect.top - tooltipHeight - padding)}px`,
          left: `${Math.max(
            padding,
            Math.min(
              viewportWidth - tooltipWidth - padding,
              highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
            ),
          )}px`,
        };
      case "left":
        return {
          top: `${Math.max(
            padding,
            Math.min(
              viewportHeight - tooltipHeight - padding,
              highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2,
            ),
          )}px`,
          left: `${Math.max(padding, highlightRect.left - tooltipWidth - padding)}px`,
        };
      case "right":
        return {
          top: `${Math.max(
            padding,
            Math.min(
              viewportHeight - tooltipHeight - padding,
              highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2,
            ),
          )}px`,
          left: `${highlightRect.right + padding}px`,
        };
      default:
        return {
          top: `${highlightRect.bottom + padding}px`,
          left: `${highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2}px`,
        };
    }
  }, [highlightRect, step?.position]);

  // Don't render if not loaded or shouldn't show
  if (!isLoaded || !shouldShowTour || !isVisible) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="fixed inset-0 z-[100]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
      >
        {/* Overlay with spotlight cutout */}
        <div className="absolute inset-0">
          {highlightRect ? (
            <svg
              className="absolute inset-0 h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={highlightRect.left - 8}
                    y={highlightRect.top - 8}
                    width={highlightRect.width + 16}
                    height={highlightRect.height + 16}
                    rx="8"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.7)"
                mask="url(#spotlight-mask)"
              />
            </svg>
          ) : (
            <div className="absolute inset-0 bg-black/70" />
          )}
        </div>

        {/* Highlight ring */}
        <AnimatePresence>
          {highlightRect && (
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute pointer-events-none"
              style={{
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
              }}
            >
              <div className="h-full w-full rounded-lg border-2 border-green-500 shadow-lg ring-4 ring-green-500/30" />
              {/* Pulse animation */}
              <m.div
                className="absolute inset-0 rounded-lg border-2 border-green-500"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <m.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute w-[340px] overflow-hidden rounded-xl bg-card shadow-2xl"
          style={getTooltipPosition()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2 text-white">
                  {step?.icon}
                </div>
                <h3
                  id="tour-step-title"
                  className="text-lg font-semibold text-white"
                >
                  {step?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="p-1 text-white/70 transition-colors hover:text-white"
                aria-label="Skip tour"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Progress indicator */}
            <div className="mb-4 flex gap-1.5">
              {TOUR_STEPS.map((tourStep, index) => (
                <button
                  type="button"
                  key={tourStep.id}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    index === currentStep
                      ? "bg-green-500"
                      : index < currentStep
                        ? "bg-green-500/50"
                        : "bg-muted",
                  )}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <p className="mb-4 text-sm text-muted-foreground">
              {step?.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={isFirstStep}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors",
                  isFirstStep
                    ? "cursor-not-allowed text-muted-foreground/40"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {TOUR_STEPS.length}
              </span>

              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                {isLastStep ? "Finish" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>

            {/* Don't show again */}
            <label className="mt-4 flex cursor-pointer items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded border-border text-green-600 focus:ring-green-500"
              />
              Do not show this tour again
            </label>
          </div>
        </m.div>
      </div>
    </LazyMotion>
  );
}
