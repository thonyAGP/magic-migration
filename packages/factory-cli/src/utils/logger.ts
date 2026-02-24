/**
 * Structured logger using Pino.
 * Provides JSON logging in production and pretty output in development.
 * Automatically redacts sensitive fields.
 */

import pino from 'pino';

// ─── Logger Configuration ────────────────────────────────────────────

const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

export const logger = pino({
  level: logLevel,
  // Redact sensitive fields automatically
  redact: {
    paths: [
      'password',
      'pwd',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'anthropicApiKey',
      'creditCard',
      'cvv',
    ],
    remove: true,
  },
  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,
});

// ─── Child Logger Factory ────────────────────────────────────────────

/**
 * Create a child logger with additional context.
 * Use this to add persistent fields like correlationId, programId, phase, etc.
 *
 * @example
 * const log = createLogger({ correlationId: '123', programId: 237, phase: 'extract' });
 * log.info('Processing started');
 * // Output: {"level":30,"time":...,"correlationId":"123","programId":237,"phase":"extract","msg":"Processing started"}
 */
export const createLogger = (context: Record<string, unknown>) => logger.child(context);

// ─── Convenience Functions ───────────────────────────────────────────

/**
 * Log the start of an operation with duration tracking.
 * Returns a function to log the end with elapsed time.
 *
 * @example
 * const endTimer = startTimer({ phase: 'extract', programId: 237 }, 'Program extraction');
 * // ... do work ...
 * endTimer(); // Logs: Program extraction completed in 1234ms
 */
export const startTimer = (
  context: Record<string, unknown>,
  operation: string
): (() => void) => {
  const log = createLogger(context);
  const start = Date.now();

  log.info({ operation }, `${operation} started`);

  return () => {
    const elapsed = Date.now() - start;
    log.info({ operation, elapsed }, `${operation} completed in ${elapsed}ms`);
  };
};

/**
 * Log an error with full stack trace and context.
 *
 * @example
 * try {
 *   // ... code ...
 * } catch (err) {
 *   logError({ programId: 237, phase: 'extract' }, err as Error, 'Failed to extract program');
 * }
 */
export const logError = (
  context: Record<string, unknown>,
  error: Error,
  message: string
): void => {
  const log = createLogger(context);
  log.error(
    {
      err: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    },
    message
  );
};
