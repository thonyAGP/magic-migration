/**
 * Migration Runner - Orchestrates the 15-phase pipeline.
 * Supports per-program parallel execution (phases 0-9) and
 * sequential batch verification (phases 10-15).
 */
import type { MigrateConfig, MigrateResult, MigratePhase } from './migrate-types.js';
export declare const formatDuration: (ms: number) => string;
/** Resolve parallel count: 0 = auto (based on CPU cores and program count). */
export declare const resolveParallelCount: (requested: number, programCount: number) => number;
export declare const estimateCostUsd: (tokens: {
    input: number;
    output: number;
}, model?: string) => number;
/**
 * Determine if a program should be skipped during migration.
 * ONLY verified programs are skipped - enriched programs must be re-generated.
 */
export declare const shouldSkipProgram: (contractStatus: string | undefined) => boolean;
export declare const runMigration: (programIds: (string | number)[], batchId: string, batchName: string, config: MigrateConfig) => Promise<MigrateResult>;
export declare const runSinglePhase: (phase: MigratePhase, programIds: (string | number)[], config: MigrateConfig) => Promise<void>;
export interface MigrateStatusView {
    programId: string;
    status: string;
    currentPhase: string | null;
    completedPhases: number;
    totalPhases: number;
    files: number;
    errors: number;
}
export declare const getMigrateStatus: (trackerFile: string) => MigrateStatusView[];
export declare const createBatch: (batchId: string, batchName: string, programIds: (string | number)[], config: MigrateConfig) => void;
