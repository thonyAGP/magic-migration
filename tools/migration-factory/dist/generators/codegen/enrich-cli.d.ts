/**
 * Tier 2b: Claude CLI enrichment for generated code.
 * Uses local `claude` CLI binary (Claude Code) instead of API.
 * No API key needed - uses the user's local Claude subscription.
 */
import type { CodegenModel } from './codegen-model.js';
import type { CodegenEnrichConfig } from './enrich-model.js';
export declare const applyClaudeCliEnrichment: (model: CodegenModel, config: CodegenEnrichConfig) => Promise<CodegenModel>;
