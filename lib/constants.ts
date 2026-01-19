/**
 * Application Constants
 *
 * Centralized location for all application constants, magic numbers,
 * and configuration values used throughout the application.
 */

/**
 * Search Configuration
 */
export const SEARCH_CONFIG = {
  /** Maximum length for search queries */
  MAX_QUERY_LENGTH: 100,
  /** Minimum length for search queries */
  MIN_QUERY_LENGTH: 1,
  /** Default number of search results to return */
  DEFAULT_RESULT_LIMIT: 5,
  /** Minimum similarity score for fuzzy search matching */
  MIN_SIMILARITY_SCORE: 0.6,
  /** Maximum results to show per page */
  MAX_RESULTS_PER_PAGE: 20,
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION_CONFIG = {
  /** Default items per page */
  DEFAULT_PAGE_SIZE: 10,
  /** Maximum items per page */
  MAX_PAGE_SIZE: 100,
  /** Default page number */
  DEFAULT_PAGE: 1,
  /** Maximum page number */
  MAX_PAGE: 1000,
} as const;

/**
 * OpenFDA API Configuration
 */
export const OPENFDA_CONFIG = {
  /** Base URL for OpenFDA API */
  BASE_URL: 'https://api.fda.gov',
  /** Drug label endpoint */
  DRUG_LABEL_ENDPOINT: '/drug/label.json',
  /** Maximum retries for API requests */
  MAX_RETRIES: 3,
  /** Delay between retries (ms) */
  RETRY_DELAY_MS: 1000,
  /** Rate limit delay (ms) - wait time after 429 response */
  RATE_LIMIT_DELAY_MS: 60000,
  /** Request timeout (ms) */
  REQUEST_TIMEOUT_MS: 10000,
} as const;

/**
 * Database Query Limits
 */
export const DB_LIMITS = {
  /** Default limit for pharmaceutical searches */
  PHARMACEUTICAL_SEARCH_LIMIT: 10,
  /** Default limit for natural remedy searches */
  NATURAL_REMEDY_SEARCH_LIMIT: 20,
  /** Maximum remedy mappings to return */
  MAX_REMEDY_MAPPINGS: 100,
} as const;

/**
 * Common suffixes to remove from search queries
 * These are normalized during query processing
 */
export const COMMON_SUFFIXES = [
  'supplement',
  'pill',
  'tablet',
  'capsule',
  'medication',
  'medicine',
  'drug',
  'dose',
] as const;

/**
 * Spelling variants mapping
 * Maps standard spellings to common misspellings for better search
 */
export const SPELLING_VARIANTS: Record<string, readonly string[]> = {
  ibuprofen: ['ibuprofin', 'ibuprophen', 'ibuprofen'],
  acetaminophen: [
    'acetaminophen',
    'acetaminofin',
    'acetaminophine',
    'tylenol',
  ],
  tylenol: ['tylanol', 'tylenol', 'tilenol'],
  vitamin: ['vitamine', 'vitamin', 'vitamins'],
  melatonin: ['melatonine', 'melatonin', 'melatonen'],
  aspirin: ['asprin', 'aspirin', 'aspirine'],
  diphenhydramine: [
    'diphenhydramine',
    'diphenhydramin',
    'diphenhydramine',
    'benadryl',
  ],
  omeprazole: ['omeprazole', 'omeprazol', 'omeprezole'],
  calcium: ['calcium', 'calcium carbonate', 'calcum'],
} as const;

/**
 * Evidence levels for natural remedies
 */
export const EVIDENCE_LEVELS = {
  STRONG: 'Strong',
  MODERATE: 'Moderate',
  LIMITED: 'Limited',
  UNKNOWN: 'Unknown',
} as const;

export type EvidenceLevel =
  (typeof EVIDENCE_LEVELS)[keyof typeof EVIDENCE_LEVELS];

/**
 * Remedy categories
 */
export const REMEDY_CATEGORIES = {
  FOOD: 'Food',
  HERBAL_REMEDY: 'Herbal Remedy',
  SPICE: 'Spice',
  ROOT: 'Root',
  HERBAL_TEA: 'Herbal Tea',
  JUICE: 'Juice',
  NATURAL_SOURCE: 'Natural Source',
  SUPPLEMENT: 'Supplement',
  MINERAL: 'Mineral',
  VITAMIN: 'Vitamin',
} as const;

export type RemedyCategory =
  (typeof REMEDY_CATEGORIES)[keyof typeof REMEDY_CATEGORIES];

/**
 * Pharmaceutical categories
 */
export const PHARMACEUTICAL_CATEGORIES = {
  PAIN_RELIEVER: 'Pain Reliever',
  SLEEP_AID: 'Sleep Aid',
  DIGESTIVE_HEALTH: 'Digestive Health',
  ALLERGY_MEDICATION: 'Allergy Medication',
  VITAMIN_SUPPLEMENT: 'Vitamin Supplement',
  MINERAL_SUPPLEMENT: 'Mineral Supplement',
  NUTRITIONAL_SUPPLEMENT: 'Nutritional Supplement',
  ANTI_INFLAMMATORY: 'Anti-Inflammatory',
  ANTIBIOTIC: 'Antibiotic',
  ANTACID: 'Antacid',
} as const;

export type PharmaceuticalCategory =
  (typeof PHARMACEUTICAL_CATEGORIES)[keyof typeof PHARMACEUTICAL_CATEGORIES];

/**
 * Replacement types for remedy mappings
 */
export const REPLACEMENT_TYPES = {
  ALTERNATIVE: 'Alternative',
  COMPLEMENTARY: 'Complementary',
  SUPPLEMENT: 'Supplement',
} as const;

export type ReplacementType =
  (typeof REPLACEMENT_TYPES)[keyof typeof REPLACEMENT_TYPES];

/**
 * HTTP Cache Configuration
 */
export const CACHE_CONFIG = {
  /** Cache control header for search results (seconds) */
  SEARCH_RESULTS_TTL: 3600, // 1 hour
  /** Cache control header for remedy details (seconds) */
  REMEDY_DETAILS_TTL: 7200, // 2 hours
  /** Cache control header for static content (seconds) */
  STATIC_CONTENT_TTL: 86400, // 24 hours
} as const;

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  /** Maximum requests per window */
  MAX_REQUESTS: 30,
  /** Time window in seconds */
  WINDOW_SECONDS: 60,
  /** Identifier for anonymous users */
  ANONYMOUS_IDENTIFIER: 'anonymous',
} as const;

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  /** Maximum request body size (bytes) */
  MAX_REQUEST_SIZE: 1048576, // 1MB
  /** Blocked user agents (bots, scrapers) */
  BLOCKED_USER_AGENTS: [
    'bot',
    'crawler',
    'spider',
    'scraper',
  ] as const,
  /** Allowed image domains for Next.js Image component */
  ALLOWED_IMAGE_DOMAINS: [
    'images.unsplash.com',
    'via.placeholder.com',
  ] as const,
} as const;

/**
 * Application Metadata
 */
export const APP_METADATA = {
  NAME: 'Remedi',
  VERSION: '0.1.0',
  API_VERSION: 'v1',
  DESCRIPTION:
    'Find natural alternatives to pharmaceutical drugs and supplements',
  AUTHOR: 'Remedi Team',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // Client errors
  QUERY_REQUIRED: 'Search query is required',
  QUERY_TOO_SHORT: 'Search query is too short',
  QUERY_TOO_LONG: 'Search query is too long (maximum 100 characters)',
  INVALID_QUERY: 'Search query contains invalid characters',
  REMEDY_NOT_FOUND: 'Remedy not found',
  INVALID_REMEDY_ID: 'Invalid remedy ID format',
  INVALID_PAGE: 'Invalid page number',
  INVALID_PAGE_SIZE: 'Invalid page size',
  // Server errors
  DATABASE_ERROR: 'Database error occurred',
  FDA_API_ERROR: 'Error fetching data from FDA API',
  INTERNAL_ERROR: 'Internal server error occurred',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  SEARCH_COMPLETE: 'Search completed successfully',
  REMEDY_FOUND: 'Remedy details retrieved successfully',
  DATA_UPDATED: 'Data updated successfully',
} as const;

/**
 * Unsplash Image Configuration
 * Used for placeholder images when no specific image is available
 */
export const UNSPLASH_CONFIG = {
  BASE_URL: 'https://images.unsplash.com',
  /** Default image dimensions */
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  /** Quality setting (0-100) */
  DEFAULT_QUALITY: 80,
} as const;

/**
 * Local Storage Keys
 * Centralized keys for localStorage to avoid conflicts
 */
export const STORAGE_KEYS = {
  SEARCH_HISTORY: 'remedi_search_history',
  FAVORITES: 'remedi_favorites',
  THEME: 'remedi_theme',
  USER_PREFERENCES: 'remedi_user_preferences',
} as const;

/**
 * Feature Flags
 * Toggle features on/off for development or testing
 */
export const FEATURE_FLAGS = {
  ENABLE_FDA_API: true,
  ENABLE_CACHING: true,
  ENABLE_RATE_LIMITING: true, // Requires Upstash Redis configuration
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_TRACKING: false,
  ENABLE_DARK_MODE: true,
  ENABLE_FAVORITES: true,
  ENABLE_SEARCH_HISTORY: true,
} as const;
