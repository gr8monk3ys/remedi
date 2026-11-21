/**
 * The public-route allowlist, checked against the routes that actually exist.
 *
 * `(.*)` in path-to-regexp binds to the preceding characters, not to a path
 * segment. So `/api/health(.*)` silently also matched `/api/health-profile`,
 * putting an endpoint that returns someone's health profile into the list of
 * routes the proxy does not protect. It was not exploitable — that route checks
 * auth itself — but the middleware layer was gone and nothing reported it.
 *
 * This walks every real route against every pattern, so the next over-broad
 * entry fails here instead of being discovered later.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_ROUTE_PATTERNS, isPublicPath } from "@/lib/public-routes";

/** Every API route path that exists, with dynamic segments normalised. */
function apiRoutes(dir = "app/api", acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) apiRoutes(full, acc);
    else if (entry === "route.ts") {
      acc.push(full.replace(/^app/, "").replace(/\/route\.ts$/, ""));
    }
  }
  return acc;
}

/** Same rule as isPublicPath, for one pattern at a time. */
const matches = (pattern: string, path: string): boolean =>
  pattern.endsWith("(.*)")
    ? path.startsWith(pattern.slice(0, -"(.*)".length))
    : path === pattern;

/** Routes that must never be reachable without a session. */
const MUST_BE_PROTECTED = [
  "/api/health-profile",
  "/api/journal",
  "/api/medication-cabinet",
  "/api/reports",
  "/api/account/export",
  "/api/admin/users/x",
  "/api/admin/subscriptions/x",
  "/api/checkout",
  "/api/billing-portal",
  "/api/trial/start",
  "/user-profile",
  "/dashboard",
  "/admin",
  // Prefix lookalikes of public pages.
  "/sign-in-as-admin",
  "/api/authz",
];

/**
 * Pages that MUST stay public. Dropping one is as dangerous as adding one:
 * removing `/sign-in(.*)` makes the sign-in page require sign-in, which is an
 * infinite redirect — the whole app becomes unreachable for signed-out users.
 * That is exactly what happened when this list was first extracted.
 */
const MUST_BE_PUBLIC = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/api/auth/sign-in/email",
  "/api/auth/verify-email",
  "/pricing",
  "/about",
  "/faq",
  "/legal/privacy",
  "/contribute",
  "/robots.txt",
  "/sitemap.xml",
  // app/layout.tsx declares manifest: "/manifest.json". The middleware matcher
  // excludes `.js` but not `.json`, so without an allowlist entry it 307s to
  // /sign-in for every signed-out visitor — breaking PWA install and adding a
  // failed request to the critical path of every page load.
  "/manifest.json",
  "/llms.txt",
];

describe("public route allowlist", () => {
  it.each(MUST_BE_PUBLIC)("keeps %s reachable without auth", (route) => {
    expect(isPublicPath(route)).toBe(true);
  });

  it.each(MUST_BE_PROTECTED)("does not expose %s", (route) => {
    expect(isPublicPath(route)).toBe(false);
  });

  it("every pattern matches at least one real route", () => {
    // A pattern matching nothing is either a typo or a leftover, and either
    // way it is a claim about the app that is no longer true.
    const routes = apiRoutes();
    const apiPatterns = PUBLIC_ROUTE_PATTERNS.filter((p) =>
      p.startsWith("/api/"),
    );
    const dead = apiPatterns.filter(
      (p) => !routes.some((r) => matches(p, r.replace(/\[[^\]]+\]/g, "x"))),
    );
    expect(dead).toEqual([]);
  });
});
