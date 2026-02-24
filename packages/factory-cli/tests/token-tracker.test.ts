/**
 * Tests for Token Tracker - token usage aggregation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  updateTokens,
  updateBatchTokens,
  getTokensData,
  getBatchTokens,
  getProgramTokens,
  formatTokenCount,
  resetTokens,
} from '../src/server/token-tracker.js';

const TEST_MIG_DIR = path.join(process.cwd(), '.test-migration');

describe('TokenTracker', () => {
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

  it('should initialize tokens.json if not exists', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1000, output: 500 });

    const tokensFile = path.join(TEST_MIG_DIR, 'tokens.json');
    expect(fs.existsSync(tokensFile)).toBe(true);

    const data = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
    expect(data.global.input).toBe(1000);
    expect(data.global.output).toBe(500);
    expect(data.global.totalCalls).toBe(1);
  });

  it('should increment input/output tokens correctly', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1000, output: 500 });
    updateTokens(TEST_MIG_DIR, 117, 'store', { input: 1500, output: 700 });

    const data = getTokensData(TEST_MIG_DIR);
    expect(data?.global.input).toBe(2500);
    expect(data?.global.output).toBe(1200);
    expect(data?.global.totalCalls).toBe(2);
  });

  it('should track tokens per batch and program', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1000, output: 500 }, 'sonnet');
    updateBatchTokens(TEST_MIG_DIR, 'B2', 'types', { input: 1000, output: 500 });

    const data = getTokensData(TEST_MIG_DIR);
    expect(data?.programs['117']).toMatchObject({ input: 1000, output: 500 });
    expect(data?.batches['B2']).toMatchObject({ input: 1000, output: 500 });
  });

  it('should calculate cost in USD correctly', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1_000_000, output: 500_000 }, 'sonnet');

    const data = getTokensData(TEST_MIG_DIR);
    // Sonnet: $3/M in, $15/M out
    // Expected: (1M/1M)*3 + (0.5M/1M)*15 = 3 + 7.5 = 10.5
    expect(data?.global.costUsd).toBeCloseTo(10.5, 2);
  });

  it('should track per-phase tokens in batch', () => {
    updateBatchTokens(TEST_MIG_DIR, 'B2', 'types', { input: 1000, output: 500 });
    updateBatchTokens(TEST_MIG_DIR, 'B2', 'store', { input: 1500, output: 700 });
    updateBatchTokens(TEST_MIG_DIR, 'B2', 'types', { input: 800, output: 400 });

    const batch = getBatchTokens(TEST_MIG_DIR, 'B2');
    expect(batch?.perPhase['types']).toEqual({ input: 1800, output: 900 });
    expect(batch?.perPhase['store']).toEqual({ input: 1500, output: 700 });
  });

  it('should return null for non-existent program', () => {
    const tokens = getProgramTokens(TEST_MIG_DIR, 999);
    expect(tokens).toBeNull();
  });

  it('should return null for non-existent batch', () => {
    const tokens = getBatchTokens(TEST_MIG_DIR, 'B99');
    expect(tokens).toBeNull();
  });

  it('should format token count correctly', () => {
    expect(formatTokenCount(500)).toBe('500');
    expect(formatTokenCount(1500)).toBe('1.5K');
    expect(formatTokenCount(50_000)).toBe('50.0K');
    expect(formatTokenCount(1_500_000)).toBe('1.5M');
    expect(formatTokenCount(2_300_000)).toBe('2.3M');
  });

  it('should persist tokens across multiple updates', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1000, output: 500 });
    updateTokens(TEST_MIG_DIR, 125, 'types', { input: 2000, output: 1000 });
    updateTokens(TEST_MIG_DIR, 237, 'store', { input: 1500, output: 800 });

    const data = getTokensData(TEST_MIG_DIR);
    expect(data?.global.totalCalls).toBe(3);
    expect(data?.programs).toHaveProperty('117');
    expect(data?.programs).toHaveProperty('125');
    expect(data?.programs).toHaveProperty('237');
  });

  it('should reset tokens correctly', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1000, output: 500 });
    resetTokens(TEST_MIG_DIR, 'ADH');

    const data = getTokensData(TEST_MIG_DIR);
    expect(data?.global).toMatchObject({ input: 0, output: 0, costUsd: 0, totalCalls: 0 });
    expect(Object.keys(data?.programs ?? {})).toHaveLength(0);
  });

  it('should handle different model pricing', () => {
    // Haiku: $0.25/M in, $1.25/M out
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1_000_000, output: 1_000_000 }, 'haiku');

    const data = getTokensData(TEST_MIG_DIR);
    // Expected: (1M/1M)*0.25 + (1M/1M)*1.25 = 0.25 + 1.25 = 1.5
    expect(data?.global.costUsd).toBeCloseTo(1.5, 2);
  });

  it('should aggregate program tokens correctly', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 1000, output: 500 });
    updateTokens(TEST_MIG_DIR, 117, 'store', { input: 1500, output: 700 });
    updateTokens(TEST_MIG_DIR, 117, 'api', { input: 800, output: 400 });

    const prog = getProgramTokens(TEST_MIG_DIR, 117);
    expect(prog?.input).toBe(3300);
    expect(prog?.output).toBe(1600);
  });
});
