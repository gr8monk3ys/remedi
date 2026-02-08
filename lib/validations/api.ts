/**
 * API Input Validation Schemas
 *
 * This module provides Zod schemas for validating API inputs.
 * All API routes should validate inputs using these schemas.
 */

import { z } from "zod";

/**
 * Search query validation schema
 * Enforces reasonable query length and prevents injection attempts
 */
export const searchQuerySchema = z.object({
  query: z
    .string({ message: "Query must be a string" })
    .min(1, { message: "Query cannot be empty" })
    .max(100, { message: "Query is too long (maximum 100 characters)" })
    .trim()
    .refine((s) => !/<|>|script|javascript:/i.test(s), {
      message: "Query contains invalid characters",
    }),
});

/**
 * Remedy ID validation schema
 * Accepts UUID format or slug format (lowercase letters, numbers, hyphens)
 */
export const remedyIdSchema = z
  .string({ message: "Remedy ID must be a string" })
  .refine(
    (id) => {
      // UUID format or slug format (lowercase alphanumeric with hyphens)
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const slugPattern = /^[a-z0-9_-]+$/;
      return uuidPattern.test(id) || slugPattern.test(id);
    },
    { message: "Invalid remedy ID format" },
  );

/**
 * Pagination parameters validation schema
 */
export const paginationSchema = z.object({
  page: z
    .number({ message: "Page must be a number" })
    .int({ message: "Page must be an integer" })
    .positive({ message: "Page must be positive" })
    .min(1, { message: "Page must be at least 1" })
    .max(1000, { message: "Page number is too large" })
    .default(1),
  pageSize: z
    .number({ message: "Page size must be a number" })
    .int({ message: "Page size must be an integer" })
    .positive({ message: "Page size must be positive" })
    .min(1, { message: "Page size must be at least 1" })
    .max(100, { message: "Page size cannot exceed 100" })
    .default(10),
});

/**
 * Filter validation schema for search
 */
export const searchFiltersSchema = z.object({
  categories: z
    .array(z.string())
    .optional()
    .transform((val) => val?.filter((c) => c.length > 0)),
  evidenceLevel: z
    .enum(["Strong", "Moderate", "Limited", "All"])
    .optional()
    .default("All"),
  minSimilarity: z
    .number()
    .min(0, { message: "Similarity must be between 0 and 1" })
    .max(1, { message: "Similarity must be between 0 and 1" })
    .optional()
    .default(0.6),
});

/**
 * Combined search request schema
 */
export const searchRequestSchema = searchQuerySchema
  .merge(paginationSchema.partial())
  .merge(searchFiltersSchema.partial());

/**
 * Remedy detail request schema
 */
export const remedyDetailRequestSchema = z.object({
  id: remedyIdSchema,
  includeRelated: z.boolean().optional().default(true),
});

/**
 * Helper function to validate and parse query parameters from URL
 *
 * @param searchParams - URLSearchParams or similar object
 * @param schema - Zod schema to validate against
 * @returns Validated data or null if validation fails
 *
 * @example
 * ```typescript
 * const params = validateQueryParams(request.nextUrl.searchParams, searchQuerySchema);
 * if (!params) {
 *   return NextResponse.json(errorResponse('INVALID_INPUT', 'Invalid query'));
 * }
 * ```
 */
export function validateQueryParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T,
): z.infer<T> | null {
  try {
    const params: Record<string, string | string[]> = {};

    // Convert URLSearchParams to object
    searchParams.forEach((value, key) => {
      if (params[key]) {
        // Multiple values for same key
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });

    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
    }
    return null;
  }
}

/**
 * Helper function to get validation error message from Zod error
 *
 * @param error - Zod error object
 * @returns Human-readable error message
 */
export function getValidationErrorMessage(error: z.ZodError): string {
  const firstError = error.issues[0];
  if (!firstError) {
    return "Validation failed";
  }

  const field = firstError.path.join(".");
  return field ? `${field}: ${firstError.message}` : firstError.message;
}

/**
 * Session ID validation schema
 * UUID format for session identifiers
 */
export const sessionIdSchema = z
  .string({ message: "Session ID must be a string" })
  .uuid({ message: "Invalid session ID format" });

/**
 * Search history validation schema
 */
export const saveSearchHistorySchema = z.object({
  query: z
    .string({ message: "Query must be a string" })
    .min(1, { message: "Query cannot be empty" })
    .max(100, { message: "Query is too long" }),
  resultsCount: z
    .number({ message: "Results count must be a number" })
    .int({ message: "Results count must be an integer" })
    .min(0, { message: "Results count cannot be negative" }),
  sessionId: sessionIdSchema.optional(),
  userId: z.string().optional(),
});

export const getSearchHistorySchema = z.object({
  sessionId: sessionIdSchema.optional(),
  userId: z.string().optional(),
  limit: z
    .number({ message: "Limit must be a number" })
    .int({ message: "Limit must be an integer" })
    .positive({ message: "Limit must be positive" })
    .max(100, { message: "Limit cannot exceed 100" })
    .optional()
    .default(10),
});

/**
 * Favorite validation schemas
 */
export const addFavoriteSchema = z.object({
  remedyId: remedyIdSchema,
  remedyName: z
    .string({ message: "Remedy name must be a string" })
    .min(1, { message: "Remedy name cannot be empty" })
    .max(200, { message: "Remedy name is too long" }),
  sessionId: sessionIdSchema.optional(),
  userId: z.string().optional(),
  notes: z
    .string()
    .max(1000, { message: "Notes cannot exceed 1000 characters" })
    .optional(),
  collectionName: z
    .string()
    .max(100, { message: "Collection name cannot exceed 100 characters" })
    .optional(),
});

export const updateFavoriteSchema = z.object({
  id: z.string().uuid({ message: "Invalid favorite ID format" }),
  notes: z
    .string()
    .max(1000, { message: "Notes cannot exceed 1000 characters" })
    .optional(),
  collectionName: z
    .string()
    .max(100, { message: "Collection name cannot exceed 100 characters" })
    .optional(),
});

export const getFavoritesSchema = z.object({
  sessionId: sessionIdSchema.optional(),
  userId: z.string().optional(),
  collectionName: z.string().optional(),
});

export const deleteFavoriteSchema = z.object({
  id: z.string().uuid({ message: "Invalid favorite ID format" }),
});

/**
 * Filter preferences validation schema
 */
export const saveFilterPreferencesSchema = z.object({
  sessionId: sessionIdSchema.optional(),
  userId: z.string().optional(),
  categories: z
    .array(z.string())
    .max(50, { message: "Too many categories selected" })
    .optional(),
  nutrients: z
    .array(z.string())
    .max(50, { message: "Too many nutrients selected" })
    .optional(),
  evidenceLevels: z
    .array(z.enum(["Strong", "Moderate", "Limited", "Traditional"]))
    .max(4, { message: "Invalid evidence levels" })
    .optional(),
  sortBy: z
    .enum(["similarity", "name", "category", "evidenceLevel"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const getFilterPreferencesSchema = z.object({
  sessionId: sessionIdSchema.optional(),
  userId: z.string().optional(),
});

/**
 * Drug interaction validation schemas
 */

/** Schema for substance name validation */
const substanceNameSchema = z
  .string({ message: "Substance name must be a string" })
  .min(1, { message: "Substance name cannot be empty" })
  .max(200, { message: "Substance name is too long (maximum 200 characters)" })
  .trim()
  .refine((s) => !/<|>|script|javascript:/i.test(s), {
    message: "Substance name contains invalid characters",
  });

/** GET /api/interactions?substance=<name> - Find all interactions for a substance */
export const interactionsBySubstanceSchema = z.object({
  substance: substanceNameSchema,
});

/** GET /api/interactions?check=substance1,substance2 - Check two specific substances */
export const interactionsCheckPairSchema = z.object({
  check: z
    .string({ message: "Check parameter must be a string" })
    .min(3, {
      message:
        "Check parameter requires two substance names separated by a comma",
    })
    .max(500, { message: "Check parameter is too long" })
    .refine((s) => s.includes(","), {
      message:
        "Check parameter must contain two substance names separated by a comma",
    })
    .refine(
      (s) => {
        const parts = s
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean);
        return parts.length === 2;
      },
      { message: "Check parameter must contain exactly two substance names" },
    ),
});

/** POST /api/interactions/check - Check pairwise interactions for multiple substances */
export const interactionsCheckMultipleSchema = z.object({
  substances: z
    .array(substanceNameSchema)
    .min(2, {
      message: "At least two substances are required for interaction checking",
    })
    .max(20, { message: "Cannot check more than 20 substances at once" }),
});

/**
 * Type exports for use in API routes
 */
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type RemedyId = z.infer<typeof remedyIdSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type RemedyDetailRequest = z.infer<typeof remedyDetailRequestSchema>;
export type SaveSearchHistory = z.infer<typeof saveSearchHistorySchema>;
export type GetSearchHistory = z.infer<typeof getSearchHistorySchema>;
export type AddFavorite = z.infer<typeof addFavoriteSchema>;
export type UpdateFavorite = z.infer<typeof updateFavoriteSchema>;
export type GetFavorites = z.infer<typeof getFavoritesSchema>;
export type DeleteFavorite = z.infer<typeof deleteFavoriteSchema>;
export type SaveFilterPreferences = z.infer<typeof saveFilterPreferencesSchema>;
export type GetFilterPreferences = z.infer<typeof getFilterPreferencesSchema>;
export type InteractionsBySubstance = z.infer<
  typeof interactionsBySubstanceSchema
>;
export type InteractionsCheckPair = z.infer<typeof interactionsCheckPairSchema>;
export type InteractionsCheckMultiple = z.infer<
  typeof interactionsCheckMultipleSchema
>;
