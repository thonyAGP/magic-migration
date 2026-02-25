/**
 * Claude Retry Logic (Bug R7 fix)
 * Automatic retry with exponential backoff for Claude API calls.
 *
 * Retry policy:
 * - Max 3 attempts
 * - Exponential backoff: 5s, 10s, 20s
 * - Only retries on timeout/network errors (not auth errors)
 */

import type { ClaudeCallOptions, ClaudeCallResult } from './migrate-claude.js';

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [5000, 10000, 20000]; // Exponential backoff

type ClaudeCallFunction = (options: ClaudeCallOptions) => Promise<ClaudeCallResult>;
type OnRetryCallback = (attempt: number, error: Error) => void;

/**
 * Determine if an error is retryable (timeout/network) or not (auth/validation).
 */
const isRetryableError = (error: Error): boolean => {
  const message = error.message.toLowerCase();

  // Retryable: timeout, network errors
  if (message.includes('timeout') || message.includes('etimedout')) return true;
  if (message.includes('econnreset') || message.includes('enotfound')) return true;
  if (message.includes('socket hang up')) return true;

  // Non-retryable: auth, validation errors
  if (message.includes('401') || message.includes('unauthorized')) return false;
  if (message.includes('403') || message.includes('forbidden')) return false;
  if (message.includes('invalid api key')) return false;

  // Default: retry on unknown errors (conservative approach)
  return true;
};

/**
 * Call Claude with automatic retry on timeout/network errors.
 *
 * @param claudeFn - The Claude call function to wrap with retry logic
 * @param options - Claude call options
 * @param onRetry - Optional callback called on each retry (for logging/events)
 * @returns Claude call result after successful attempt
 * @throws Error after MAX_RETRIES attempts
 */
export const callClaudeWithRetry = async (
  claudeFn: ClaudeCallFunction,
  options: ClaudeCallOptions,
  onRetry?: OnRetryCallback,
): Promise<ClaudeCallResult> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await claudeFn(options);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error; // Non-retryable → fail immediately
      }

      // Last attempt exhausted → throw
      if (attempt >= MAX_RETRIES) {
        const msg = `[R7] Max retries (${MAX_RETRIES}) exceeded: ${error.message}`;
        throw new Error(msg);
      }

      // Emit retry event (for logging)
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retry (exponential backoff)
      const delay = RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError ?? new Error('Retry logic failed unexpectedly');
};

/**
 * Sleep utility for testing.
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));
