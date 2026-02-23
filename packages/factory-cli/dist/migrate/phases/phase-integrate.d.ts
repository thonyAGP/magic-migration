/**
 * Phase 14: INTEGRATE - Wire new pages into the application routing.
 * Updates App.tsx / routes to include newly generated pages.
 */
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';
export interface IntegrateResult {
    filesModified: string[];
    duration: number;
}
export declare const runIntegratePhase: (analyses: AnalysisDocument[], config: MigrateConfig) => Promise<IntegrateResult>;
