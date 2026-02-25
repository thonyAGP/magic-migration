/**
 * Tests for Token Tracker - batch tokens, edge cases, and robustness.
 * Covers: updateBatchTokens, getTokensData error cases, formatTokenCount edges, resetTokens.
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

const TEST_MIG_DIR = path.join(process.cwd(), '.test-migration-batch');

describe('TokenTracker batch & robustness', () => {
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

  it('should persist perPhase data via updateBatchTokens', () => {
    updateBatchTokens(TEST_MIG_DIR, 'B3', 'types', { input: 2000, output: 1000 });

    const batch = getBatchTokens(TEST_MIG_DIR, 'B3');
    expect(batch).not.toBeNull();
    expect(batch!.input).toBe(2000);
    expect(batch!.output).toBe(1000);
    expect(batch!.perPhase['types']).toEqual({ input: 2000, output: 1000 });
  });

  it('should accumulate across multiple phases in updateBatchTokens', () => {
    updateBatchTokens(TEST_MIG_DIR, 'B3', 'types', { input: 1000, output: 500 });
    updateBatchTokens(TEST_MIG_DIR, 'B3', 'store', { input: 2000, output: 800 });
    updateBatchTokens(TEST_MIG_DIR, 'B3', 'api', { input: 500, output: 200 });

    const batch = getBatchTokens(TEST_MIG_DIR, 'B3');
    expect(batch!.input).toBe(3500);
    expect(batch!.output).toBe(1500);
    expect(Object.keys(batch!.perPhase)).toHaveLength(3);
    expect(batch!.perPhase['types']).toEqual({ input: 1000, output: 500 });
    expect(batch!.perPhase['store']).toEqual({ input: 2000, output: 800 });
    expect(batch!.perPhase['api']).toEqual({ input: 500, output: 200 });
  });

  it('should return correct perPhase breakdown via getBatchTokens', () => {
    updateBatchTokens(TEST_MIG_DIR, 'B5', 'scaffold', { input: 3000, output: 1200 });
    updateBatchTokens(TEST_MIG_DIR, 'B5', 'scaffold', { input: 1000, output: 300 });
    updateBatchTokens(TEST_MIG_DIR, 'B5', 'review', { input: 500, output: 100 });

    const batch = getBatchTokens(TEST_MIG_DIR, 'B5');
    expect(batch!.perPhase['scaffold']).toEqual({ input: 4000, output: 1500 });
    expect(batch!.perPhase['review']).toEqual({ input: 500, output: 100 });
    // Total should be sum across phases
    expect(batch!.input).toBe(4500);
    expect(batch!.output).toBe(1600);
  });

  it('should return null on corrupted JSON in getTokensData (R6 fixed)', () => {
    const tokensFile = path.join(TEST_MIG_DIR, 'tokens.json');
    fs.writeFileSync(tokensFile, '{corrupt json!!!', 'utf8');

    // After R6 fix: returns null instead of crashing
    const result = getTokensData(TEST_MIG_DIR);
    expect(result).toBeNull();
  });

  it('should return null for missing tokens.json in getTokensData', () => {
    const data = getTokensData(TEST_MIG_DIR);
    expect(data).toBeNull();
  });

  it('should handle edge cases in formatTokenCount', () => {
    expect(formatTokenCount(0)).toBe('0');
    expect(formatTokenCount(1)).toBe('1');
    expect(formatTokenCount(999)).toBe('999');
    expect(formatTokenCount(1000)).toBe('1.0K');
    expect(formatTokenCount(999_999)).toBe('1000.0K');
    expect(formatTokenCount(1_000_000)).toBe('1.0M');
    expect(formatTokenCount(100_000_000)).toBe('100.0M');
  });

  it('should accumulate correctly when updateTokens called with same program and different phases', () => {
    updateTokens(TEST_MIG_DIR, 42, 'types', { input: 1000, output: 500 });
    updateTokens(TEST_MIG_DIR, 42, 'store', { input: 2000, output: 700 });
    updateTokens(TEST_MIG_DIR, 42, 'api', { input: 500, output: 300 });

    const prog = getProgramTokens(TEST_MIG_DIR, 42);
    expect(prog!.input).toBe(3500);
    expect(prog!.output).toBe(1500);

    const data = getTokensData(TEST_MIG_DIR);
    expect(data!.global.totalCalls).toBe(3);
    expect(data!.global.input).toBe(3500);
    expect(data!.global.output).toBe(1500);
  });

  it('should clear file and return empty data after resetTokens', () => {
    updateTokens(TEST_MIG_DIR, 117, 'types', { input: 5000, output: 2000 });
    updateBatchTokens(TEST_MIG_DIR, 'B2', 'types', { input: 5000, output: 2000 });

    const before = getTokensData(TEST_MIG_DIR);
    expect(before!.global.totalCalls).toBe(1);
    expect(Object.keys(before!.programs)).toHaveLength(1);

    resetTokens(TEST_MIG_DIR, 'TestProject');

    const after = getTokensData(TEST_MIG_DIR);
    expect(after).not.toBeNull();
    expect(after!.global).toMatchObject({ input: 0, output: 0, costUsd: 0, totalCalls: 0 });
    expect(Object.keys(after!.programs)).toHaveLength(0);
    expect(Object.keys(after!.batches)).toHaveLength(0);

    // Subsequent get returns empty data, not null (file exists but empty)
    const prog = getProgramTokens(TEST_MIG_DIR, 117);
    expect(prog).toBeNull();

    const batch = getBatchTokens(TEST_MIG_DIR, 'B2');
    expect(batch).toBeNull();
  });
});
