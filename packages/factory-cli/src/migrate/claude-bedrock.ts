/**
 * AWS Bedrock client for Claude API calls.
 * Uses AWS Bearer Token authentication for Bedrock API.
 */

import type { ClaudeCallResult } from './migrate-claude.js';

interface BedrockConfig {
  region: string;
  bearerToken: string;
}

interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BedrockRequest {
  anthropic_version: string;
  max_tokens: number;
  messages: BedrockMessage[];
}

interface BedrockResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/** Get Bedrock configuration from environment variables. */
export const getBedrockConfig = (): BedrockConfig | null => {
  const region = process.env.AWS_REGION;
  const bearerToken = process.env.AWS_BEARER_TOKEN_BEDROCK;

  if (!region || !bearerToken) {
    return null;
  }

  return { region, bearerToken };
};

/** Map short model name to Bedrock model ID (cross-region `us.` prefix required). */
const resolveBedrockModelId = (shortName?: string): string => {
  const modelMap: Record<string, string> = {
    haiku: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
    sonnet: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    opus: 'us.anthropic.claude-opus-4-20250514-v1:0',
  };

  return modelMap[shortName ?? 'haiku'] ?? modelMap.haiku;
};

/** Call Claude via AWS Bedrock. */
export const callClaudeBedrock = async (
  prompt: string,
  model?: string,
): Promise<ClaudeCallResult> => {
  const config = getBedrockConfig();
  if (!config) {
    throw new Error('AWS Bedrock not configured. Set AWS_REGION and AWS_BEARER_TOKEN_BEDROCK environment variables.');
  }

  const modelId = resolveBedrockModelId(model);
  const start = Date.now();

  const requestBody: BedrockRequest = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  };

  const url = `https://bedrock-runtime.${config.region}.amazonaws.com/model/${encodeURIComponent(modelId)}/invoke`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${config.bearerToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bedrock API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as BedrockResponse;

  const text = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  const tokens = data.usage
    ? { input: data.usage.input_tokens, output: data.usage.output_tokens }
    : undefined;

  return {
    output: text.trim(),
    durationMs: Date.now() - start,
    tokens,
  };
};
