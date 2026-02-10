/**
 * AI Remedy Report Generator
 *
 * Orchestrates report generation by:
 * 1. Querying database for relevant remedies
 * 2. Checking interactions with medication cabinet (if requested)
 * 3. Fetching journal data (if requested)
 * 4. Calling GPT-4 with structured prompt
 * 5. Returning structured report content
 */

import { getOpenAIClient, isAIEnabled } from "./client";
import { createLogger } from "@/lib/logger";

const logger = createLogger("report-generator");

interface ReportParams {
  reportId: string;
  userId: string;
  queryType: string;
  queryInput: string;
  includeCabinetInteractions: boolean;
  includeJournalData: boolean;
}

interface ReportContent {
  summary: string;
  recommendations: Array<{
    name: string;
    category: string;
    evidenceLevel: string;
    reasoning: string;
    dosage: string;
    warnings: string[];
  }>;
  interactionWarnings: Array<{
    substanceA: string;
    substanceB: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  journalInsights?: {
    trackedRemedies: number;
    topRatedRemedy?: string;
    avgRating?: number;
  };
  sources: string[];
  disclaimer: string;
}

const REPORT_SYSTEM_PROMPT = `You are a knowledgeable natural medicine expert creating a comprehensive remedy report.
Provide evidence-based recommendations with clear reasoning.

IMPORTANT:
- Always prioritize safety
- Clearly state evidence levels (Strong, Moderate, Limited, Traditional)
- Warn about any interactions or contraindications
- Never claim natural remedies can cure serious diseases
- Always recommend consulting a healthcare provider
- Base recommendations on the remedy data provided

Respond in JSON format with this structure:
{
  "summary": "Brief overview of findings",
  "recommendations": [
    {
      "name": "Remedy name",
      "category": "Category",
      "evidenceLevel": "Strong/Moderate/Limited/Traditional",
      "reasoning": "Why this remedy is recommended",
      "dosage": "Typical dosage recommendation",
      "warnings": ["Any warnings"]
    }
  ],
  "sources": ["Reference sources"]
}`;

/**
 * Generate a remedy report using AI and database data
 */
export async function generateRemedyReport(
  params: ReportParams,
): Promise<Record<string, unknown>> {
  const {
    userId,
    queryType,
    queryInput,
    includeCabinetInteractions,
    includeJournalData,
  } = params;

  try {
    // Lazy import to avoid circular dependencies with server-only modules
    const { prisma } = await import("@/lib/db/client");
    const { searchNaturalRemedies } = await import("@/lib/db/remedies");

    // 1. Search for relevant remedies
    let remedyContext = "";
    try {
      const remedies = await searchNaturalRemedies(queryInput);
      if (remedies.length > 0) {
        remedyContext = remedies
          .slice(0, 10)
          .map(
            (r) =>
              `- ${r.name} (${r.category}): ${r.description?.slice(0, 200) ?? "No description"}. ` +
              `Evidence: ${r.evidenceLevel ?? "Unknown"}. Dosage: ${r.dosage ?? "Not specified"}.`,
          )
          .join("\n");
      }
    } catch {
      logger.warn("Failed to search remedies for report", { queryInput });
    }

    // 2. Check cabinet interactions if requested
    let interactionWarnings: ReportContent["interactionWarnings"] = [];
    if (includeCabinetInteractions) {
      try {
        const { checkCabinetInteractions } =
          await import("@/lib/db/medication-cabinet");
        const interactions = await checkCabinetInteractions(userId);
        interactionWarnings = interactions.map((i) => ({
          substanceA: i.substanceA,
          substanceB: i.substanceB,
          severity: i.severity,
          description: i.description,
          recommendation:
            i.recommendation ?? "Consult your healthcare provider",
        }));
      } catch {
        logger.warn("Failed to check cabinet interactions for report");
      }
    }

    // 3. Fetch journal data if requested
    let journalInsights: ReportContent["journalInsights"] | undefined;
    if (includeJournalData) {
      try {
        const { getTrackedRemedies } = await import("@/lib/db/journal");
        const tracked = await getTrackedRemedies(userId);

        if (tracked.length > 0) {
          // Get insights for the top tracked remedy
          const journalEntries = await prisma.remedyJournal.findMany({
            where: { userId },
            select: { rating: true, remedyName: true },
          });

          const avgRating =
            journalEntries.length > 0
              ? journalEntries.reduce((sum, e) => sum + e.rating, 0) /
                journalEntries.length
              : undefined;

          journalInsights = {
            trackedRemedies: tracked.length,
            topRatedRemedy: tracked[0]?.remedyName,
            avgRating: avgRating ? Math.round(avgRating * 10) / 10 : undefined,
          };
        }
      } catch {
        logger.warn("Failed to fetch journal data for report");
      }
    }

    // 4. Build the AI prompt
    const queryTypeLabel =
      queryType === "condition"
        ? "natural remedies for the condition"
        : queryType === "drug_alternative"
          ? "natural alternatives to the drug"
          : "natural remedy recommendations for";

    let userPrompt = `Create a comprehensive report on ${queryTypeLabel}: "${queryInput}"\n\n`;

    if (remedyContext) {
      userPrompt += `Available remedies in our database:\n${remedyContext}\n\n`;
    }

    if (interactionWarnings.length > 0) {
      userPrompt += `IMPORTANT - User's medication cabinet has these known interactions:\n`;
      for (const w of interactionWarnings) {
        userPrompt += `- ${w.substanceA} + ${w.substanceB}: ${w.severity} - ${w.description}\n`;
      }
      userPrompt += `\nPlease factor these interactions into your recommendations.\n\n`;
    }

    if (journalInsights) {
      userPrompt += `User's journal data: tracking ${journalInsights.trackedRemedies} remedies`;
      if (journalInsights.avgRating) {
        userPrompt += `, average rating ${journalInsights.avgRating}/5`;
      }
      userPrompt += `\n\n`;
    }

    userPrompt += `Provide 3-5 evidence-based recommendations. Respond in JSON only.`;

    // 5. Call GPT-4
    const client = getOpenAIClient();
    if (!client || !isAIEnabled()) {
      // Return a basic report without AI
      return buildFallbackReport(
        queryInput,
        remedyContext,
        interactionWarnings,
        journalInsights,
      );
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: REPORT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const aiContent = response.choices[0]?.message?.content;
    if (!aiContent) {
      throw new Error("Empty AI response");
    }

    const parsed = JSON.parse(aiContent) as Partial<ReportContent>;

    // Merge AI output with our data
    const reportContent: ReportContent = {
      summary: parsed.summary ?? `Report on ${queryInput}`,
      recommendations: parsed.recommendations ?? [],
      interactionWarnings,
      journalInsights,
      sources: parsed.sources ?? ["Remedi Database", "OpenFDA", "PubMed"],
      disclaimer:
        "This report is for informational purposes only. Always consult a healthcare professional before making changes to your health regimen.",
    };

    return reportContent as unknown as Record<string, unknown>;
  } catch (error) {
    logger.error("Report generation failed", error);
    throw error;
  }
}

/**
 * Build a basic report when AI is not available
 */
function buildFallbackReport(
  queryInput: string,
  remedyContext: string,
  interactionWarnings: ReportContent["interactionWarnings"],
  journalInsights?: ReportContent["journalInsights"],
): Record<string, unknown> {
  const recommendations = remedyContext
    ? remedyContext
        .split("\n")
        .slice(0, 5)
        .map((line) => {
          const match = line.match(/^- (.+?) \((.+?)\): (.+?)\./);
          return {
            name: match?.[1] ?? "Unknown",
            category: match?.[2] ?? "General",
            evidenceLevel: "See database",
            reasoning: match?.[3] ?? "Available in our database",
            dosage: "Consult database for details",
            warnings: [],
          };
        })
    : [];

  return {
    summary: `Natural remedy recommendations for "${queryInput}". AI analysis was unavailable; recommendations are based on database matches.`,
    recommendations,
    interactionWarnings,
    journalInsights,
    sources: ["Remedi Database", "OpenFDA"],
    disclaimer:
      "This report is for informational purposes only. Always consult a healthcare professional before making changes to your health regimen.",
  };
}
