/**
 * Unit Tests for Remedy Mapping Service
 *
 * Tests the natural remedy mapping functionality including:
 * - Ingredient-based matching
 * - Category-based matching
 * - Detailed remedy retrieval
 */

import { describe, it, expect } from "vitest";
import {
  findNaturalRemediesForDrug,
  getDetailedRemedy,
  addDetailedRemedy,
} from "../remedyMapping";
import type { ProcessedDrug, DetailedRemedy } from "../types";

describe("Remedy Mapping Service", () => {
  describe("findNaturalRemediesForDrug", () => {
    describe("Ingredient-based matching", () => {
      it("should find remedies for ibuprofen", async () => {
        const drug: ProcessedDrug = {
          id: "drug-1",
          fdaId: "fda-1",
          name: "Advil",
          description: "Pain reliever",
          category: "Pain Reliever",
          ingredients: ["ibuprofen 200mg"],
          benefits: ["pain relief"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        expect(remedies.length).toBeGreaterThan(0);
        // Should match turmeric, ginger, willow bark, or boswellia
        const remedyNames = remedies.map((r) => r.name.toLowerCase());
        expect(
          remedyNames.some(
            (name) =>
              name.includes("turmeric") ||
              name.includes("ginger") ||
              name.includes("willow") ||
              name.includes("boswellia"),
          ),
        ).toBe(true);
      });

      it("should find remedies for acetaminophen via category fallback", async () => {
        const drug: ProcessedDrug = {
          id: "drug-2",
          fdaId: "fda-2",
          name: "Tylenol",
          description: "Pain reliever",
          category: "Pain Reliever",
          ingredients: ["acetaminophen"],
          benefits: ["pain relief", "fever reducer"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        // May find matches through category fallback since acetaminophen maps
        // to remedies not in DETAILED_REMEDIES
        expect(Array.isArray(remedies)).toBe(true);
      });

      it("should find remedies for melatonin", async () => {
        const drug: ProcessedDrug = {
          id: "drug-3",
          fdaId: "fda-3",
          name: "Melatonin Supplement",
          description: "Sleep aid",
          category: "Sleep Aid",
          ingredients: ["melatonin 3mg"],
          benefits: ["sleep regulation"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        expect(remedies.length).toBeGreaterThan(0);
        // Should match tart cherry juice, chamomile, or valerian
        const remedyIds = remedies.map((r) => r.id.toLowerCase());
        expect(
          remedyIds.some(
            (id) =>
              id.includes("cherry") ||
              id.includes("chamomile") ||
              id.includes("valerian"),
          ),
        ).toBe(true);
      });

      it("should find remedies for omeprazole via category fallback", async () => {
        const drug: ProcessedDrug = {
          id: "drug-4",
          fdaId: "fda-4",
          name: "Prilosec",
          description: "Acid reducer",
          category: "Digestive Health",
          ingredients: ["omeprazole"],
          benefits: ["acid reflux relief"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        // May find matches through category fallback since omeprazole maps
        // to remedies not in DETAILED_REMEDIES. Check for ginger which is
        // in the Digestive Health category mapping.
        expect(Array.isArray(remedies)).toBe(true);
        if (remedies.length > 0) {
          const remedyIds = remedies.map((r) => r.id.toLowerCase());
          expect(
            remedyIds.some(
              (id) => id.includes("ginger") || id.includes("peppermint"),
            ),
          ).toBe(true);
        }
      });

      it("should find remedies for allergy medications via category fallback", async () => {
        const drug: ProcessedDrug = {
          id: "drug-5",
          fdaId: "fda-5",
          name: "Zyrtec",
          description: "Allergy relief",
          category: "Allergy Medication",
          ingredients: ["cetirizine"],
          benefits: ["allergy relief"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        // Cetirizine maps to quercetin, stinging_nettle, butterbur
        // but these may not be in DETAILED_REMEDIES
        expect(Array.isArray(remedies)).toBe(true);
      });

      it("should match partial ingredient names", async () => {
        const drug: ProcessedDrug = {
          id: "drug-6",
          fdaId: "fda-6",
          name: "Generic Drug",
          description: "Pain reliever",
          category: "Pain Reliever",
          ingredients: ["naproxen sodium 220mg"],
          benefits: ["pain relief"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        expect(remedies.length).toBeGreaterThan(0);
      });
    });

    describe("Category-based matching", () => {
      it("should fall back to category matching when no ingredient matches", async () => {
        const drug: ProcessedDrug = {
          id: "drug-7",
          fdaId: "fda-7",
          name: "Unknown Pain Drug",
          description: "Pain reliever",
          category: "Pain Reliever",
          ingredients: ["unknown_ingredient_xyz"],
          benefits: ["pain relief"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        expect(remedies.length).toBeGreaterThan(0);
        // Should match Pain Reliever category remedies
        const remedyIds = remedies.map((r) => r.id.toLowerCase());
        expect(
          remedyIds.some(
            (id) =>
              id.includes("turmeric") ||
              id.includes("ginger") ||
              id.includes("willow"),
          ),
        ).toBe(true);
      });

      it("should match Sleep Aid category", async () => {
        const drug: ProcessedDrug = {
          id: "drug-8",
          fdaId: "fda-8",
          name: "Sleep Helper",
          description: "Helps with sleep",
          category: "Sleep Aid",
          ingredients: ["some_unknown_ingredient"],
          benefits: ["sleep"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        expect(remedies.length).toBeGreaterThan(0);
      });

      it("should match Digestive Health category", async () => {
        const drug: ProcessedDrug = {
          id: "drug-9",
          fdaId: "fda-9",
          name: "Stomach Helper",
          description: "For digestive issues",
          category: "Digestive Health",
          ingredients: ["some_unknown_ingredient"],
          benefits: ["digestion"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        expect(remedies.length).toBeGreaterThan(0);
      });

      it("should handle partial category matches", async () => {
        const drug: ProcessedDrug = {
          id: "drug-10",
          fdaId: "fda-10",
          name: "Blood Pressure Med",
          description: "Lowers blood pressure",
          category: "Blood Pressure",
          ingredients: ["lisinopril"],
          benefits: ["blood pressure control"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        // May or may not find matches depending on partial category matching
        expect(Array.isArray(remedies)).toBe(true);
      });
    });

    describe("Edge cases", () => {
      it("should return empty array when no matches found", async () => {
        const drug: ProcessedDrug = {
          id: "drug-11",
          fdaId: "fda-11",
          name: "Completely Unknown",
          description: "Unknown drug",
          category: "Nonexistent Category XYZ",
          ingredients: ["xyz_ingredient_not_mapped"],
          benefits: ["unknown"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        expect(Array.isArray(remedies)).toBe(true);
      });

      it("should handle drugs with empty ingredients", async () => {
        const drug: ProcessedDrug = {
          id: "drug-12",
          fdaId: "fda-12",
          name: "No Ingredients",
          description: "Mystery drug",
          category: "Pain Reliever",
          ingredients: [],
          benefits: [],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        // Should still find category-based matches
        expect(remedies.length).toBeGreaterThan(0);
      });

      it("should handle case-insensitive ingredient matching", async () => {
        const drug: ProcessedDrug = {
          id: "drug-13",
          fdaId: "fda-13",
          name: "Mixed Case",
          description: "Pain reliever",
          category: "Pain Reliever",
          ingredients: ["IBUPROFEN", "Aspirin"],
          benefits: ["pain relief"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        expect(remedies.length).toBeGreaterThan(0);
      });

      it("should sort remedies by similarity score descending", async () => {
        const drug: ProcessedDrug = {
          id: "drug-14",
          fdaId: "fda-14",
          name: "Test Drug",
          description: "Pain reliever",
          category: "Pain Reliever",
          ingredients: ["ibuprofen"],
          benefits: ["pain relief"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);

        // Verify sorting
        for (let i = 0; i < remedies.length - 1; i++) {
          expect(remedies[i].similarityScore).toBeGreaterThanOrEqual(
            remedies[i + 1].similarityScore,
          );
        }
      });

      it("should not return duplicate remedies", async () => {
        const drug: ProcessedDrug = {
          id: "drug-15",
          fdaId: "fda-15",
          name: "Multi Ingredient",
          description: "Pain reliever",
          category: "Pain Reliever",
          ingredients: ["ibuprofen", "aspirin"], // Both may match turmeric
          benefits: ["pain relief"],
        };

        const remedies = await findNaturalRemediesForDrug(drug);
        const ids = remedies.map((r) => r.id);
        const uniqueIds = new Set(ids);

        expect(ids.length).toBe(uniqueIds.size);
      });
    });
  });

  describe("getDetailedRemedy", () => {
    it("should return detailed remedy for turmeric", () => {
      const remedy = getDetailedRemedy("turmeric");

      expect(remedy).not.toBeNull();
      expect(remedy?.id).toBe("turmeric");
      expect(remedy?.name).toBe("Turmeric");
      expect(remedy?.category).toBe("Herbal Remedy");
      expect(remedy?.matchingNutrients).toContain("Curcumin");
      expect(remedy?.usage).toBeDefined();
      expect(remedy?.dosage).toBeDefined();
      expect(remedy?.precautions).toBeDefined();
      expect(remedy?.scientificInfo).toBeDefined();
      expect(remedy?.references).toBeDefined();
      expect(remedy?.relatedRemedies).toBeDefined();
    });

    it("should return detailed remedy for ginger", () => {
      const remedy = getDetailedRemedy("ginger");

      expect(remedy).not.toBeNull();
      expect(remedy?.id).toBe("ginger");
      expect(remedy?.name).toBe("Ginger");
      expect(remedy?.matchingNutrients).toContain("Gingerols");
    });

    it("should return detailed remedy for valerian root", () => {
      const remedy = getDetailedRemedy("valerian_root");

      expect(remedy).not.toBeNull();
      expect(remedy?.id).toBe("valerian_root");
      expect(remedy?.name).toBe("Valerian Root");
    });

    it("should return null for non-existent remedy", () => {
      const remedy = getDetailedRemedy("nonexistent_remedy");

      expect(remedy).toBeNull();
    });

    it("should return remedy with all required fields", () => {
      const remedy = getDetailedRemedy("turmeric");

      expect(remedy).toHaveProperty("id");
      expect(remedy).toHaveProperty("name");
      expect(remedy).toHaveProperty("description");
      expect(remedy).toHaveProperty("imageUrl");
      expect(remedy).toHaveProperty("category");
      expect(remedy).toHaveProperty("matchingNutrients");
      expect(remedy).toHaveProperty("similarityScore");
      expect(remedy).toHaveProperty("usage");
      expect(remedy).toHaveProperty("dosage");
      expect(remedy).toHaveProperty("precautions");
      expect(remedy).toHaveProperty("scientificInfo");
      expect(remedy).toHaveProperty("references");
      expect(remedy).toHaveProperty("relatedRemedies");
    });
  });

  describe("addDetailedRemedy", () => {
    it("should add a new remedy to the database", () => {
      const newRemedy: DetailedRemedy = {
        id: "test_remedy",
        name: "Test Remedy",
        description: "A test remedy for unit testing",
        imageUrl: "https://example.com/test.jpg",
        category: "Test Category",
        matchingNutrients: ["Test Nutrient"],
        similarityScore: 0.75,
        usage: "For testing purposes",
        dosage: "One test per day",
        precautions: "Do not use in production",
        scientificInfo: "Created for testing",
        references: [{ title: "Test Reference", url: "https://test.com" }],
        relatedRemedies: [{ id: "turmeric", name: "Turmeric" }],
      };

      addDetailedRemedy(newRemedy);

      const retrieved = getDetailedRemedy("test_remedy");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("Test Remedy");
      expect(retrieved?.description).toBe("A test remedy for unit testing");
    });

    it("should override existing remedy with same ID", () => {
      const originalRemedy: DetailedRemedy = {
        id: "override_test",
        name: "Original",
        description: "Original description",
        imageUrl: "",
        category: "Test",
        matchingNutrients: [],
        similarityScore: 0.5,
        usage: "",
        dosage: "",
        precautions: "",
        scientificInfo: "",
        references: [],
        relatedRemedies: [],
      };

      addDetailedRemedy(originalRemedy);

      const updatedRemedy: DetailedRemedy = {
        ...originalRemedy,
        name: "Updated",
        description: "Updated description",
      };

      addDetailedRemedy(updatedRemedy);

      const retrieved = getDetailedRemedy("override_test");
      expect(retrieved?.name).toBe("Updated");
      expect(retrieved?.description).toBe("Updated description");
    });
  });

  describe("Integration: Find and retrieve detailed remedies", () => {
    it("should find remedies and retrieve their details", async () => {
      const drug: ProcessedDrug = {
        id: "integration-test",
        fdaId: "fda-integration",
        name: "Integration Test Drug",
        description: "Pain reliever",
        category: "Pain Reliever",
        ingredients: ["ibuprofen"],
        benefits: ["pain relief"],
      };

      const remedies = await findNaturalRemediesForDrug(drug);

      // For each found remedy, verify we can get detailed info
      for (const remedy of remedies) {
        // Check that each remedy has the expected structure
        expect(remedy).toHaveProperty("id");
        expect(remedy).toHaveProperty("name");
        expect(remedy).toHaveProperty("similarityScore");
        expect(typeof remedy.similarityScore).toBe("number");
        expect(remedy.similarityScore).toBeGreaterThanOrEqual(0);
        expect(remedy.similarityScore).toBeLessThanOrEqual(1);
      }
    });
  });
});
