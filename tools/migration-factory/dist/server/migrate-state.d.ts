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
    events: unknown[];
}
export declare const getMigrateActiveState: () => MigrateActiveState;
export declare const startMigration: (batch: string, totalPrograms: number, targetDir: string, mode: string, dryRun: boolean) => void;
export declare const addMigrateEvent: (event: unknown) => void;
export declare const endMigration: () => void;
