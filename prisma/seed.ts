import { PrismaClient, SubscriptionPlan, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  allNaturalRemedies,
  pharmaceuticals,
  remedyMappings,
} from "./seed-data/index.ts";
import { seedInteractions } from "./seeds/interactions.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// Batch size for database operations
const BATCH_SIZE = 50;
const SHOULD_RESET = process.env.SEED_RESET === "true";
const DEFAULT_DEMO_EMAIL = "demo@remedi.local";
const REQUIRED_REMEDY_SAMPLE_SIZE = 72;

type DemoUserSeed = {
  email: string;
  name: string;
  role: UserRole;
  plan: SubscriptionPlan;
  status: string;
  interval: string | null;
  categories: string[];
  goals: string[];
  allergies: string[];
  conditions: string[];
  dietaryPrefs: string[];
};

function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

function parseSeedArray(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value !== "string" || value.length === 0) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.trim() ? [value.trim()] : [];
  }
}

async function main(): Promise<void> {
  console.log("Starting database seed...");
  console.log(`Total natural remedies: ${allNaturalRemedies.length}`);
  console.log(`Total pharmaceuticals: ${pharmaceuticals.length}`);
  console.log(`Total mappings: ${remedyMappings.length}`);

  // Optional reset mode for local/dev workflows.
  // By default we preserve existing data and rely on createMany(upsert-like) semantics.
  if (SHOULD_RESET) {
    console.log("\nSEED_RESET=true: clearing existing core data...");
    await prisma.naturalRemedyMapping.deleteMany({});
    await prisma.pharmaceutical.deleteMany({});
    await prisma.naturalRemedy.deleteMany({});
    console.log("Existing core data cleared.");
  } else {
    console.log(
      "\nSEED_RESET not set: preserving existing core data and enriching missing rows.",
    );
  }

  // Create pharmaceuticals in batches
  console.log("\nCreating pharmaceuticals...");
  for (let i = 0; i < pharmaceuticals.length; i += BATCH_SIZE) {
    const batch = pharmaceuticals.slice(i, i + BATCH_SIZE);
    await prisma.pharmaceutical.createMany({
      data: batch.map((pharm) => ({
        fdaId: pharm.fdaId || null,
        name: pharm.name,
        description: pharm.description || null,
        category: pharm.category,
        ingredients: parseSeedArray(pharm.ingredients),
        benefits: parseSeedArray(pharm.benefits),
        usage: pharm.usage || null,
        warnings: pharm.warnings || null,
        interactions: pharm.interactions || null,
      })),
      skipDuplicates: true,
    });
    console.log(
      `  Created pharmaceuticals ${i + 1} to ${Math.min(i + BATCH_SIZE, pharmaceuticals.length)}`,
    );
  }
  console.log(`Created ${pharmaceuticals.length} pharmaceuticals.`);

  // Create natural remedies in batches
  console.log("\nCreating natural remedies...");
  for (let i = 0; i < allNaturalRemedies.length; i += BATCH_SIZE) {
    const batch = allNaturalRemedies.slice(i, i + BATCH_SIZE);
    await prisma.naturalRemedy.createMany({
      data: batch.map((remedy) => ({
        name: remedy.name,
        description: remedy.description || null,
        category: remedy.category,
        ingredients: parseSeedArray(remedy.ingredients),
        benefits: parseSeedArray(remedy.benefits),
        imageUrl:
          "imageUrl" in remedy && typeof remedy.imageUrl === "string"
            ? remedy.imageUrl
            : null,
        usage: remedy.usage || null,
        dosage: remedy.dosage || null,
        precautions: remedy.precautions || null,
        scientificInfo: remedy.scientificInfo || null,
        references: parseSeedArray(remedy.references),
        relatedRemedies: parseSeedArray(remedy.relatedRemedies),
        sourceUrl:
          "sourceUrl" in remedy && typeof remedy.sourceUrl === "string"
            ? remedy.sourceUrl
            : null,
        evidenceLevel: remedy.evidenceLevel || null,
      })),
      skipDuplicates: true,
    });
    console.log(
      `  Created remedies ${i + 1} to ${Math.min(i + BATCH_SIZE, allNaturalRemedies.length)}`,
    );
  }
  console.log(`Created ${allNaturalRemedies.length} natural remedies.`);

  // Create mappings between pharmaceuticals and natural remedies
  console.log("\nCreating remedy mappings...");

  // First, fetch all pharmaceuticals and remedies for lookup
  const allPharms = await prisma.pharmaceutical.findMany({
    select: { id: true, name: true },
  });
  const allRemedies = await prisma.naturalRemedy.findMany({
    select: { id: true, name: true },
  });

  // Create lookup maps
  const pharmMap = new Map(allPharms.map((p) => [p.name, p.id]));
  const remedyMap = new Map(allRemedies.map((r) => [r.name, r.id]));

  // Filter valid mappings and prepare data
  const validMappings = remedyMappings
    .filter((mapping) => {
      const pharmId = pharmMap.get(mapping.pharmaceuticalName);
      const remedyId = remedyMap.get(mapping.naturalRemedyName);
      if (!pharmId) {
        console.warn(
          `  Warning: Pharmaceutical not found: ${mapping.pharmaceuticalName}`,
        );
        return false;
      }
      if (!remedyId) {
        console.warn(
          `  Warning: Remedy not found: ${mapping.naturalRemedyName}`,
        );
        return false;
      }
      return true;
    })
    .map((mapping) => ({
      pharmaceuticalId: pharmMap.get(mapping.pharmaceuticalName)!,
      naturalRemedyId: remedyMap.get(mapping.naturalRemedyName)!,
      similarityScore: mapping.similarityScore,
      matchingNutrients: parseSeedArray(mapping.matchingNutrients),
      replacementType: mapping.replacementType,
    }));

  // Create mappings in batches
  let createdMappings = 0;
  let skippedMappings = 0;

  for (let i = 0; i < validMappings.length; i += BATCH_SIZE) {
    const batch = validMappings.slice(i, i + BATCH_SIZE);

    // Use individual creates to handle duplicates gracefully
    for (const mapping of batch) {
      try {
        await prisma.naturalRemedyMapping.create({
          data: mapping,
        });
        createdMappings++;
      } catch {
        // Skip duplicates silently
        skippedMappings++;
      }
    }

    console.log(
      `  Processed mappings ${i + 1} to ${Math.min(i + BATCH_SIZE, validMappings.length)}`,
    );
  }

  console.log(
    `Created ${createdMappings} mappings (${skippedMappings} duplicates skipped).`,
  );

  // Print summary
  console.log("\n========================================");
  console.log("Seed completed successfully!");
  console.log("========================================");
  console.log(`Pharmaceuticals: ${pharmaceuticals.length}`);
  console.log(`Natural Remedies: ${allNaturalRemedies.length}`);
  console.log(`Mappings: ${createdMappings}`);
  console.log("========================================");

  // Seed drug interactions
  await seedInteractions(prisma);
  await ensureSubscriptionFeatureData();

  // Print category breakdown
  const categoryCounts = allNaturalRemedies.reduce(
    (acc, remedy) => {
      acc[remedy.category] = (acc[remedy.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("\nNatural Remedy Categories:");
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
}

async function ensureSubscriptionFeatureData(): Promise<void> {
  console.log("\nEnsuring subscription feature demo data...");

  const demoEmail = process.env.SEED_DEMO_EMAIL || DEFAULT_DEMO_EMAIL;
  const demoUsers: DemoUserSeed[] = [
    {
      email: demoEmail,
      name: "Remedi Demo User",
      role: UserRole.user,
      plan: SubscriptionPlan.premium,
      status: "active",
      interval: "yearly",
      categories: ["Pain Relief", "Sleep", "Stress"],
      goals: ["Reduce pharma reliance", "Natural-first care"],
      allergies: ["Penicillin"],
      conditions: ["Mild insomnia", "Joint discomfort"],
      dietaryPrefs: ["Mediterranean", "Low sugar"],
    },
    {
      email: "starter@remedi.local",
      name: "Starter Plan User",
      role: UserRole.user,
      plan: SubscriptionPlan.basic,
      status: "active",
      interval: "monthly",
      categories: ["Digestive Health", "Energy"],
      goals: ["Improve consistency", "Track outcomes"],
      allergies: ["Lactose"],
      conditions: ["Occasional reflux"],
      dietaryPrefs: ["High protein", "Gluten aware"],
    },
    {
      email: "free-tier@remedi.local",
      name: "Free Tier User",
      role: UserRole.user,
      plan: SubscriptionPlan.free,
      status: "active",
      interval: null,
      categories: ["Immunity", "Focus"],
      goals: ["Try natural alternatives", "Build daily habit"],
      allergies: [],
      conditions: ["Seasonal allergies"],
      dietaryPrefs: ["Plant-forward"],
    },
    {
      email: "analyst@remedi.local",
      name: "Analytics Heavy User",
      role: UserRole.user,
      plan: SubscriptionPlan.premium,
      status: "active",
      interval: "monthly",
      categories: ["Recovery", "Inflammation", "Stress"],
      goals: ["Performance support", "Detailed tracking"],
      allergies: ["Shellfish"],
      conditions: ["Exercise-related soreness"],
      dietaryPrefs: ["Low inflammatory foods"],
    },
    {
      email: "admin@remedi.local",
      name: "Remedi Admin",
      role: UserRole.admin,
      plan: SubscriptionPlan.premium,
      status: "active",
      interval: "yearly",
      categories: ["Clinical Safety", "Interactions"],
      goals: ["Moderate community content", "Review safety signals"],
      allergies: [],
      conditions: [],
      dietaryPrefs: ["Balanced"],
    },
  ];

  const remedyCatalog = await prisma.naturalRemedy.findMany({
    select: { id: true, name: true, category: true },
    orderBy: { name: "asc" },
    take: REQUIRED_REMEDY_SAMPLE_SIZE,
  });

  if (remedyCatalog.length < 24) {
    throw new Error(
      `Need at least 24 remedies to seed rich demo data, found ${remedyCatalog.length}.`,
    );
  }

  let seededUsers = 0;
  let seededSearches = 0;
  let seededFavorites = 0;
  let seededEvents = 0;
  let seededUsageRecords = 0;
  let seededJournalEntries = 0;
  let seededReports = 0;
  let seededReviews = 0;
  let seededContributions = 0;
  let seededConversionEvents = 0;

  for (const [userIndex, seedUser] of demoUsers.entries()) {
    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        name: seedUser.name,
        role: seedUser.role,
        hasUsedTrial: true,
        trialStartDate: daysAgo(35 + userIndex * 3),
        trialEndDate: daysAgo(21 + userIndex * 3),
      },
      create: {
        email: seedUser.email,
        name: seedUser.name,
        role: seedUser.role,
        hasUsedTrial: true,
        trialStartDate: daysAgo(35 + userIndex * 3),
        trialEndDate: daysAgo(21 + userIndex * 3),
      },
    });
    seededUsers++;

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: seedUser.plan,
        status: seedUser.status,
        interval: seedUser.interval,
        currentPeriodStart: daysAgo(20 - userIndex),
        currentPeriodEnd: daysAgo(-10 + userIndex),
        cancelAtPeriodEnd: false,
      },
      create: {
        userId: user.id,
        plan: seedUser.plan,
        status: seedUser.status,
        interval: seedUser.interval,
        currentPeriodStart: daysAgo(20 - userIndex),
        currentPeriodEnd: daysAgo(-10 + userIndex),
      },
    });

    await prisma.emailPreference.upsert({
      where: { userId: user.id },
      update: {
        weeklyDigest: true,
        marketingEmails: seedUser.plan !== SubscriptionPlan.free,
        productUpdates: true,
        subscriptionReminders: true,
      },
      create: {
        userId: user.id,
        weeklyDigest: true,
        marketingEmails: seedUser.plan !== SubscriptionPlan.free,
        productUpdates: true,
        subscriptionReminders: true,
      },
    });

    await prisma.healthProfile.upsert({
      where: { userId: user.id },
      update: {
        categories: seedUser.categories,
        goals: seedUser.goals,
        allergies: seedUser.allergies,
        conditions: seedUser.conditions,
        dietaryPrefs: seedUser.dietaryPrefs,
      },
      create: {
        userId: user.id,
        categories: seedUser.categories,
        goals: seedUser.goals,
        allergies: seedUser.allergies,
        conditions: seedUser.conditions,
        dietaryPrefs: seedUser.dietaryPrefs,
      },
    });

    const startIndex = userIndex * 12;
    const userRemedies =
      remedyCatalog.slice(startIndex, startIndex + 12).length === 12
        ? remedyCatalog.slice(startIndex, startIndex + 12)
        : remedyCatalog.slice(0, 12);

    await Promise.all([
      prisma.medicationCabinet.deleteMany({ where: { userId: user.id } }),
      prisma.favorite.deleteMany({ where: { userId: user.id } }),
      prisma.searchHistory.deleteMany({ where: { userId: user.id } }),
      prisma.userEvent.deleteMany({ where: { userId: user.id } }),
      prisma.usageRecord.deleteMany({ where: { userId: user.id } }),
      prisma.remedyJournal.deleteMany({ where: { userId: user.id } }),
      prisma.remedyReport.deleteMany({ where: { userId: user.id } }),
      prisma.remedyReview.deleteMany({ where: { userId: user.id } }),
      prisma.remedyContribution.deleteMany({ where: { userId: user.id } }),
      prisma.conversionEvent.deleteMany({ where: { userId: user.id } }),
    ]);

    const medications = [
      {
        name: "Magnesium Glycinate",
        type: "supplement",
        dosage: "200mg",
        frequency: "daily",
        notes: "Evening use for sleep support",
        startDate: daysAgo(90),
      },
      {
        name: "Omega-3 Fish Oil",
        type: "supplement",
        dosage: "1000mg",
        frequency: "daily",
        notes: "With first meal",
        startDate: daysAgo(60),
      },
      {
        name: "Ibuprofen",
        type: "pharmaceutical",
        dosage: "200mg",
        frequency: "as_needed",
        notes: "Used sparingly for breakthrough pain",
        startDate: daysAgo(120),
      },
      {
        name: "Turmeric Extract",
        type: "natural_remedy",
        dosage: "500mg",
        frequency: "daily",
        notes: "Taken with meals",
        startDate: daysAgo(75),
      },
    ];

    await prisma.medicationCabinet.createMany({
      data: medications.map((medication) => ({
        userId: user.id,
        ...medication,
      })),
    });

    const favorites = userRemedies.slice(0, 6).map((remedy, index) => ({
      userId: user.id,
      remedyId: remedy.id,
      remedyName: remedy.name,
      collectionName:
        index % 2 === 0
          ? "Daily Stack"
          : index % 3 === 0
            ? "Sleep Support"
            : null,
      notes: `Seeded favorite for ${remedy.category.toLowerCase()}.`,
      createdAt: daysAgo(14 - index),
      updatedAt: daysAgo(14 - index),
    }));

    await prisma.favorite.createMany({ data: favorites });
    seededFavorites += favorites.length;

    const queries = [
      "ibuprofen",
      "melatonin",
      "magnesium for sleep",
      "omega 3 alternatives",
      "natural anti inflammatory",
      "vitamin d deficiency",
      "ashwagandha stress",
      "turmeric dosage",
      "ginger interactions",
      "probiotics bloating",
      "sleep quality supplements",
      "headache remedy",
    ];

    const searchHistoryRows = queries.map((query, index) => ({
      userId: user.id,
      query,
      resultsCount: 2 + ((index + userIndex) % 7),
      createdAt: daysAgo(index + userIndex),
    }));

    await prisma.searchHistory.createMany({ data: searchHistoryRows });
    seededSearches += searchHistoryRows.length;

    for (let day = 0; day < 30; day++) {
      const usageDate = daysAgo(day);
      await prisma.usageRecord.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: usageDate,
          },
        },
        update: {
          searches: 3 + ((userIndex + day) % 8),
          aiSearches: 1 + ((userIndex + day) % 4),
          comparisons: (userIndex + day) % 4,
          exports: (userIndex + day) % 3,
        },
        create: {
          userId: user.id,
          date: usageDate,
          searches: 3 + ((userIndex + day) % 8),
          aiSearches: 1 + ((userIndex + day) % 4),
          comparisons: (userIndex + day) % 4,
          exports: (userIndex + day) % 3,
        },
      });
      seededUsageRecords++;
    }

    const journalRows = userRemedies
      .slice(0, 4)
      .flatMap((remedy, remedyOffset) => {
        return [0, 7].map((weekOffset) => ({
          userId: user.id,
          remedyId: remedy.id,
          remedyName: remedy.name,
          date: daysAgo(weekOffset + remedyOffset * 3),
          rating: 3 + ((userIndex + remedyOffset) % 3),
          symptoms: ["Inflammation", "Sleep disruption"],
          sideEffects: remedyOffset % 2 === 0 ? [] : ["Mild digestive upset"],
          dosageTaken: "1 serving",
          notes: "Seeded journal trend entry.",
          mood: 3 + ((userIndex + remedyOffset) % 3),
          energyLevel: 3 + ((userIndex + remedyOffset + 1) % 3),
          sleepQuality: 3 + ((userIndex + remedyOffset + 2) % 3),
        }));
      });

    await prisma.remedyJournal.createMany({ data: journalRows });
    seededJournalEntries += journalRows.length;

    const reportRows = [
      {
        userId: user.id,
        title: "Monthly Wellness Overview",
        queryType: "custom",
        queryInput: "Summarize regimen effectiveness and symptom changes",
        status: "complete",
        content: {
          summary:
            "Sleep quality and baseline pain metrics improved over the last 30 days.",
          recommendations: [
            "Continue current supplement cadence for another month.",
            "Review NSAID usage trend with clinician if frequency rises.",
          ],
          interactionWarnings: [],
          sources: ["Journal entries", "Medication cabinet", "Usage records"],
        },
      },
      {
        userId: user.id,
        title: "Interaction Risk Snapshot",
        queryType: "drug_alternative",
        queryInput: "Check current cabinet for potential conflicts",
        status: "complete",
        content: {
          summary:
            "No severe interactions detected; monitor mild overlap on blood-thinning pathways.",
          recommendations: [
            "Space omega-3 and NSAID use when possible.",
            "Re-check interactions after any regimen change.",
          ],
          interactionWarnings: [
            "Potential additive bleeding risk with fish oil + ibuprofen.",
          ],
          sources: ["Interaction checker", "Medication cabinet"],
        },
      },
    ];

    await prisma.remedyReport.createMany({ data: reportRows });
    seededReports += reportRows.length;

    const eventRows = searchHistoryRows.map((searchRow, index) => ({
      userId: user.id,
      eventType: index % 2 === 0 ? "search" : "view_remedy",
      eventData:
        index % 2 === 0
          ? { query: searchRow.query, resultsCount: searchRow.resultsCount }
          : { remedyId: favorites[index % favorites.length]?.remedyId },
      page:
        index % 2 === 0
          ? "/"
          : `/remedy/${favorites[index % favorites.length]?.remedyId}`,
      referrer: "/",
      userAgent: "seed-script",
      createdAt: searchRow.createdAt,
    }));

    await prisma.userEvent.createMany({ data: eventRows });
    seededEvents += eventRows.length;

    const conversionRows = [
      {
        userId: user.id,
        eventType: "upgrade_prompt_shown",
        eventSource: "feature_gate",
        planTarget: "premium",
        metadata: { location: "journal", seeded: true },
        createdAt: daysAgo(20 - userIndex),
      },
      {
        userId: user.id,
        eventType: "trial_started",
        eventSource: "pricing_page",
        planTarget: "premium",
        metadata: { seeded: true },
        createdAt: daysAgo(18 - userIndex),
      },
      {
        userId: user.id,
        eventType: "upgrade_clicked",
        eventSource: "usage_limit_banner",
        planTarget: seedUser.plan,
        metadata: { seeded: true },
        createdAt: daysAgo(10 - userIndex),
      },
    ];
    await prisma.conversionEvent.createMany({ data: conversionRows });
    seededConversionEvents += conversionRows.length;

    const reviewRows = userRemedies.slice(0, 3).map((remedy, index) => ({
      userId: user.id,
      remedyId: remedy.id,
      remedyName: remedy.name,
      rating: 3 + ((index + userIndex) % 3),
      title: `${remedy.name} progress update`,
      comment:
        "Seeded review: measurable benefit over 2-4 weeks with consistent use.",
      helpful: index + userIndex,
      verified: true,
    }));
    await prisma.remedyReview.createMany({ data: reviewRows });
    seededReviews += reviewRows.length;

    const contributionRows = [
      {
        userId: user.id,
        name: `Seeded Remedy Blend ${userIndex + 1}A`,
        description: "Community-submitted blend for stress and sleep support.",
        category: "Community Blend",
        ingredients: ["Magnesium", "L-Theanine", "Lemon Balm"],
        benefits: ["Calm support", "Sleep onset"],
        usage: "Take 45 minutes before bedtime.",
        dosage: "1 capsule",
        precautions: "Avoid with sedative medications.",
        scientificInfo:
          "Includes ingredients with moderate evidence in sleep quality.",
        references: ["https://pubmed.ncbi.nlm.nih.gov/"],
        imageUrl: null,
        status: "pending" as const,
      },
      {
        userId: user.id,
        name: `Seeded Remedy Blend ${userIndex + 1}B`,
        description: "Community formula for daytime focus and reduced fatigue.",
        category: "Community Blend",
        ingredients: ["Rhodiola", "B Vitamins", "CoQ10"],
        benefits: ["Energy support", "Focus support"],
        usage: "Take with breakfast.",
        dosage: "1 capsule",
        precautions: "Stop use if jitteriness occurs.",
        scientificInfo: "Adaptogenic and mitochondrial-support ingredients.",
        references: ["https://pubmed.ncbi.nlm.nih.gov/"],
        imageUrl: null,
        status: "approved" as const,
      },
    ];

    await prisma.remedyContribution.createMany({ data: contributionRows });
    seededContributions += contributionRows.length;
  }

  console.log("Subscription feature demo data ensured.");
  console.log(
    `  Seeded demo users: ${seededUsers}, searches: ${seededSearches}, favorites: ${seededFavorites}, usage records: ${seededUsageRecords}`,
  );
  console.log(
    `  Seeded events: ${seededEvents}, conversion events: ${seededConversionEvents}, journal entries: ${seededJournalEntries}, reports: ${seededReports}`,
  );
  console.log(
    `  Seeded reviews: ${seededReviews}, contributions: ${seededContributions}`,
  );
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
