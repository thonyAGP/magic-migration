/**
 * Coverage calculation for migration contracts.
 * Formula: (impl + partial * 0.5) / (total - na) * 100
 */
const countStatuses = (items) => {
    let impl = 0, partial = 0, missing = 0, na = 0;
    for (const item of items) {
        switch (item.status) {
            case 'IMPL':
                impl++;
                break;
            case 'PARTIAL':
                partial++;
                break;
            case 'MISSING':
                missing++;
                break;
            case 'N/A':
                na++;
                break;
        }
    }
    const total = items.length;
    const applicable = total - na;
    const coveragePct = applicable > 0
        ? Math.round((impl + partial * 0.5) / applicable * 100)
        : 100;
    return { impl, partial, missing, na, total, coveragePct };
};
export const computeRulesCoverage = (contract) => countStatuses(contract.rules);
export const computeVariablesCoverage = (contract) => countStatuses(contract.variables);
export const computeTablesCoverage = (contract) => countStatuses(contract.tables);
export const computeCalleesCoverage = (contract) => countStatuses(contract.callees);
export const computeOverallCoverage = (contract) => {
    const rules = computeRulesCoverage(contract);
    const variables = computeVariablesCoverage(contract);
    const tables = computeTablesCoverage(contract);
    const callees = computeCalleesCoverage(contract);
    const totalApplicable = (rules.total - rules.na) +
        (variables.total - variables.na) +
        (tables.total - tables.na) +
        (callees.total - callees.na);
    if (totalApplicable === 0)
        return 100;
    const totalImpl = rules.impl + variables.impl + tables.impl + callees.impl;
    const totalPartial = rules.partial + variables.partial + tables.partial + callees.partial;
    return Math.round((totalImpl + totalPartial * 0.5) / totalApplicable * 100);
};
export const formatCoverageBar = (pct, width = 20) => {
    const filled = Math.round(pct / 100 * width);
    const empty = width - filled;
    const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
    return `[${bar}] ${pct}%`;
};
//# sourceMappingURL=coverage.js.map