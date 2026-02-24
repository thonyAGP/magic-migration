/**
 * Tests for the structured logger.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture logs for assertions
const logs: Array<{ level: string; msg: string; context?: Record<string, unknown> }> = [];

// Create mock logger factory
const createMockLogger = () => {
  const mock = {
    info: vi.fn((context: unknown, msg?: string) => {
      logs.push({ level: 'info', msg: typeof context === 'string' ? context : msg ?? '', context: typeof context === 'object' ? context as Record<string, unknown> : undefined });
    }),
    debug: vi.fn((context: unknown, msg?: string) => {
      logs.push({ level: 'debug', msg: typeof context === 'string' ? context : msg ?? '', context: typeof context === 'object' ? context as Record<string, unknown> : undefined });
    }),
    warn: vi.fn((context: unknown, msg?: string) => {
      logs.push({ level: 'warn', msg: typeof context === 'string' ? context : msg ?? '', context: typeof context === 'object' ? context as Record<string, unknown> : undefined });
    }),
    error: vi.fn((context: unknown, msg?: string) => {
      logs.push({ level: 'error', msg: typeof context === 'string' ? context : msg ?? '', context: typeof context === 'object' ? context as Record<string, unknown> : undefined });
    }),
    child: vi.fn(() => mock),
  };
  return mock;
};

const mockPinoLogger = createMockLogger();

// Mock pino to use our test logger
vi.mock('pino', () => ({
  default: vi.fn(() => mockPinoLogger),
}));

// Now import modules after mocks are set up
const { createLogger, startTimer, logError } = await import('../src/utils/logger.js');
const { withCorrelation, createBatchLogger } = await import('../src/core/correlation.js');

describe('Logger', () => {
  beforeEach(() => {
    logs.length = 0;
    vi.clearAllMocks();
  });

  describe('createLogger', () => {
    it('should create child logger with context', () => {
      const log = createLogger({ component: 'test', programId: 237 });
      expect(log).toBeDefined();
      expect(mockPinoLogger.child).toHaveBeenCalledWith({ component: 'test', programId: 237 });
    });

    it('should log structured messages', () => {
      const log = createLogger({ component: 'test' });
      log.info({ programId: 237 }, 'Processing program');

      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'info',
        msg: 'Processing program',
        context: { programId: 237 },
      });
    });

    it('should log at different levels', () => {
      const log = createLogger({ component: 'test' });

      log.debug('Debug message');
      log.info('Info message');
      log.warn('Warning message');
      log.error('Error message');

      expect(logs).toHaveLength(4);
      expect(logs.map(l => l.level)).toEqual(['debug', 'info', 'warn', 'error']);
    });
  });

  describe('startTimer', () => {
    it('should log start and end with elapsed time', async () => {
      const endTimer = startTimer({ programId: 237 }, 'Extract program');

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));

      endTimer();

      expect(logs).toHaveLength(2);
      expect(logs[0].msg).toContain('started');
      expect(logs[1].msg).toContain('completed in');
      expect(logs[1].context).toHaveProperty('elapsed');
    });
  });

  describe('logError', () => {
    it('should log error with stack trace', () => {
      const error = new Error('Test error');
      logError({ programId: 237 }, error, 'Operation failed');

      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: 'error',
        msg: 'Operation failed',
      });
      expect(logs[0].context).toHaveProperty('err');
      const err = (logs[0].context as { err: { message: string; stack?: string } }).err;
      expect(err.message).toBe('Test error');
      expect(err.stack).toBeDefined();
    });
  });

  describe('withCorrelation', () => {
    it('should generate correlation ID and pass to function', async () => {
      let capturedId = '';

      await withCorrelation(async (correlationId) => {
        capturedId = correlationId;
        const log = createLogger({ correlationId });
        log.info('Processing');
        return 'result';
      });

      expect(capturedId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(logs.some(l => l.msg.includes('Correlation ID generated'))).toBe(true);
    });

    it('should log errors and re-throw', async () => {
      await expect(
        withCorrelation(async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');

      expect(logs.some(l => l.level === 'error' && l.msg === 'Operation failed')).toBe(true);
    });
  });

  describe('createBatchLogger', () => {
    it('should create logger with batch context', () => {
      const batchLogger = createBatchLogger('correlation-123', {
        batchId: 'B2',
        batchSize: 25,
      });

      expect(batchLogger.logger).toBeDefined();
      expect(mockPinoLogger.child).toHaveBeenCalledWith({
        correlationId: 'correlation-123',
        batchId: 'B2',
        batchSize: 25,
      });
    });

    it('should create item-specific loggers', () => {
      const batchLogger = createBatchLogger('correlation-123', { batchId: 'B2' });
      const itemLogger = batchLogger.forItem(237);

      expect(itemLogger).toBeDefined();
      expect(mockPinoLogger.child).toHaveBeenCalledWith(
        expect.objectContaining({
          correlationId: 'correlation-123',
          batchId: 'B2',
          itemId: 237,
        })
      );
    });
  });
});
