/**
 * Phase-level tracking for the v10 migration pipeline.
 * Persists per-program, per-phase status in tracker.json under a "migrate" key.
 */

import fs from 'node:fs';
import { MigratePhase } from './migrate-types.js';
import type { PhaseRecord, PhaseStatus, ProgramMigration } from './migrate-types.js';

/**
 * Phase weights based on real observed effort (generation time, AI tokens, complexity).
 * Total = 100%
 *
 * Rationale:
 * - SPEC/CONTRACT (2%): Automatic, templates (seconds)
 * - ANALYZE/TYPES (5%): Light AI, TypeScript generation (minutes)
 * - ENRICH phases (69%): Heavy AI generation (STORE→TESTS) - THE BIG CHUNK
 *   - COMPONENTS (20%): Most complex phase (UI logic, state, interactions)
 *   - PAGE (15%): React page with routing, layout
 *   - TESTS (24%): Unit + UI tests with fixtures
 * - VERIFY/FIX (14%): TypeScript + test verification/correction
 * - INTEGRATE/REVIEW (3%): Finalization steps
 */
export const PHASE_WEIGHTS: Record<MigratePhase, number> = {
  [MigratePhase.SPEC]: 1,
  [MigratePhase.CONTRACT]: 1,
  [MigratePhase.PARSE]: 2,
  [MigratePhase.DATA_MODEL]: 2,
  [MigratePhase.ANALYZE]: 3,
  [MigratePhase.TYPES]: 2,
  [MigratePhase.STORE]: 8,
  [MigratePhase.API]: 2,
  [MigratePhase.PAGE]: 15,
  [MigratePhase.COMPONENTS]: 20, // Heaviest phase
  [MigratePhase.TESTS_UNIT]: 12,
  [MigratePhase.TESTS_UI]: 12,
  [MigratePhase.VERIFY_TSC]: 2,
  [MigratePhase.FIX_TSC]: 5,
  [MigratePhase.VERIFY_TESTS]: 2,
  [MigratePhase.FIX_TESTS]: 5,
  [MigratePhase.REMEDIATE]: 5,
  [MigratePhase.INTEGRATE]: 0.5,
  [MigratePhase.REVIEW]: 2.5,
  [MigratePhase.REFACTOR]: 5,
};

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
 * Returns both simple phase count and weighted percentage based on effort.
 */
export const getCompletionStats = (
  prog: ProgramMigration,
): { completed: number; total: number; pct: number; weightedPct: number } => {
  const phases = Object.values(prog.phases);
  const completed = phases.filter(p => p.status === 'completed').length;
  const total = phases.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // NEW: Weighted calculation based on effort
  // Calculate completed weight (sum of weights for completed phases)
  let completedWeight = 0;

  for (const [phaseName, record] of Object.entries(prog.phases)) {
    if (record.status === 'completed') {
      const weight = PHASE_WEIGHTS[phaseName as MigratePhase] ?? 0;
      completedWeight += weight;
    }
  }

  // Divide by 100 (total weight of all phases) to get true percentage
  const weightedPct = Math.round(completedWeight);

  return { completed, total, pct, weightedPct };
};
