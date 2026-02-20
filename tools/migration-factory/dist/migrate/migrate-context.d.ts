/**
 * Context builder for migration prompts.
 * Loads spec, contract, DB metadata, analysis JSON, and pattern references
 * to compose the full context needed by each phase.
 */
import type { MigrateConfig, AnalysisDocument } from './migrate-types.js';
import type { MigrationContract } from '../core/types.js';
export interface MigrateContext {
    programId: string | number;
    project: string;
    spec: string | null;
    contract: MigrationContract | null;
    analysis: AnalysisDocument | null;
    dbMetadata: Record<string, string>;
    patternFiles: Record<string, string>;
}
export declare const buildContext: (programId: string | number, config: MigrateConfig) => MigrateContext;
export declare const loadPatternFile: (targetDir: string, relativePath: string) => string | null;
export declare const loadReferencePatterns: (targetDir: string) => Record<string, string>;
export declare const extractSpecSection: (spec: string, sectionName: string) => string | null;
export declare const extractSpecForPhase: (spec: string, phase: "analyze" | "store" | "page" | "components" | "review") => string;
export declare const sanitizeDomain: (name: string) => string;
export declare const toCamelCase: (name: string) => string;
export declare const toPascalCase: (name: string) => string;
