/**
 * Phases 3-7: Generate code files (Types, Store, API, Page, Components).
 * Each phase calls Claude CLI with the appropriate prompt and writes the output file.
 */
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';
export interface GenerateResult {
    file: string;
    skipped: boolean;
    duration: number;
}
export declare const runTypesPhase: (programId: string | number, analysis: AnalysisDocument, config: MigrateConfig) => Promise<GenerateResult>;
export declare const runStorePhase: (programId: string | number, analysis: AnalysisDocument, config: MigrateConfig) => Promise<GenerateResult>;
export declare const runApiPhase: (_programId: string | number, analysis: AnalysisDocument, config: MigrateConfig) => Promise<GenerateResult>;
export declare const runPagePhase: (programId: string | number, analysis: AnalysisDocument, config: MigrateConfig) => Promise<GenerateResult>;
export interface ComponentsResult {
    files: GenerateResult[];
    totalDuration: number;
}
export declare const runComponentsPhase: (_programId: string | number, analysis: AnalysisDocument, config: MigrateConfig) => Promise<ComponentsResult>;
