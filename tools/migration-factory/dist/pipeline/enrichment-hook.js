/**
 * Enrichment hook interface: extensible mechanism for auto-enrichment.
 * v3: ManualEnrichmentHook (report gaps, no modification)
 * v4: ClaudeApiEnrichmentHook (auto-enrich via Claude API)
 */
/**
 * Manual enrichment: always reports gaps, never modifies contracts.
 * This is the default for v3 - the pipeline stops and reports what needs human work.
 */
export const createManualEnrichmentHook = () => ({
    name: 'manual',
    canEnrich() {
        return false;
    },
    async enrich(context) {
        const allItems = [
            ...context.contract.rules,
            ...context.contract.variables,
            ...context.contract.tables,
            ...context.contract.callees,
        ];
        const gaps = allItems.filter(i => i.status !== 'IMPL' && i.status !== 'N/A');
        return {
            enriched: false,
            message: `${gaps.length} gaps require manual enrichment`,
            gapsResolved: 0,
            gapsRemaining: gaps.length,
        };
    },
});
// Re-export Claude enrichment hook
export { createClaudeEnrichmentHook } from './claude-enrichment-hook.js';
//# sourceMappingURL=enrichment-hook.js.map