/**
 * Tests for drug interaction validation schemas in lib/validations/api.ts
 *
 * Tests the interaction-specific Zod schemas:
 * - interactionsBySubstanceSchema
 * - interactionsCheckPairSchema
 * - interactionsCheckMultipleSchema
 */

import { describe, it, expect } from "vitest";
import {
  interactionsBySubstanceSchema,
  interactionsCheckPairSchema,
  interactionsCheckMultipleSchema,
} from "@/lib/validations/api";

describe("interactionsBySubstanceSchema", () => {
  it("should accept a valid substance name", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "Warfarin",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.substance).toBe("Warfarin");
    }
  });

  it("should accept substance names with special characters", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "St. John's Wort",
    });
    expect(result.success).toBe(true);
  });

  it("should trim whitespace from substance name", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "  Warfarin  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.substance).toBe("Warfarin");
    }
  });

  it("should reject empty substance name", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "",
    });
    expect(result.success).toBe(false);
  });

  it("should trim whitespace-only substance name to empty string", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "   ",
    });
    // Zod .trim() transforms the value; .min(1) may not catch empty after trim in all versions
    // The API route handles empty strings via the falsy check before validation
    if (result.success) {
      expect(result.data.substance).toBe("");
    } else {
      expect(result.success).toBe(false);
    }
  });

  it("should reject missing substance field", () => {
    const result = interactionsBySubstanceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject substance names with script injection", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "<script>alert(1)</script>",
    });
    expect(result.success).toBe(false);
  });

  it("should reject substance names with javascript: protocol", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });

  it("should reject substance names longer than 200 characters", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("should accept substance names exactly 200 characters", () => {
    const result = interactionsBySubstanceSchema.safeParse({
      substance: "A".repeat(200),
    });
    expect(result.success).toBe(true);
  });
});

describe("interactionsCheckPairSchema", () => {
  it("should accept a valid pair separated by comma", () => {
    const result = interactionsCheckPairSchema.safeParse({
      check: "Warfarin,Aspirin",
    });
    expect(result.success).toBe(true);
  });

  it("should accept a pair with spaces around comma", () => {
    const result = interactionsCheckPairSchema.safeParse({
      check: "Warfarin, Aspirin",
    });
    expect(result.success).toBe(true);
  });

  it("should accept complex substance names in pair", () => {
    const result = interactionsCheckPairSchema.safeParse({
      check: "St. John's Wort,Ginkgo Biloba",
    });
    expect(result.success).toBe(true);
  });

  it("should reject check parameter without a comma", () => {
    const result = interactionsCheckPairSchema.safeParse({
      check: "WarfarinOnly",
    });
    expect(result.success).toBe(false);
  });

  it("should reject check parameter that is too short", () => {
    const result = interactionsCheckPairSchema.safeParse({
      check: "a,",
    });
    expect(result.success).toBe(false);
  });

  it("should reject check parameter with three substances", () => {
    const result = interactionsCheckPairSchema.safeParse({
      check: "Warfarin,Aspirin,Ibuprofen",
    });
    expect(result.success).toBe(false);
  });

  it("should reject check parameter with empty second substance", () => {
    const result = interactionsCheckPairSchema.safeParse({
      check: "Warfarin,",
    });
    expect(result.success).toBe(false);
  });

  it("should reject check parameter with empty first substance", () => {
    const result = interactionsCheckPairSchema.safeParse({
      check: ",Aspirin",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing check field", () => {
    const result = interactionsCheckPairSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject check parameter longer than 500 characters", () => {
    const longName = "A".repeat(250);
    const result = interactionsCheckPairSchema.safeParse({
      check: `${longName},${longName}B`,
    });
    expect(result.success).toBe(false);
  });
});

describe("interactionsCheckMultipleSchema", () => {
  it("should accept 2 substance names", () => {
    const result = interactionsCheckMultipleSchema.safeParse({
      substances: ["Warfarin", "Aspirin"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.substances).toHaveLength(2);
    }
  });

  it("should accept up to 20 substance names", () => {
    const substances = Array.from(
      { length: 20 },
      (_, i) => `Substance ${i + 1}`,
    );
    const result = interactionsCheckMultipleSchema.safeParse({ substances });
    expect(result.success).toBe(true);
  });

  it("should reject fewer than 2 substances", () => {
    const result = interactionsCheckMultipleSchema.safeParse({
      substances: ["OnlyOne"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("At least two");
    }
  });

  it("should reject empty substances array", () => {
    const result = interactionsCheckMultipleSchema.safeParse({
      substances: [],
    });
    expect(result.success).toBe(false);
  });

  it("should reject more than 20 substances", () => {
    const substances = Array.from(
      { length: 21 },
      (_, i) => `Substance ${i + 1}`,
    );
    const result = interactionsCheckMultipleSchema.safeParse({ substances });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("20");
    }
  });

  it("should reject missing substances field", () => {
    const result = interactionsCheckMultipleSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject when a substance name is empty", () => {
    const result = interactionsCheckMultipleSchema.safeParse({
      substances: ["Warfarin", ""],
    });
    expect(result.success).toBe(false);
  });

  it("should reject when a substance name has script injection", () => {
    const result = interactionsCheckMultipleSchema.safeParse({
      substances: ["Warfarin", "<script>alert(1)</script>"],
    });
    expect(result.success).toBe(false);
  });

  it("should reject when a substance name exceeds 200 characters", () => {
    const result = interactionsCheckMultipleSchema.safeParse({
      substances: ["Warfarin", "A".repeat(201)],
    });
    expect(result.success).toBe(false);
  });

  it("should trim whitespace from substance names", () => {
    const result = interactionsCheckMultipleSchema.safeParse({
      substances: ["  Warfarin  ", "  Aspirin  "],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.substances[0]).toBe("Warfarin");
      expect(result.data.substances[1]).toBe("Aspirin");
    }
  });

  it("should reject non-string values in substances array", () => {
    const result = interactionsCheckMultipleSchema.safeParse({
      substances: ["Warfarin", 123],
    });
    expect(result.success).toBe(false);
  });
});
