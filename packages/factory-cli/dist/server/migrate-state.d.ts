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
    failedPrograms: number;
    targetDir: string;
    mode: string;
    dryRun: boolean;
    estimatedHours: number;
    programList: Array<{
        id: string | number;
        name: string;
    }>;
    events: unknown[];
}
export declare const getMigrateActiveState: () => MigrateActiveState;
export declare const startMigration: (batch: string, totalPrograms: number, targetDir: string, mode: string, dryRun: boolean, programList?: Array<{
    id: string | number;
    name: string;
}>, estimatedHours?: number) => void;
export declare const addMigrateEvent: (event: unknown) => void;
export declare const endMigration: () => void;
