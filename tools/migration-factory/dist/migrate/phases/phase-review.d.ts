/**
 * Phase 15: REVIEW - Quality review comparing generated code vs spec/contract.
 * Produces a coverage report for each program.
 */
import type { MigrateConfig, AnalysisDocument, ReviewReport } from '../migrate-types.js';
export interface ReviewResult {
    report: ReviewReport;
    duration: number;
}
export declare const runReviewPhase: (programId: string | number, analysis: AnalysisDocument, config: MigrateConfig) => Promise<ReviewResult>;
