"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { fetchWithCSRF } from "@/lib/fetch";
import { getSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";

export function LandingClient({
  trackView = true,
  inverted = false,
}: {
  trackView?: boolean;
  /** Render on a dark brand surface. */
  inverted?: boolean;
}) {
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
    <div className="flex flex-wrap gap-3">
      <Link
        href="/pricing"
        onClick={handleCtaClick("primary_pricing")}
        className={cn(
          buttonVariants({ size: "lg" }),
          inverted && "bg-white text-primary hover:bg-white/90",
        )}
      >
        See Pricing
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link
        href="/"
        onClick={handleCtaClick("secondary_search")}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          inverted &&
            "border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10 hover:text-white",
        )}
      >
        Try a Search
      </Link>
    </div>
  );
}
