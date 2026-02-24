/**
 * Token Tracker - Persistent token usage tracking for cost monitoring.
 * Aggregates tokens at global, batch, phase, and program levels.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface TokenStats {
  input: number;
  output: number;
  costUsd: number;
  totalCalls: number;
}

export interface TokensData {
  project: string;
  global: TokenStats;
  batches: Record<string, {
    input: number;
    output: number;
    costUsd: number;
    perPhase: Record<string, { input: number; output: number }>;
  }>;
  programs: Record<string, { input: number; output: number; costUsd: number }>;
}

const PRICING: Record<string, { input: number; output: number }> = {
  haiku: { input: 0.25, output: 1.25 },
  sonnet: { input: 3, output: 15 },
  opus: { input: 15, output: 75 },
};

/**
 * Estimate cost in USD based on token usage and model.
 */
const estimateCost = (tokens: { input: number; output: number }, model = 'sonnet'): number => {
  const pricing = PRICING[model] ?? PRICING.sonnet;
  return (tokens.input / 1_000_000) * pricing.input + (tokens.output / 1_000_000) * pricing.output;
};

/**
 * Update tokens for a migration event.
 * Returns updated global stats for SSE streaming.
 */
export const updateTokens = (
  migrationDir: string,
  programId: string | number,
  phase: string,
  tokens: { input: number; output: number },
  model = 'sonnet',
): TokenStats => {
  const tokensFile = path.join(migrationDir, 'tokens.json');
  let data: TokensData;

  if (fs.existsSync(tokensFile)) {
    data = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
  } else {
    data = createEmpty(path.basename(migrationDir));
  }

  const costUsd = estimateCost(tokens, model);

  // Update global
  data.global.input += tokens.input;
  data.global.output += tokens.output;
  data.global.costUsd += costUsd;
  data.global.totalCalls++;

  // Update program
  const progKey = String(programId);
  if (!data.programs[progKey]) {
    data.programs[progKey] = { input: 0, output: 0, costUsd: 0 };
  }
  data.programs[progKey].input += tokens.input;
  data.programs[progKey].output += tokens.output;
  data.programs[progKey].costUsd += estimateCost({ input: data.programs[progKey].input, output: data.programs[progKey].output }, model);

  // Save
  fs.writeFileSync(tokensFile, JSON.stringify(data, null, 2), 'utf8');

  return data.global;
};

/**
 * Update batch-level tokens (called at end of batch).
 */
export const updateBatchTokens = (
  migrationDir: string,
  batchId: string,
  phase: string,
  tokens: { input: number; output: number },
): void => {
  const tokensFile = path.join(migrationDir, 'tokens.json');
  let data: TokensData;

  if (fs.existsSync(tokensFile)) {
    data = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
  } else {
    data = createEmpty(path.basename(migrationDir));
  }

  if (!data.batches[batchId]) {
    data.batches[batchId] = { input: 0, output: 0, costUsd: 0, perPhase: {} };
  }

  const batch = data.batches[batchId];
  batch.input += tokens.input;
  batch.output += tokens.output;
  batch.costUsd = estimateCost({ input: batch.input, output: batch.output });

  if (!batch.perPhase[phase]) {
    batch.perPhase[phase] = { input: 0, output: 0 };
  }
  batch.perPhase[phase].input += tokens.input;
  batch.perPhase[phase].output += tokens.output;

  fs.writeFileSync(tokensFile, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * Get tokens data for a project.
 */
export const getTokensData = (migrationDir: string): TokensData | null => {
  const tokensFile = path.join(migrationDir, 'tokens.json');
  if (!fs.existsSync(tokensFile)) return null;
  return JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
};

/**
 * Get tokens for a specific batch.
 */
export const getBatchTokens = (migrationDir: string, batchId: string): TokensData['batches'][string] | null => {
  const data = getTokensData(migrationDir);
  if (!data) return null;
  return data.batches[batchId] ?? null;
};

/**
 * Get tokens for a specific program.
 */
export const getProgramTokens = (migrationDir: string, programId: string | number): TokensData['programs'][string] | null => {
  const data = getTokensData(migrationDir);
  if (!data) return null;
  return data.programs[String(programId)] ?? null;
};

/**
 * Create empty tokens data structure.
 */
const createEmpty = (project: string): TokensData => ({
  project,
  global: { input: 0, output: 0, costUsd: 0, totalCalls: 0 },
  batches: {},
  programs: {},
});

/**
 * Format token count for display (1500 → 1.5K, 1500000 → 1.5M).
 */
export const formatTokenCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

/**
 * Reset tokens (for testing or manual cleanup).
 */
export const resetTokens = (migrationDir: string, project: string): void => {
  const tokensFile = path.join(migrationDir, 'tokens.json');
  fs.writeFileSync(tokensFile, JSON.stringify(createEmpty(project), null, 2), 'utf8');
};
