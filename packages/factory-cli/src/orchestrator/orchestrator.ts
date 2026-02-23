/**
 * @deprecated Use src/pipeline/pipeline-runner.ts instead.
 * This orchestrator is superseded by the Pipeline Runner v3 which provides:
 * - Full batch pipeline execution (auto-contract → gap-analysis → auto-verify)
 * - Event system for observability
 * - Preflight checks
 * - Batch status views
 *
 * Kept for backward compatibility. Will be removed in v4.
 */

import type {
  SpecExtractor, PipelineStatus, MigrationContract, Program, Tracker,
} from '../core/types.js';
import { loadContracts, writeContract } from '../core/contract.js';
import { readTracker, writeTracker, updateTrackerStats } from '../core/tracker.js';
import { computeOverallCoverage } from '../core/coverage.js';
import { canTransition, nextStatus } from '../core/pipeline.js';

export interface OrchestratorConfig {
  migrationDir: string;
  trackerFile: string;
  adapter: SpecExtractor;
  contractPattern?: RegExp;
}

export interface PipelineResult {
  programId: string | number;
  previousStatus: PipelineStatus;
  newStatus: PipelineStatus;
  coveragePct: number;
  success: boolean;
  message: string;
}

/**
 * Run the next pipeline step for a single program.
 */
export const advanceProgram = async (
  programId: string | number,
  config: OrchestratorConfig
): Promise<PipelineResult> => {
  const contracts = loadContracts(config.migrationDir, config.contractPattern);
  const contract = contracts.get(programId);

  if (!contract) {
    // No contract yet -> try to create one
    const spec = await config.adapter.extractSpec(programId);
    if (!spec) {
      return {
        programId,
        previousStatus: 'pending',
        newStatus: 'pending',
        coveragePct: 0,
        success: false,
        message: `No spec found for program ${programId}`,
      };
    }

    // Write contract with status 'contracted'
    const updatedSpec: MigrationContract = {
      ...spec,
      overall: { ...spec.overall, status: 'contracted' },
    };
    const filePath = `${config.migrationDir}/program-${programId}.contract.yaml`;
    writeContract(updatedSpec, filePath);

    return {
      programId,
      previousStatus: 'pending',
      newStatus: 'contracted',
      coveragePct: computeOverallCoverage(updatedSpec),
      success: true,
      message: `Contract generated for program ${programId}`,
    };
  }

  const currentStatus = contract.overall.status;
  const next = nextStatus(currentStatus);

  if (!next) {
    return {
      programId,
      previousStatus: currentStatus,
      newStatus: currentStatus,
      coveragePct: contract.overall.coveragePct,
      success: true,
      message: `Program ${programId} is already ${currentStatus} (terminal state)`,
    };
  }

  // Transition is handled by external agents (enricher/verifier)
  // Orchestrator only tracks and validates transitions
  return {
    programId,
    previousStatus: currentStatus,
    newStatus: currentStatus,
    coveragePct: contract.overall.coveragePct,
    success: true,
    message: `Program ${programId} is at ${currentStatus}, next step: ${next}`,
  };
};

/**
 * Run pipeline for all programs in a batch.
 */
export const advanceBatch = async (
  batchId: string,
  config: OrchestratorConfig
): Promise<PipelineResult[]> => {
  const tracker = readTracker(config.trackerFile);
  const batch = tracker.batches.find(b => b.id === batchId);

  if (!batch) {
    return [{
      programId: batchId,
      previousStatus: 'pending',
      newStatus: 'pending',
      coveragePct: 0,
      success: false,
      message: `Batch ${batchId} not found in tracker`,
    }];
  }

  const graph = await config.adapter.extractProgramGraph();
  const batchPrograms = graph.programs.filter(p => {
    // Find programs belonging to this batch
    // Simple: use priority_order from tracker
    return batch.priorityOrder.includes(p.id);
  });

  const results: PipelineResult[] = [];
  for (const prog of batchPrograms) {
    const result = await advanceProgram(prog.id, config);
    results.push(result);
  }

  // Update tracker stats
  const contracts = loadContracts(config.migrationDir, config.contractPattern);
  let contracted = 0, enriched = 0, verified = 0;
  for (const [, c] of contracts) {
    switch (c.overall.status) {
      case 'contracted': contracted++; break;
      case 'enriched': enriched++; break;
      case 'verified': verified++; break;
    }
  }

  const updatedTracker = updateTrackerStats(tracker, { contracted, enriched, verified });
  writeTracker(updatedTracker, config.trackerFile);

  return results;
};

/**
 * Get pipeline status summary for all contracted programs.
 */
export const getPipelineStatus = (config: OrchestratorConfig): Map<string | number, PipelineStatus> => {
  const contracts = loadContracts(config.migrationDir, config.contractPattern);
  const statuses = new Map<string | number, PipelineStatus>();

  for (const [id, contract] of contracts) {
    statuses.set(id, contract.overall.status);
  }

  return statuses;
};
