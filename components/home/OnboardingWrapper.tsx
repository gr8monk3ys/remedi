"use client";

import { useState } from "react";
import { useFirstVisit } from "@/hooks/use-first-visit";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { TutorialOverlay } from "@/components/onboarding/TutorialOverlay";

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
