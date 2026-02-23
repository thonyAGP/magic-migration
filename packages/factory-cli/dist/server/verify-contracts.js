/**
 * Contract verification: pure function for auto-verifying enriched contracts.
 * Extracted from cli.ts verify command for reuse by action server.
 */
import fs from 'node:fs';
import { parseContract, writeContract } from '../core/contract.js';
import { PipelineStatus } from '../core/types.js';
export const verifyContracts = (contractDir, options) => {
    const dryRun = options?.dryRun ?? false;
    const details = [];
    if (!fs.existsSync(contractDir)) {
        return { verified: 0, notReady: 0, alreadyVerified: 0, dryRun, details };
    }
    const allFiles = fs.readdirSync(contractDir).filter(f => f.endsWith('.contract.yaml'));
    const targetIds = options?.programs
        ? new Set(options.programs.split(',').map(s => s.trim()))
        : null;
    let verified = 0;
    let notReady = 0;
    let alreadyVerified = 0;
    for (const file of allFiles) {
        const filePath = `${contractDir}/${file}`;
        const contract = parseContract(filePath);
        const id = String(contract.program.id);
        if (targetIds && !targetIds.has(id))
            continue;
        if (contract.overall.status === PipelineStatus.VERIFIED) {
            alreadyVerified++;
            details.push({ id, status: 'already-verified' });
            continue;
        }
        if (contract.overall.status !== PipelineStatus.ENRICHED) {
            details.push({ id, status: 'skipped' });
            continue;
        }
        const completedStatuses = new Set(['IMPL', 'N/A']);
        const gaps = [];
        for (const r of contract.rules) {
            if (!completedStatuses.has(r.status))
                gaps.push(`rule ${r.id}: ${r.status}`);
        }
        for (const v of contract.variables) {
            if (!completedStatuses.has(v.status))
                gaps.push(`var ${v.localId}: ${v.status}`);
        }
        for (const t of contract.tables) {
            if (!completedStatuses.has(t.status))
                gaps.push(`table ${t.id}: ${t.status}`);
        }
        for (const c of contract.callees) {
            if (!completedStatuses.has(c.status))
                gaps.push(`callee ${c.id}: ${c.status}`);
        }
        if (gaps.length > 0) {
            notReady++;
            details.push({ id, status: 'not-ready', gaps: gaps.slice(0, 5) });
        }
        else {
            if (!dryRun) {
                contract.overall.status = PipelineStatus.VERIFIED;
                contract.overall.coveragePct = 100;
                writeContract(contract, filePath);
            }
            verified++;
            details.push({ id, status: 'verified' });
        }
    }
    return { verified, notReady, alreadyVerified, dryRun, details };
};
//# sourceMappingURL=verify-contracts.js.map