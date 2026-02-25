/**
 * Bug R7 - Claude Retry Logic Tests
 * Tests for automatic retry on Claude API timeout/failure.
 *
 * OBJECTIVE: Ensure Claude timeouts are retried up to 3 times before failing.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { callClaudeWithRetry } from '../src/migrate/migrate-claude-retry.js';
import type { ClaudeCallOptions } from '../src/migrate/migrate-claude.js';

describe('Bug R7 - Claude Retry Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Retry Mechanism', () => {
    it('should succeed on first attempt if Claude responds', async () => {
      // This test validates happy path (no retry needed)
      const mockClaude = vi.fn().mockResolvedValue({
        output: 'Success response',
        durationMs: 1000,
        tokens: { input: 100, output: 50 },
      });

      const result = await callClaudeWithRetry(mockClaude, {
        prompt: 'Test prompt',
        model: 'haiku',
      });

      // Assert: Called only once (no retries)
      expect(mockClaude).toHaveBeenCalledTimes(1);
      expect(result.output).toBe('Success response');
    });

    it('should retry up to 3 times on timeout', { timeout: 30000 }, async () => {
      // Mock Claude to timeout on first 2 calls, succeed on 3rd
      const mockClaude = vi.fn()
        .mockRejectedValueOnce(new Error('ETIMEDOUT: timeout of 180000ms exceeded'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT: timeout of 180000ms exceeded'))
        .mockResolvedValueOnce({
          output: 'Success after retries',
          durationMs: 2000,
          tokens: { input: 100, output: 50 },
        });

      const result = await callClaudeWithRetry(mockClaude, {
        prompt: 'Test prompt',
        model: 'haiku',
      });

      // Assert: Called 3 times (2 failures + 1 success)
      expect(mockClaude).toHaveBeenCalledTimes(3);
      expect(result.output).toBe('Success after retries');
    });

    it('should throw after 3 failed retries', { timeout: 30000 }, async () => {
      // Mock Claude to always timeout
      const mockClaude = vi.fn().mockRejectedValue(new Error('ETIMEDOUT'));

      // Assert: Should throw after 3 attempts
      await expect(
        callClaudeWithRetry(mockClaude, { prompt: 'Test', model: 'haiku' })
      ).rejects.toThrow('Max retries (3) exceeded');

      // Assert: Called exactly 3 times
      expect(mockClaude).toHaveBeenCalledTimes(3);
    });
  });

  describe('Retry Events & Logging', () => {
    it('should emit retry event on each attempt', { timeout: 30000 }, async () => {
      const capturedEvents: unknown[] = [];
      const onRetry = (attempt: number, error: Error) => {
        capturedEvents.push({ type: 'retry', attempt, error: error.message });
      };

      const mockClaude = vi.fn()
        .mockRejectedValueOnce(new Error('Timeout 1'))
        .mockRejectedValueOnce(new Error('Timeout 2'))
        .mockResolvedValueOnce({ output: 'Success', durationMs: 1000 });

      await callClaudeWithRetry(mockClaude, { prompt: 'Test' }, onRetry);

      // Assert: 2 retry events emitted (attempts 1 and 2 failed)
      expect(capturedEvents.length).toBe(2);
      expect(capturedEvents[0]).toMatchObject({ type: 'retry', attempt: 1 });
      expect(capturedEvents[1]).toMatchObject({ type: 'retry', attempt: 2 });
    });

    it('should wait with exponential backoff between retries', { timeout: 30000 }, async () => {
      const timestamps: number[] = [];

      const mockClaude = vi.fn().mockImplementation(async () => {
        timestamps.push(Date.now());
        if (timestamps.length < 3) throw new Error('ETIMEDOUT');
        return { output: 'Success', durationMs: 1000 };
      });

      await callClaudeWithRetry(mockClaude, { prompt: 'Test' });

      // Assert: 3 calls made
      expect(timestamps.length).toBe(3);

      // Calculate delays between attempts
      const delay1 = timestamps[1] - timestamps[0];
      const delay2 = timestamps[2] - timestamps[1];

      // Exponential backoff: ~5s, ~10s (allowing ±1s margin)
      expect(delay1).toBeGreaterThanOrEqual(4000);
      expect(delay1).toBeLessThanOrEqual(6000);

      expect(delay2).toBeGreaterThanOrEqual(9000);
      expect(delay2).toBeLessThanOrEqual(11000);
    });
  });

  describe('Error Classification', () => {
    it('should NOT retry on non-retryable errors (e.g. invalid API key)', async () => {
      const mockClaude = vi.fn().mockRejectedValue(
        new Error('401 Unauthorized: Invalid API key')
      );

      // Assert: Should throw immediately without retries
      await expect(
        callClaudeWithRetry(mockClaude, { prompt: 'Test' })
      ).rejects.toThrow('401 Unauthorized');

      // Assert: Called only once (no retries for auth errors)
      expect(mockClaude).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors (ECONNRESET, ENOTFOUND)', async () => {
      const mockClaude = vi.fn()
        .mockRejectedValueOnce(new Error('ECONNRESET: Connection reset'))
        .mockResolvedValueOnce({ output: 'Success', durationMs: 1000 });

      const result = await callClaudeWithRetry(mockClaude, { prompt: 'Test' });

      // Assert: Retried after network error
      expect(mockClaude).toHaveBeenCalledTimes(2);
      expect(result.output).toBe('Success');
    });
  });
});
