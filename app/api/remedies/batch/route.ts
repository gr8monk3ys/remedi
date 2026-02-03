import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/client'
import { parseNaturalRemedy } from '@/lib/db/parsers'
import { toDetailedRemedy } from '@/lib/db/remedies'
import {
  successResponse,
  errorResponse,
  errorResponseFromError,
  getStatusCode,
} from '@/lib/api/response'
import { createLogger } from '@/lib/logger'
import type { DetailedRemedy } from '@/lib/types'

const log = createLogger('remedies-batch-api')

/**
 * Validation schema for batch remedy request
 */
const batchRemediesSchema = z.object({
  ids: z
    .string()
    .min(1, 'At least one remedy ID is required')
    .transform((val) => val.split(',').map((id) => id.trim()))
    .refine(
      (ids) => ids.length <= 4,
      'Maximum 4 remedies can be compared at once'
    )
    .refine(
      (ids) => ids.every((id) => id.length > 0),
      'Invalid remedy ID format'
    ),
})

// Mock remedies for fallback (same as in remedy/[id]/route.ts)
const MOCK_REMEDIES: Record<string, DetailedRemedy> = {
  '101': {
    id: '101',
    name: 'Sunlight Exposure',
    description: 'Natural vitamin D production through sunlight exposure on skin.',
    imageUrl: 'https://images.unsplash.com/photo-1517758478390-c89333af4642?w=400&h=400&fit=crop',
    category: 'Lifestyle Change',
    matchingNutrients: ['Vitamin D3'],
    similarityScore: 0.9,
    usage: 'Spend 15-30 minutes in direct sunlight a few times a week.',
    dosage: '15-30 minutes of sun exposure 2-3 times per week.',
    precautions: 'Avoid sunburn. Limit exposure during peak sun hours.',
    scientificInfo: 'When UVB rays hit the skin, they convert 7-DHC into vitamin D3.',
    references: [
      { title: 'Vitamin D: The sunshine vitamin', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3356951/' },
    ],
    relatedRemedies: [{ id: '102', name: 'Fatty Fish' }],
  },
  '102': {
    id: '102',
    name: 'Fatty Fish',
    description: 'Salmon, mackerel, and other fatty fish rich in vitamin D.',
    imageUrl: 'https://images.unsplash.com/photo-1599160689894-193dafc2e8b2?w=400&h=400&fit=crop',
    category: 'Food Source',
    matchingNutrients: ['Vitamin D3', 'Omega-3'],
    similarityScore: 0.8,
    usage: 'Include fatty fish like salmon or mackerel in your diet regularly.',
    dosage: '2-3 servings per week. 3.5-ounce serving provides 200-700 IU vitamin D.',
    precautions: 'Be mindful of mercury content. Pregnant women should follow guidelines.',
    scientificInfo: 'Fatty fish contain vitamin D3 (cholecalciferol) naturally.',
    references: [
      { title: 'Vitamin D in Fish', url: 'https://www.mdpi.com/2072-6643/10/12/1876' },
    ],
    relatedRemedies: [{ id: '101', name: 'Sunlight Exposure' }],
  },
  '103': {
    id: '103',
    name: 'Turmeric',
    description: 'Contains curcumin which has anti-inflammatory properties.',
    imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop',
    category: 'Herbal Remedy',
    matchingNutrients: ['Curcumin'],
    similarityScore: 0.85,
    usage: 'Can be used in cooking, as supplement, or topical paste.',
    dosage: '500-2,000 mg of turmeric extract per day or 1-2 teaspoons ground.',
    precautions: 'May interact with blood thinners and diabetes medications.',
    scientificInfo: 'Curcumin inhibits COX-2 and 5-LOX enzymes.',
    references: [
      { title: 'Curcumin: A Review', url: 'https://www.mdpi.com/2072-6643/9/10/1047' },
    ],
    relatedRemedies: [{ id: '104', name: 'Ginger' }],
  },
  '104': {
    id: '104',
    name: 'Ginger',
    description: 'Root with anti-inflammatory and digestive properties.',
    imageUrl: 'https://images.unsplash.com/photo-1603431213662-4862e7a29051?w=400&h=400&fit=crop',
    category: 'Herbal Remedy',
    matchingNutrients: ['Gingerols', 'Shogaols'],
    similarityScore: 0.8,
    usage: 'Fresh, dried, powdered, or as tea/supplement.',
    dosage: '1-2g powder, 1-2 teaspoons fresh, or 400-500mg extract 2-3 times daily.',
    precautions: 'May interact with blood thinners. High doses may cause heartburn.',
    scientificInfo: 'Contains gingerols and shogaols with anti-inflammatory effects.',
    references: [
      { title: 'Ginger on Human Health', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7019938/' },
    ],
    relatedRemedies: [{ id: '103', name: 'Turmeric' }],
  },
}

/**
 * GET /api/remedies/batch?ids=id1,id2,id3
 * Fetch multiple remedies by their IDs for comparison
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    const searchParams = request.nextUrl.searchParams
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json(
        errorResponse('MISSING_PARAMETER', 'ids parameter is required'),
        { status: getStatusCode('MISSING_PARAMETER') }
      )
    }

    // Validate input
    const validation = batchRemediesSchema.safeParse({ ids: idsParam })
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Invalid input'
      log.debug('Validation failed', { error: errorMessage })
      return NextResponse.json(
        errorResponse('INVALID_INPUT', errorMessage, {
          issues: validation.error.issues,
        }),
        { status: getStatusCode('INVALID_INPUT') }
      )
    }

    const { ids } = validation.data
    log.info('Fetching batch remedies', { ids, count: ids.length })

    // Fetch remedies from database
    const dbRemedies = await prisma.naturalRemedy.findMany({
      where: {
        id: { in: ids },
      },
    })

    // Parse database results
    const parsedDbRemedies = dbRemedies.map(parseNaturalRemedy)
    const dbRemedyMap = new Map(
      parsedDbRemedies.map((r) => [r.id, toDetailedRemedy(r)])
    )

    // Build result array maintaining order and using mock data as fallback
    const remedies: DetailedRemedy[] = []
    const notFoundIds: string[] = []

    for (const id of ids) {
      const dbRemedy = dbRemedyMap.get(id)
      if (dbRemedy) {
        remedies.push(dbRemedy)
      } else {
        // Try mock data fallback
        const mockRemedy = MOCK_REMEDIES[id]
        if (mockRemedy) {
          remedies.push(mockRemedy)
        } else {
          notFoundIds.push(id)
        }
      }
    }

    if (remedies.length === 0) {
      return NextResponse.json(
        errorResponse('RESOURCE_NOT_FOUND', 'No remedies found for the provided IDs'),
        { status: getStatusCode('RESOURCE_NOT_FOUND') }
      )
    }

    const processingTime = Date.now() - startTime
    log.info('Batch remedies fetched', {
      found: remedies.length,
      notFound: notFoundIds.length,
      processingTime,
    })

    return NextResponse.json(
      successResponse(
        {
          remedies,
          notFoundIds: notFoundIds.length > 0 ? notFoundIds : undefined,
        },
        {
          processingTime,
          total: remedies.length,
          apiVersion: '1.0',
        }
      ),
      { status: 200 }
    )
  } catch (error) {
    log.error('Error fetching batch remedies', error)
    return NextResponse.json(
      errorResponseFromError(error, 'DATABASE_ERROR'),
      { status: getStatusCode('DATABASE_ERROR') }
    )
  }
}
