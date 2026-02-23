/**
 * MVP-11: Cost pre-estimation for migration batches.
 * Estimates token usage and cost before running a migration.
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadContracts, parseContract } from '../core/contract.js';
import type { MigrationContract } from '../core/types.js';
import { GENERATION_PHASES, DEFAULT_PHASE_MODELS } from './migrate-types.js';
import type { MigratePhase } from './migrate-types.js';

// ─── Pricing (per million tokens) ──────────────────────────────

const PRICING: Record<string, { input: number; output: number }> = {
  sonnet: { input: 3, output: 15 },
  haiku: { input: 0.25, output: 1.25 },
  opus: { input: 15, output: 75 },
};

// ─── Token estimation heuristics ──────────────────────────────

/** Estimate prompt tokens for a phase based on contract complexity. */
const estimatePhaseTokens = (
  phase: MigratePhase,
  contract: MigrationContract,
): { input: number; output: number } => {
  const rulesCount = contract.rules?.length ?? 0;
  const tablesCount = contract.tables?.length ?? 0;
  const variablesCount = contract.variables?.length ?? 0;
  const calleesCount = contract.callees?.length ?? 0;
  const complexity = rulesCount + tablesCount * 2 + variablesCount + calleesCount;

  // Base tokens by phase type
  const baseTokens: Record<string, { input: number; output: number }> = {
    spec: { input: 2000, output: 3000 },
    contract: { input: 1500, output: 2000 },
    analyze: { input: 3000, output: 2000 },
    types: { input: 2000, output: 1500 },
    store: { input: 3000, output: 3000 },
    api: { input: 2000, output: 2000 },
    page: { input: 4000, output: 5000 },
    components: { input: 3000, output: 4000 },
    'tests-unit': { input: 3000, output: 4000 },
    'tests-ui': { input: 3000, output: 4000 },
    'verify-tsc': { input: 0, output: 0 },
    'fix-tsc': { input: 2000, output: 2000 },
    'verify-tests': { input: 0, output: 0 },
    'fix-tests': { input: 2000, output: 2000 },
    integrate: { input: 1000, output: 500 },
    review: { input: 3000, output: 2000 },
  };

  const base = baseTokens[phase] ?? { input: 2000, output: 2000 };

  // Scale by complexity (each rule/table adds ~100 input tokens)
  const scaleFactor = 1 + complexity * 0.05;

  return {
    input: Math.round(base.input * scaleFactor),
    output: Math.round(base.output * scaleFactor),
  };
};

// ─── Public API ──────────────────────────────────────────────

export interface CostEstimate {
  batchId: string;
  programCount: number;
  programs: ProgramCostEstimate[];
  totals: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
  model: string;
  phases: number;
}

export interface ProgramCostEstimate {
  programId: string | number;
  programName: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  complexity: number;
}

/**
 * Estimate the cost of migrating a batch.
 * Reads contracts to determine complexity, then estimates tokens per phase.
 */
export const estimateBatchCost = (
  batchPrograms: { id: string | number; name: string }[],
  contractDir: string,
  model = 'sonnet',
): CostEstimate => {
  const programs: ProgramCostEstimate[] = [];
  let totalInput = 0;
  let totalOutput = 0;

  const pricing = PRICING[model] ?? PRICING.sonnet;

  for (const prog of batchPrograms) {
    // Try to load contract for this program
    let contract: MigrationContract | null = null;
    const contractFile = path.join(contractDir, `${prog.id}.yaml`);
    if (fs.existsSync(contractFile)) {
      try {
        contract = parseContract(fs.readFileSync(contractFile, 'utf8'));
      } catch { /* use defaults */ }
    }

    let progInput = 0;
    let progOutput = 0;
    const rulesCount = contract?.rules?.length ?? 5;
    const tablesCount = contract?.tables?.length ?? 2;
    const complexity = rulesCount + tablesCount * 2;

    // Estimate tokens for each generation phase
    for (const phase of GENERATION_PHASES) {
      if (contract) {
        const est = estimatePhaseTokens(phase, contract);
        progInput += est.input;
        progOutput += est.output;
      } else {
        // Default estimate without contract
        progInput += 2500;
        progOutput += 2500;
      }
    }

    // Add fix phases estimate (assume ~1.5 fix passes average)
    progInput += Math.round(2000 * 1.5);
    progOutput += Math.round(2000 * 1.5);

    const costUsd = (progInput / 1_000_000) * pricing.input
      + (progOutput / 1_000_000) * pricing.output;

    programs.push({
      programId: prog.id,
      programName: prog.name,
      inputTokens: progInput,
      outputTokens: progOutput,
      costUsd,
      complexity,
    });

    totalInput += progInput;
    totalOutput += progOutput;
  }

  const totalCost = (totalInput / 1_000_000) * pricing.input
    + (totalOutput / 1_000_000) * pricing.output;

  return {
    batchId: '',
    programCount: batchPrograms.length,
    programs,
    totals: {
      inputTokens: totalInput,
      outputTokens: totalOutput,
      costUsd: totalCost,
    },
    model,
    phases: GENERATION_PHASES.length,
  };
};
