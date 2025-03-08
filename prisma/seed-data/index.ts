// Export all seed data
export { vitaminRemedies } from "./remedies-vitamins.ts";
export { mineralRemedies } from "./remedies-minerals.ts";
export { herbalRemedies } from "./remedies-herbs.ts";
export { extendedHerbalRemedies } from "./remedies-herbs-extended.ts";
export { aminoAcidRemedies } from "./remedies-amino-acids.ts";
export { adaptogenRemedies } from "./remedies-adaptogens.ts";
export { probioticRemedies } from "./remedies-probiotics.ts";
export { specialtyRemedies } from "./remedies-specialty.ts";
export { foodRemedies } from "./remedies-foods.ts";
export { additionalRemedies } from "./remedies-additional.ts";
export { tcmRemedies } from "./remedies-tcm.ts";
export { ayurvedicRemedies } from "./remedies-ayurvedic.ts";
export { essentialOilRemedies } from "./remedies-essential-oils.ts";
export { compoundRemedies } from "./remedies-compounds.ts";
export { traditionalRemedies } from "./remedies-traditional.ts";
export { homeopathicRemedies } from "./remedies-homeopathic.ts";
export { pharmaceuticals } from "./pharmaceuticals.ts";
export { remedyMappings } from "./mappings.ts";

// Combine all natural remedies into a single array
import { vitaminRemedies } from "./remedies-vitamins.ts";
import { mineralRemedies } from "./remedies-minerals.ts";
import { herbalRemedies } from "./remedies-herbs.ts";
import { extendedHerbalRemedies } from "./remedies-herbs-extended.ts";
import { aminoAcidRemedies } from "./remedies-amino-acids.ts";
import { adaptogenRemedies } from "./remedies-adaptogens.ts";
import { probioticRemedies } from "./remedies-probiotics.ts";
import { specialtyRemedies } from "./remedies-specialty.ts";
import { foodRemedies } from "./remedies-foods.ts";
import { additionalRemedies } from "./remedies-additional.ts";
import { tcmRemedies } from "./remedies-tcm.ts";
import { ayurvedicRemedies } from "./remedies-ayurvedic.ts";
import { essentialOilRemedies } from "./remedies-essential-oils.ts";
import { compoundRemedies } from "./remedies-compounds.ts";
import { traditionalRemedies } from "./remedies-traditional.ts";
import { homeopathicRemedies } from "./remedies-homeopathic.ts";

export const allNaturalRemedies = [
  ...vitaminRemedies,
  ...mineralRemedies,
  ...herbalRemedies,
  ...extendedHerbalRemedies,
  ...aminoAcidRemedies,
  ...adaptogenRemedies,
  ...probioticRemedies,
  ...specialtyRemedies,
  ...foodRemedies,
  ...additionalRemedies,
  ...tcmRemedies,
  ...ayurvedicRemedies,
  ...essentialOilRemedies,
  ...compoundRemedies,
  ...traditionalRemedies,
  ...homeopathicRemedies,
];

// Type definitions for seed data
export interface NaturalRemedyData {
  name: string;
  description: string;
  category: string;
  ingredients: string; // JSON string
  benefits: string; // JSON string
  usage?: string;
  dosage?: string;
  precautions?: string;
  scientificInfo?: string;
  references?: string; // JSON string
  relatedRemedies?: string; // JSON string
  evidenceLevel?: string;
  imageUrl?: string;
  sourceUrl?: string;
}

export interface PharmaceuticalData {
  fdaId?: string;
  name: string;
  description?: string;
  category: string;
  ingredients: string; // JSON string
  benefits: string; // JSON string
  usage?: string;
  warnings?: string;
  interactions?: string;
}

export interface MappingData {
  pharmaceuticalName: string;
  naturalRemedyName: string;
  similarityScore: number;
  matchingNutrients: string; // JSON string
  replacementType: string;
}
