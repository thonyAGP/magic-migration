/**
 * Token Counter
 *
 * Approximation tokens pour estimation coût
 * Règle : ~4 caractères = 1 token
 *
 * Note: Pour précision maximale, utiliser tiktoken (coût supplémentaire)
 */

export class TokenCounter {
  private readonly CHARS_PER_TOKEN = 4;

  /**
   * Compte tokens approximatifs d'un texte
   */
  count(text: string): number {
    // Approximation simple : 4 chars ≈ 1 token
    return Math.ceil(text.length / this.CHARS_PER_TOKEN);
  }

  /**
   * Compte tokens d'un tableau de messages
   */
  countMessages(messages: Array<{ role: string; content: string }>): number {
    let total = 0;

    for (const message of messages) {
      // Overhead par message : ~4 tokens (role + formatting)
      total += 4;
      total += this.count(message.content);
    }

    // Overhead global : ~3 tokens
    return total + 3;
  }

  /**
   * Calcule coût estimé (USD)
   */
  estimateCost(
    inputTokens: number,
    outputTokens: number,
    pricing: { input: number; output: number },
  ): number {
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }
}
