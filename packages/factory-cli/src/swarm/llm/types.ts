/**
 * LLM Types
 *
 * Types for LLM integration (messages, responses, config, errors)
 */

/**
 * Message LLM (format Anthropic)
 */
export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Réponse LLM avec usage tokens
 */
export interface LLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number; // en USD
  };
  model: string;
  finishReason: 'stop' | 'length' | 'error';
}

/**
 * Configuration LLM
 */
export interface LLMConfig {
  apiKey: string;
  model: 'opus' | 'sonnet' | 'haiku';
  maxTokens?: number; // défaut 4096
  temperature?: number; // défaut 0.3
  timeout?: number; // défaut 60000 ms
}

/**
 * Type pour pricing d'un modèle
 */
export type ModelPricing = { input: number; output: number };

/**
 * Mapping modèles → model IDs Anthropic
 */
export const MODEL_IDS = {
  opus: 'claude-opus-4-20250514',
  sonnet: 'claude-sonnet-3-5-20241022',
  haiku: 'claude-3-5-haiku-20241022',
};

/**
 * Prix par modèle (USD par 1M tokens)
 */
export const MODEL_PRICING = {
  opus: { input: 15, output: 75 },
  sonnet: { input: 3, output: 15 },
  haiku: { input: 1, output: 5 },
};

/**
 * Erreurs LLM structurées
 */
export class LLMError extends Error {
  code: string;
  statusCode?: number;
  retryable: boolean;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    retryable: boolean = false,
  ) {
    super(message);
    this.name = 'LLMError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}
