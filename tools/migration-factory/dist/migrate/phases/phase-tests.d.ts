/**
 * Phases 8-9: Generate test files (unit tests for store, UI tests for page).
 */
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';
export interface TestResult {
    file: string;
    skipped: boolean;
    duration: number;
}
export declare const runTestsUnitPhase: (_programId: string | number, analysis: AnalysisDocument, config: MigrateConfig) => Promise<TestResult>;
export declare const runTestsUiPhase: (_programId: string | number, analysis: AnalysisDocument, config: MigrateConfig) => Promise<TestResult>;
