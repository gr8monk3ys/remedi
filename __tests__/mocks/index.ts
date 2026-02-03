/**
 * Test Mocks and Fixtures
 *
 * Common mock data and utilities for testing.
 */

import { vi } from 'vitest';

// ============================================================================
// Mock Pharmaceutical Data
// ============================================================================

export const mockPharmaceutical = {
  id: 'pharm-1',
  fdaId: 'fda-test-123',
  name: 'Ibuprofen',
  description: 'Nonsteroidal anti-inflammatory drug for pain relief',
  category: 'Pain Reliever',
  ingredients: '["ibuprofen"]',
  benefits: '["pain relief", "anti-inflammatory"]',
  usage: 'Take with food every 4-6 hours',
  warnings: 'Do not exceed 1200mg in 24 hours',
  interactions: 'May interact with blood thinners',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockProcessedDrug = {
  id: 'drug-1',
  fdaId: 'fda-processed-123',
  name: 'Aspirin',
  description: 'Pain reliever and blood thinner',
  category: 'Pain Reliever',
  ingredients: ['aspirin', 'inactive ingredients'],
  benefits: ['pain relief', 'reduces fever', 'anti-inflammatory'],
  usage: 'Take 1-2 tablets every 4 hours',
  warnings: "Reye's syndrome warning",
  interactions: 'Avoid with blood thinners',
};

// ============================================================================
// Mock Natural Remedy Data
// ============================================================================

export const mockNaturalRemedy = {
  id: 'remedy-1',
  name: 'Turmeric',
  description: 'Natural anti-inflammatory spice',
  category: 'Herbal Remedy',
  ingredients: '["curcumin"]',
  benefits: '["anti-inflammatory", "antioxidant"]',
  imageUrl: 'https://example.com/turmeric.jpg',
  usage: 'Add to food or take as supplement',
  dosage: '500-2000mg daily',
  precautions: 'May interact with blood thinners',
  scientificInfo: 'Curcumin inhibits inflammatory pathways',
  references: '[]',
  relatedRemedies: '[]',
  sourceUrl: null,
  evidenceLevel: 'moderate',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockParsedNaturalRemedy = {
  id: 'remedy-1',
  name: 'Turmeric',
  description: 'Natural anti-inflammatory spice',
  category: 'Herbal Remedy',
  ingredients: ['curcumin'],
  benefits: ['anti-inflammatory', 'antioxidant'],
  imageUrl: 'https://example.com/turmeric.jpg',
  usage: 'Add to food or take as supplement',
  dosage: '500-2000mg daily',
  precautions: 'May interact with blood thinners',
  scientificInfo: 'Curcumin inhibits inflammatory pathways',
  references: [],
  relatedRemedies: [],
  sourceUrl: null,
  evidenceLevel: 'moderate',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ============================================================================
// Mock FDA API Response
// ============================================================================

export const mockFdaApiResponse = {
  meta: {
    disclaimer: 'Do not rely on openFDA to make decisions regarding medical care.',
    terms: 'https://open.fda.gov/terms/',
    license: 'https://open.fda.gov/license/',
    last_updated: '2024-01-01',
    results: {
      skip: 0,
      limit: 5,
      total: 1,
    },
  },
  results: [
    {
      id: 'fda-result-123',
      openfda: {
        brand_name: ['IBUPROFEN'],
        generic_name: ['IBUPROFEN'],
        product_type: ['HUMAN OTC DRUG'],
        route: ['ORAL'],
        substance_name: ['IBUPROFEN'],
      },
      active_ingredient: ['IBUPROFEN 200 MG'],
      indications_and_usage: ['For temporary relief of minor aches and pains'],
      purpose: ['Pain reliever/fever reducer'],
      dosage_and_administration: ['Take 1-2 tablets every 4-6 hours'],
      warnings: ['Do not exceed recommended dose'],
      drug_interactions: ['Ask a doctor before use if taking aspirin'],
    },
  ],
};

// ============================================================================
// Mock User and Session Data
// ============================================================================

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  role: 'user',
};

export const mockAdminUser = {
  id: 'admin-123',
  email: 'admin@example.com',
  name: 'Admin User',
  image: 'https://example.com/admin-avatar.jpg',
  role: 'admin',
};

export const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 86400000).toISOString(),
};

export const mockSessionId = '550e8400-e29b-41d4-a716-446655440000';

// ============================================================================
// Mock Favorite Data
// ============================================================================

export const mockFavorite = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  remedyId: 'remedy-1',
  remedyName: 'Turmeric',
  sessionId: mockSessionId,
  userId: null,
  notes: 'Good for joint pain',
  collectionName: 'Pain Relief',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ============================================================================
// Mock Subscription Data
// ============================================================================

export const mockSubscription = {
  id: 'sub-1',
  userId: 'user-123',
  stripeSubscriptionId: 'sub_stripe_123',
  customerId: 'cus_stripe_123',
  priceId: 'price_basic_monthly',
  plan: 'basic',
  status: 'active',
  interval: 'month',
  currentPeriodStart: new Date('2024-01-01'),
  currentPeriodEnd: new Date('2024-02-01'),
  startedAt: new Date('2024-01-01'),
  expiresAt: null,
  cancelledAt: null,
  cancelAtPeriodEnd: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ============================================================================
// Mock Stripe Data
// ============================================================================

export const mockStripeSession = {
  id: 'cs_test_123',
  customer: 'cus_stripe_123',
  subscription: 'sub_stripe_123',
  metadata: {
    userId: 'user-123',
  },
  mode: 'subscription',
  payment_status: 'paid',
  status: 'complete',
};

export const mockStripeSubscription = {
  id: 'sub_stripe_123',
  customer: 'cus_stripe_123',
  status: 'active',
  cancel_at_period_end: false,
  canceled_at: null,
  start_date: Math.floor(Date.now() / 1000),
  items: {
    data: [
      {
        price: {
          id: 'price_basic_monthly',
          recurring: {
            interval: 'month',
          },
        },
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      },
    ],
  },
  metadata: {
    userId: 'user-123',
  },
};

export const mockStripeInvoice = {
  id: 'in_test_123',
  customer: 'cus_stripe_123',
  parent: {
    subscription_details: {
      subscription: 'sub_stripe_123',
    },
  },
  status: 'paid',
  amount_paid: 999,
  currency: 'usd',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a mock NextRequest
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
) {
  const { method = 'GET', headers = {}, body } = options;

  return {
    url,
    method,
    headers: new Headers(headers),
    nextUrl: new URL(url),
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  } as unknown;
}

/**
 * Create a mock Prisma client
 */
export function createMockPrismaClient() {
  return {
    pharmaceutical: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    naturalRemedy: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    naturalRemedyMapping: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    searchHistory: {
      create: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
      deleteMany: vi.fn(),
    },
    favorite: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    filterPreference: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $disconnect: vi.fn(),
  };
}

/**
 * Create a mock fetch function
 */
export function createMockFetch(response: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
  });
}

/**
 * Create a mock OpenAI client
 */
export function createMockOpenAIClient() {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  recommendations: [
                    {
                      remedyName: 'Turmeric',
                      confidence: 0.85,
                      reasoning: 'Anti-inflammatory properties',
                      warnings: ['May interact with blood thinners'],
                      interactions: [],
                    },
                  ],
                }),
              },
            },
          ],
        }),
      },
    },
  };
}
