/**
 * Natural remedy mapping service
 * Maps pharmaceutical ingredients and categories to natural alternatives
 */

import type { ProcessedDrug, NaturalRemedy, DetailedRemedy } from "./types";

// Base ingredients to remedy mappings
const INGREDIENT_MAPPINGS: Record<string, string[]> = {
  // Pain relievers / Anti-inflammatories
  acetaminophen: ["white_willow_bark", "peppermint_oil"],
  ibuprofen: ["turmeric", "ginger", "willow_bark", "boswellia"],
  aspirin: ["white_willow_bark", "meadowsweet", "turmeric"],
  naproxen: ["turmeric", "ginger", "boswellia"],

  // Sleep aids
  melatonin: ["tart_cherry_juice", "chamomile_tea", "valerian_root"],
  diphenhydramine: ["valerian_root", "passionflower", "lemon_balm"],

  // Digestive health
  omeprazole: [
    "aloe_vera",
    "apple_cider_vinegar",
    "deglycyrrhizinated_licorice",
  ],
  esomeprazole: ["aloe_vera", "deglycyrrhizinated_licorice", "slippery_elm"],
  famotidine: ["chamomile_tea", "marshmallow_root", "slippery_elm"],
  loperamide: ["psyllium_husk", "activated_charcoal"],

  // Vitamins & Supplements
  "vitamin d": ["sunlight_exposure", "fatty_fish", "mushrooms"],
  "vitamin c": ["citrus_fruits", "bell_peppers", "kiwi"],
  iron: ["spinach", "lentils", "pumpkin_seeds"],
  "omega 3": ["fatty_fish", "flaxseed", "chia_seeds"],
  calcium: ["dairy_products", "leafy_greens", "almonds"],

  // Allergy medications
  cetirizine: ["quercetin", "stinging_nettle", "butterbur"],
  loratadine: ["butterbur", "quercetin", "stinging_nettle"],
  fexofenadine: ["butterbur", "quercetin", "stinging_nettle"],
};

// Category to remedy mappings (used when specific ingredients don't match)
const CATEGORY_MAPPINGS: Record<string, string[]> = {
  "Pain Reliever": ["turmeric", "ginger", "white_willow_bark"],
  "Sleep Aid": ["valerian_root", "chamomile_tea", "tart_cherry_juice"],
  "Digestive Health": ["ginger", "peppermint_oil", "apple_cider_vinegar"],
  "Vitamin Supplement": ["whole_foods", "nutritional_yeast"],
  "Allergy Medication": ["quercetin", "stinging_nettle", "butterbur"],
  "Cholesterol Medication": ["red_yeast_rice", "garlic", "flaxseed"],
  "Blood Pressure Medication": ["hawthorn", "garlic", "hibiscus_tea"],
  "Diabetes Medication": ["cinnamon", "fenugreek", "bitter_melon"],
  "Mental Health Medication": ["st_johns_wort", "saffron", "sam_e"],
};

// Detailed natural remedy database
const DETAILED_REMEDIES: Record<string, DetailedRemedy> = {
  // Turmeric
  turmeric: {
    id: "turmeric",
    name: "Turmeric",
    description: "Contains curcumin which has anti-inflammatory properties.",
    imageUrl:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop",
    category: "Herbal Remedy",
    matchingNutrients: ["Curcumin"],
    similarityScore: 0.85,
    usage:
      "Turmeric can be used in cooking, taken as a supplement, or made into a paste for topical application.",
    dosage:
      "The recommended dosage is typically 500-2,000 mg of turmeric extract per day.",
    precautions:
      "May interact with blood thinners, diabetes medications, and acid-reducing medications.",
    scientificInfo:
      "The active compound in turmeric, curcumin, inhibits inflammatory enzymes similar to NSAIDs.",
    references: [
      {
        title: "Curcumin: A Review of Its Effects on Human Health",
        url: "https://www.mdpi.com/2072-6643/9/10/1047",
      },
    ],
    relatedRemedies: [
      { id: "ginger", name: "Ginger" },
      { id: "white_willow_bark", name: "White Willow Bark" },
    ],
  },

  // Ginger
  ginger: {
    id: "ginger",
    name: "Ginger",
    description: "Root with anti-inflammatory and digestive properties.",
    imageUrl:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop",
    category: "Herbal Remedy",
    matchingNutrients: ["Gingerols", "Shogaols"],
    similarityScore: 0.8,
    usage:
      "Can be used fresh, dried, powdered, or as an oil or juice. Add to foods, brew as tea, or take as a supplement.",
    dosage:
      "1-2g of ginger powder, 1-2 teaspoons of fresh ginger, or 400-500mg of extract 2-3 times daily.",
    precautions: "May interact with blood thinners and diabetes medications.",
    scientificInfo:
      "Ginger contains compounds called gingerols and shogaols that have anti-inflammatory effects.",
    references: [
      {
        title: "Ginger on Human Health: A Comprehensive Systematic Review",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7019938/",
      },
    ],
    relatedRemedies: [
      { id: "turmeric", name: "Turmeric" },
      { id: "peppermint_oil", name: "Peppermint Oil" },
    ],
  },

  // Valerian Root
  valerian_root: {
    id: "valerian_root",
    name: "Valerian Root",
    description: "Herb used to treat sleep disorders and anxiety.",
    imageUrl:
      "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=400&fit=crop",
    category: "Herbal Remedy",
    matchingNutrients: ["Valerenic acid", "Isovaleric acid"],
    similarityScore: 0.75,
    usage:
      "Typically consumed as a tea, tincture, or in capsule form before bedtime.",
    dosage:
      "300-600mg of valerian root extract or 2-3g of dried root 1-2 hours before bedtime.",
    precautions:
      "May cause drowsiness; avoid driving or operating machinery. Not recommended with alcohol or sedatives.",
    scientificInfo:
      "Valerian may increase GABA levels in the brain, which helps regulate nerve cells and has a calming effect.",
    references: [
      {
        title: "Valerian for Sleep: A Systematic Review and Meta-Analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/17145239/",
      },
    ],
    relatedRemedies: [
      { id: "chamomile_tea", name: "Chamomile Tea" },
      { id: "passionflower", name: "Passionflower" },
    ],
  },
};

/**
 * Find natural remedies for a specific pharmaceutical drug
 * @param drug Pharmaceutical drug data
 * @returns Array of matching natural remedies
 */
export async function findNaturalRemediesForDrug(
  drug: ProcessedDrug,
): Promise<NaturalRemedy[]> {
  const matchedRemedyIds = new Set<string>();

  // First try to match by ingredients
  for (const ingredient of drug.ingredients) {
    const lowerIngredient = ingredient.toLowerCase();

    // Check for exact matches
    for (const [key, remedyIds] of Object.entries(INGREDIENT_MAPPINGS)) {
      if (lowerIngredient.includes(key) || key.includes(lowerIngredient)) {
        remedyIds.forEach((id) => matchedRemedyIds.add(id));
      }
    }
  }

  // If no matches by ingredients, try category matching
  if (matchedRemedyIds.size === 0) {
    const categoryRemedies = CATEGORY_MAPPINGS[drug.category] || [];
    categoryRemedies.forEach((id) => matchedRemedyIds.add(id));

    // If still no matches, use a fallback based on general category
    if (matchedRemedyIds.size === 0) {
      // Match to a more general category if available
      for (const [category, remedyIds] of Object.entries(CATEGORY_MAPPINGS)) {
        if (
          drug.category.includes(category) ||
          category.includes(drug.category)
        ) {
          remedyIds.forEach((id) => matchedRemedyIds.add(id));
        }
      }
    }
  }

  // Get the detailed remedy data for each match
  const remedies: NaturalRemedy[] = [];
  matchedRemedyIds.forEach((id) => {
    if (DETAILED_REMEDIES[id]) {
      // Calculate a similarity score based on match type
      const baseRemedy = { ...DETAILED_REMEDIES[id] };
      remedies.push(baseRemedy);
    }
  });

  // Calculate similarity scores
  // Sort by similarity score (highest first)
  return remedies.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Get detailed information about a specific natural remedy
 * @param id Remedy ID
 * @returns Detailed remedy information
 */
export function getDetailedRemedy(id: string): DetailedRemedy | null {
  return DETAILED_REMEDIES[id] || null;
}

/**
 * Add a new natural remedy to the database
 * @param remedy Detailed remedy data
 */
export function addDetailedRemedy(remedy: DetailedRemedy): void {
  DETAILED_REMEDIES[remedy.id] = remedy;
}
