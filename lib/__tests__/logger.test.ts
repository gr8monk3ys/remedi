/**
 * Unit Tests for Logger Utility
 *
 * Tests structured logging functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, createLogger } from '../logger';

describe('Logger', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('logger.debug', () => {
    it('should log debug messages in development', () => {
      process.env.NODE_ENV = 'development';

      logger.debug('Debug message');

      expect(console.debug).toHaveBeenCalled();
      const logOutput = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('[DEBUG]');
      expect(logOutput).toContain('Debug message');
    });

    it('should include context in debug logs', () => {
      process.env.NODE_ENV = 'development';

      logger.debug('Debug with context', { userId: '123', action: 'search' });

      expect(console.debug).toHaveBeenCalled();
      const logOutput = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('userId');
      expect(logOutput).toContain('123');
    });
  });

  describe('logger.info', () => {
    it('should log info messages', () => {
      logger.info('Info message');

      expect(console.info).toHaveBeenCalled();
      const logOutput = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('[INFO]');
      expect(logOutput).toContain('Info message');
    });

    it('should include timestamp in logs', () => {
      logger.info('Test message');

      const logOutput = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0];
      // Timestamp format: [2024-01-15T10:30:00.000Z]
      expect(logOutput).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\]/);
    });
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
      expect(logOutput).toContain('errorMessage');
      expect(logOutput).toContain('Test error');
    });

    it('should include stack trace when Error object provided', () => {
      const error = new Error('Test error');
      logger.error('Database error', error);

      const logOutput = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('errorStack');
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
      log.info('Search started', { query: 'ibuprofen' });

      const logOutput = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(logOutput).toContain('[search-api]');
      expect(logOutput).toContain('Search started');
      expect(logOutput).toContain('ibuprofen');
    });

    it('should support all log levels in namespaced logger', () => {
      const log = createLogger('test-module');

      log.debug('Debug');
      log.info('Info');
      log.warn('Warn');
      log.error('Error', new Error('Test'));

      expect(console.debug).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should include namespace in all logs', () => {
      const log = createLogger('stripe-webhook');

      log.debug('Processing event');
      log.info('Event received');
      log.warn('Retry needed');
      log.error('Event failed');

      const debugOutput = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const infoOutput = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const warnOutput = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const errorOutput = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];

      expect(debugOutput).toContain('[stripe-webhook]');
      expect(infoOutput).toContain('[stripe-webhook]');
      expect(warnOutput).toContain('[stripe-webhook]');
      expect(errorOutput).toContain('[stripe-webhook]');
    });
  });

  describe('Log level filtering', () => {
    it('should log all levels in development', () => {
      process.env.NODE_ENV = 'development';

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(console.debug).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
