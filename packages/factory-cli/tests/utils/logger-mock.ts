/**
 * Logger mock for tests.
 * Use this to prevent log spam during test runs.
 */

import { vi } from 'vitest';

export const mockLogger = {
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn(() => mockLogger),
};

export const mockCreateLogger = vi.fn(() => mockLogger);
export const mockLogError = vi.fn();
export const mockStartTimer = vi.fn(() => vi.fn());
export const mockWithCorrelation = vi.fn(async (fn) => {
  return fn('mock-correlation-id');
});

/**
 * Setup logger mocks for all tests in a suite.
 *
 * @example
 * import { setupLoggerMocks } from '../tests/utils/logger-mock.js';
 *
 * describe('MyModule', () => {
 *   setupLoggerMocks();
 *
 *   it('should do something', () => {
 *     // ... test code ...
 *   });
 * });
 */
export const setupLoggerMocks = () => {
  vi.mock('../src/utils/logger.js', () => ({
    logger: mockLogger,
    createLogger: mockCreateLogger,
    logError: mockLogError,
    startTimer: mockStartTimer,
  }));

  vi.mock('../src/core/correlation.js', () => ({
    withCorrelation: mockWithCorrelation,
    withCorrelationSync: vi.fn((fn) => fn('mock-correlation-id')),
    createBatchLogger: vi.fn(() => ({
      logger: mockLogger,
      forItem: vi.fn(() => mockLogger),
    })),
  }));
};

/**
 * Reset all logger mock call counts between tests.
 *
 * @example
 * afterEach(() => {
 *   resetLoggerMocks();
 * });
 */
export const resetLoggerMocks = () => {
  mockLogger.info.mockClear();
  mockLogger.debug.mockClear();
  mockLogger.warn.mockClear();
  mockLogger.error.mockClear();
  mockLogger.child.mockClear();
  mockCreateLogger.mockClear();
  mockLogError.mockClear();
  mockStartTimer.mockClear();
  mockWithCorrelation.mockClear();
};
