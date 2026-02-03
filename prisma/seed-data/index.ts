// Export all seed data
export { vitaminRemedies } from './remedies-vitamins'
export { mineralRemedies } from './remedies-minerals'
export { herbalRemedies } from './remedies-herbs'
export { extendedHerbalRemedies } from './remedies-herbs-extended'
export { aminoAcidRemedies } from './remedies-amino-acids'
export { adaptogenRemedies } from './remedies-adaptogens'
export { probioticRemedies } from './remedies-probiotics'
export { specialtyRemedies } from './remedies-specialty'
export { foodRemedies } from './remedies-foods'
export { additionalRemedies } from './remedies-additional'
export { tcmRemedies } from './remedies-tcm'
export { ayurvedicRemedies } from './remedies-ayurvedic'
export { essentialOilRemedies } from './remedies-essential-oils'
export { compoundRemedies } from './remedies-compounds'
export { traditionalRemedies } from './remedies-traditional'
export { homeopathicRemedies } from './remedies-homeopathic'
export { pharmaceuticals } from './pharmaceuticals'
export { remedyMappings } from './mappings'

// Combine all natural remedies into a single array
import { vitaminRemedies } from './remedies-vitamins'
import { mineralRemedies } from './remedies-minerals'
import { herbalRemedies } from './remedies-herbs'
import { extendedHerbalRemedies } from './remedies-herbs-extended'
import { aminoAcidRemedies } from './remedies-amino-acids'
import { adaptogenRemedies } from './remedies-adaptogens'
import { probioticRemedies } from './remedies-probiotics'
import { specialtyRemedies } from './remedies-specialty'
import { foodRemedies } from './remedies-foods'
import { additionalRemedies } from './remedies-additional'
import { tcmRemedies } from './remedies-tcm'
import { ayurvedicRemedies } from './remedies-ayurvedic'
import { essentialOilRemedies } from './remedies-essential-oils'
import { compoundRemedies } from './remedies-compounds'
import { traditionalRemedies } from './remedies-traditional'
import { homeopathicRemedies } from './remedies-homeopathic'

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
  ...homeopathicRemedies
]

// Type definitions for seed data
export interface NaturalRemedyData {
  name: string
  description: string
  category: string
  ingredients: string // JSON string
  benefits: string // JSON string
  usage?: string
  dosage?: string
  precautions?: string
  scientificInfo?: string
  references?: string // JSON string
  relatedRemedies?: string // JSON string
  evidenceLevel?: string
  imageUrl?: string
  sourceUrl?: string
}

export interface PharmaceuticalData {
  fdaId?: string
  name: string
  description?: string
  category: string
  ingredients: string // JSON string
  benefits: string // JSON string
  usage?: string
  warnings?: string
  interactions?: string
}

export interface MappingData {
  pharmaceuticalName: string
  naturalRemedyName: string
  similarityScore: number
  matchingNutrients: string // JSON string
  replacementType: string
}
