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
import type { SpecExtractor, PipelineStatus } from '../core/types.js';
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
export declare const advanceProgram: (programId: string | number, config: OrchestratorConfig) => Promise<PipelineResult>;
/**
 * Run pipeline for all programs in a batch.
 */
export declare const advanceBatch: (batchId: string, config: OrchestratorConfig) => Promise<PipelineResult[]>;
/**
 * Get pipeline status summary for all contracted programs.
 */
export declare const getPipelineStatus: (config: OrchestratorConfig) => Map<string | number, PipelineStatus>;
