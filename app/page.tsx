"use client";

import { useState, useMemo, useSyncExternalStore, useCallback } from "react";
import dynamic from "next/dynamic";
import { Heart, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirstVisit } from "@/hooks/use-first-visit";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { TutorialOverlay } from "@/components/onboarding/TutorialOverlay";

// Hydration-safe hook for client-only rendering
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// Custom event for localStorage changes within the same tab
const FAVORITES_CHANGED_EVENT = "favoritesChanged";

// Hook for syncing favorites with localStorage using useSyncExternalStore
function useFavorites() {
  const subscribe = useCallback((callback: () => void) => {
    // Listen for storage events from other tabs
    window.addEventListener("storage", callback);
    // Listen for custom events from this tab
    window.addEventListener(FAVORITES_CHANGED_EVENT, callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener(FAVORITES_CHANGED_EVENT, callback);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const saved = localStorage.getItem("favoriteRemedies");
    return saved || "[]";
  }, []);

  const getServerSnapshot = useCallback(() => "[]", []);

  const favoritesJson = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const favorites = useMemo(() => {
    try {
      return JSON.parse(favoritesJson) as FavoriteRemedy[];
    } catch {
      return [];
    }
  }, [favoritesJson]);

  const clearFavorites = useCallback(() => {
    localStorage.removeItem("favoriteRemedies");
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  }, []);

  return { favorites, clearFavorites };
}

// Code splitting: Load SearchComponent dynamically
const SearchComponent = dynamic(
  () =>
    import("@/components/ui/search").then((mod) => ({
      default: mod.SearchComponent,
    })),
  {
    loading: () => (
      <div className="animate-pulse">
        <div
          className="h-14 neu-pressed w-full"
          style={{ borderRadius: "9999px" }}
        ></div>
      </div>
    ),
    ssr: false,
  },
);

interface FavoriteRemedy {
  id: string;
  name: string;
  category: string;
}

export default function Home() {
  const router = useRouter();
  const { favorites, clearFavorites } = useFavorites();
  const hydrated = useHydrated();
  const [welcomeModalDismissed, setWelcomeModalDismissed] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { isFirstVisit, loading, dismissFirstVisit, completeTutorial } =
    useFirstVisit();

  // Derive showWelcomeModal from state instead of setting it in an effect
  const showWelcomeModal =
    !loading && isFirstVisit && !welcomeModalDismissed && !showTutorial;

  const handleCloseWelcomeModal = () => {
    setWelcomeModalDismissed(true);
    dismissFirstVisit();
  };

  const handleStartTutorial = () => {
    setWelcomeModalDismissed(true);
    dismissFirstVisit();
    setShowTutorial(true);
  };

  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    completeTutorial();
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
    completeTutorial();
  };

  const navigateToRemedy = (remedyId: string) => {
    router.push(`/remedy/${remedyId}`);
  };

  return (
    <>
      {/* Onboarding Components */}
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

      <main className="flex min-h-screen flex-col items-center pt-24 p-4 md:px-24 md:pt-32">
        <div className="z-10 max-w-5xl w-full flex flex-col items-center mb-12">
          <h1
            className="text-5xl md:text-7xl font-bold text-center tracking-tight"
            style={{ color: "var(--primary)" }}
          >
            Remedi
          </h1>
          <p
            className="mt-3 text-sm font-medium tracking-widest uppercase"
            style={{ color: "var(--foreground-subtle)" }}
          >
            Natural Alternatives
          </p>
        </div>

        <div className="mb-32 w-full max-w-4xl">
          <div className="neu-card-flat p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Find Natural Alternatives
            </h2>
            <p
              className="mb-6 text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              Enter a pharmaceutical or supplement name to discover natural
              alternatives that may offer similar benefits.
            </p>
            <SearchComponent />
          </div>

          {hydrated && favorites.length > 0 && (
            <div className="neu-card-flat p-8">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold flex items-center">
                  <Heart
                    className="h-5 w-5 mr-2"
                    style={{ color: "var(--error)" }}
                  />
                  Your Favorites
                </h2>
                <button
                  onClick={clearFavorites}
                  className="text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "var(--foreground-subtle)" }}
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="neu-card-interactive p-5"
                    onClick={() => navigateToRemedy(favorite.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{favorite.name}</h3>
                      <ExternalLink
                        className="h-4 w-4"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <span
                      className="neu-pill inline-block px-3 py-1 text-xs font-medium"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {favorite.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
