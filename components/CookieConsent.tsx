"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      setVisible(true);
    }
  }, []);

  function handleAccept(): void {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline(): void {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          This site uses cookies for functionality and analytics. By accepting,
          you consent to our use of cookies.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleDecline}
            className="rounded-md border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
