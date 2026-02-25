/**
 * Server-side state tracking for active migration.
 * Keeps a circular buffer of events so the dashboard can reconnect
 * after a page refresh and see what happened.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface MigrateActiveState {
  running: boolean;
  batch: string;
  startedAt: number;
  totalPrograms: number;
  completedPrograms: number;
  failedPrograms: number;
  targetDir: string;
  mode: string;
  dryRun: boolean;
  estimatedHours: number;
  programList: Array<{ id: string | number; name: string }>;
  events: unknown[];
}

const MAX_EVENTS = 500;

let state: MigrateActiveState = {
  running: false,
  batch: '',
  startedAt: 0,
  totalPrograms: 0,
  completedPrograms: 0,
  failedPrograms: 0,
  targetDir: '',
  mode: '',
  dryRun: false,
  estimatedHours: 0,
  programList: [],
  events: [],
};

export const getMigrateActiveState = (): MigrateActiveState => ({ ...state, programList: [...state.programList], events: [...state.events] });

export const startMigration = (batch: string, totalPrograms: number, targetDir: string, mode: string, dryRun: boolean, programList: Array<{ id: string | number; name: string }> = [], estimatedHours = 0): void => {
  state = {
    running: true,
    batch,
    startedAt: Date.now(),
    totalPrograms,
    completedPrograms: 0,
    failedPrograms: 0,
    targetDir,
    mode,
    dryRun,
    estimatedHours,
    programList,
    events: [],
  };
};

export const addMigrateEvent = (event: unknown): void => {
  if (state.events.length >= MAX_EVENTS) {
    state.events.shift();
  }
  state.events.push(event);

  const e = event as Record<string, unknown>;
  if (e.type === 'program_completed') {
    state.completedPrograms++;
  }
  if (e.type === 'program_failed') {
    state.failedPrograms++;
  }
  if (e.type === 'migrate_started') {
    state.totalPrograms = (e.programs as number) || state.totalPrograms;
    if (typeof e.estimatedHours === 'number') state.estimatedHours = e.estimatedHours;
  }
};

export const endMigration = (): void => {
  state.running = false;
};

// ─── Phase 3: State Persistence ──────────────────────────────────

/**
 * Persist current migration state to disk for crash recovery.
 */
export const persistState = (filePath: string): void => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('[STATE PERSIST FAILED]', {
      filePath,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Load persisted migration state from disk (for recovery after restart).
 * Returns null if file doesn't exist or is corrupted.
 */
export const loadPersistedState = (filePath: string): MigrateActiveState | null => {
  if (!fs.existsSync(filePath)) return null;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const loaded = JSON.parse(content) as MigrateActiveState;

    // Restore state
    state = {
      ...loaded,
      programList: [...loaded.programList],
      events: [...loaded.events],
    };

    return state;
  } catch (err) {
    console.error('[STATE RECOVERY FAILED] Corrupted migration-state.json, starting fresh', {
      filePath,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
};

/**
 * Clear persisted state file (called after successful migration completion).
 */
export const clearPersistedState = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('[STATE CLEANUP FAILED]', {
      filePath,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
