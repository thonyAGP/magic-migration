/**
 * Server-side state tracking for active migration.
 * Keeps a circular buffer of events so the dashboard can reconnect
 * after a page refresh and see what happened.
 */

export interface MigrateActiveState {
  running: boolean;
  batch: string;
  startedAt: number;
  totalPrograms: number;
  completedPrograms: number;
  targetDir: string;
  mode: string;
  dryRun: boolean;
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
  targetDir: '',
  mode: '',
  dryRun: false,
  programList: [],
  events: [],
};

export const getMigrateActiveState = (): MigrateActiveState => ({ ...state, programList: [...state.programList], events: [...state.events] });

export const startMigration = (batch: string, totalPrograms: number, targetDir: string, mode: string, dryRun: boolean, programList: Array<{ id: string | number; name: string }> = []): void => {
  state = {
    running: true,
    batch,
    startedAt: Date.now(),
    totalPrograms,
    completedPrograms: 0,
    targetDir,
    mode,
    dryRun,
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
  if (e.type === 'program_completed' || e.type === 'program_failed') {
    state.completedPrograms++;
  }
  if (e.type === 'migrate_started') {
    state.totalPrograms = (e.programs as number) || state.totalPrograms;
  }
};

export const endMigration = (): void => {
  state.running = false;
};
