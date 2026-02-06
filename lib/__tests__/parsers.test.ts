/**
 * Unit Tests for Database Parsers
 *
 * Tests JSON parsing utilities for database fields.
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  parseJsonArray,
  parseJsonObject,
  parsePharmaceutical,
  parseNaturalRemedy,
  parseRemedyMapping,
  serializeArray,
  isPostgres,
  isSqlite,
} from "../db/parsers";

describe("Database Parsers", () => {
  describe("parseJsonArray", () => {
    it("should return array as-is (PostgreSQL native)", () => {
      const arr = ["item1", "item2", "item3"];
      expect(parseJsonArray(arr)).toEqual(arr);
    });

    it("should parse JSON string (SQLite)", () => {
      const jsonStr = '["item1", "item2", "item3"]';
      expect(parseJsonArray(jsonStr)).toEqual(["item1", "item2", "item3"]);
    });

    it("should return empty array for null", () => {
      expect(parseJsonArray(null)).toEqual([]);
    });

    it("should return empty array for undefined", () => {
      expect(parseJsonArray(undefined)).toEqual([]);
    });

    it("should return empty array for empty string", () => {
      expect(parseJsonArray("")).toEqual([]);
    });

    it("should return non-array JSON as empty array", () => {
      expect(parseJsonArray('{"key": "value"}')).toEqual([]);
      expect(parseJsonArray('"just a string"')).toEqual([]);
      expect(parseJsonArray("123")).toEqual([]);
    });

    it("should treat invalid JSON as single-item array", () => {
      expect(parseJsonArray("not-json")).toEqual(["not-json"]);
      expect(parseJsonArray("invalid{json}")).toEqual(["invalid{json}"]);
    });

    it("should trim whitespace when treating as single-item", () => {
      expect(parseJsonArray("  trimmed  ")).toEqual(["trimmed"]);
    });

    it("should return empty array for whitespace-only strings", () => {
      expect(parseJsonArray("   ")).toEqual([]);
    });
  });

  describe("parseJsonObject", () => {
    it("should return object as-is (PostgreSQL native)", () => {
      const obj = { key: "value", nested: { inner: "data" } };
      expect(parseJsonObject(obj)).toEqual(obj);
    });

    it("should parse JSON string (SQLite)", () => {
      const jsonStr = '{"key": "value", "number": 123}';
      expect(parseJsonObject(jsonStr)).toEqual({ key: "value", number: 123 });
    });

    it("should return null for null", () => {
      expect(parseJsonObject(null)).toBeNull();
    });

    it("should return null for undefined", () => {
      expect(parseJsonObject(undefined)).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(parseJsonObject("")).toBeNull();
    });

    it("should return null for invalid JSON", () => {
      expect(parseJsonObject("not-json")).toBeNull();
      expect(parseJsonObject("{invalid}")).toBeNull();
    });

    it("should parse arrays from JSON string", () => {
      expect(parseJsonObject('["a", "b", "c"]')).toEqual(["a", "b", "c"]);
    });

    it("should handle nested objects", () => {
      const complex = '{"a": {"b": {"c": 1}}}';
      expect(parseJsonObject(complex)).toEqual({ a: { b: { c: 1 } } });
    });
  });

  describe("parsePharmaceutical", () => {
    it("should parse pharmaceutical with JSON string arrays", () => {
      const raw = {
        id: "1",
        fdaId: "fda-1",
        name: "Test Drug",
        description: "Description",
        category: "Pain Reliever",
        ingredients: '["ingredient1", "ingredient2"]',
        benefits: '["benefit1", "benefit2"]',
        usage: "Take daily",
        warnings: "Warning text",
        interactions: "None",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parsePharmaceutical(raw);

      expect(parsed.ingredients).toEqual(["ingredient1", "ingredient2"]);
      expect(parsed.benefits).toEqual(["benefit1", "benefit2"]);
      expect(parsed.name).toBe("Test Drug");
    });

    it("should parse pharmaceutical with native arrays", () => {
      const raw = {
        id: "1",
        fdaId: null,
        name: "Test Drug",
        description: null,
        category: "Sleep Aid",
        ingredients: ["ingredient1"],
        benefits: ["benefit1"],
        usage: null,
        warnings: null,
        interactions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parsePharmaceutical(raw);

      expect(parsed.ingredients).toEqual(["ingredient1"]);
      expect(parsed.benefits).toEqual(["benefit1"]);
    });
  });

  describe("parseNaturalRemedy", () => {
    it("should parse natural remedy with JSON string arrays", () => {
      const raw = {
        id: "1",
        name: "Turmeric",
        description: "Anti-inflammatory",
        category: "Herbal",
        ingredients: '["curcumin"]',
        benefits: '["anti-inflammatory", "antioxidant"]',
        imageUrl: "https://example.com/image.jpg",
        usage: "Take with food",
        dosage: "500mg daily",
        precautions: "May interact with blood thinners",
        scientificInfo: "Science info",
        references: '["ref1", "ref2"]',
        relatedRemedies: '["ginger", "pepper"]',
        sourceUrl: null,
        evidenceLevel: "moderate",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parseNaturalRemedy(raw);

      expect(parsed.ingredients).toEqual(["curcumin"]);
      expect(parsed.benefits).toEqual(["anti-inflammatory", "antioxidant"]);
      expect(parsed.references).toEqual(["ref1", "ref2"]);
      expect(parsed.relatedRemedies).toEqual(["ginger", "pepper"]);
    });

    it("should handle null optional fields", () => {
      const raw = {
        id: "1",
        name: "Test",
        description: null,
        category: "Test",
        ingredients: "[]",
        benefits: "[]",
        imageUrl: null,
        usage: null,
        dosage: null,
        precautions: null,
        scientificInfo: null,
        references: null,
        relatedRemedies: null,
        sourceUrl: null,
        evidenceLevel: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parseNaturalRemedy(raw);

      expect(parsed.references).toEqual([]);
      expect(parsed.relatedRemedies).toEqual([]);
    });
  });

  describe("parseRemedyMapping", () => {
    it("should parse remedy mapping with JSON string array", () => {
      const raw = {
        id: "1",
        pharmaceuticalId: "pharm-1",
        naturalRemedyId: "remedy-1",
        similarityScore: 0.85,
        matchingNutrients: '["curcumin", "gingerol"]',
        replacementType: "alternative",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parseRemedyMapping(raw);

      expect(parsed.matchingNutrients).toEqual(["curcumin", "gingerol"]);
      expect(parsed.similarityScore).toBe(0.85);
    });

    it("should handle native array", () => {
      const raw = {
        id: "1",
        pharmaceuticalId: "pharm-1",
        naturalRemedyId: "remedy-1",
        similarityScore: 0.9,
        matchingNutrients: ["nutrient1"],
        replacementType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const parsed = parseRemedyMapping(raw);

      expect(parsed.matchingNutrients).toEqual(["nutrient1"]);
    });
  });

  describe("serializeArray", () => {
    it("should return array as-is for PostgreSQL (default)", () => {
      const arr = ["a", "b", "c"];
      expect(serializeArray(arr)).toEqual(arr);
    });

    it("should return JSON string for SQLite", () => {
      const arr = ["a", "b", "c"];
      expect(serializeArray(arr, true)).toBe('["a","b","c"]');
    });

    it("should handle empty arrays", () => {
      expect(serializeArray([], false)).toEqual([]);
      expect(serializeArray([], true)).toBe("[]");
    });
  });

  describe("isPostgres", () => {
    const originalEnv = process.env.DATABASE_URL;

    afterEach(() => {
      process.env.DATABASE_URL = originalEnv;
    });

    it("should return true for postgresql:// URLs", () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      expect(isPostgres()).toBe(true);
    });

    it("should return true for postgres:// URLs", () => {
      process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/db";
      expect(isPostgres()).toBe(true);
    });

    it("should return false for SQLite URLs", () => {
      process.env.DATABASE_URL = "file:./dev.db";
      expect(isPostgres()).toBe(false);
    });

    it("should return false when DATABASE_URL is not set", () => {
      delete process.env.DATABASE_URL;
      expect(isPostgres()).toBe(false);
    });
  });

  describe("isSqlite", () => {
    const originalEnv = process.env.DATABASE_URL;

    afterEach(() => {
      process.env.DATABASE_URL = originalEnv;
    });

    it("should return true for file: URLs", () => {
      process.env.DATABASE_URL = "file:./dev.db";
      expect(isSqlite()).toBe(true);
    });

    it("should return false for PostgreSQL URLs", () => {
      process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";
      expect(isSqlite()).toBe(false);
    });

    it("should return false when DATABASE_URL is not set", () => {
      delete process.env.DATABASE_URL;
      expect(isSqlite()).toBe(false);
    });
  });
});
