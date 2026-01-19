/**
 * Unit Tests for CSRF Protection Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  generateCSRFToken,
  requiresCSRFValidation,
  shouldSkipCSRF,
} from '../csrf';

describe('CSRF Protection Utilities', () => {
  describe('generateCSRFToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateCSRFToken();
      expect(token).toHaveLength(64); // 32 bytes * 2 hex chars
    });

    it('should only contain valid hex characters', () => {
      const token = generateCSRFToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate unique tokens on each call', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      const token3 = generateCSRFToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });
  });

  describe('requiresCSRFValidation', () => {
    it('should return true for state-changing methods', () => {
      expect(requiresCSRFValidation('POST')).toBe(true);
      expect(requiresCSRFValidation('PUT')).toBe(true);
      expect(requiresCSRFValidation('DELETE')).toBe(true);
      expect(requiresCSRFValidation('PATCH')).toBe(true);
    });

    it('should return true for lowercase method names', () => {
      expect(requiresCSRFValidation('post')).toBe(true);
      expect(requiresCSRFValidation('put')).toBe(true);
      expect(requiresCSRFValidation('delete')).toBe(true);
      expect(requiresCSRFValidation('patch')).toBe(true);
    });

    it('should return false for safe methods', () => {
      expect(requiresCSRFValidation('GET')).toBe(false);
      expect(requiresCSRFValidation('HEAD')).toBe(false);
      expect(requiresCSRFValidation('OPTIONS')).toBe(false);
    });
  });

  describe('shouldSkipCSRF', () => {
    it('should skip NextAuth routes', () => {
      expect(shouldSkipCSRF('/api/auth/signin')).toBe(true);
      expect(shouldSkipCSRF('/api/auth/signout')).toBe(true);
      expect(shouldSkipCSRF('/api/auth/callback/google')).toBe(true);
      expect(shouldSkipCSRF('/api/auth/session')).toBe(true);
    });

    it('should not skip regular API routes', () => {
      expect(shouldSkipCSRF('/api/search')).toBe(false);
      expect(shouldSkipCSRF('/api/favorites')).toBe(false);
      expect(shouldSkipCSRF('/api/remedy/123')).toBe(false);
    });

    it('should not skip non-API routes', () => {
      expect(shouldSkipCSRF('/')).toBe(false);
      expect(shouldSkipCSRF('/remedy/123')).toBe(false);
      expect(shouldSkipCSRF('/search')).toBe(false);
    });
  });
});
