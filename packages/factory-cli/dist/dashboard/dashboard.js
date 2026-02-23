/**
 * Dashboard: CLI-formatted migration progress views.
 */
import { formatCoverageBar } from '../core/coverage.js';
import { loadContracts } from '../core/contract.js';
import { computeOverallCoverage } from '../core/coverage.js';
/**
 * Render the global progress dashboard as text.
 */
export const renderDashboard = (data) => {
    const { tracker, contractsDir, programs } = data;
    const contracts = loadContracts(contractsDir);
    const lines = [];
    lines.push('='.repeat(60));
    lines.push('  SPECMAP MIGRATION DASHBOARD');
    lines.push('='.repeat(60));
    lines.push('');
    // Global stats
    lines.push('GLOBAL STATS:');
    lines.push(`  Total programs:   ${tracker.stats.totalPrograms}`);
    lines.push(`  Live programs:    ${tracker.stats.livePrograms}`);
    lines.push(`  Orphan programs:  ${tracker.stats.orphanPrograms}`);
    lines.push(`  Shared (ECF):     ${tracker.stats.sharedPrograms}`);
    lines.push(`  Max level:        ${tracker.stats.maxLevel}`);
    lines.push('');
    // Pipeline progress
    const { contracted, enriched, verified } = tracker.stats;
    const live = tracker.stats.livePrograms || 1;
    lines.push('PIPELINE:');
    lines.push(`  Contracted: ${String(contracted).padStart(4)} / ${live}  ${formatCoverageBar(Math.round(contracted / live * 100))}`);
    lines.push(`  Enriched:   ${String(enriched).padStart(4)} / ${live}  ${formatCoverageBar(Math.round(enriched / live * 100))}`);
    lines.push(`  Verified:   ${String(verified).padStart(4)} / ${live}  ${formatCoverageBar(Math.round(verified / live * 100))}`);
    lines.push('');
    // Batches
    if (tracker.batches.length > 0) {
        lines.push('BATCHES:');
        for (const batch of tracker.batches) {
            const statusIcon = batch.status === 'verified' ? '[OK]'
                : batch.status === 'enriched' ? '[~~]'
                    : batch.status === 'contracted' ? '[>>]'
                        : '[..]';
            lines.push(`  ${statusIcon} ${batch.id} - ${batch.name} (${batch.programs} progs, ${batch.status})`);
            if (batch.stats.coverageAvgFrontend > 0) {
                lines.push(`       Coverage: ${batch.stats.coverageAvgFrontend}% | PARTIAL: ${batch.stats.totalPartial} | MISSING: ${batch.stats.totalMissing}`);
            }
        }
        lines.push('');
    }
    // Per-contract coverage (top 10 lowest)
    if (contracts.size > 0) {
        const contractList = [...contracts.entries()]
            .map(([id, c]) => ({ id, coverage: computeOverallCoverage(c), status: c.overall.status }))
            .sort((a, b) => a.coverage - b.coverage);
        lines.push('CONTRACTS (lowest coverage first):');
        for (const c of contractList.slice(0, 10)) {
            const prog = programs.find(p => p.id === c.id);
            const name = prog?.name ?? String(c.id);
            lines.push(`  ${String(c.id).padStart(4)} ${name.padEnd(35).slice(0, 35)} ${formatCoverageBar(c.coverage, 15)} [${c.status}]`);
        }
        if (contractList.length > 10) {
            lines.push(`  ... and ${contractList.length - 10} more`);
        }
        lines.push('');
    }
    lines.push(`Last computed: ${tracker.stats.lastComputed || tracker.updated}`);
    lines.push('='.repeat(60));
    return lines.join('\n');
};
//# sourceMappingURL=dashboard.js.map