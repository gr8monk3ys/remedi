/**
 * The public-route allowlist, checked against the routes that actually exist.
 *
 * `(.*)` in path-to-regexp binds to the preceding characters, not to a path
 * segment. So `/api/health(.*)` silently also matched `/api/health-profile`,
 * putting an endpoint that returns someone's health profile into the list of
 * routes Clerk does not protect. It was not exploitable — that route checks
 * auth itself — but the middleware layer was gone and nothing reported it.
 *
 * This walks every real route against every pattern, so the next over-broad
 * entry fails here instead of being discovered later.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { PUBLIC_ROUTE_PATTERNS } from "@/lib/public-routes";

// Next bundles path-to-regexp without type declarations. Using the same
// implementation Clerk's createRouteMatcher uses matters here — the whole
// point is to test the real matching semantics, not an approximation.
const { pathToRegexp } = createRequire(import.meta.url)(
  "next/dist/compiled/path-to-regexp",
) as { pathToRegexp: (p: string) => { regexp?: RegExp } | RegExp };

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

const matches = (pattern: string, path: string): boolean => {
  const compiled = pathToRegexp(pattern) as { regexp?: RegExp } | RegExp;
  const re = (compiled as { regexp?: RegExp }).regexp ?? (compiled as RegExp);
  return re.test(path);
};

/** Routes that must never be reachable without Clerk protecting them. */
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
];

describe("public route allowlist", () => {
  it.each(MUST_BE_PROTECTED)("does not expose %s", (route) => {
    const matching = PUBLIC_ROUTE_PATTERNS.filter((p) => matches(p, route));
    expect(matching).toEqual([]);
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
