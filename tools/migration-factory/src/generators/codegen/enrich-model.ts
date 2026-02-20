/**
 * Enrichment model types for v9 AI-assisted code generation.
 * Two tiers: heuristic (free, deterministic) + Claude API (paid, ~$0.028/prog).
 */

export interface EntityFieldDef {
  name: string;
  type: string;
}

export interface EnrichmentData {
  stateFieldTypes: Record<string, string>;
  stateFieldDefaults: Record<string, string>;
  entityFields: Record<string, EntityFieldDef[]>;
  actionBodies: Record<string, string>;
  testAssertions: Record<string, string>;
}

export type EnrichMode = 'none' | 'heuristic' | 'claude';

export interface CodegenEnrichConfig {
  mode: EnrichMode;
  model?: string;
  apiKey?: string;
}

export const emptyEnrichment = (): EnrichmentData => ({
  stateFieldTypes: {},
  stateFieldDefaults: {},
  entityFields: {},
  actionBodies: {},
  testAssertions: {},
});
