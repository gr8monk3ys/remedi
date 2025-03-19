/**
 * OpenFDA API integration service
 * Provides utilities for fetching drug data from the OpenFDA API
 */

const FDA_BASE_URL = 'https://api.fda.gov';

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

/**
 * Search for drugs in the FDA database
 * @param query Search term
 * @param limit Number of results to return
 * @returns Processed drug results
 */
export async function searchFdaDrugs(query: string, limit = 5): Promise<ProcessedDrug[]> {
  try {
    const searchQuery = encodeURIComponent(query);
    const endpoint = `/drug/label.json?search=${searchQuery}&limit=${limit}`;
    
    const response = await fetch(`${FDA_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No results found for "${query}"`);
        return [];
      }
      throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
    }
    
    const data: DrugSearchResult = await response.json();
    
    // Process the FDA API results into our application format
    return processFdaResults(data.results);
  } catch (error) {
    console.error('Error searching FDA drugs:', error);
    return [];
  }
}

/**
 * Get detailed information about a specific drug by FDA ID
 * @param fdaId FDA ID of the drug
 * @returns Detailed drug information
 */
export async function getFdaDrugById(fdaId: string): Promise<ProcessedDrug | null> {
  try {
    const endpoint = `/drug/label.json?search=id:${fdaId}`;
    
    const response = await fetch(`${FDA_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Drug with ID "${fdaId}" not found`);
        return null;
      }
      throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
    }
    
    const data: DrugSearchResult = await response.json();
    
    if (data.results.length === 0) {
      return null;
    }
    
    // Process the FDA API result into our application format
    const processedDrugs = processFdaResults(data.results);
    return processedDrugs[0] || null;
  } catch (error) {
    console.error('Error fetching FDA drug by ID:', error);
    return null;
  }
}

/**
 * Convert FDA API results into our application format
 * @param results FDA API results
 * @returns Processed drug results
 */
function processFdaResults(results: FdaDrugResult[]): ProcessedDrug[] {
  return results.map(result => {
    // Extract the brand name or generic name
    const brandName = result.openfda?.brand_name?.[0] || '';
    const genericName = result.openfda?.generic_name?.[0] || '';
    const name = brandName || genericName || 'Unknown Drug';
    
    // Extract category from product type or make an educated guess
    const category = result.openfda?.product_type?.[0] || 
                    determineCategory(result);
    
    // Extract active ingredients
    const activeIngredients = result.active_ingredient || 
                             result.openfda?.substance_name || 
                             [];
    
    // Extract indications/purpose for benefits
    const indications = result.indications_and_usage || result.purpose || [];
    
    // Create a description from indications
    const description = indications[0] || 'No description available';
    
    return {
      id: generateInternalId(result.id),
      fdaId: result.id,
      name,
      description: truncateText(description, 200),
      category,
      ingredients: activeIngredients,
      benefits: indications.map(indication => truncateText(indication, 100)),
      usage: result.dosage_and_administration?.[0],
      warnings: result.warnings?.[0],
      interactions: result.drug_interactions?.[0]
    };
  });
}

/**
 * Generate a consistent internal ID from the FDA ID
 * @param fdaId FDA ID
 * @returns Internal ID
 */
function generateInternalId(fdaId: string): string {
  // Create a hash of the FDA ID to get a consistent internal ID
  let hash = 0;
  for (let i = 0; i < fdaId.length; i++) {
    const char = fdaId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive number and then to string
  return Math.abs(hash).toString();
}

/**
 * Determine the category of a drug based on its properties
 * @param drug FDA drug result
 * @returns Category string
 */
function determineCategory(drug: FdaDrugResult): string {
  // If openfda is missing, return a default category
  if (!drug.openfda) return 'Medication';
  
  // Check the route of administration
  const route = drug.openfda.route?.[0]?.toLowerCase();
  if (route) {
    if (route.includes('oral')) return 'Oral Medication';
    if (route.includes('topical')) return 'Topical Treatment';
    if (route.includes('injection')) return 'Injectable';
    if (route.includes('ophthalmic')) return 'Eye Treatment';
    if (route.includes('otic')) return 'Ear Treatment';
    if (route.includes('nasal')) return 'Nasal Treatment';
    if (route.includes('rectal')) return 'Rectal Treatment';
    if (route.includes('vaginal')) return 'Vaginal Treatment';
  }
  
  // Check the indications or purpose for common categories
  const indications = drug.indications_and_usage?.[0]?.toLowerCase() || 
                     drug.purpose?.[0]?.toLowerCase() || '';
  
  if (indications.includes('pain') || indications.includes('ache')) return 'Pain Reliever';
  if (indications.includes('allerg')) return 'Allergy Medication';
  if (indications.includes('acid') || indications.includes('reflux') || 
      indications.includes('stomach') || indications.includes('digest')) return 'Digestive Health';
  if (indications.includes('sleep') || indications.includes('insomnia')) return 'Sleep Aid';
  if (indications.includes('vitamin') || indications.includes('supplement')) return 'Supplement';
  if (indications.includes('antibiotic') || indications.includes('infection')) return 'Antibiotic';
  if (indications.includes('blood pressure') || indications.includes('hypertension')) return 'Blood Pressure Medication';
  if (indications.includes('cholesterol')) return 'Cholesterol Medication';
  if (indications.includes('diabetes')) return 'Diabetes Medication';
  if (indications.includes('depression') || indications.includes('anxiety')) return 'Mental Health Medication';
  
  // Default category
  return 'Medication';
}

/**
 * Truncate text to a certain length and add ellipsis if needed
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
