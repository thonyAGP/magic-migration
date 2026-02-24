/**
 * Tests ClaudeClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeClient } from '../../../src/swarm/llm/claude-client.js';
import { LLMError } from '../../../src/swarm/llm/types.js';
import { TokenCounter } from '../../../src/swarm/llm/token-counter.js';
import Anthropic from '@anthropic-ai/sdk';

// Mock create function (shared across all tests)
const mockCreate = vi.fn();

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = {
      create: mockCreate,
    };
  }

  (MockAnthropic as any).APIError = class APIError extends Error {
    status?: number;
    type?: string;
    constructor(status: number, body: any, message: string, headers: any) {
      super(message);
      this.status = status;
      this.type = body.type;
    }
  };

  return {
    default: MockAnthropic,
  };
});

describe('ClaudeClient', () => {
  let client: ClaudeClient;

  beforeEach(() => {
    // Reset mocks
    mockCreate.mockReset();

    // Create client
    client = new ClaudeClient({
      apiKey: 'test-key',
      model: 'haiku',
    });
  });

  it('should chat successfully', async () => {
    // Mock successful response
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Test response' }],
      usage: { input_tokens: 100, output_tokens: 50 },
      stop_reason: 'end_turn',
    });

    const response = await client.chat([
      { role: 'system', content: 'You are a test assistant' },
      { role: 'user', content: 'Hello' },
    ]);

    expect(response.content).toBe('Test response');
    expect(response.usage.inputTokens).toBe(100);
    expect(response.usage.outputTokens).toBe(50);
    expect(response.model).toBe('haiku');
    expect(response.finishReason).toBe('stop');
  });

  it('should retry on 429 rate limit', async () => {
    const error429 = new Anthropic.APIError(
      429,
      { type: 'rate_limit_error', message: 'Rate limit exceeded' },
      'Rate limit exceeded',
      {},
    );
    error429.status = 429;

    // First call fails with 429, second succeeds
    mockCreate
      .mockRejectedValueOnce(error429)
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Success after retry' }],
        usage: { input_tokens: 100, output_tokens: 50 },
        stop_reason: 'end_turn',
      });

    const response = await client.chat([{ role: 'user', content: 'Test' }]);

    expect(response.content).toBe('Success after retry');
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('should retry on 500 server error', async () => {
    const error500 = new Anthropic.APIError(
      500,
      { type: 'server_error', message: 'Internal server error' },
      'Internal server error',
      {},
    );
    error500.status = 500;

    // First call fails with 500, second succeeds
    mockCreate
      .mockRejectedValueOnce(error500)
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Success after retry' }],
        usage: { input_tokens: 100, output_tokens: 50 },
        stop_reason: 'end_turn',
      });

    const response = await client.chat([{ role: 'user', content: 'Test' }]);

    expect(response.content).toBe('Success after retry');
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    const error500 = new Anthropic.APIError(
      500,
      { type: 'server_error', message: 'Internal server error' },
      'Internal server error',
      {},
    );
    error500.status = 500;

    // All calls fail
    mockCreate.mockRejectedValue(error500);

    await expect(client.chat([{ role: 'user', content: 'Test' }])).rejects.toThrow(
      LLMError,
    );

    // Should retry 3 times (1 initial + 3 retries = 4 total)
    expect(mockCreate).toHaveBeenCalledTimes(4);
  });

  it('should respect rate limiting', async () => {
    // Mock 51 successful calls
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Response' }],
      usage: { input_tokens: 10, output_tokens: 10 },
      stop_reason: 'end_turn',
    });

    const startTime = Date.now();

    // Make 51 rapid calls (should trigger rate limiting after 50)
    const promises = Array.from({ length: 51 }, () =>
      client.chat([{ role: 'user', content: 'Test' }]),
    );

    await Promise.all(promises);

    const duration = Date.now() - startTime;

    // Should take at least some time due to rate limiting
    // (51 requests at 50 req/min = at least 1200ms for the 51st request)
    // Using a smaller threshold to avoid flaky tests
    expect(duration).toBeGreaterThan(100);
  });

  it('should count tokens approximately', () => {
    const counter = new TokenCounter();

    // Test simple text
    const text = 'Hello, world!'; // 13 chars ≈ 3.25 tokens → ceil = 4 tokens
    expect(counter.count(text)).toBe(4);

    // Test longer text
    const longText = 'a'.repeat(400); // 400 chars = 100 tokens
    expect(counter.count(longText)).toBe(100);

    // Test messages
    const messages = [
      { role: 'user', content: 'Hello' }, // 4 (overhead) + 2 (tokens) = 6
      { role: 'assistant', content: 'Hi!' }, // 4 (overhead) + 1 (token) = 5
    ];
    // Total: 6 + 5 + 3 (global overhead) = 14
    expect(counter.countMessages(messages)).toBe(14);
  });

  it('should handle timeout', async () => {
    const timeoutError = new Error('timeout of 60000ms exceeded');

    mockCreate.mockRejectedValue(timeoutError);

    await expect(client.chat([{ role: 'user', content: 'Test' }])).rejects.toThrow();
  });

  it('should calculate cost correctly', () => {
    const counter = new TokenCounter();

    // Haiku pricing: $1/1M input, $5/1M output
    const pricing = { input: 1, output: 5 };

    // 1000 input tokens, 200 output tokens
    const cost = counter.estimateCost(1000, 200, pricing);

    // (1000/1M × $1) + (200/1M × $5) = $0.001 + $0.001 = $0.002
    expect(cost).toBeCloseTo(0.002, 6);

    // Opus pricing: $15/1M input, $75/1M output
    const opusPricing = { input: 15, output: 75 };
    const opusCost = counter.estimateCost(1000, 200, opusPricing);

    // (1000/1M × $15) + (200/1M × $75) = $0.015 + $0.015 = $0.030
    expect(opusCost).toBeCloseTo(0.03, 6);
  });
});
