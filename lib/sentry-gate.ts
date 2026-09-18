/**
 * Where Sentry is allowed to report from.
 *
 * The `vivance` Sentry org shares ONE error quota across all nine projects, and
 * that quota was exhausted: since 2026-09-13 every error envelope comes back
 * `429 error_usage_exceeded`, so no project in the fleet can report anything.
 * Of the 8,432 error events in the 30 days before that, 3,060 — 36% — carried
 * `environment:development`: laptop runs (`Natalys-MacBook-Pro.local`, urls
 * like `http://127.0.0.1:4173`) filing into the production quota. Per-DSN rate
 * limits are not available on this plan, so this client-side gate is the only
 * control there is.
 *
 * The rule: initialise Sentry only when the app is actually running as a
 * deployed Vercel app.
 *
 * `VERCEL_ENV` is set by Vercel to "production" | "preview" | "development"
 * and is UNDEFINED anywhere else — including `next dev` AND a local
 * `next build && next start`. That second case is the one that matters:
 * `NODE_ENV` is "production" for a local production build, so the existing
 * `beforeSend` guards (`NODE_ENV === "development"` → return null) never fired
 * for it, and it reported like a deploy. Gating on `VERCEL_ENV` closes it.
 *
 * Escape hatches, both opt-in and both explicit:
 *   NEXT_PUBLIC_SENTRY_FORCE_ENABLE=1   report from a local build on purpose
 *                                        (e.g. verifying an SDK upgrade)
 *   NEXT_PUBLIC_SENTRY_FORCE_DISABLE=1  silence a deployed environment
 *                                        (takes precedence over everything)
 *
 * Both are `NEXT_PUBLIC_` so the browser bundle can see them; they are read
 * through `process.env` inside functions so Next's build-time inlining still
 * applies and tests can stub them.
 */

/** "production" | "preview" | "development" on Vercel, "" everywhere else. */
export function sentryEnvironment(): string {
  const fromVercel =
    process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? "";
  return fromVercel.trim();
}

/**
 * The value to tag events with, so production and preview stay apart.
 *
 * Only meaningful when {@link sentryEnabled} is true; the NODE_ENV fallback
 * exists for the force-enabled local case, which has no VERCEL_ENV to report.
 */
export function sentryEnvironmentTag(): string {
  return sentryEnvironment() || process.env.NODE_ENV || "development";
}

/**
 * Whether `Sentry.init` may run at all.
 *
 * @param dsn the DSN the caller would initialise with; no DSN, no reporting.
 */
export function sentryEnabled(dsn: string | undefined): boolean {
  if (!dsn) return false;
  if (process.env.NEXT_PUBLIC_SENTRY_FORCE_DISABLE === "1") return false;
  if (process.env.NEXT_PUBLIC_SENTRY_FORCE_ENABLE === "1") return true;

  const env = sentryEnvironment();
  return env === "production" || env === "preview";
}
