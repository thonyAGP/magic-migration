/**
 * Target directory scaffolding for the migration pipeline.
 * Creates minimal infrastructure files needed for TSC verification
 * when the target directory doesn't already have them (e.g. fresh dir).
 */
import type { MigrateConfig } from './migrate-types.js';
export declare const scaffoldTargetDir: (config: MigrateConfig) => {
    created: number;
    skipped: number;
};
