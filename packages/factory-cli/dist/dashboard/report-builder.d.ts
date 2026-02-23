/**
 * Report Builder: assembles all data into a FullMigrationReport
 * for consumption by the HTML dashboard generator.
 */
import type { Program, PipelineStatus, SCC, Tracker, Batch, FullMigrationReport, ModuleSummary, MultiProjectReport, MigrationContract } from '../core/types.js';
import type { ModuleCalculatorOutput } from '../calculators/module-calculator.js';
import type { ReadinessReport } from '../core/types.js';
import type { DecommissionResult } from '../core/types.js';
export interface ReportInput {
    projectName: string;
    programs: Program[];
    programStatuses: Map<string | number, PipelineStatus>;
    sharedPrograms: Set<string | number>;
    sccs: SCC[];
    maxLevel: number;
    modulesOutput: ModuleCalculatorOutput;
    readiness: ReadinessReport;
    decommission: DecommissionResult;
    tracker?: Tracker;
    contracts?: Map<string | number, MigrationContract>;
}
export declare const buildReport: (input: ReportInput) => FullMigrationReport;
export declare const buildModulesFromBatches: (batches: Batch[], programStatuses: Map<string | number, PipelineStatus>) => ModuleSummary[];
export interface MultiProjectInput {
    projects: {
        name: string;
        reportInput?: ReportInput;
        programCount?: number;
        description?: string;
    }[];
}
export declare const buildMultiProjectReport: (input: MultiProjectInput) => MultiProjectReport;
