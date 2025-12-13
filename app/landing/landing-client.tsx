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
        className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-[0_10px_30px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-light"
      >
        See Pricing
      </Link>
      <Link
        href="/"
        onClick={handleCtaClick("secondary_search")}
        className="inline-flex items-center justify-center rounded-xl border border-primary/20 bg-card/80 px-6 py-3 font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5"
      >
        Try a Search
      </Link>
    </div>
  );
}
