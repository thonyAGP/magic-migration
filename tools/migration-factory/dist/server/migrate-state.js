/**
 * Server-side state tracking for active migration.
 * Keeps a circular buffer of events so the dashboard can reconnect
 * after a page refresh and see what happened.
 */
const MAX_EVENTS = 500;
let state = {
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
export const getMigrateActiveState = () => ({ ...state, programList: [...state.programList], events: [...state.events] });
export const startMigration = (batch, totalPrograms, targetDir, mode, dryRun, programList = []) => {
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
export const addMigrateEvent = (event) => {
    if (state.events.length >= MAX_EVENTS) {
        state.events.shift();
    }
    state.events.push(event);
    const e = event;
    if (e.type === 'program_completed' || e.type === 'program_failed') {
        state.completedPrograms++;
    }
    if (e.type === 'migrate_started') {
        state.totalPrograms = e.programs || state.totalPrograms;
    }
};
export const endMigration = () => {
    state.running = false;
};
//# sourceMappingURL=migrate-state.js.map