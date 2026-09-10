/**
 * Routes reachable without authentication.
 *
 * Extracted from proxy.ts so the list can be tested. These are
 * path-to-regexp patterns, and the failure mode is quiet: `(.*)` binds
 * directly to the preceding characters, not to a path segment, so
 * `/api/health(.*)` also matched `/api/health-profile` — putting a route that
 * returns someone's health profile into the public allowlist. Nothing was
 * exploitable, because that route checks auth itself, but the middleware layer
 * of defence was gone and nothing said so.
 *
 * Prefer an exact string. Reach for `(.*)` only for a genuine subtree, and
 * write it as `/prefix/(.*)` so the slash anchors it.
 *
 * Dropping an entry here is as dangerous as adding one: removing
 * `/sign-in(.*)` makes the sign-in page itself require sign-in, which is an
 * infinite redirect. The tests alongside this file cover both directions.
 */
export const PUBLIC_ROUTE_PATTERNS = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about(.*)",
  "/faq(.*)",
  "/legal/(.*)",
  "/compare(.*)",
  "/contribute(.*)",
  "/interactions(.*)",
  "/landing(.*)",
  "/maintenance(.*)",
  "/pricing(.*)",
  "/remedy/(.*)",
  "/robots.txt",
  "/sitemap.xml",
  // The middleware matcher excludes `.js` but deliberately not `.json`
  // (`js(?!on)`), so the PWA manifest declared in app/layout.tsx reached Clerk
  // and 307'd to /sign-in for every signed-out visitor — breaking install and
  // putting a failed request in the critical path of every page load.
  "/manifest.json",
  "/llms.txt",
  // Public API routes
  // Exact: `/api/search(.*)` also matched /api/search-history.
  "/api/search",
  "/api/remedy/(.*)",
  "/api/remedies/(.*)",
  "/api/webhooks/(.*)",
  // Exact: `/api/health(.*)` also matched /api/health-profile.
  "/api/health",
  "/api/reviews", // GET is public (POST requires auth at route level)
  "/api/favorites(.*)", // Supports anonymous sessionId-based access
  "/api/search-history(.*)", // Supports anonymous sessionId-based access
  "/api/filter-preferences(.*)", // Supports anonymous sessionId-based access
  "/api/plan(.*)", // Lightweight plan/limits lookup (safe for anonymous)
  "/api/user-events(.*)", // Anonymous event tracking
  "/api/conversion-events(.*)", // Anonymous conversion tracking
  "/api/ai-search(.*)", // AI availability check is public
  "/api/interactions(.*)", // Public interaction checker + substance lookup
  // Scheduled jobs authenticate with CRON_SECRET at the route level; Clerk
  // must not intercept them or the secret check is never reached.
  "/api/cron/(.*)",
] as const;
