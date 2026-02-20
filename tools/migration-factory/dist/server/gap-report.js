/**
 * Gap report computation: pure function for analyzing contract gaps.
 * Extracted from cli.ts for reuse by both CLI and action server.
 */
import fs from 'node:fs';
import { parseContract } from '../core/contract.js';
import { PipelineStatus } from '../core/types.js';
export const computeGapReport = (contractDir, filterStatus) => {
    if (!fs.existsSync(contractDir)) {
        return { contracts: [], grandTotalGaps: 0, grandTotalItems: 0, globalPct: 0 };
    }
    const gapFiles = fs.readdirSync(contractDir).filter(f => f.endsWith('.contract.yaml'));
    const completedSet = new Set(['IMPL', 'N/A']);
    const allGaps = [];
    let grandTotalGaps = 0;
    let grandTotalItems = 0;
    for (const file of gapFiles) {
        const contract = parseContract(`${contractDir}/${file}`);
        if (filterStatus && contract.overall.status !== filterStatus)
            continue;
        if (contract.overall.status === PipelineStatus.VERIFIED)
            continue;
        const gaps = [];
        let total = 0;
        let impl = 0;
        for (const r of contract.rules) {
            total++;
            if (completedSet.has(r.status)) {
                impl++;
            }
            else {
                gaps.push({ type: 'rule', id: r.id, status: r.status, notes: r.gapNotes });
            }
        }
        for (const v of contract.variables) {
            total++;
            if (completedSet.has(v.status)) {
                impl++;
            }
            else {
                gaps.push({ type: 'var', id: v.localId, status: v.status, notes: v.gapNotes });
            }
        }
        for (const t of contract.tables) {
            total++;
            if (completedSet.has(t.status)) {
                impl++;
            }
            else {
                gaps.push({ type: 'table', id: String(t.id), status: t.status, notes: t.gapNotes });
            }
        }
        for (const c of contract.callees) {
            total++;
            if (completedSet.has(c.status)) {
                impl++;
            }
            else {
                gaps.push({ type: 'callee', id: String(c.id), status: c.status, notes: c.gapNotes });
            }
        }
        if (gaps.length > 0) {
            allGaps.push({ id: String(contract.program.id), name: contract.program.name, pipelineStatus: contract.overall.status, gaps, total, impl });
            grandTotalGaps += gaps.length;
        }
        grandTotalItems += total;
    }
    allGaps.sort((a, b) => b.gaps.length - a.gaps.length);
    const implTotal = grandTotalItems - grandTotalGaps;
    const globalPct = grandTotalItems > 0 ? Math.round((implTotal / grandTotalItems) * 100) : 0;
    return { contracts: allGaps, grandTotalGaps, grandTotalItems, globalPct };
};
//# sourceMappingURL=gap-report.js.map