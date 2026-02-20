/**
 * Claude API enrichment hook: auto-classify gap items via Claude API.
 * v4: replaces manual enrichment for contracted programs with gaps.
 */
import type { EnrichmentHook } from './enrichment-hook.js';
import { type ClaudeClientConfig } from './claude-client.js';
export declare const createClaudeEnrichmentHook: (clientConfig?: ClaudeClientConfig) => EnrichmentHook;
