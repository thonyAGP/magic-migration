/**
 * Phase 2: ANALYZE - Generate design document JSON via Claude CLI.
 * Produces the architectural blueprint used by all subsequent phases.
 */
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';
export interface AnalyzeResult {
    analysisFile: string;
    analysis: AnalysisDocument;
    skipped: boolean;
    duration: number;
}
export declare const runAnalyzePhase: (programId: string | number, config: MigrateConfig) => Promise<AnalyzeResult>;
