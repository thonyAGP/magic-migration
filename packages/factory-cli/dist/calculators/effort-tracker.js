/**
 * Effort tracker: auto-timestamp status transitions and compute actual hours.
 */
/**
 * Track a status change by updating the appropriate timestamp.
 * Returns the updated effort object (creates one if missing).
 */
export const trackStatusChange = (contract, newStatus) => {
    const effort = { ...(contract.overall.effort ?? {}) };
    const now = new Date().toISOString();
    switch (newStatus) {
        case 'contracted':
            effort.contractedAt = effort.contractedAt ?? now;
            break;
        case 'enriched':
            effort.enrichedAt = effort.enrichedAt ?? now;
            break;
        case 'verified':
            effort.verifiedAt = effort.verifiedAt ?? now;
            break;
    }
    return effort;
};
/**
 * Compute actual hours from timestamps (contracted → verified).
 * Returns null if insufficient data.
 */
export const computeActualHours = (effort) => {
    if (!effort.contractedAt || !effort.verifiedAt)
        return null;
    const start = new Date(effort.contractedAt).getTime();
    const end = new Date(effort.verifiedAt).getTime();
    if (isNaN(start) || isNaN(end) || end <= start)
        return null;
    const ms = end - start;
    // Convert to working hours (assume 8h/day, exclude weekends would be complex,
    // so just compute calendar hours for now)
    return Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
};
/**
 * Compute elapsed hours from contracted to enriched.
 */
export const computeContractToEnrichHours = (effort) => {
    if (!effort.contractedAt || !effort.enrichedAt)
        return null;
    const start = new Date(effort.contractedAt).getTime();
    const end = new Date(effort.enrichedAt).getTime();
    if (isNaN(start) || isNaN(end) || end <= start)
        return null;
    return Math.round((end - start) / (1000 * 60 * 60) * 10) / 10;
};
//# sourceMappingURL=effort-tracker.js.map