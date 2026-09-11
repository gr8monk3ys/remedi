/**
 * Third-party origins the Content-Security-Policy has to allow, derived from
 * the credentials that already name them.
 *
 * Both of these were hardcoded once and both went wrong the same way: the
 * policy named hosts the deployment did not use, and the deployment used hosts
 * the policy did not name. Clerk's script was blocked in production so sign-in
 * silently failed (#137), and Sentry's browser SDK could not reach its ingest
 * host so every error event was dropped before it left the page.
 *
 * Deriving them means the policy follows the deployment rather than having to
 * be remembered. Both return null rather than a guess: a malformed credential
 * must not inject arbitrary text into a security header.
 *
 * This lives outside proxy.ts so it can be tested through its real interface.
 * The previous test re-implemented the Clerk derivation inside the test file
 * and asserted against the copy, which would have passed even if proxy.ts had
 * been deleted.
 */

/** Only ever emit something that is unambiguously a hostname. */
const HOSTNAME = /^[a-z0-9.-]+\.[a-z]{2,}$/i;

/**
 * Clerk's frontend API origin for this deployment.
 *
 * A publishable key is `pk_<env>_<base64 host with a trailing $>`, so the host
 * it will actually talk to is carried in the key itself.
 */
export function clerkFrontendOrigin(
  key: string | undefined = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
): string | null {
  if (!key) return null;

  const encoded = key.split("_").slice(2).join("_");
  if (!encoded) return null;

  try {
    const host = Buffer.from(encoded, "base64")
      .toString("utf8")
      .replace(/\$$/, "");
    return HOSTNAME.test(host) ? `https://${host}` : null;
  } catch {
    return null;
  }
}

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
