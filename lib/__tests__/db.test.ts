import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

// Use vi.hoisted to create mocks that will be hoisted with vi.mock
const { mockPharmaceutical, mockNaturalRemedy, mockNaturalRemedyMapping, mockSearchHistory, mockFavorite, mockFilterPreference, mockDisconnect } = vi.hoisted(() => ({
  mockPharmaceutical: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    upsert: vi.fn(),
  },
  mockNaturalRemedy: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  mockNaturalRemedyMapping: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  mockSearchHistory: {
    create: vi.fn(),
    findMany: vi.fn(),
    groupBy: vi.fn(),
    deleteMany: vi.fn(),
  },
  mockFavorite: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  mockFilterPreference: {
    upsert: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  },
  mockDisconnect: vi.fn(),
}));

// Mock the PrismaClient
vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function () {
      return {
        pharmaceutical: mockPharmaceutical,
        naturalRemedy: mockNaturalRemedy,
        naturalRemedyMapping: mockNaturalRemedyMapping,
        searchHistory: mockSearchHistory,
        favorite: mockFavorite,
        filterPreference: mockFilterPreference,
        $disconnect: mockDisconnect,
      };
    },
  };
});

import {
  searchPharmaceuticals,
  getPharmaceuticalById,
  getPharmaceuticalByFdaId,
  upsertPharmaceutical,
  getNaturalRemedyById,
  searchNaturalRemedies,
  toDetailedRemedy,
  getAllCategories,
  getAllEvidenceLevels,
  saveSearchHistory,
  getPopularSearches,
  addFavorite,
  isFavorite,
  removeFavorite,
  saveFilterPreferences,
  disconnect,
} from '../db';
import type { ProcessedDrug, ParsedNaturalRemedy } from '../types';

describe('db module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchPharmaceuticals', () => {
    it('should search pharmaceuticals by lowercase query', async () => {
      const mockResults = [
        {
          id: '1',
          fdaId: 'fda-1',
          name: 'ibuprofen',
          description: 'Pain reliever',
          category: 'analgesic',
          ingredients: '["ibuprofen"]',
          benefits: '["pain relief"]',
          usage: 'Take with food',
          warnings: null,
          interactions: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (mockPharmaceutical.findMany as Mock).mockResolvedValue(mockResults);

      const results = await searchPharmaceuticals('Ibuprofen');

      expect(mockPharmaceutical.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'ibuprofen' } },
            { description: { contains: 'ibuprofen' } },
            { category: { contains: 'ibuprofen' } },
          ],
        },
        take: 10,
      });

      expect(results).toHaveLength(1);
      expect(results[0].ingredients).toEqual(['ibuprofen']);
      expect(results[0].benefits).toEqual(['pain relief']);
    });

    it('should return empty array when no results', async () => {
      (mockPharmaceutical.findMany as Mock).mockResolvedValue([]);

      const results = await searchPharmaceuticals('nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('getPharmaceuticalById', () => {
    it('should return pharmaceutical with parsed JSON fields', async () => {
      const mockResult = {
        id: '1',
        fdaId: 'fda-1',
        name: 'aspirin',
        description: 'Blood thinner',
        category: 'cardiovascular',
        ingredients: '["aspirin", "caffeine"]',
        benefits: '["pain relief", "anti-inflammatory"]',
        usage: null,
        warnings: 'May cause bleeding',
        interactions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPharmaceutical.findUnique as Mock).mockResolvedValue(mockResult);

      const result = await getPharmaceuticalById('1');

      expect(mockPharmaceutical.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).not.toBeNull();
      expect(result?.ingredients).toEqual(['aspirin', 'caffeine']);
      expect(result?.benefits).toEqual(['pain relief', 'anti-inflammatory']);
    });

    it('should return null when not found', async () => {
      (mockPharmaceutical.findUnique as Mock).mockResolvedValue(null);

      const result = await getPharmaceuticalById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getPharmaceuticalByFdaId', () => {
    it('should find pharmaceutical by FDA ID', async () => {
      const mockResult = {
        id: '1',
        fdaId: 'fda-123',
        name: 'tylenol',
        description: 'Pain reliever',
        category: 'analgesic',
        ingredients: '[]',
        benefits: '[]',
        usage: null,
        warnings: null,
        interactions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPharmaceutical.findFirst as Mock).mockResolvedValue(mockResult);

      const result = await getPharmaceuticalByFdaId('fda-123');

      expect(mockPharmaceutical.findFirst).toHaveBeenCalledWith({
        where: { fdaId: 'fda-123' },
      });
      expect(result?.fdaId).toBe('fda-123');
    });
  });

  describe('upsertPharmaceutical', () => {
    it('should create or update pharmaceutical', async () => {
      const drug: ProcessedDrug = {
        id: 'new-id',
        fdaId: 'fda-new',
        name: 'newdrug',
        description: 'A new drug',
        category: 'test',
        ingredients: ['ingredient1'],
        benefits: ['benefit1'],
        usage: 'As directed',
        warnings: undefined,
        interactions: undefined,
      };

      const mockResult = {
        id: 'new-id',
        fdaId: drug.fdaId,
        name: drug.name,
        description: drug.description,
        category: drug.category,
        usage: drug.usage,
        warnings: null,
        interactions: null,
        ingredients: JSON.stringify(drug.ingredients),
        benefits: JSON.stringify(drug.benefits),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPharmaceutical.upsert as Mock).mockResolvedValue(mockResult);

      const result = await upsertPharmaceutical(drug);

      expect(mockPharmaceutical.upsert).toHaveBeenCalled();
      expect(result.ingredients).toEqual(['ingredient1']);
    });
  });

  describe('getNaturalRemedyById', () => {
    it('should return remedy with parsed JSON fields', async () => {
      const mockResult = {
        id: '1',
        name: 'Turmeric',
        description: 'Anti-inflammatory',
        category: 'herb',
        ingredients: '["curcumin"]',
        benefits: '["reduces inflammation"]',
        imageUrl: null,
        usage: 'Add to food',
        dosage: '500mg daily',
        precautions: 'May interact with blood thinners',
        scientificInfo: null,
        references: '["https://example.com"]',
        relatedRemedies: '["ginger"]',
        sourceUrl: null,
        evidenceLevel: 'moderate',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockNaturalRemedy.findUnique as Mock).mockResolvedValue(mockResult);

      const result = await getNaturalRemedyById('1');

      expect(result?.ingredients).toEqual(['curcumin']);
      expect(result?.benefits).toEqual(['reduces inflammation']);
      expect(result?.references).toEqual(['https://example.com']);
      expect(result?.relatedRemedies).toEqual(['ginger']);
    });

    it('should handle invalid JSON gracefully', async () => {
      const mockResult = {
        id: '1',
        name: 'Test',
        description: null,
        category: 'test',
        ingredients: 'invalid-json',
        benefits: '{bad}',
        imageUrl: null,
        usage: null,
        dosage: null,
        precautions: null,
        scientificInfo: null,
        references: 'not-an-array',
        relatedRemedies: null,
        sourceUrl: null,
        evidenceLevel: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockNaturalRemedy.findUnique as Mock).mockResolvedValue(mockResult);

      const result = await getNaturalRemedyById('1');

      expect(result?.ingredients).toEqual([]);
      expect(result?.benefits).toEqual([]);
      expect(result?.references).toEqual([]);
    });
  });

  describe('searchNaturalRemedies', () => {
    it('should search with lowercase query', async () => {
      (mockNaturalRemedy.findMany as Mock).mockResolvedValue([]);

      await searchNaturalRemedies('GINGER');

      expect(mockNaturalRemedy.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'ginger' } },
            { description: { contains: 'ginger' } },
            { category: { contains: 'ginger' } },
          ],
        },
        take: 20,
      });
    });
  });

  describe('toDetailedRemedy', () => {
    it('should convert ParsedNaturalRemedy to DetailedRemedy', () => {
      const parsedRemedy: ParsedNaturalRemedy = {
        id: '1',
        name: 'Test Remedy',
        description: 'A test remedy',
        category: 'herb',
        ingredients: ['ingredient1', 'ingredient2'],
        benefits: ['benefit1'],
        imageUrl: 'http://example.com/image.jpg',
        usage: 'Custom usage',
        dosage: '100mg',
        precautions: 'Be careful',
        scientificInfo: 'Some science',
        references: [{ title: 'Reference 1', url: 'http://example.com/ref1' }],
        relatedRemedies: [{ id: 'remedy2', name: 'Related Remedy' }],
        sourceUrl: null,
        evidenceLevel: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = toDetailedRemedy(parsedRemedy, 0.85);

      expect(result.id).toBe('1');
      expect(result.name).toBe('Test Remedy');
      expect(result.matchingNutrients).toEqual(['ingredient1', 'ingredient2']);
      expect(result.similarityScore).toBe(0.85);
      expect(result.usage).toBe('Custom usage');
      expect(result.references).toEqual([{ title: 'Reference 1', url: 'http://example.com/ref1' }]);
    });

    it('should provide default values for missing fields', () => {
      const parsedRemedy: ParsedNaturalRemedy = {
        id: '1',
        name: 'Minimal',
        description: null,
        category: 'herb',
        ingredients: [],
        benefits: [],
        imageUrl: null,
        usage: null,
        dosage: null,
        precautions: null,
        scientificInfo: null,
        references: [],
        relatedRemedies: [],
        sourceUrl: null,
        evidenceLevel: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = toDetailedRemedy(parsedRemedy);

      expect(result.description).toBe('');
      expect(result.imageUrl).toBe('');
      expect(result.usage).toBe('Usage information not available.');
      expect(result.dosage).toBe('Dosage information not available.');
      expect(result.precautions).toBe('Precaution information not available.');
      expect(result.scientificInfo).toBe('Scientific information not available.');
      expect(result.similarityScore).toBe(1.0);
    });
  });

  describe('getAllCategories', () => {
    it('should return unique categories', async () => {
      (mockNaturalRemedy.findMany as Mock).mockResolvedValue([
        { category: 'herb' },
        { category: 'supplement' },
      ]);

      const result = await getAllCategories();

      expect(mockNaturalRemedy.findMany).toHaveBeenCalledWith({
        select: { category: true },
        distinct: ['category'],
      });
      expect(result).toEqual(['herb', 'supplement']);
    });
  });

  describe('getAllEvidenceLevels', () => {
    it('should return unique evidence levels filtering nulls', async () => {
      (mockNaturalRemedy.findMany as Mock).mockResolvedValue([
        { evidenceLevel: 'high' },
        { evidenceLevel: 'moderate' },
        { evidenceLevel: null },
      ]);

      const result = await getAllEvidenceLevels();

      expect(result).toEqual(['high', 'moderate']);
    });
  });

  describe('saveSearchHistory', () => {
    it('should save search with session and user IDs', async () => {
      (mockSearchHistory.create as Mock).mockResolvedValue({
        id: '1',
        query: 'test query',
        resultsCount: 5,
        sessionId: 'session-1',
        userId: 'user-1',
        createdAt: new Date(),
      });

      await saveSearchHistory('test query', 5, 'session-1', 'user-1');

      expect(mockSearchHistory.create).toHaveBeenCalledWith({
        data: {
          query: 'test query',
          resultsCount: 5,
          sessionId: 'session-1',
          userId: 'user-1',
        },
      });
    });
  });

  describe('getPopularSearches', () => {
    it('should return grouped search counts', async () => {
      (mockSearchHistory.groupBy as Mock).mockResolvedValue([
        { query: 'ibuprofen', _count: { query: 10 } },
        { query: 'vitamin d', _count: { query: 8 } },
      ]);

      const result = await getPopularSearches(5);

      expect(result).toEqual([
        { query: 'ibuprofen', count: 10 },
        { query: 'vitamin d', count: 8 },
      ]);
    });
  });

  describe('addFavorite', () => {
    it('should create favorite with all fields', async () => {
      const mockFavoriteResult = {
        id: '1',
        remedyId: 'remedy-1',
        remedyName: 'Turmeric',
        sessionId: 'session-1',
        userId: null,
        notes: 'Good for joints',
        collectionName: 'Pain Relief',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockFavorite.create as Mock).mockResolvedValue(mockFavoriteResult);

      const result = await addFavorite({
        remedyId: 'remedy-1',
        remedyName: 'Turmeric',
        sessionId: 'session-1',
        notes: 'Good for joints',
        collectionName: 'Pain Relief',
      });

      expect(result.remedyName).toBe('Turmeric');
      expect(result.collectionName).toBe('Pain Relief');
    });
  });

  describe('isFavorite', () => {
    it('should return true when favorite exists', async () => {
      (mockFavorite.findFirst as Mock).mockResolvedValue({
        id: '1',
        remedyId: 'remedy-1',
        remedyName: 'Test',
        sessionId: 'session-1',
        userId: null,
        notes: null,
        collectionName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await isFavorite('remedy-1', 'session-1');
      expect(result).toBe(true);
    });

    it('should return false when favorite does not exist', async () => {
      (mockFavorite.findFirst as Mock).mockResolvedValue(null);

      const result = await isFavorite('remedy-1', 'session-1');
      expect(result).toBe(false);
    });
  });

  describe('removeFavorite', () => {
    it('should delete favorite by id', async () => {
      (mockFavorite.delete as Mock).mockResolvedValue({
        id: '1',
        remedyId: 'remedy-1',
        remedyName: 'Test',
        sessionId: null,
        userId: null,
        notes: null,
        collectionName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await removeFavorite('1');

      expect(mockFavorite.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('saveFilterPreferences', () => {
    it('should upsert filter preferences with JSON arrays', async () => {
      const mockResult = {
        id: '1',
        sessionId: 'session-1',
        userId: null,
        categories: '["herb", "supplement"]',
        nutrients: '["vitamin c"]',
        evidenceLevels: '["high"]',
        sortBy: 'name',
        sortOrder: 'asc',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockFilterPreference.upsert as Mock).mockResolvedValue(mockResult);

      const result = await saveFilterPreferences({
        sessionId: 'session-1',
        categories: ['herb', 'supplement'],
        nutrients: ['vitamin c'],
        evidenceLevels: ['high'],
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(result.categories).toEqual(['herb', 'supplement']);
      expect(result.nutrients).toEqual(['vitamin c']);
    });
  });

  describe('disconnect', () => {
    it('should call prisma $disconnect', async () => {
      await disconnect();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
