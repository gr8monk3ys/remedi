/**
 * Unit Tests for API Validation Schemas
 *
 * Tests all Zod validation schemas in lib/validations/api.ts
 */

import { describe, it, expect } from 'vitest';
import {
  searchQuerySchema,
  remedyIdSchema,
  paginationSchema,
  searchFiltersSchema,
  searchRequestSchema,
  remedyDetailRequestSchema,
  sessionIdSchema,
  saveSearchHistorySchema,
  getSearchHistorySchema,
  addFavoriteSchema,
  updateFavoriteSchema,
  getFavoritesSchema,
  deleteFavoriteSchema,
  saveFilterPreferencesSchema,
  getFilterPreferencesSchema,
  validateQueryParams,
  getValidationErrorMessage,
} from '../validations/api';
import { z } from 'zod';

describe('API Validation Schemas', () => {
  describe('searchQuerySchema', () => {
    it('should accept valid queries', () => {
      const result = searchQuerySchema.safeParse({ query: 'ibuprofen' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('ibuprofen');
      }
    });

    it('should trim whitespace from queries', () => {
      const result = searchQuerySchema.safeParse({ query: '  aspirin  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('aspirin');
      }
    });

    it('should reject empty queries', () => {
      const result = searchQuerySchema.safeParse({ query: '' });
      expect(result.success).toBe(false);
    });

    it('should reject queries that are too long', () => {
      const longQuery = 'a'.repeat(101);
      const result = searchQuerySchema.safeParse({ query: longQuery });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('too long');
      }
    });

    it('should reject queries with script tags', () => {
      const result = searchQuerySchema.safeParse({ query: '<script>alert(1)</script>' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('invalid characters');
      }
    });

    it('should reject queries with javascript: protocol', () => {
      const result = searchQuerySchema.safeParse({ query: 'javascript:void(0)' });
      expect(result.success).toBe(false);
    });

    it('should reject non-string queries', () => {
      const result = searchQuerySchema.safeParse({ query: 123 });
      expect(result.success).toBe(false);
    });

    it('should reject missing query', () => {
      const result = searchQuerySchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('remedyIdSchema', () => {
    it('should accept valid UUID format', () => {
      const result = remedyIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
      expect(result.success).toBe(true);
    });

    it('should accept valid slug format', () => {
      const result = remedyIdSchema.safeParse('turmeric-root');
      expect(result.success).toBe(true);
    });

    it('should accept slug with underscores', () => {
      const result = remedyIdSchema.safeParse('white_willow_bark');
      expect(result.success).toBe(true);
    });

    it('should accept numeric slugs', () => {
      const result = remedyIdSchema.safeParse('remedy123');
      expect(result.success).toBe(true);
    });

    it('should reject uppercase slugs', () => {
      const result = remedyIdSchema.safeParse('UPPERCASE');
      expect(result.success).toBe(false);
    });

    it('should reject special characters', () => {
      const result = remedyIdSchema.safeParse('remedy@123');
      expect(result.success).toBe(false);
    });

    it('should reject script injection', () => {
      const result = remedyIdSchema.safeParse('<script>alert(1)</script>');
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should accept valid pagination parameters', () => {
      const result = paginationSchema.safeParse({ page: 1, pageSize: 10 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(10);
      }
    });

    it('should use default values when not provided', () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(10);
      }
    });

    it('should reject page less than 1', () => {
      const result = paginationSchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject negative page', () => {
      const result = paginationSchema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });

    it('should reject page greater than 1000', () => {
      const result = paginationSchema.safeParse({ page: 1001 });
      expect(result.success).toBe(false);
    });

    it('should reject pageSize greater than 100', () => {
      const result = paginationSchema.safeParse({ pageSize: 101 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer page', () => {
      const result = paginationSchema.safeParse({ page: 1.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('searchFiltersSchema', () => {
    it('should accept valid filters', () => {
      const result = searchFiltersSchema.safeParse({
        categories: ['herb', 'supplement'],
        evidenceLevel: 'Strong',
        minSimilarity: 0.8,
      });
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const result = searchFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.evidenceLevel).toBe('All');
        expect(result.data.minSimilarity).toBe(0.6);
      }
    });

    it('should reject invalid evidence levels', () => {
      const result = searchFiltersSchema.safeParse({ evidenceLevel: 'Invalid' });
      expect(result.success).toBe(false);
    });

    it('should reject minSimilarity greater than 1', () => {
      const result = searchFiltersSchema.safeParse({ minSimilarity: 1.5 });
      expect(result.success).toBe(false);
    });

    it('should reject negative minSimilarity', () => {
      const result = searchFiltersSchema.safeParse({ minSimilarity: -0.1 });
      expect(result.success).toBe(false);
    });

    it('should filter empty category strings', () => {
      const result = searchFiltersSchema.safeParse({
        categories: ['herb', '', 'supplement', ''],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categories).toEqual(['herb', 'supplement']);
      }
    });
  });

  describe('searchRequestSchema', () => {
    it('should combine search query with filters', () => {
      const result = searchRequestSchema.safeParse({
        query: 'ibuprofen',
        page: 2,
        evidenceLevel: 'Strong',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('ibuprofen');
        expect(result.data.page).toBe(2);
        expect(result.data.evidenceLevel).toBe('Strong');
      }
    });

    it('should reject when query is missing', () => {
      const result = searchRequestSchema.safeParse({ page: 1 });
      expect(result.success).toBe(false);
    });
  });

  describe('remedyDetailRequestSchema', () => {
    it('should accept valid remedy detail request', () => {
      const result = remedyDetailRequestSchema.safeParse({
        id: 'turmeric',
        includeRelated: true,
      });
      expect(result.success).toBe(true);
    });

    it('should default includeRelated to true', () => {
      const result = remedyDetailRequestSchema.safeParse({ id: 'turmeric' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeRelated).toBe(true);
      }
    });
  });

  describe('sessionIdSchema', () => {
    it('should accept valid UUID session ID', () => {
      const result = sessionIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const result = sessionIdSchema.safeParse('not-a-valid-uuid');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = sessionIdSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('saveSearchHistorySchema', () => {
    it('should accept valid search history data', () => {
      const result = saveSearchHistorySchema.safeParse({
        query: 'turmeric',
        resultsCount: 5,
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('should accept without optional fields', () => {
      const result = saveSearchHistorySchema.safeParse({
        query: 'ginger',
        resultsCount: 10,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative results count', () => {
      const result = saveSearchHistorySchema.safeParse({
        query: 'test',
        resultsCount: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject query too long', () => {
      const result = saveSearchHistorySchema.safeParse({
        query: 'a'.repeat(101),
        resultsCount: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('getSearchHistorySchema', () => {
    it('should accept valid parameters', () => {
      const result = getSearchHistorySchema.safeParse({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        limit: 20,
      });
      expect(result.success).toBe(true);
    });

    it('should default limit to 10', () => {
      const result = getSearchHistorySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
      }
    });

    it('should reject limit greater than 100', () => {
      const result = getSearchHistorySchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });
  });

  describe('addFavoriteSchema', () => {
    it('should accept valid favorite data', () => {
      const result = addFavoriteSchema.safeParse({
        remedyId: 'turmeric',
        remedyName: 'Turmeric',
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        notes: 'Good for joint pain',
        collectionName: 'Pain Relief',
      });
      expect(result.success).toBe(true);
    });

    it('should accept minimal required fields', () => {
      const result = addFavoriteSchema.safeParse({
        remedyId: 'ginger',
        remedyName: 'Ginger',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty remedy name', () => {
      const result = addFavoriteSchema.safeParse({
        remedyId: 'test',
        remedyName: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject remedy name too long', () => {
      const result = addFavoriteSchema.safeParse({
        remedyId: 'test',
        remedyName: 'a'.repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it('should reject notes too long', () => {
      const result = addFavoriteSchema.safeParse({
        remedyId: 'test',
        remedyName: 'Test',
        notes: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateFavoriteSchema', () => {
    it('should accept valid update data', () => {
      const result = updateFavoriteSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        notes: 'Updated notes',
        collectionName: 'New Collection',
      });
      expect(result.success).toBe(true);
    });

    it('should require valid UUID for id', () => {
      const result = updateFavoriteSchema.safeParse({
        id: 'not-a-uuid',
        notes: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('getFavoritesSchema', () => {
    it('should accept all parameters', () => {
      const result = getFavoritesSchema.safeParse({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
        collectionName: 'Pain Relief',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = getFavoritesSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('deleteFavoriteSchema', () => {
    it('should accept valid UUID', () => {
      const result = deleteFavoriteSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = deleteFavoriteSchema.safeParse({
        id: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('saveFilterPreferencesSchema', () => {
    it('should accept valid filter preferences', () => {
      const result = saveFilterPreferencesSchema.safeParse({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        categories: ['herb', 'supplement'],
        nutrients: ['vitamin c', 'zinc'],
        evidenceLevels: ['Strong', 'Moderate'],
        sortBy: 'similarity',
        sortOrder: 'desc',
      });
      expect(result.success).toBe(true);
    });

    it('should reject too many categories', () => {
      const categories = Array(51).fill('category');
      const result = saveFilterPreferencesSchema.safeParse({ categories });
      expect(result.success).toBe(false);
    });

    it('should reject invalid evidence levels', () => {
      const result = saveFilterPreferencesSchema.safeParse({
        evidenceLevels: ['Invalid'],
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid sortBy values', () => {
      const sortByValues = ['similarity', 'name', 'category', 'evidenceLevel'];
      for (const sortBy of sortByValues) {
        const result = saveFilterPreferencesSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid sortBy', () => {
      const result = saveFilterPreferencesSchema.safeParse({ sortBy: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('getFilterPreferencesSchema', () => {
    it('should accept session and user IDs', () => {
      const result = getFilterPreferencesSchema.safeParse({
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('validateQueryParams', () => {
    it('should parse valid URLSearchParams', () => {
      const params = new URLSearchParams('query=ibuprofen');
      const result = validateQueryParams(params, searchQuerySchema);

      expect(result).not.toBeNull();
      expect(result?.query).toBe('ibuprofen');
    });

    it('should return null for invalid params', () => {
      const params = new URLSearchParams('query=');
      const result = validateQueryParams(params, searchQuerySchema);

      expect(result).toBeNull();
    });

    it('should handle multiple values for same key', () => {
      const params = new URLSearchParams('category=herb&category=supplement');
      const schema = z.object({
        category: z.array(z.string()).optional(),
      });
      const result = validateQueryParams(params, schema);

      expect(result).not.toBeNull();
      expect(result?.category).toEqual(['herb', 'supplement']);
    });
  });

  describe('getValidationErrorMessage', () => {
    it('should return formatted error message with field', () => {
      const result = searchQuerySchema.safeParse({ query: '' });
      expect(result.success).toBe(false);

      if (!result.success) {
        const message = getValidationErrorMessage(result.error);
        expect(message).toContain('query');
      }
    });

    it('should handle errors without path', () => {
      const schema = z.string().min(1);
      const result = schema.safeParse('');
      expect(result.success).toBe(false);

      if (!result.success) {
        const message = getValidationErrorMessage(result.error);
        expect(message).toBeTruthy();
      }
    });

    it('should return default message for empty issues', () => {
      // Create a ZodError with no issues
      const zodError = new z.ZodError([]);
      const message = getValidationErrorMessage(zodError);
      expect(message).toBe('Validation failed');
    });
  });
});
