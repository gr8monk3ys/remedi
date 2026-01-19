/**
 * AI-Enhanced Search API
 *
 * POST /api/ai-search - Get AI-powered remedy recommendations
 *
 * Uses OpenAI GPT-4 for intelligent natural language processing
 * and context-aware remedy suggestions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  enhanceRemedyMatching,
  processNaturalLanguageQuery,
  checkDrugInteractions,
} from '@/lib/ai-matching';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getValidationErrorMessage } from '@/lib/validations/api';
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createLogger } from '@/lib/logger';

const log = createLogger('ai-search-api');

/**
 * Request schema for AI search
 */
const aiSearchSchema = z.object({
  query: z
    .string({ message: 'Query must be a string' })
    .min(1, { message: 'Query cannot be empty' })
    .max(500, { message: 'Query is too long (maximum 500 characters)' }),
  userHistory: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  symptoms: z.array(z.string()).optional(),
  preferences: z
    .object({
      evidenceLevel: z.enum(['strong', 'moderate', 'limited']).optional(),
      category: z.array(z.string()).optional(),
    })
    .optional(),
  checkInteractions: z.boolean().optional().default(false),
});

/**
 * POST /api/ai-search
 * Get AI-powered remedy recommendations
 */
export async function POST(request: NextRequest) {
  // Check rate limit (AI search has stricter limits due to cost)
  const { allowed, response: rateLimitResponse } = await withRateLimit(
    request,
    RATE_LIMITS.aiSearch
  );
  if (!allowed && rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        errorResponse(
          'SERVICE_UNAVAILABLE',
          'AI search is not configured. Please set OPENAI_API_KEY environment variable.'
        ),
        { status: 503 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = aiSearchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        errorResponse('INVALID_INPUT', getValidationErrorMessage(validation.error)),
        { status: 400 }
      );
    }

    const { query, userHistory, currentMedications, symptoms, preferences, checkInteractions } =
      validation.data;

    // Process natural language query first
    const nlpResult = await processNaturalLanguageQuery(query);

    // Get AI-enhanced recommendations
    const recommendations = await enhanceRemedyMatching({
      query,
      userHistory,
      currentMedications:
        currentMedications || (nlpResult.pharmaceuticalMentioned ? [nlpResult.pharmaceuticalMentioned] : undefined),
      symptoms: symptoms || nlpResult.symptomsMentioned,
      preferences: {
        ...preferences,
        category: preferences?.category || nlpResult.preferredCategories,
      },
    });

    // Check for drug interactions if requested
    let interactionResults = null;
    if (checkInteractions && currentMedications && currentMedications.length > 0) {
      interactionResults = await Promise.all(
        recommendations.map(async (rec) => {
          const interactions = await checkDrugInteractions(rec.remedy.name, currentMedications);
          return {
            remedyName: rec.remedy.name,
            ...interactions,
          };
        })
      );
    }

    return NextResponse.json(
      successResponse({
        intent: nlpResult.intent,
        recommendations,
        interactions: interactionResults,
        extractedInfo: {
          pharmaceutical: nlpResult.pharmaceuticalMentioned,
          symptoms: nlpResult.symptomsMentioned,
          categories: nlpResult.preferredCategories,
          concerns: nlpResult.concerns,
        },
      })
    );
  } catch (error) {
    log.error('AI search error', error);

    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        errorResponse('UNAUTHORIZED', 'Invalid or missing OpenAI API key'),
        { status: 401 }
      );
    }

    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Failed to process AI search request'),
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-search
 * Health check endpoint
 */
export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  // Check if key exists and looks valid (starts with sk- and is long enough)
  const isConfigured = !!(apiKey &&
    apiKey.startsWith('sk-') &&
    apiKey.length > 20 &&
    !apiKey.includes('dummy') &&
    !apiKey.includes('your-'));

  return NextResponse.json(
    successResponse({
      status: isConfigured ? 'available' : 'not_configured',
      message: isConfigured
        ? 'AI search is available'
        : 'AI search requires a valid OPENAI_API_KEY environment variable',
      features: {
        naturalLanguageProcessing: isConfigured,
        intelligentMatching: isConfigured,
        drugInteractionChecking: isConfigured,
        personalizedRecommendations: isConfigured,
      },
    })
  );
}
