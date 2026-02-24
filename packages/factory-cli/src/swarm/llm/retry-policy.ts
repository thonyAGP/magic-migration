/**
 * Retry Policy
 *
 * Retry avec exponential backoff pour erreurs temporaires
 */

import { LLMError } from './types.js';

export interface RetryConfig {
  maxRetries: number; // défaut 3
  baseDelayMs: number; // défaut 1000 (1s)
  maxDelayMs: number; // défaut 10000 (10s)
  retryableStatusCodes: number[]; // défaut [429, 500, 502, 503, 504]
}

export class RetryPolicy {
  private readonly config: Required<RetryConfig>;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      baseDelayMs: config.baseDelayMs ?? 1000,
      maxDelayMs: config.maxDelayMs ?? 10000,
      retryableStatusCodes: config.retryableStatusCodes ?? [
        429, 500, 502, 503, 504,
      ],
    };
  }

  /**
   * Exécute une fonction avec retry exponential backoff
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Si dernière tentative, throw
        if (attempt === this.config.maxRetries) {
          throw error;
        }

        // Si erreur non-retryable, throw immédiatement
        if (!this.isRetryable(error)) {
          throw error;
        }

        // Calcul delay avec exponential backoff
        const delayMs = Math.min(
          this.config.baseDelayMs * Math.pow(2, attempt),
          this.config.maxDelayMs,
        );

        console.log(
          `[RetryPolicy] Attempt ${attempt + 1}/${this.config.maxRetries} failed, retrying in ${delayMs}ms...`,
        );

        // Attendre avant retry
        await this.sleep(delayMs);
      }
    }

    // Ne devrait jamais arriver ici
    throw lastError;
  }

  /**
   * Détermine si l'erreur est retryable
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof LLMError) {
      return error.retryable;
    }

    // Erreur réseau générique
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('econnreset')
      );
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
