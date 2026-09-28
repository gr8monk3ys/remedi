import { describe, it, expect } from "vitest";
import { intParam } from "@/lib/api/query-params";

const PAGE = { fallback: 1, min: 1 };
const PAGE_SIZE = { fallback: 10, min: 1, max: 50 };

describe("intParam", () => {
  it("reads a plain integer", () => {
    expect(intParam("3", PAGE)).toBe(3);
  });

  it("falls back when the parameter is missing or empty", () => {
    expect(intParam(null, PAGE_SIZE)).toBe(10);
    expect(intParam("", PAGE_SIZE)).toBe(10);
  });

  it("falls back instead of returning NaN for non-numbers", () => {
    expect(intParam("abc", PAGE)).toBe(1);
    expect(intParam("Infinity", PAGE_SIZE)).toBe(10);
  });

  it("drops fractions, which Prisma rejects for skip/take", () => {
    expect(intParam("1.5", PAGE)).toBe(1);
    expect(intParam("12.9", PAGE_SIZE)).toBe(12);
  });

  it("clamps to the bounds", () => {
    expect(intParam("-4", PAGE)).toBe(1);
    expect(intParam("0", PAGE_SIZE)).toBe(1);
    expect(intParam("1000", PAGE_SIZE)).toBe(50);
  });
});
