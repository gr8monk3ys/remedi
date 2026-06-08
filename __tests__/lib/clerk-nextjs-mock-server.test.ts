import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { createRouteMatcher } from "@/lib/e2e/clerk-nextjs-mock/server";

describe("createRouteMatcher", () => {
  it("matches exact routes without regex construction", () => {
    const matcher = createRouteMatcher(["/api/reviews"]);
    const request = new NextRequest("http://localhost:3000/api/reviews");

    expect(matcher(request)).toBe(true);
  });

  it("matches wildcard route prefixes", () => {
    const matcher = createRouteMatcher(["/sign-in(.*)", "/legal/(.*)"]);

    expect(matcher(new NextRequest("http://localhost:3000/sign-in"))).toBe(
      true,
    );
    expect(
      matcher(new NextRequest("http://localhost:3000/sign-in/callback")),
    ).toBe(true);
    expect(
      matcher(new NextRequest("http://localhost:3000/legal/privacy")),
    ).toBe(true);
  });

  it("does not match unrelated paths", () => {
    const matcher = createRouteMatcher(["/sign-in(.*)"]);

    expect(matcher(new NextRequest("http://localhost:3000/dashboard"))).toBe(
      false,
    );
  });
});
