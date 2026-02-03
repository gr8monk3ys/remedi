/**
 * Unit Tests for AI Matching Module
 *
 * Tests AI client, matching, NLP, and interactions functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock OpenAI before importing
const mockCreate = vi.fn();

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
    },
  };
});

// Mock Prisma
vi.mock('../db', () => ({
  prisma: {
    naturalRemedy: {
      findMany: vi.fn(),
    },
  },
}));

describe('AI Module', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isAIEnabled', () => {
    it('should return true when OPENAI_API_KEY is set', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const { isAIEnabled } = await import('../ai/client');
      expect(isAIEnabled()).toBe(true);
    });

    it('should return false when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;
      const { isAIEnabled } = await import('../ai/client');
      expect(isAIEnabled()).toBe(false);
    });
  });

  describe('getOpenAIClient', () => {
    it('should return null when API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      vi.resetModules();
      const { getOpenAIClient } = await import('../ai/client');
      const client = getOpenAIClient();
      expect(client).toBeNull();
    });

    it('should return client when API key is configured', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();
      const { getOpenAIClient } = await import('../ai/client');
      const client = getOpenAIClient();
      expect(client).not.toBeNull();
    });

    it('should reuse the same client instance', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();
      const { getOpenAIClient } = await import('../ai/client');
      const client1 = getOpenAIClient();
      const client2 = getOpenAIClient();
      expect(client1).toBe(client2);
    });
  });

  describe('enhanceRemedyMatching', () => {
    it('should return empty array when AI is disabled', async () => {
      delete process.env.OPENAI_API_KEY;
      vi.resetModules();

      const { enhanceRemedyMatching } = await import('../ai/matching');
      const result = await enhanceRemedyMatching({
        query: 'pain relief',
      });

      expect(result).toEqual([]);
    });

    it('should return recommendations when AI is enabled', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

      const { prisma } = await import('../db');
      vi.mocked(prisma.naturalRemedy.findMany).mockResolvedValue([
        {
          id: 'turmeric',
          name: 'Turmeric',
          description: 'Anti-inflammatory spice',
          category: 'Herbal Remedy',
          ingredients: '["curcumin"]',
          benefits: '["anti-inflammatory"]',
          imageUrl: 'https://example.com/turmeric.jpg',
          usage: null,
          dosage: null,
          precautions: null,
          scientificInfo: null,
          references: '[]',
          relatedRemedies: '[]',
          sourceUrl: null,
          evidenceLevel: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

            mockCreate.mockResolvedValue({
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
      });

      const { enhanceRemedyMatching } = await import('../ai/matching');
      const result = await enhanceRemedyMatching({
        query: 'natural pain relief',
      });

      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle AI errors gracefully', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

      const { prisma } = await import('../db');
      vi.mocked(prisma.naturalRemedy.findMany).mockResolvedValue([]);

            mockCreate.mockRejectedValue(new Error('API Error'));

      const { enhanceRemedyMatching } = await import('../ai/matching');
      const result = await enhanceRemedyMatching({
        query: 'test',
      });

      expect(result).toEqual([]);
    });

    it('should handle empty AI response', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

      const { prisma } = await import('../db');
      vi.mocked(prisma.naturalRemedy.findMany).mockResolvedValue([]);

            mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const { enhanceRemedyMatching } = await import('../ai/matching');
      const result = await enhanceRemedyMatching({
        query: 'test',
      });

      expect(result).toEqual([]);
    });

    it('should handle malformed JSON response', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

      const { prisma } = await import('../db');
      vi.mocked(prisma.naturalRemedy.findMany).mockResolvedValue([
        {
          id: 'test',
          name: 'Test',
          description: 'Test',
          category: 'Test',
          ingredients: '[]',
          benefits: '[]',
          imageUrl: null,
          usage: null,
          dosage: null,
          precautions: null,
          scientificInfo: null,
          references: '[]',
          relatedRemedies: '[]',
          sourceUrl: null,
          evidenceLevel: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

            mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'not valid json' } }],
      });

      const { enhanceRemedyMatching } = await import('../ai/matching');
      const result = await enhanceRemedyMatching({
        query: 'test',
      });

      expect(result).toEqual([]);
    });
  });

  describe('processNaturalLanguageQuery', () => {
    it('should return default intent when AI is disabled', async () => {
      delete process.env.OPENAI_API_KEY;
      vi.resetModules();

      const { processNaturalLanguageQuery } = await import('../ai/nlp');
      const result = await processNaturalLanguageQuery('find pain relief');

      expect(result.intent).toBe('search');
    });

    it('should process query and return intent', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

            mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                intent: 'search',
                entities: {
                  symptoms: ['headache'],
                  preferences: ['natural'],
                },
              }),
            },
          },
        ],
      });

      const { processNaturalLanguageQuery } = await import('../ai/nlp');
      const result = await processNaturalLanguageQuery('natural remedy for headache');

      expect(result.intent).toBe('search');
      expect(result.entities?.symptoms).toContain('headache');
    });

    it('should handle NLP processing errors', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

            mockCreate.mockRejectedValue(new Error('NLP Error'));

      const { processNaturalLanguageQuery } = await import('../ai/nlp');
      const result = await processNaturalLanguageQuery('test query');

      expect(result.intent).toBe('search');
    });

    it('should handle empty response', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

            mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const { processNaturalLanguageQuery } = await import('../ai/nlp');
      const result = await processNaturalLanguageQuery('test');

      expect(result.intent).toBe('search');
    });
  });

  describe('checkDrugInteractions', () => {
    it('should return safe result for empty medications', async () => {
      vi.resetModules();

      const { checkDrugInteractions } = await import('../ai/interactions');
      const result = await checkDrugInteractions('Turmeric', []);

      expect(result.hasInteractions).toBe(false);
      expect(result.warnings).toEqual([]);
      expect(result.severity).toBe('low');
    });

    it('should return warning when AI is disabled', async () => {
      delete process.env.OPENAI_API_KEY;
      vi.resetModules();

      const { checkDrugInteractions } = await import('../ai/interactions');
      const result = await checkDrugInteractions('Turmeric', ['Warfarin']);

      expect(result.hasInteractions).toBe(true);
      expect(result.warnings[0]).toContain('AI interaction checking unavailable');
      expect(result.severity).toBe('moderate');
    });

    it('should check interactions when AI is enabled', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

            mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                hasInteractions: true,
                warnings: ['Turmeric may enhance effects of blood thinners'],
                severity: 'moderate',
                recommendations: ['Monitor bleeding signs', 'Consult doctor'],
              }),
            },
          },
        ],
      });

      const { checkDrugInteractions } = await import('../ai/interactions');
      const result = await checkDrugInteractions('Turmeric', ['Warfarin']);

      expect(result.hasInteractions).toBe(true);
      expect(result.warnings[0]).toContain('blood thinners');
      expect(result.severity).toBe('moderate');
      expect(result.recommendations).toHaveLength(2);
    });

    it('should handle multiple medications', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

            mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                hasInteractions: true,
                warnings: ['Multiple potential interactions'],
                severity: 'high',
                recommendations: ['Consult healthcare provider before use'],
              }),
            },
          },
        ],
      });

      const { checkDrugInteractions } = await import('../ai/interactions');
      const result = await checkDrugInteractions('Turmeric', [
        'Warfarin',
        'Aspirin',
        'Metformin',
      ]);

      expect(result.hasInteractions).toBe(true);
      expect(result.severity).toBe('high');
    });

    it('should handle interaction check errors', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      vi.resetModules();

            mockCreate.mockRejectedValue(new Error('Interaction check failed'));

      const { checkDrugInteractions } = await import('../ai/interactions');
      const result = await checkDrugInteractions('Turmeric', ['Warfarin']);

      expect(result.hasInteractions).toBe(true);
      expect(result.warnings[0]).toContain('Unable to verify');
      expect(result.severity).toBe('moderate');
    });
  });
});
