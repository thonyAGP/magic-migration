/**
 * Auto-Contract Generator: combine spec parsing + codebase scanning
 * to produce a complete MigrationContract.
 */
import path from 'node:path';
import { parseSpecFile } from './spec-parser.js';
import { scanCodebase } from './codebase-scanner.js';
export const generateAutoContract = (options) => {
    const { specFile, codebaseDir, projectDir, initialStatus = 'contracted' } = options;
    const parsed = parseSpecFile(specFile);
    if (!parsed)
        return null;
    // Scan codebase to find existing implementations
    const scanOpts = { codebaseDir, projectDir };
    const scanned = scanCodebase(parsed.rules, parsed.tables, parsed.callees, parsed.variables, scanOpts);
    // Compute coverage
    const allItems = [
        ...scanned.rules,
        ...scanned.tables,
        ...scanned.callees,
        ...scanned.variables,
    ];
    const totalItems = allItems.length;
    const naItems = allItems.filter(i => i.status === 'N/A').length;
    const implItems = allItems.filter(i => i.status === 'IMPL').length;
    const partialItems = allItems.filter(i => i.status === 'PARTIAL').length;
    const denominator = totalItems - naItems;
    const coveragePct = denominator > 0
        ? Math.round(((implItems + partialItems * 0.5) / denominator) * 100)
        : 100;
    const overall = {
        rulesTotal: scanned.rules.length,
        rulesImpl: scanned.rules.filter(r => r.status === 'IMPL').length,
        rulesPartial: scanned.rules.filter(r => r.status === 'PARTIAL').length,
        rulesMissing: scanned.rules.filter(r => r.status === 'MISSING').length,
        rulesNa: scanned.rules.filter(r => r.status === 'N/A').length,
        variablesKeyCount: scanned.variables.length,
        calleesTotal: scanned.callees.length,
        calleesImpl: scanned.callees.filter(c => c.status === 'IMPL').length,
        calleesMissing: scanned.callees.filter(c => c.status === 'MISSING').length,
        coveragePct,
        status: initialStatus,
        generated: new Date().toISOString(),
        notes: `Auto-generated from ${path.basename(specFile)}`,
    };
    const resolvedId = options.programId != null
        ? (typeof options.programId === 'string' ? parseInt(options.programId, 10) : options.programId)
        : parsed.programId;
    return {
        program: {
            id: resolvedId || parsed.programId,
            name: parsed.programName,
            complexity: 'MEDIUM',
            callers: [],
            callees: [],
            tasksCount: parsed.tasksCount,
            tablesCount: parsed.tablesModified,
            expressionsCount: parsed.expressionsCount,
        },
        rules: scanned.rules,
        variables: scanned.variables,
        tables: scanned.tables,
        callees: scanned.callees,
        overall,
    };
};
//# sourceMappingURL=auto-contract.js.map