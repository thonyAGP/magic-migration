/**
 * Rate Limiter
 *
 * Token bucket rate limiting (50 requêtes/minute par défaut)
 */

export interface RateLimiterConfig {
  requestsPerMinute: number; // défaut 50
  burstSize: number; // défaut 10 (allow burst)
}

export class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens/ms
  private lastRefill: number;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    const requestsPerMinute = config.requestsPerMinute ?? 50;
    const burstSize = config.burstSize ?? 10;

    this.maxTokens = requestsPerMinute;
    this.tokens = this.maxTokens;
    this.refillRate = requestsPerMinute / 60000; // tokens per ms
    this.lastRefill = Date.now();
  }

  /**
   * Acquérir un token (bloque si nécessaire)
   */
  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculer temps d'attente nécessaire
    const tokensNeeded = 1 - this.tokens;
    const waitMs = tokensNeeded / this.refillRate;

    console.log(
      `[RateLimiter] Rate limit reached, waiting ${Math.ceil(waitMs)}ms...`,
    );

    await this.sleep(waitMs);
    this.refill();
    this.tokens -= 1;
  }

  /**
   * Refill tokens selon temps écoulé
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.tokens + tokensToAdd, this.maxTokens);
    this.lastRefill = now;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset le rate limiter (pour tests)
   */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}
