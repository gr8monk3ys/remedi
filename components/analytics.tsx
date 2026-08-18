"use client";

/**
 * Analytics Component
 *
 * Provides privacy-focused analytics using Plausible Analytics.
 * Can also integrate Google Analytics if configured.
 *
 * Plausible is recommended because:
 * - Privacy-focused (no cookie consent needed in most regions)
 * - Lightweight (~1KB)
 * - GDPR, CCPA compliant
 * - Open source and self-hostable
 *
 * @see https://plausible.io/docs
 */

import { useEffect, useState } from "react";
import Script from "next/script";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

/**
 * Track the visitor's stored consent choice, updating when the banner writes
 * a new one so analytics start or stay off without a page reload.
 */
function useCookieConsent(): CookieConsent {
  const [consent, setConsent] = useState<CookieConsent>(null);

  useEffect(() => {
    const sync = (): void => setConsent(readCookieConsent());
    sync();

    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    // Keep other tabs in sync too.
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return consent;
}

interface AnalyticsProps {
  /**
   * Plausible domain (e.g., "remedi.app")
   */
  plausibleDomain?: string;

  /**
   * Google Analytics measurement ID (e.g., "G-XXXXXXXXXX")
   */
  googleAnalyticsId?: string;

  /**
   * CSP nonce forwarded from the middleware x-nonce header.
   * Required in production to satisfy the nonce-based script-src policy.
   */
  nonce?: string;
}

export function Analytics({
  plausibleDomain,
  googleAnalyticsId,
  nonce,
}: AnalyticsProps) {
  const consent = useCookieConsent();

  const hasPlausible = !!plausibleDomain;
  // Google Analytics sets cookies, so it may only load once the visitor has
  // actively accepted. Plausible is cookieless and stays exempt.
  const hasGA = !!googleAnalyticsId && consent === "accepted";

  // Don't render anything if no analytics configured
  if (!hasPlausible && !hasGA) {
    return null;
  }

  return (
    <>
      {/* Plausible Analytics */}
      {hasPlausible && (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
          nonce={nonce}
        />
      )}

      {/* Google Analytics */}
      {hasGA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
            nonce={nonce}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            nonce={nonce}
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}

/**
 * Track custom events with Plausible
 *
 * @example
 * trackEvent('Search', { query: 'ibuprofen' });
 * trackEvent('Favorite', { remedyId: '123' });
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>,
) {
  // Plausible tracking
  if (
    typeof window !== "undefined" &&
    (
      window as unknown as {
        plausible?: (
          name: string,
          options?: { props?: Record<string, string | number | boolean> },
        ) => void;
      }
    ).plausible
  ) {
    (
      window as unknown as {
        plausible: (
          name: string,
          options?: { props?: Record<string, string | number | boolean> },
        ) => void;
      }
    ).plausible(eventName, { props });
  }

  // Google Analytics tracking
  if (
    typeof window !== "undefined" &&
    (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  ) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      eventName,
      props,
    );
  }
}
