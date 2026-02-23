/**
 * Enrichment model types for v9 AI-assisted code generation.
 * Two tiers: heuristic (free, deterministic) + Claude API (paid, ~$0.028/prog).
 */
export const emptyEnrichment = () => ({
    stateFieldTypes: {},
    stateFieldDefaults: {},
    entityFields: {},
    actionBodies: {},
    testAssertions: {},
});
//# sourceMappingURL=enrich-model.js.map