/**
 * Claude Client
 *
 * Client API Claude avec retry + rate limiting + token counting
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  LLMConfig,
  LLMMessage,
  LLMResponse,
} from './types.js';
import { LLMError, MODEL_IDS, MODEL_PRICING } from './types.js';
import { RetryPolicy } from './retry-policy.js';
import { RateLimiter } from './rate-limiter.js';
import { TokenCounter } from './token-counter.js';

export class ClaudeClient {
  private readonly client: Anthropic;
  private readonly config: Required<LLMConfig>;
  private readonly retryPolicy: RetryPolicy;
  private readonly rateLimiter: RateLimiter;
  private readonly tokenCounter: TokenCounter;
  private readonly modelId: string;
  private readonly pricing: { input: number; output: number };

  constructor(config: LLMConfig) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model,
      maxTokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.3,
      timeout: config.timeout ?? 60000,
    };

    this.client = new Anthropic({
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
    });

    this.retryPolicy = new RetryPolicy();
    this.rateLimiter = new RateLimiter();
    this.tokenCounter = new TokenCounter();

    this.modelId = MODEL_IDS[this.config.model];
    this.pricing = MODEL_PRICING[this.config.model];
  }

  /**
   * Appel API Claude avec retry + rate limiting
   */
  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    // Valider messages
    this.validateMessages(messages);

    // Rate limiting
    await this.rateLimiter.acquire();

    // Appel API avec retry
    const response = await this.retryPolicy.execute(async () => {
      try {
        // Conversion format Anthropic (system prompt séparé)
        const systemPrompt = messages.find((m) => m.role === 'system')?.content;
        const userMessages = messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        const apiResponse = await this.client.messages.create({
          model: this.modelId,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          system: systemPrompt,
          messages: userMessages,
        });

        // Extraire contenu
        const content = apiResponse.content[0];
        if (content.type !== 'text') {
          throw new LLMError('Unexpected content type', 'INVALID_RESPONSE');
        }

        // Calculer coût
        const inputTokens = apiResponse.usage.input_tokens;
        const outputTokens = apiResponse.usage.output_tokens;
        const totalCost = this.tokenCounter.estimateCost(
          inputTokens,
          outputTokens,
          this.pricing,
        );

        // Déterminer finishReason
        let finishReason: 'stop' | 'length' | 'error' = 'stop';
        if (apiResponse.stop_reason === 'max_tokens') {
          finishReason = 'length';
        } else if (apiResponse.stop_reason !== 'end_turn') {
          finishReason = 'error';
        }

        return {
          content: content.text,
          usage: {
            inputTokens,
            outputTokens,
            totalCost,
          },
          model: this.config.model,
          finishReason,
        };
      } catch (error) {
        // Convertir erreurs Anthropic en LLMError
        if (error instanceof Anthropic.APIError) {
          const retryable = error.status === 429 || (error.status ?? 0) >= 500;
          const errorCode = (error as any).type || 'API_ERROR';
          throw new LLMError(
            error.message,
            errorCode,
            error.status,
            retryable,
          );
        }
        throw error;
      }
    });

    return response;
  }

  /**
   * Valide format messages
   */
  private validateMessages(messages: LLMMessage[]): void {
    if (messages.length === 0) {
      throw new LLMError('Messages array cannot be empty', 'INVALID_INPUT');
    }

    for (const message of messages) {
      if (!message.role || !message.content) {
        throw new LLMError('Invalid message format', 'INVALID_INPUT');
      }
      if (!['user', 'assistant', 'system'].includes(message.role)) {
        throw new LLMError(`Invalid role: ${message.role}`, 'INVALID_INPUT');
      }
    }
  }
}
