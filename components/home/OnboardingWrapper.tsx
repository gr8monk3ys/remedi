"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useFirstVisit } from "@/hooks/use-first-visit";

// Statically imported, these pulled the five-step wizard and framer-motion
// into the homepage's initial bundle for every visitor — while only a genuine
// first visit ever renders them. They are gated behind an async localStorage
// read anyway, so nothing above the fold waits on them.
// SearchSection.tsx already uses this pattern.
const WelcomeModal = dynamic(
  () =>
    import("@/components/onboarding/WelcomeModal").then((m) => ({
      default: m.WelcomeModal,
    })),
  { ssr: false },
);
const TutorialOverlay = dynamic(
  () =>
    import("@/components/onboarding/TutorialOverlay").then((m) => ({
      default: m.TutorialOverlay,
    })),
  { ssr: false },
);

export function OnboardingWrapper() {
  const [welcomeModalDismissed, setWelcomeModalDismissed] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { isFirstVisit, loading, dismissFirstVisit, completeTutorial } =
    useFirstVisit();

  const showWelcomeModal =
    !loading && isFirstVisit && !welcomeModalDismissed && !showTutorial;

  const handleCloseWelcomeModal = (): void => {
    setWelcomeModalDismissed(true);
    dismissFirstVisit();
  };

  const handleStartTutorial = (): void => {
    setWelcomeModalDismissed(true);
    dismissFirstVisit();
    setShowTutorial(true);
  };

  const handleCompleteTutorial = (): void => {
    setShowTutorial(false);
    completeTutorial();
  };

  const handleSkipTutorial = (): void => {
    setShowTutorial(false);
    completeTutorial();
  };

  return (
    <>
      {showWelcomeModal && (
        <WelcomeModal
          onClose={handleCloseWelcomeModal}
          onStartTour={handleStartTutorial}
        />
      )}
      {showTutorial && (
        <TutorialOverlay
          onComplete={handleCompleteTutorial}
          onSkip={handleSkipTutorial}
        />
      )}
    </>
  );
}
