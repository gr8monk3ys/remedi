/**
 * Unit Tests for Utility Functions
 *
 * Tests the cn() function for Tailwind CSS class merging.
 */

import { describe, it, expect } from "vitest";
import { cn, isUuid } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
      "base active",
    );
  });

  it("should merge conflicting Tailwind classes", () => {
    // twMerge should keep the last conflicting class
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("bg-white", "bg-black")).toBe("bg-black");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle objects with boolean values", () => {
    expect(
      cn({
        foo: true,
        bar: false,
        baz: true,
      }),
    ).toBe("foo baz");
  });

  it("should handle undefined and null values", () => {
    expect(cn("foo", undefined, "bar", null)).toBe("foo bar");
  });

  it("should handle empty strings", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar");
  });

  it("should handle complex combinations", () => {
    const includeConditional = Boolean("conditional");
    const includeSkipped = Boolean("");
    const result = cn(
      "base",
      includeConditional && "conditional",
      includeSkipped && "skipped",
      ["array", "classes"],
      { object: true, skipped: false },
      undefined,
      "final",
    );
    expect(result).toBe("base conditional array classes object final");
  });

  it("should handle Tailwind responsive modifiers", () => {
    expect(cn("p-2 md:p-4", "p-3")).toBe("md:p-4 p-3");
  });

  it("should handle Tailwind state modifiers", () => {
    expect(cn("hover:bg-blue-500", "hover:bg-red-500")).toBe(
      "hover:bg-red-500",
    );
  });

  it("should preserve non-conflicting classes", () => {
    expect(cn("font-bold", "text-center", "p-4")).toBe(
      "font-bold text-center p-4",
    );
  });

  it("should handle numeric values (from clsx)", () => {
    expect(cn("foo", 0, 1, "bar")).toBe("foo 1 bar");
  });
});

describe("isUuid", () => {
  it("accepts well-formed UUIDs (Prisma @default(uuid))", () => {
    expect(isUuid("123e4567-e89b-42d3-a456-426614174000")).toBe(true);
    expect(isUuid("00000000-0000-0000-0000-000000000000")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isUuid("123E4567-E89B-42D3-A456-426614174000")).toBe(true);
  });

  it("rejects mock and non-uuid IDs", () => {
    expect(isUuid("101")).toBe(false);
    expect(isUuid("mock-remedy-3")).toBe(false);
    expect(isUuid("rem-1")).toBe(false);
    expect(isUuid("")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
  });

  it("rejects malformed UUID-like strings", () => {
    // Wrong length (last segment too short)
    expect(isUuid("123e4567-e89b-42d3-a456-42661417400")).toBe(false);
    // Non-hex character
    expect(isUuid("123e4567-e89b-42d3-a456-42661417400g")).toBe(false);
    // Missing hyphens
    expect(isUuid("123e4567e89b42d3a456426614174000")).toBe(false);
  });
});
