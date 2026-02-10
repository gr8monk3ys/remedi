"use client";

import { useEffect } from "react";
import Link from "next/link";
import { fetchWithCSRF } from "@/lib/fetch";
import { getSessionId } from "@/lib/session";

export function LandingClient({ trackView = true }: { trackView?: boolean }) {
  useEffect(() => {
    if (!trackView) return;
    const sessionId = getSessionId();
    void fetchWithCSRF("/api/user-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "landing_view",
        sessionId,
        page: "/landing",
      }),
    });
  }, [trackView]);

  const handleCtaClick = (ctaId: string) => async () => {
    const sessionId = getSessionId();
    await fetchWithCSRF("/api/user-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "landing_cta_clicked",
        sessionId,
        page: "/landing",
        eventData: { ctaId },
      }),
    });
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Link
        href="/pricing"
        onClick={handleCtaClick("primary_pricing")}
        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
      >
        See Pricing
      </Link>
      <Link
        href="/"
        onClick={handleCtaClick("secondary_search")}
        className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors"
      >
        Try a Search
      </Link>
    </div>
  );
}
