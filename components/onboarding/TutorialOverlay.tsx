"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Remedi!",
    description:
      "Let's take a quick tour of the features that will help you find natural alternatives to pharmaceuticals.",
  },
  {
    id: "search",
    title: "Search for Remedies",
    description:
      "Enter the name of any pharmaceutical or supplement in the search bar to find natural alternatives. Try searching for 'ibuprofen' or 'vitamin D'.",
    targetSelector: "[data-search-input]",
    position: "bottom",
  },
  {
    id: "ai-toggle",
    title: "AI-Powered Search",
    description:
      "Enable AI search for more personalized recommendations. Our AI understands natural language queries like 'I have trouble sleeping' or 'need help with joint pain'.",
    targetSelector: "[data-ai-toggle]",
    position: "bottom",
  },
  {
    id: "filters",
    title: "Filter Results",
    description:
      "Use filters to narrow down results by category, nutrient type, or evidence level. Find exactly what you're looking for.",
    targetSelector: "[data-filter-toggle]",
    position: "bottom",
  },
  {
    id: "favorites",
    title: "Save Favorites",
    description:
      "Click the heart icon on any remedy to save it to your favorites. Build your personal collection of natural remedies.",
    targetSelector: "[data-favorite-button]",
    position: "left",
  },
  {
    id: "complete",
    title: "You're All Set!",
    description:
      "You now know the basics of Remedi. Start exploring natural alternatives and take control of your wellness journey!",
  },
];

export function TutorialOverlay({ onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const updateHighlight = useCallback(() => {
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    } else {
      setHighlightRect(null);
    }
  }, [step.targetSelector]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight);

    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight);
    };
  }, [updateHighlight]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!highlightRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    switch (step.position) {
      case "bottom":
        return {
          top: `${highlightRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2))}px`,
        };
      case "top":
        return {
          top: `${highlightRect.top - tooltipHeight - padding}px`,
          left: `${Math.max(padding, Math.min(window.innerWidth - tooltipWidth - padding, highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2))}px`,
        };
      case "left":
        return {
          top: `${highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2}px`,
          left: `${highlightRect.left - tooltipWidth - padding}px`,
        };
      case "right":
        return {
          top: `${highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2}px`,
          left: `${highlightRect.right + padding}px`,
        };
      default:
        return {
          top: `${highlightRect.bottom + padding}px`,
          left: `${highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2}px`,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay with cutout */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Highlight cutout */}
      {highlightRect && (
        <div
          className="absolute bg-transparent border-2 border-primary rounded-lg shadow-lg ring-4 ring-primary/30"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute w-80 bg-card rounded-xl shadow-2xl p-6"
        style={getTooltipPosition()}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Skip tutorial"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-4">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                index === currentStep
                  ? "bg-primary"
                  : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">{step.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className={`flex items-center gap-1 text-sm font-medium ${
              isFirstStep
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-xs text-muted-foreground">
            {currentStep + 1} of {tutorialSteps.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
          >
            {isLastStep ? "Get Started" : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
