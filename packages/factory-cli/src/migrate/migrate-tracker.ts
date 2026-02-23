/**
 * Phase-level tracking for the v10 migration pipeline.
 * Persists per-program, per-phase status in tracker.json under a "migrate" key.
 */

import fs from 'node:fs';
import type { MigratePhase, PhaseRecord, PhaseStatus, ProgramMigration } from './migrate-types.js';

export interface MigrateTrackerData {
  migrate: Record<string, ProgramMigration>;
}

/**
 * Read the migrate section from tracker.json.
 * Returns empty record if no migrate section exists.
 */
export const readMigrateTracker = (trackerFile: string): Record<string, ProgramMigration> => {
  if (!fs.existsSync(trackerFile)) return {};
  const raw = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
  return (raw.migrate ?? {}) as Record<string, ProgramMigration>;
};

/**
 * Write the migrate section back to tracker.json.
 * Preserves all other tracker fields.
 */
export const writeMigrateTracker = (
  trackerFile: string,
  migrateData: Record<string, ProgramMigration>,
): void => {
  let doc: Record<string, unknown> = {};
  if (fs.existsSync(trackerFile)) {
    doc = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
  }
  doc.migrate = migrateData;
  fs.writeFileSync(trackerFile, JSON.stringify(doc, null, 2), 'utf8');
};

/**
 * Get or create a ProgramMigration record.
 */
export const getOrCreateProgram = (
  data: Record<string, ProgramMigration>,
  programId: string | number,
): ProgramMigration => {
  const key = String(programId);
  if (!data[key]) {
    data[key] = {
      status: 'pending',
      currentPhase: null,
      phases: {},
      files: [],
      errors: [],
    };
  }
  return data[key];
};

/**
 * Start a phase for a program.
 */
export const startPhase = (
  prog: ProgramMigration,
  phase: MigratePhase,
): void => {
  prog.status = 'generating';
  prog.currentPhase = phase;
  prog.phases[phase] = {
    status: 'generating' as PhaseStatus,
    startedAt: new Date().toISOString(),
  };
  if (!prog.startedAt) {
    prog.startedAt = new Date().toISOString();
  }
};

/**
 * Complete a phase for a program.
 */
export const completePhase = (
  prog: ProgramMigration,
  phase: MigratePhase,
  result: { file?: string; duration?: number },
): void => {
  const record = prog.phases[phase] ?? { status: 'pending' as PhaseStatus };
  record.status = 'completed';
  record.completedAt = new Date().toISOString();
  if (result.duration != null) record.duration = result.duration;
  if (result.file) {
    record.file = result.file;
    if (!prog.files.includes(result.file)) prog.files.push(result.file);
  }
  prog.phases[phase] = record;
};

/**
 * Fail a phase for a program.
 */
export const failPhase = (
  prog: ProgramMigration,
  phase: MigratePhase,
  error: string,
): void => {
  const record = prog.phases[phase] ?? { status: 'pending' as PhaseStatus };
  record.status = 'failed';
  record.error = error;
  record.completedAt = new Date().toISOString();
  prog.phases[phase] = record;
  prog.errors.push(`[${phase}] ${error}`);
};

/**
 * Check if a phase is already completed for a program.
 */
export const isPhaseCompleted = (
  prog: ProgramMigration,
  phase: MigratePhase,
): boolean => {
  const record = prog.phases[phase];
  return record?.status === 'completed';
};

/**
 * Mark a program as fully completed.
 */
export const markProgramCompleted = (prog: ProgramMigration): void => {
  prog.status = 'completed';
  prog.currentPhase = null;
  prog.completedAt = new Date().toISOString();
};

/**
 * Mark a program as failed.
 */
export const markProgramFailed = (prog: ProgramMigration, error: string): void => {
  prog.status = 'failed';
  prog.errors.push(error);
};

/**
 * Get completion stats for a program.
 */
export const getCompletionStats = (prog: ProgramMigration): { completed: number; total: number; pct: number } => {
  const phases = Object.values(prog.phases);
  const completed = phases.filter(p => p.status === 'completed').length;
  const total = phases.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, pct };
};
