/**
 * Third-party origins the Content-Security-Policy has to allow, derived from
 * the credentials that already name them.
 *
 * Hardcoded hosts went wrong: the policy named hosts the deployment did not
 * use, and the deployment used hosts the policy did not name. Sentry's browser
 * SDK could not reach its ingest host so every error event was dropped before
 * it left the page.
 *
 * Deriving the origin means the policy follows the deployment rather than
 * having to be remembered. It returns null rather than a guess: a malformed
 * credential must not inject arbitrary text into a security header.
 *
 * This lives outside proxy.ts so it can be tested through its real interface.
 */

/** Only ever emit something that is unambiguously a hostname. */
const HOSTNAME = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

/**
 * The Sentry ingest origin this deployment reports to.
 *
 * A DSN is `https://<publicKey>@<host>/<projectId>`; only the origin matters
 * for connect-src. http DSNs are refused — the policy sets
 * upgrade-insecure-requests, and allowing a plaintext ingest host would be a
 * downgrade rather than a fix.
 */
export function sentryIngestOrigin(
  dsn: string | undefined = process.env.NEXT_PUBLIC_SENTRY_DSN,
): string | null {
  if (!dsn) return null;

  try {
    const { protocol, hostname } = new URL(dsn);
    if (protocol !== "https:") return null;
    return HOSTNAME.test(hostname) ? `https://${hostname}` : null;
  } catch {
    return null;
  }
}
