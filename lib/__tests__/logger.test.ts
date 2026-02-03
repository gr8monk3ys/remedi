/**
 * Unit Tests for Logger Utility
 *
 * Tests structured logging functionality.
 * Note: LOG_LEVEL is cached at module load time, so these tests
 * focus on the behavior within the current test environment.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, createLogger, logRequest, logResponse, createTimer } from '../logger';

// Mock Sentry to prevent actual error reporting
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logger.warn', () => {
    it('should log warning messages', () => {
      logger.warn('Warning message');

      expect(console.warn).toHaveBeenCalled();
      const logOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('[WARN]');
      expect(logOutput).toContain('Warning message');
    });

    it('should include context in warnings', () => {
      logger.warn('Rate limit approaching', { remaining: 5 });

      const logOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('remaining');
      expect(logOutput).toContain('5');
    });
  });

  describe('logger.error', () => {
    it('should log error messages', () => {
      logger.error('Error occurred');

      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('[ERROR]');
      expect(logOutput).toContain('Error occurred');
    });

    it('should include error details when Error object provided', () => {
      const error = new Error('Test error');
      logger.error('Database error', error);

      const logOutput = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('Error');
      expect(logOutput).toContain('Test error');
    });

    it('should include additional context with errors', () => {
      const error = new Error('Connection failed');
      logger.error('Database error', error, { database: 'main', attempt: 3 });

      const logOutput = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('database');
      expect(logOutput).toContain('main');
      expect(logOutput).toContain('attempt');
    });
  });

  describe('createLogger', () => {
    it('should create namespaced logger', () => {
      const log = createLogger('search-api');
      log.warn('Search warning', { query: 'ibuprofen' });

      const logOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('[search-api]');
      expect(logOutput).toContain('Search warning');
      expect(logOutput).toContain('ibuprofen');
    });

    it('should support warn and error levels in namespaced logger', () => {
      const log = createLogger('test-module');

      log.warn('Warn');
      log.error('Error', new Error('Test'));

      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should include namespace in all logged messages', () => {
      const log = createLogger('stripe-webhook');

      log.warn('Retry needed');
      log.error('Event failed');

      const warnOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const errorOutput = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];

      expect(warnOutput).toContain('[stripe-webhook]');
      expect(errorOutput).toContain('[stripe-webhook]');
    });
  });

  describe('logRequest', () => {
    it('should return a request ID', () => {
      const mockRequest = new Request('https://example.com/api/search?q=test');
      const requestId = logRequest(mockRequest);

      expect(requestId).toBeTruthy();
      expect(typeof requestId).toBe('string');
      // UUID format
      expect(requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('logResponse', () => {
    it('should log error level for 5xx status', () => {
      logResponse('test-id', 500);

      expect(console.error).toHaveBeenCalled();
      const logOutput = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('500');
    });

    it('should log warn level for 4xx status', () => {
      logResponse('test-id', 404);

      expect(console.warn).toHaveBeenCalled();
      const logOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('404');
    });
  });

  describe('createTimer', () => {
    it('should return duration in milliseconds', async () => {
      const timer = createTimer('test-operation');

      // Small delay to ensure non-zero duration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const duration = timer.end();

      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Log formatting', () => {
    it('should include timestamp in logs', () => {
      logger.warn('Test message');

      const logOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
      // Timestamp format: [2024-01-15T10:30:00.000Z]
      expect(logOutput).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\]/);
    });

    it('should format context as JSON', () => {
      logger.warn('Test with context', { key: 'value', count: 42 });

      const logOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('"key"');
      expect(logOutput).toContain('"value"');
      expect(logOutput).toContain('42');
    });
  });
});
