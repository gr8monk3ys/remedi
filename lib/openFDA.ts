/**
 * OpenFDA API integration service
 * Provides utilities for fetching drug data from the OpenFDA API
 *
 * Rate Limits:
 * - Without API key: 240 requests per minute, 120,000 per day
 * - With API key: 240 requests per minute, 120,000 per day (higher limits available)
 */

import type { DrugSearchResult, FdaDrugResult, ProcessedDrug } from "./types";
import { createLogger } from "@/lib/logger";
import { CircuitBreaker, CircuitBreakerOpenError } from "@/lib/circuit-breaker";

const logger = createLogger("openfda");

const fdaCircuitBreaker = new CircuitBreaker({
  name: "openfda",
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
});

const FDA_BASE_URL = "https://api.fda.gov";
const FDA_API_KEY = process.env.OPENFDA_API_KEY;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second
const RATE_LIMIT_DELAY_MS = 5000; // 5 seconds

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch from FDA API with retry logic and rate limit handling
 * @param url Full URL to fetch
 * @param retries Number of retries remaining
 * @returns Response object
 */
async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES,
): Promise<Response> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    // Handle rate limiting (429 Too Many Requests)
    if (response.status === 429) {
      logger.warn("FDA API rate limit reached, waiting before retry");
      if (retries > 0) {
        await sleep(RATE_LIMIT_DELAY_MS);
        return fetchWithRetry(url, retries - 1);
      }
      throw new Error("FDA API rate limit exceeded. Please try again later.");
    }

    // Handle server errors (5xx) with retry
    if (response.status >= 500 && retries > 0) {
      logger.warn("FDA API server error, retrying", {
        status: response.status,
        retryDelayMs: RETRY_DELAY_MS,
      });
      await sleep(RETRY_DELAY_MS);
      return fetchWithRetry(url, retries - 1);
    }

    return response;
  } catch (error) {
    // Handle network errors with retry
    if (retries > 0) {
      logger.warn("Network error fetching from FDA API, retrying", {
        retryDelayMs: RETRY_DELAY_MS,
      });
      await sleep(RETRY_DELAY_MS);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

/**
 * Build FDA API URL with optional API key
 * @param endpoint API endpoint
 * @returns Full URL with API key if available
 */
function buildFdaUrl(endpoint: string): string {
  const url = new URL(endpoint, FDA_BASE_URL);
  if (FDA_API_KEY) {
    url.searchParams.set("api_key", FDA_API_KEY);
  }
  return url.toString();
}

/**
 * Build a fielded, quoted openFDA search expression.
 *
 * openFDA treats space-separated clauses as OR, so each field gets the full
 * quoted phrase. Quoting keeps a multi-word drug name together instead of
 * matching any label containing any one of its words.
 */
function buildFdaSearchPhrase(query: string): string {
  // Double quotes and backslashes would break out of the quoted phrase.
  const sanitized = query.replace(/["\\]/g, " ").trim();
  const quoted = `"${sanitized}"`;

  const clauses = [
    `openfda.brand_name:${quoted}`,
    `openfda.generic_name:${quoted}`,
    `openfda.substance_name:${quoted}`,
  ];

  return encodeURIComponent(clauses.join("+"));
}

/** Normalise for comparison: lowercase, strip punctuation, collapse spaces. */
function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Check that a returned drug plausibly *is* what was searched for, rather than
 * a label that merely mentions the term somewhere.
 */
function matchesQuery(drug: ProcessedDrug, query: string): boolean {
  const normalizedQuery = normalizeForMatch(query);
  if (!normalizedQuery) {
    return false;
  }

  const haystacks = [drug.name, ...(drug.ingredients ?? [])]
    .filter(Boolean)
    .map(normalizeForMatch);

  // Accept when the name/ingredient contains the query or vice versa (covers
  // "ibuprofen" vs "Ibuprofen 200mg" and "advil" vs "Advil").
  if (
    haystacks.some(
      (value) =>
        value.includes(normalizedQuery) || normalizedQuery.includes(value),
    )
  ) {
    return true;
  }

  // Otherwise require every query token to appear, so "extra strength" alone
  // cannot pull in an unrelated product.
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  return haystacks.some((value) => {
    const valueTokens = new Set(value.split(" ").filter(Boolean));
    return tokens.every((token) => valueTokens.has(token));
  });
}

/**
 * Search for drugs in the FDA database with retry logic and error handling
 * @param query Search term
 * @param limit Number of results to return
 * @returns Processed drug results
 */
export async function searchFdaDrugs(
  query: string,
  limit = 5,
): Promise<ProcessedDrug[]> {
  try {
    return await fdaCircuitBreaker.call(async () => {
      // Search the drug-name fields specifically, with the term quoted as a
      // phrase. An unqualified search matches every label field (warnings,
      // interactions, inactive ingredients), and multi-word terms are OR'd, so
      // "tylenol extra strength" could return an unrelated product whose label
      // merely mentions "strength" — which then gets cached as the answer.
      const phrase = buildFdaSearchPhrase(query);
      const endpoint = `/drug/label.json?search=${phrase}&limit=${limit}`;
      const url = buildFdaUrl(endpoint);

      const response = await fetchWithRetry(url);

      if (!response.ok) {
        if (response.status === 404) {
          logger.debug("No results found", { query });
          return [];
        }
        throw new Error(
          `FDA API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: DrugSearchResult = await response.json();

      const processed = processFdaResults(data.results);

      // Even a fielded search can return a near miss, so keep only results
      // whose name actually corresponds to what was searched for.
      const relevant = processed.filter((drug) => matchesQuery(drug, query));

      if (relevant.length === 0 && processed.length > 0) {
        logger.debug("Discarded FDA results that did not match the query", {
          query,
          discarded: processed.length,
        });
      }

      return relevant;
    });
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      logger.warn("OpenFDA circuit breaker is open, falling back to mock data");
    } else {
      logger.error("Error searching FDA drugs", error);
    }
    // Return empty array instead of throwing to allow fallback to mock data
    return [];
  }
}

/**
 * Get detailed information about a specific drug by FDA ID with retry logic
 * @param fdaId FDA ID of the drug
 * @returns Detailed drug information
 */
export async function getFdaDrugById(
  fdaId: string,
): Promise<ProcessedDrug | null> {
  try {
    return await fdaCircuitBreaker.call(async () => {
      const endpoint = `/drug/label.json?search=id:${fdaId}`;
      const url = buildFdaUrl(endpoint);

      const response = await fetchWithRetry(url);

      if (!response.ok) {
        if (response.status === 404) {
          logger.debug("Drug not found by ID", { fdaId });
          return null;
        }
        throw new Error(
          `FDA API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: DrugSearchResult = await response.json();

      if (data.results.length === 0) {
        return null;
      }

      // Process the FDA API result into our application format
      const processedDrugs = processFdaResults(data.results);
      return processedDrugs[0] || null;
    });
  } catch (error) {
    if (error instanceof CircuitBreakerOpenError) {
      logger.warn(
        "OpenFDA circuit breaker is open, skipping drug lookup by ID",
      );
    } else {
      logger.error("Error fetching FDA drug by ID", error);
    }
    return null;
  }
}

/**
 * Convert FDA API results into our application format
 * @param results FDA API results
 * @returns Processed drug results
 */
function processFdaResults(results: FdaDrugResult[]): ProcessedDrug[] {
  return results.map((result) => {
    // A label is brand-first: "COUMADIN", not "Warfarin". The generic name is
    // the one the safety policy recognises, so it is carried alongside the
    // display name rather than discarded once a brand exists.
    const brandName = result.openfda?.brand_name?.[0] || "";
    const genericName = result.openfda?.generic_name?.[0] || "";
    const name = brandName || genericName || "Unknown Drug";

    // Extract category from product type or make an educated guess
    const category =
      result.openfda?.product_type?.[0] || determineCategory(result);

    // Extract active ingredients
    const activeIngredients =
      result.active_ingredient || result.openfda?.substance_name || [];

    // Extract indications/purpose for benefits
    const indications = result.indications_and_usage || result.purpose || [];

    // Create a description from indications
    const description = indications[0] || "No description available";

    return {
      id: generateInternalId(result.id),
      fdaId: result.id,
      name,
      genericName: genericName || undefined,
      rxcui: result.openfda?.rxcui ?? [],
      unii: result.openfda?.unii ?? [],
      description: truncateText(description, 200),
      category,
      ingredients: activeIngredients,
      benefits: indications.map((indication) => truncateText(indication, 100)),
      usage: result.dosage_and_administration?.[0],
      warnings: result.warnings?.[0],
      interactions: result.drug_interactions?.[0],
    };
  });
}

/**
 * Generate a consistent internal ID from the FDA ID.
 * Uses the FDA application number directly with a prefix for clarity,
 * avoiding the collision-prone 32-bit hash approach.
 * @param fdaId FDA application number
 * @returns Prefixed string identifier
 */
function generateInternalId(fdaId: string): string {
  return `fda-${fdaId}`;
}

/**
 * Determine the category of a drug based on its properties
 * @param drug FDA drug result
 * @returns Category string
 */
function determineCategory(drug: FdaDrugResult): string {
  // If openfda is missing, return a default category
  if (!drug.openfda) return "Medication";

  // Check the route of administration
  const route = drug.openfda.route?.[0]?.toLowerCase();
  if (route) {
    if (route.includes("oral")) return "Oral Medication";
    if (route.includes("topical")) return "Topical Treatment";
    if (route.includes("injection")) return "Injectable";
    if (route.includes("ophthalmic")) return "Eye Treatment";
    if (route.includes("otic")) return "Ear Treatment";
    if (route.includes("nasal")) return "Nasal Treatment";
    if (route.includes("rectal")) return "Rectal Treatment";
    if (route.includes("vaginal")) return "Vaginal Treatment";
  }

  // Check the indications or purpose for common categories
  const indications =
    drug.indications_and_usage?.[0]?.toLowerCase() ||
    drug.purpose?.[0]?.toLowerCase() ||
    "";

  if (indications.includes("pain") || indications.includes("ache"))
    return "Pain Reliever";
  if (indications.includes("allerg")) return "Allergy Medication";
  if (
    indications.includes("acid") ||
    indications.includes("reflux") ||
    indications.includes("stomach") ||
    indications.includes("digest")
  )
    return "Digestive Health";
  if (indications.includes("sleep") || indications.includes("insomnia"))
    return "Sleep Aid";
  if (indications.includes("vitamin") || indications.includes("supplement"))
    return "Supplement";
  if (indications.includes("antibiotic") || indications.includes("infection"))
    return "Antibiotic";
  if (
    indications.includes("blood pressure") ||
    indications.includes("hypertension")
  )
    return "Blood Pressure Medication";
  if (indications.includes("cholesterol")) return "Cholesterol Medication";
  if (indications.includes("diabetes")) return "Diabetes Medication";
  if (indications.includes("depression") || indications.includes("anxiety"))
    return "Mental Health Medication";

  // Default category
  return "Medication";
}

/**
 * Truncate text to a certain length and add ellipsis if needed
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
