/**
 * Comparison export formats (`lib/export-formats.ts`).
 *
 * The text export is what leaves the product: it is copied into emails and
 * saved to disk, where none of the page's surrounding warnings travel with
 * it. So the properties under test are that every compared remedy is in it,
 * that a missing field reads as "N/A" rather than "undefined", and that the
 * informational-only disclaimer is always attached.
 *
 * The canvas (PNG) and print paths need a real browser and are not covered
 * here.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  copyComparisonLink,
  emailComparison,
  generateTextContent,
} from "@/lib/export-formats";
import type { DetailedRemedy } from "@/lib/types";

function remedy(overrides: Partial<DetailedRemedy> = {}): DetailedRemedy {
  return {
    id: "r1",
    name: "Turmeric",
    description: "A root used in cooking.",
    imageUrl: "",
    category: "Herbal",
    matchingNutrients: [],
    similarityScore: 0.8,
    usage: "With food.",
    dosage: "500 mg daily",
    precautions: "May interact with blood thinners.",
    scientificInfo: "Contains curcumin.",
    references: [],
    relatedRemedies: [],
    ...overrides,
  };
}

const COMPARE_URL = "https://remedi.example/compare?ids=r1,r2";
const originalLocation = window.location;

function stubLocation(href: string) {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { href },
  });
}

beforeEach(() => {
  stubLocation(COMPARE_URL);
});

function stubClipboard(writeText: Clipboard["writeText"]) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
  Reflect.deleteProperty(document, "execCommand");
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: originalLocation,
  });
  vi.restoreAllMocks();
});

describe("generateTextContent", () => {
  it("lists every compared remedy in order with its category", () => {
    const text = generateTextContent([
      remedy(),
      remedy({ id: "r2", name: "Ginger", category: "Root" }),
    ]);

    expect(text).toContain("1. Turmeric (Herbal)");
    expect(text).toContain("2. Ginger (Root)");
    expect(text.indexOf("--- Turmeric ---")).toBeLessThan(
      text.indexOf("--- Ginger ---"),
    );
  });

  it("writes each remedy's detail fields", () => {
    const text = generateTextContent([remedy()]);

    expect(text).toContain("Category: Herbal");
    expect(text).toContain("Description: A root used in cooking.");
    expect(text).toContain("Dosage: 500 mg daily");
    expect(text).toContain("Usage: With food.");
    expect(text).toContain("Precautions: May interact with blood thinners.");
    expect(text).toContain("Scientific Info: Contains curcumin.");
  });

  it("renders missing fields as N/A, never as undefined or blank", () => {
    const text = generateTextContent([
      remedy({
        category: "",
        description: "",
        dosage: "",
        usage: "",
        precautions: "",
        scientificInfo: "",
      }),
    ]);

    expect(text).toContain("1. Turmeric (N/A)");
    for (const field of [
      "Category",
      "Description",
      "Dosage",
      "Usage",
      "Precautions",
      "Scientific Info",
    ]) {
      expect(text).toContain(`${field}: N/A`);
    }
    expect(text).not.toMatch(/undefined|null/);
  });

  it("always attaches the not-medical-advice disclaimer", () => {
    for (const remedies of [[], [remedy()]]) {
      const text = generateTextContent(remedies);
      expect(text).toContain("DISCLAIMER:");
      expect(text).toMatch(/should not be considered medical advice/);
      expect(text).toMatch(/consult with a qualified healthcare professional/);
    }
  });

  it("ends with the comparison URL so the reader can get back to it", () => {
    const text = generateTextContent([remedy()]);
    expect(text.trimEnd().endsWith(`Comparison URL: ${COMPARE_URL}`)).toBe(
      true,
    );
  });
});

describe("emailComparison", () => {
  it("opens a mailto link whose subject names the remedies and whose body is the text export", () => {
    const remedies = [remedy(), remedy({ id: "r2", name: "Ginger" })];
    const expectedBody = generateTextContent(remedies);

    emailComparison(remedies);

    const href = window.location.href;
    expect(href.startsWith("mailto:?")).toBe(true);
    const params = new URLSearchParams(href.slice("mailto:?".length));
    expect(params.get("subject")).toBe("Remedy Comparison: Turmeric, Ginger");
    expect(params.get("body")).toBe(expectedBody);
  });
});

describe("copyComparisonLink", () => {
  it("writes the current URL to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    await copyComparisonLink();

    expect(writeText).toHaveBeenCalledWith(COMPARE_URL);
  });

  it("falls back to execCommand when the clipboard API rejects", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    let copied: string | undefined;
    const execCommand = vi.fn((command: string) => {
      const active = document.querySelector("textarea");
      if (command === "copy") copied = active?.value;
      return true;
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: execCommand,
    });

    await copyComparisonLink();

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(copied).toBe(COMPARE_URL);
    // The temporary textarea is removed afterwards.
    expect(document.querySelector("textarea")).toBeNull();
  });
});
