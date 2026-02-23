/**
 * Claude API client wrapper: testable, mockable factory.
 * v4: auto-enrichment of migration contracts via Claude API.
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeClientConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

export interface EnrichedItem {
  id: string;
  type: 'rule' | 'variable' | 'table' | 'callee';
  status: 'IMPL' | 'N/A' | 'PARTIAL' | 'MISSING';
  targetFile: string;
  gapNotes: string;
}

export interface ClaudeResponse {
  items: EnrichedItem[];
  reasoning: string;
  inputTokens: number;
  outputTokens: number;
}

export interface ClaudeClient {
  classify(systemPrompt: string, userPrompt: string): Promise<ClaudeResponse>;
}

export const createClaudeClient = (config: ClaudeClientConfig = {}): ClaudeClient => {
  const apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required (env or --api-key)');

  const client = new Anthropic({ apiKey });
  const model = config.model ?? 'claude-haiku-4-5-20251001';
  const maxTokens = config.maxTokens ?? 2048;

  return {
    async classify(systemPrompt: string, userPrompt: string): Promise<ClaudeResponse> {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('');

      // Extract JSON from response (may be wrapped in ```json blocks)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch?.[1]?.trim() ?? text.trim();

      const parsed = JSON.parse(jsonStr) as { items?: EnrichedItem[]; reasoning?: string };

      return {
        items: parsed.items ?? [],
        reasoning: parsed.reasoning ?? '',
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    },
  };
};
