/**
 * A database outage is not a missing page.
 *
 * loadRemedy used to catch the DB error, log a warning, and fall through to
 * demo data — which is null in production — so the page called notFound() and
 * told the reader "The page you're looking for doesn't exist or has been
 * moved." A remedy someone had bookmarked appeared to have been deleted.
 *
 * The correct boundary already existed at app/remedy/[id]/error.tsx and could
 * never fire, because the throw was swallowed two frames below it.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/db", () => ({
  getNaturalRemedyById: vi.fn(),
  resolveRelatedRemedies: vi.fn(async () => []),
  toDetailedRemedy: vi.fn((r: { id: string; name: string }) => ({
    ...r,
    references: [],
  })),
}));

vi.mock("@/lib/env", () => ({ isDemoDataEnabled: () => false }));
vi.mock("@/lib/logger", () => {
  const stub = { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
  return { logger: stub, createLogger: () => stub };
});

import { notFound } from "next/navigation";
import { getNaturalRemedyById } from "@/lib/db";
import Page, { generateMetadata } from "@/app/remedy/[id]/page";

const uuid = (n: number): string =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

describe("remedy detail page, when the database is unreachable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws so the error boundary renders, rather than calling notFound", async () => {
    const id = uuid(1);
    vi.mocked(getNaturalRemedyById).mockRejectedValue(
      new Error("connection terminated"),
    );

    await expect(Page({ params: Promise.resolve({ id }) })).rejects.toThrow(
      /could not load this remedy/i,
    );

    // The distinction that matters: we never claimed the remedy is absent.
    expect(vi.mocked(notFound)).not.toHaveBeenCalled();
  });

  it("does not title the page 'Not Found' during an outage", async () => {
    const id = uuid(2);
    vi.mocked(getNaturalRemedyById).mockRejectedValue(new Error("ETIMEDOUT"));

    const meta = await generateMetadata({ params: Promise.resolve({ id }) });

    // This string gets cached, shared and indexed.
    expect(meta.title).toBe("Remedy temporarily unavailable");
    expect(meta.title).not.toMatch(/not found/i);
  });

  it("still 404s when the database answers and the remedy genuinely is absent", async () => {
    const id = uuid(3);
    vi.mocked(getNaturalRemedyById).mockResolvedValue(null);

    await expect(Page({ params: Promise.resolve({ id }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );

    expect(vi.mocked(notFound)).toHaveBeenCalled();
  });
});
