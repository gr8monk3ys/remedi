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

import Script from "next/script";

interface AnalyticsProps {
  /**
   * Plausible domain (e.g., "remedi.app")
   */
  plausibleDomain?: string;

  /**
   * Google Analytics measurement ID (e.g., "G-XXXXXXXXXX")
   */
  googleAnalyticsId?: string;
}

export function Analytics({
  plausibleDomain,
  googleAnalyticsId,
}: AnalyticsProps) {
  const hasPlausible = !!plausibleDomain;
  const hasGA = !!googleAnalyticsId;

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
        />
      )}

      {/* Google Analytics */}
      {hasGA && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
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

export default Analytics;
