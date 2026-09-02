"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getSessionId } from "@/lib/session";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";

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
    // Telemetry: a failure here must never surface to the visitor, but it
    // must not become an unhandled rejection either.
    void apiClient
      .post("/api/user-events", {
        eventType: "landing_view",
        sessionId,
        page: "/landing",
      })
      .catch(() => {});
  }, [trackView]);

  const handleCtaClick = (ctaId: string) => async () => {
    const sessionId = getSessionId();
    await apiClient
      .post("/api/user-events", {
        eventType: "landing_cta_clicked",
        sessionId,
        page: "/landing",
        eventData: { ctaId },
      })
      .catch(() => {});
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
