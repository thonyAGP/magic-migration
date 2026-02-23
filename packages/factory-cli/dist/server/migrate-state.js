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
    failedPrograms: 0,
    targetDir: '',
    mode: '',
    dryRun: false,
    estimatedHours: 0,
    programList: [],
    events: [],
};
export const getMigrateActiveState = () => ({ ...state, programList: [...state.programList], events: [...state.events] });
export const startMigration = (batch, totalPrograms, targetDir, mode, dryRun, programList = [], estimatedHours = 0) => {
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
export const addMigrateEvent = (event) => {
    if (state.events.length >= MAX_EVENTS) {
        state.events.shift();
    }
    state.events.push(event);
    const e = event;
    if (e.type === 'program_completed') {
        state.completedPrograms++;
    }
    if (e.type === 'program_failed') {
        state.failedPrograms++;
    }
    if (e.type === 'migrate_started') {
        state.totalPrograms = e.programs || state.totalPrograms;
        if (typeof e.estimatedHours === 'number')
            state.estimatedHours = e.estimatedHours;
    }
};
export const endMigration = () => {
    state.running = false;
};
//# sourceMappingURL=migrate-state.js.map