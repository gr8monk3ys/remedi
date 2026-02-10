/**
 * PWA Service Worker Registration Component
 *
 * Registers the service worker for Progressive Web App functionality.
 * Handles installation prompts and update notifications.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */

"use client";

import { useEffect, useState } from "react";
import { createLogger } from "@/lib/logger";

const logger = createLogger("pwa");

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWARegister() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Only register service worker in production
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined"
    ) {
      return;
    }

    // Check if service workers are supported
    if ("serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          logger.info("Service worker registered", {
            scope: registration.scope,
          });

          // Check for updates every hour
          setInterval(
            () => {
              registration.update();
            },
            60 * 60 * 1000,
          );

          // Handle service worker updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          logger.error("Service worker registration failed", error);
        });

      // Handle controller change (new service worker activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        logger.info("New service worker activated");
        window.location.reload();
      });
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Save the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install button
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Handle app installed
    window.addEventListener("appinstalled", () => {
      logger.info("App installed");
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    logger.info("User response to install prompt", { outcome });

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  const handleUpdate = () => {
    // Tell service worker to skip waiting and activate immediately
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
    }
    setShowUpdatePrompt(false);
  };

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card shadow-lg rounded-lg p-4 z-50 border border-border">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Install Remedi App
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Install Remedi on your device for a better experience and
                offline access.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={handleDismissInstall}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissInstall}
              className="ml-2 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-lg rounded-lg p-4 z-50">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Update Available
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                A new version of Remedi is available. Refresh to update.
              </p>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Now
              </button>
            </div>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="ml-2 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
