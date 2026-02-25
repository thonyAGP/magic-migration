/**
 * Tests for Token Tracker cost calculation accuracy.
 * Regression tests for B1 bug: per-program costUsd was growing quadratically.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  updateTokens,
  getTokensData,
  getProgramTokens,
  resetTokens,
} from '../src/server/token-tracker.js';

const TEST_MIG_DIR = path.join(process.cwd(), '.test-migration-cost');

describe('TokenTracker cost accuracy', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_MIG_DIR)) {
      fs.rmSync(TEST_MIG_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_MIG_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_MIG_DIR)) {
      fs.rmSync(TEST_MIG_DIR, { recursive: true });
    }
  });

  it('should compute per-program costUsd linearly across multiple calls (B1 regression)', () => {
    // 3 identical calls to the same program
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1000, output: 500 }, 'sonnet');
    updateTokens(TEST_MIG_DIR, 117, 'store', { input: 1000, output: 500 }, 'sonnet');
    updateTokens(TEST_MIG_DIR, 117, 'api', { input: 1000, output: 500 }, 'sonnet');

    const data = getTokensData(TEST_MIG_DIR);
    const prog = getProgramTokens(TEST_MIG_DIR, 117);

    // Sonnet: $3/M in, $15/M out
    // Single call cost: (1000/1M)*3 + (500/1M)*15 = 0.003 + 0.0075 = 0.0105
    const singleCallCost = (1000 / 1_000_000) * 3 + (500 / 1_000_000) * 15;
    const expectedTotal = singleCallCost * 3;

    // Global cost should equal program cost (only one program)
    expect(data?.global.costUsd).toBeCloseTo(expectedTotal, 6);
    expect(prog?.costUsd).toBeCloseTo(expectedTotal, 6);

    // Program cost MUST equal global cost (same data)
    expect(prog?.costUsd).toBeCloseTo(data!.global.costUsd, 6);
  });

  it('should keep per-program cost consistent with global across 10 calls', () => {
    for (let i = 0; i < 10; i++) {
      updateTokens(TEST_MIG_DIR, 42, 'phase' + i, { input: 500, output: 250 }, 'sonnet');
    }

    const data = getTokensData(TEST_MIG_DIR);
    const prog = getProgramTokens(TEST_MIG_DIR, 42);

    // All calls go to program 42, so global cost == program cost
    expect(prog?.costUsd).toBeCloseTo(data!.global.costUsd, 6);

    // Verify linear growth: cost = 10 * single_call_cost
    const singleCallCost = (500 / 1_000_000) * 3 + (250 / 1_000_000) * 15;
    expect(prog?.costUsd).toBeCloseTo(singleCallCost * 10, 6);
  });

  it('should track per-program cost independently for multiple programs', () => {
    updateTokens(TEST_MIG_DIR, 100, 'types', { input: 1000, output: 500 }, 'sonnet');
    updateTokens(TEST_MIG_DIR, 200, 'types', { input: 2000, output: 1000 }, 'sonnet');
    updateTokens(TEST_MIG_DIR, 100, 'store', { input: 1000, output: 500 }, 'sonnet');

    const prog100 = getProgramTokens(TEST_MIG_DIR, 100);
    const prog200 = getProgramTokens(TEST_MIG_DIR, 200);
    const data = getTokensData(TEST_MIG_DIR);

    const cost100 = ((1000 / 1_000_000) * 3 + (500 / 1_000_000) * 15) * 2;
    const cost200 = (2000 / 1_000_000) * 3 + (1000 / 1_000_000) * 15;

    expect(prog100?.costUsd).toBeCloseTo(cost100, 6);
    expect(prog200?.costUsd).toBeCloseTo(cost200, 6);

    // Sum of per-program costs must equal global
    expect((prog100?.costUsd ?? 0) + (prog200?.costUsd ?? 0)).toBeCloseTo(data!.global.costUsd, 6);
  });

  it('should use opus pricing correctly', () => {
    // Opus: $15/M in, $75/M out
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1_000_000, output: 500_000 }, 'opus');

    const data = getTokensData(TEST_MIG_DIR);
    // (1M/1M)*15 + (0.5M/1M)*75 = 15 + 37.5 = 52.5
    expect(data?.global.costUsd).toBeCloseTo(52.5, 2);
    expect(data?.programs['117'].costUsd).toBeCloseTo(52.5, 2);
  });

  it('should fallback to sonnet pricing for unknown model', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1_000_000, output: 1_000_000 }, 'gpt-4-turbo');

    const data = getTokensData(TEST_MIG_DIR);
    // Sonnet pricing: (1M/1M)*3 + (1M/1M)*15 = 3 + 15 = 18
    expect(data?.global.costUsd).toBeCloseTo(18, 2);
  });
});
