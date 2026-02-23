/**
 * Code generation runner: orchestrates model building + enrichment + 5 generators + file writing.
 * v8: sync runCodegen (no enrichment, backward compat)
 * v9: async runCodegenEnriched (heuristic or Claude enrichment)
 */
import type { MigrationContract } from '../../core/types.js';
import { type CodegenConfig, type CodegenResult } from './codegen-model.js';
import type { CodegenEnrichConfig } from './enrich-model.js';
/** v8 sync API (backward compat, no enrichment) */
export declare const runCodegen: (contract: MigrationContract, config: CodegenConfig) => CodegenResult;
/** v9 async API with enrichment */
export declare const runCodegenEnriched: (contract: MigrationContract, config: CodegenConfig, enrichConfig: CodegenEnrichConfig) => Promise<CodegenResult>;
