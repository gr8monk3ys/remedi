/**
 * OpenFDA Bulk Data Import Script
 *
 * Imports pharmaceutical data from the OpenFDA API into the database.
 * This script fetches drug information from multiple FDA datasets and
 * populates the Pharmaceutical model.
 *
 * Usage:
 *   npm run import:fda [options]
 *
 * Options:
 *   --limit <number>    Maximum number of drugs to import (default: 100)
 *   --skip <number>     Number of records to skip (default: 0)
 *   --dataset <name>    Dataset to import from (default: all)
 *                       Options: drugs, supplements, both
 *   --category <name>   Filter by category (optional)
 *   --dry-run          Preview data without importing
 *
 * Examples:
 *   npm run import:fda -- --limit 50
 *   npm run import:fda -- --dataset drugs --category "Pain Relief"
 *   npm run import:fda -- --dry-run
 *
 * @see https://open.fda.gov/apis/
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// OpenFDA API configuration
const FDA_API_BASE = "https://api.fda.gov";
const RATE_LIMIT_DELAY = 1000; // 1 second between requests (FDA allows 240 requests per minute)

// Dataset endpoints
const DATASETS = {
  drugs: "/drug/label.json",
  supplements: "/food/ndc.json",
} as const;

// Categories for pharmaceuticals
const CATEGORIES = {
  "Pain Relief": ["pain", "analgesic", "aspirin", "ibuprofen", "acetaminophen"],
  Cardiovascular: ["heart", "blood pressure", "hypertension", "cholesterol"],
  Diabetes: ["diabetes", "insulin", "blood sugar", "glucose"],
  Respiratory: ["asthma", "breathing", "respiratory", "inhaler"],
  "Mental Health": ["depression", "anxiety", "mood", "psychiatric"],
  Digestive: ["stomach", "digestive", "acid reflux", "ulcer"],
  Infection: ["antibiotic", "infection", "bacterial", "viral"],
  Allergy: ["allergy", "allergic", "antihistamine"],
  Inflammation: ["inflammation", "inflammatory", "arthritis"],
  Supplement: ["vitamin", "mineral", "supplement", "nutrient"],
} as const;

/**
 * OpenFDA API response structure
 */
interface FDAOpenFdaField {
  brand_name?: string[];
  generic_name?: string[];
  substance_name?: string[];
  application_number?: string[];
}

/**
 * FDA Drug Label record structure
 */
interface FDADrugRecord {
  openfda?: FDAOpenFdaField;
  product_ndc?: string;
  active_ingredient?: string[];
  indications_and_usage?: string[];
  purpose?: string[];
  description?: string[];
  dosage_and_administration?: string[];
  when_using?: string[];
  warnings?: string[];
  warnings_and_cautions?: string[];
  drug_interactions?: string[];
}

/**
 * FDA API response wrapper
 */
interface FDAApiResponse {
  results: FDADrugRecord[];
  meta?: {
    disclaimer: string;
    terms: string;
    license: string;
    last_updated: string;
    results?: {
      skip: number;
      limit: number;
      total: number;
    };
  };
}

/**
 * Parsed drug data ready for database insertion
 */
interface ParsedDrugData {
  fdaId: string;
  name: string;
  description: string;
  category: string;
  ingredients: string[];
  benefits: string[];
  usage: string;
  warnings: string;
  interactions: string;
}

// Configuration from command line arguments
interface ImportConfig {
  limit: number;
  skip: number;
  dataset: "drugs" | "supplements" | "both";
  category?: string;
  dryRun: boolean;
}

function parseArgs(): ImportConfig {
  const args = process.argv.slice(2);
  const config: ImportConfig = {
    limit: 100,
    skip: 0,
    dataset: "both",
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--limit":
        config.limit = parseInt(args[++i], 10);
        break;
      case "--skip":
        config.skip = parseInt(args[++i], 10);
        break;
      case "--dataset":
        config.dataset = args[++i] as ImportConfig["dataset"];
        break;
      case "--category":
        config.category = args[++i];
        break;
      case "--dry-run":
        config.dryRun = true;
        break;
    }
  }

  return config;
}

// Rate limiting helper
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch data from OpenFDA API
 */
async function fetchFromFDA(
  endpoint: string,
  limit: number = 100,
  skip: number = 0,
  searchQuery?: string,
): Promise<FDAApiResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString(),
  });

  if (searchQuery) {
    params.append("search", searchQuery);
  }

  const url = `${FDA_API_BASE}${endpoint}?${params.toString()}`;

  console.log(`📡 Fetching: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("ℹ️  No results found for this query");
        return { results: [] };
      }
      throw new Error(
        `FDA API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    await delay(RATE_LIMIT_DELAY);
    return data;
  } catch (error) {
    console.error("❌ Error fetching from FDA:", error);
    throw error;
  }
}

/**
 * Determine category from drug information
 */
function determineCategory(drug: FDADrugRecord): string {
  const searchText = [
    drug.openfda?.brand_name?.[0] || "",
    drug.openfda?.generic_name?.[0] || "",
    drug.indications_and_usage?.[0] || "",
    drug.purpose?.[0] || "",
  ]
    .join(" ")
    .toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some((keyword) => searchText.includes(keyword))) {
      return category;
    }
  }

  return "General";
}

/**
 * Parse drug data from OpenFDA response
 */
function parseDrugData(drug: FDADrugRecord): ParsedDrugData {
  const brandName = drug.openfda?.brand_name?.[0] || "Unknown Drug";
  const genericName = drug.openfda?.generic_name?.[0] || "";
  const name = brandName !== "Unknown Drug" ? brandName : genericName;

  // Extract ingredients
  const ingredients =
    drug.active_ingredient ||
    drug.openfda?.substance_name ||
    drug.openfda?.generic_name ||
    [];

  // Extract benefits/indications
  const benefits = drug.indications_and_usage || drug.purpose || [];

  // Build description
  const description =
    drug.description?.[0] ||
    drug.purpose?.[0] ||
    `${name} is a pharmaceutical medication.`;

  // Category determination
  const category = determineCategory(drug);

  return {
    fdaId: drug.openfda?.application_number?.[0] || drug.product_ndc || "",
    name,
    description,
    category,
    ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
    benefits: Array.isArray(benefits) ? benefits : [benefits],
    usage:
      drug.dosage_and_administration?.[0] ||
      drug.when_using?.[0] ||
      "Consult healthcare provider for usage instructions.",
    warnings:
      drug.warnings?.[0] ||
      drug.warnings_and_cautions?.[0] ||
      "Consult healthcare provider before use.",
    interactions:
      drug.drug_interactions?.[0] ||
      "Consult healthcare provider about interactions.",
  };
}

/**
 * Import drugs into database
 */
async function importDrugs(config: ImportConfig): Promise<void> {
  console.log("\n🚀 Starting OpenFDA Data Import");
  console.log("================================\n");
  console.log(`Configuration:
  - Dataset: ${config.dataset}
  - Limit: ${config.limit}
  - Skip: ${config.skip}
  - Category: ${config.category || "all"}
  - Dry Run: ${config.dryRun}
\n`);

  const datasets =
    config.dataset === "both" ? ["drugs", "supplements"] : [config.dataset];

  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const dataset of datasets as Array<keyof typeof DATASETS>) {
    console.log(`\n📦 Processing dataset: ${dataset}`);
    console.log("─".repeat(50));

    try {
      // Build search query if category specified
      let searchQuery: string | undefined;
      if (
        config.category &&
        CATEGORIES[config.category as keyof typeof CATEGORIES]
      ) {
        const keywords = CATEGORIES[config.category as keyof typeof CATEGORIES];
        searchQuery = keywords.map((k) => `${k}`).join("+");
      }

      // Fetch data from FDA
      const data = await fetchFromFDA(
        DATASETS[dataset],
        config.limit,
        config.skip,
        searchQuery,
      );

      if (!data.results || data.results.length === 0) {
        console.log(`ℹ️  No results found for ${dataset}`);
        continue;
      }

      console.log(`✅ Found ${data.results.length} records`);

      // Process each drug
      for (const drug of data.results) {
        try {
          const parsed = parseDrugData(drug);

          if (!parsed.name || parsed.name === "Unknown Drug") {
            console.log(`⚠️  Skipping drug with no name`);
            totalSkipped++;
            continue;
          }

          if (config.dryRun) {
            console.log(`\n📋 Would import: ${parsed.name}`);
            console.log(`   Category: ${parsed.category}`);
            console.log(`   FDA ID: ${parsed.fdaId}`);
            console.log(
              `   Ingredients: ${parsed.ingredients.slice(0, 3).join(", ")}`,
            );
            totalImported++;
            continue;
          }

          // Check if already exists
          const existing = await prisma.pharmaceutical.findUnique({
            where: { name: parsed.name },
          });

          if (existing) {
            console.log(`⏭️  Skipping existing: ${parsed.name}`);
            totalSkipped++;
            continue;
          }

          // Import to database
          await prisma.pharmaceutical.create({
            data: {
              fdaId: parsed.fdaId || null,
              name: parsed.name,
              description: parsed.description,
              category: parsed.category,
              ingredients: parsed.ingredients,
              benefits: parsed.benefits,
              usage: parsed.usage,
              warnings: parsed.warnings,
              interactions: parsed.interactions,
            },
          });

          console.log(`✅ Imported: ${parsed.name}`);
          totalImported++;
        } catch (error) {
          console.error(`❌ Error processing drug:`, error);
          totalErrors++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing dataset ${dataset}:`, error);
      totalErrors++;
    }
  }

  console.log("\n\n📊 Import Summary");
  console.log("================================");
  console.log(`✅ Successfully imported: ${totalImported}`);
  console.log(`⏭️  Skipped (duplicates): ${totalSkipped}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(
    `📦 Total processed: ${totalImported + totalSkipped + totalErrors}\n`,
  );

  if (config.dryRun) {
    console.log("ℹ️  This was a dry run. No data was actually imported.\n");
  }
}

/**
 * Main execution
 */
async function main() {
  const config = parseArgs();

  try {
    await importDrugs(config);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
