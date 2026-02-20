/**
 * Phase-level tracking for the v10 migration pipeline.
 * Persists per-program, per-phase status in tracker.json under a "migrate" key.
 */
import type { MigratePhase, ProgramMigration } from './migrate-types.js';
export interface MigrateTrackerData {
    migrate: Record<string, ProgramMigration>;
}
/**
 * Read the migrate section from tracker.json.
 * Returns empty record if no migrate section exists.
 */
export declare const readMigrateTracker: (trackerFile: string) => Record<string, ProgramMigration>;
/**
 * Write the migrate section back to tracker.json.
 * Preserves all other tracker fields.
 */
export declare const writeMigrateTracker: (trackerFile: string, migrateData: Record<string, ProgramMigration>) => void;
/**
 * Get or create a ProgramMigration record.
 */
export declare const getOrCreateProgram: (data: Record<string, ProgramMigration>, programId: string | number) => ProgramMigration;
/**
 * Start a phase for a program.
 */
export declare const startPhase: (prog: ProgramMigration, phase: MigratePhase) => void;
/**
 * Complete a phase for a program.
 */
export declare const completePhase: (prog: ProgramMigration, phase: MigratePhase, result: {
    file?: string;
    duration?: number;
}) => void;
/**
 * Fail a phase for a program.
 */
export declare const failPhase: (prog: ProgramMigration, phase: MigratePhase, error: string) => void;
/**
 * Check if a phase is already completed for a program.
 */
export declare const isPhaseCompleted: (prog: ProgramMigration, phase: MigratePhase) => boolean;
/**
 * Mark a program as fully completed.
 */
export declare const markProgramCompleted: (prog: ProgramMigration) => void;
/**
 * Mark a program as failed.
 */
export declare const markProgramFailed: (prog: ProgramMigration, error: string) => void;
/**
 * Get completion stats for a program.
 */
export declare const getCompletionStats: (prog: ProgramMigration) => {
    completed: number;
    total: number;
    pct: number;
};
