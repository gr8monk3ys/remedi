/**
 * Cookie consent state.
 *
 * Shared by the consent banner (which writes the choice) and the analytics
 * loader (which reads it). Cookie-setting analytics must not load until the
 * visitor has actively accepted; declining has to mean something.
 */

export const COOKIE_CONSENT_KEY = "cookie-consent";

/** Fired on the window when the stored choice changes, so listeners re-read it. */
export const COOKIE_CONSENT_EVENT = "cookie-consent-change";

export type CookieConsent = "accepted" | "declined" | null;

export function readCookieConsent(): CookieConsent {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored === "accepted" || stored === "declined" ? stored : null;
  } catch {
    // Storage can throw in private modes; treat it as "no consent given".
    return null;
  }
}

export function writeCookieConsent(
  consent: Exclude<CookieConsent, null>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, consent);
  } catch {
    // Ignore storage failures — the in-memory event still updates this page.
  }

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
}
