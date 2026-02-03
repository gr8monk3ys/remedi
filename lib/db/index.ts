/**
 * Database Module
 *
 * Centralized database operations for the Remedi application.
 * Re-exports all domain-specific operations for convenient access.
 */

// Client
export { prisma, disconnect, isConnected, withTransaction } from "./client";

// Parsers (for internal/advanced use)
export {
  parseJsonArray,
  parseJsonObject,
  parsePharmaceutical,
  parseNaturalRemedy,
  parseRemedyMapping,
  serializeArray,
  isPostgres,
  isSqlite,
} from "./parsers";
export type {
  RawPharmaceutical,
  RawNaturalRemedy,
  RawRemedyMapping,
} from "./parsers";

// Pharmaceutical operations
export {
  searchPharmaceuticals,
  getPharmaceuticalById,
  getPharmaceuticalByFdaId,
  upsertPharmaceutical,
} from "./pharmaceuticals";

// Natural remedy operations
export {
  getNaturalRemedyById,
  searchNaturalRemedies,
  getNaturalRemediesForPharmaceutical,
  toDetailedRemedy,
  createRemedyMapping,
  getAllCategories,
  getAllEvidenceLevels,
} from "./remedies";

// Search history operations
export {
  saveSearchHistory,
  getSearchHistory,
  getPopularSearches,
  clearSearchHistory,
} from "./search-history";

// Favorites operations
export {
  addFavorite,
  getFavorites,
  getFavoriteById,
  isFavorite,
  updateFavorite,
  removeFavorite,
  getCollectionNames,
} from "./favorites";
export type { FavoriteInput, FavoriteOutput } from "./favorites";

// Filter preferences operations
export {
  saveFilterPreferences,
  getFilterPreferences,
  clearFilterPreferences,
} from "./filter-preferences";
export type {
  FilterPreferenceInput,
  FilterPreferenceOutput,
} from "./filter-preferences";
