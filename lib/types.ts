/**
 * Shared TypeScript types and interfaces for Remedi
 */

// ============================================================================
// OpenFDA API Types
// ============================================================================

export interface DrugSearchResult {
  meta: {
    disclaimer: string;
    terms: string;
    license: string;
    last_updated: string;
    results: {
      skip: number;
      limit: number;
      total: number;
    };
  };
  results: FdaDrugResult[];
}

export interface FdaDrugResult {
  openfda: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    route?: string[];
    substance_name?: string[];
    rxcui?: string[];
    spl_id?: string[];
    spl_set_id?: string[];
    package_ndc?: string[];
    ndc?: string[];
    application_number?: string[];
    unii?: string[];
  };
  purpose?: string[];
  indications_and_usage?: string[];
  active_ingredient?: string[];
  inactive_ingredient?: string[];
  warnings?: string[];
  dosage_and_administration?: string[];
  drug_interactions?: string[];
  contraindications?: string[];
  adverse_reactions?: string[];
  id: string;
}

export interface ProcessedDrug {
  id: string;
  fdaId: string;
  name: string;
  description: string;
  category: string;
  ingredients: string[];
  benefits: string[];
  usage?: string;
  warnings?: string;
  interactions?: string;
  similarityScore?: number;
}

// ============================================================================
// Natural Remedy Types
// ============================================================================

export interface NaturalRemedy {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  matchingNutrients: string[];
  similarityScore: number;
}

export interface DetailedRemedy extends NaturalRemedy {
  usage: string;
  dosage: string;
  precautions: string;
  scientificInfo: string;
  references: Reference[];
  relatedRemedies: RelatedRemedy[];
}

export interface Reference {
  title: string;
  url: string;
}

export interface RelatedRemedy {
  id: string;
  name: string;
}

// ============================================================================
// Database Types (matching Prisma schema)
// ============================================================================

export interface Pharmaceutical {
  id: string;
  fdaId: string | null;
  name: string;
  description: string | null;
  category: string;
  ingredients: string; // JSON string
  benefits: string; // JSON string
  usage: string | null;
  warnings: string | null;
  interactions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NaturalRemedyDB {
  id: string;
  name: string;
  description: string | null;
  category: string;
  ingredients: string; // JSON string
  benefits: string; // JSON string
  imageUrl: string | null;
  usage: string | null;
  dosage: string | null;
  precautions: string | null;
  scientificInfo: string | null;
  references: string | null; // JSON string
  relatedRemedies: string | null; // JSON string
  sourceUrl: string | null;
  evidenceLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NaturalRemedyMapping {
  id: string;
  pharmaceuticalId: string;
  naturalRemedyId: string;
  similarityScore: number;
  matchingNutrients: string; // JSON string
  replacementType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface SearchParams {
  query: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  remedies: NaturalRemedy[];
  total: number;
  hasMore: boolean;
}

export interface FilterOptions {
  categories: string[];
  nutrients: string[];
  evidenceLevels: string[];
}

// ============================================================================
// User Favorites Types
// ============================================================================

export interface FavoriteRemedy {
  id: string;
  name: string;
  category: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface FilterProps {
  selectedCategories: string[];
  selectedNutrients: string[];
  onCategoryChange: (categories: string[]) => void;
  onNutrientChange: (nutrients: string[]) => void;
  availableCategories: string[];
  availableNutrients: string[];
}

export interface SearchComponentProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export type ReplacementType = 'Alternative' | 'Complementary' | 'Supportive';
export type EvidenceLevel = 'Strong' | 'Moderate' | 'Limited' | 'Traditional';

// Helper type to convert JSON string fields to their actual types
export type ParsedPharmaceutical = Omit<Pharmaceutical, 'ingredients' | 'benefits'> & {
  ingredients: string[];
  benefits: string[];
};

export type ParsedNaturalRemedy = Omit<
  NaturalRemedyDB,
  'ingredients' | 'benefits' | 'references' | 'relatedRemedies'
> & {
  ingredients: string[];
  benefits: string[];
  references: Reference[];
  relatedRemedies: RelatedRemedy[];
};

export type ParsedRemedyMapping = Omit<NaturalRemedyMapping, 'matchingNutrients'> & {
  matchingNutrients: string[];
};
