/**
 * Tier 1: Heuristic enrichment (free, deterministic).
 * Infers TS types + defaults from variable names and descriptions.
 */
import type { CodegenModel } from './codegen-model.js';
export declare const inferFieldType: (name: string, description?: string) => string;
export declare const inferDefaultValue: (type: string) => string;
export declare const applyHeuristicEnrichment: (model: CodegenModel) => CodegenModel;
