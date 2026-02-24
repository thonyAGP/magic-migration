/**
 * Correlation ID middleware for tracing operations across the migration pipeline.
 * Generates unique IDs to track a single migration from start to finish.
 */

import { randomUUID } from 'node:crypto';
import { createLogger } from '../utils/logger.js';

// ─── Correlation Context ─────────────────────────────────────────────

/**
 * Execute a function with a correlation ID in context.
 * The correlation ID is automatically included in all logs.
 *
 * @example
 * const result = await withCorrelation(async (correlationId) => {
 *   const log = createLogger({ correlationId, phase: 'extract' });
 *   log.info('Starting extraction');
 *   // ... do work ...
 *   return data;
 * });
 */
export const withCorrelation = async <T>(
  fn: (correlationId: string) => Promise<T>
): Promise<T> => {
  const correlationId = randomUUID();
  const log = createLogger({ correlationId });

  log.debug({ correlationId }, 'Correlation ID generated');

  try {
    return await fn(correlationId);
  } catch (error) {
    log.error(
      {
        correlationId,
        err: error instanceof Error ? error.message : String(error),
      },
      'Operation failed'
    );
    throw error;
  }
};

/**
 * Execute a synchronous function with a correlation ID.
 *
 * @example
 * const result = withCorrelationSync((correlationId) => {
 *   const log = createLogger({ correlationId });
 *   log.info('Processing');
 *   return processData();
 * });
 */
export const withCorrelationSync = <T>(fn: (correlationId: string) => T): T => {
  const correlationId = randomUUID();
  const log = createLogger({ correlationId });

  log.debug({ correlationId }, 'Correlation ID generated');

  try {
    return fn(correlationId);
  } catch (error) {
    log.error(
      {
        correlationId,
        err: error instanceof Error ? error.message : String(error),
      },
      'Operation failed'
    );
    throw error;
  }
};

/**
 * Create a correlation-aware logger for batch operations.
 * Useful when processing multiple items in parallel.
 *
 * @example
 * const batchLogger = createBatchLogger(correlationId, { batchId: 'B1', batchSize: 25 });
 * for (const program of programs) {
 *   const itemLogger = batchLogger.forItem(program.id);
 *   itemLogger.info('Processing program');
 * }
 */
export const createBatchLogger = (
  correlationId: string,
  batchContext: Record<string, unknown>
) => {
  const baseLogger = createLogger({ correlationId, ...batchContext });

  return {
    logger: baseLogger,
    forItem: (itemId: string | number) =>
      createLogger({ correlationId, ...batchContext, itemId }),
  };
};
