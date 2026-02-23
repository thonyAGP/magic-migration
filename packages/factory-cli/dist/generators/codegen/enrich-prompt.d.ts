/**
 * Tier 2: Claude API enrichment for generated code.
 * One API call per program: sends contract + heuristic base → refined enrichment.
 */
import type { CodegenModel } from './codegen-model.js';
import type { CodegenEnrichConfig, EnrichmentData } from './enrich-model.js';
export declare const buildCodegenSystemPrompt: () => string;
export declare const buildCodegenUserPrompt: (model: CodegenModel) => string;
export declare const parseClaudeEnrichmentResponse: (raw: string) => EnrichmentData;
export declare const applyClaudeEnrichment: (model: CodegenModel, config: CodegenEnrichConfig) => Promise<CodegenModel>;
