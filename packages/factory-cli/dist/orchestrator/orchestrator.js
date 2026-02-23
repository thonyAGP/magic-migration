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
import { loadContracts, writeContract } from '../core/contract.js';
import { readTracker, writeTracker, updateTrackerStats } from '../core/tracker.js';
import { computeOverallCoverage } from '../core/coverage.js';
import { nextStatus } from '../core/pipeline.js';
/**
 * Run the next pipeline step for a single program.
 */
export const advanceProgram = async (programId, config) => {
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
        const updatedSpec = {
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
export const advanceBatch = async (batchId, config) => {
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
    const results = [];
    for (const prog of batchPrograms) {
        const result = await advanceProgram(prog.id, config);
        results.push(result);
    }
    // Update tracker stats
    const contracts = loadContracts(config.migrationDir, config.contractPattern);
    let contracted = 0, enriched = 0, verified = 0;
    for (const [, c] of contracts) {
        switch (c.overall.status) {
            case 'contracted':
                contracted++;
                break;
            case 'enriched':
                enriched++;
                break;
            case 'verified':
                verified++;
                break;
        }
    }
    const updatedTracker = updateTrackerStats(tracker, { contracted, enriched, verified });
    writeTracker(updatedTracker, config.trackerFile);
    return results;
};
/**
 * Get pipeline status summary for all contracted programs.
 */
export const getPipelineStatus = (config) => {
    const contracts = loadContracts(config.migrationDir, config.contractPattern);
    const statuses = new Map();
    for (const [id, contract] of contracts) {
        statuses.set(id, contract.overall.status);
    }
    return statuses;
};
//# sourceMappingURL=orchestrator.js.map