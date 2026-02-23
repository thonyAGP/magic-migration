/**
 * Pipeline status lifecycle management.
 * pending -> contracted -> enriched -> verified
 */
import { PipelineStatus } from './types.js';
const TRANSITIONS = {
    [PipelineStatus.PENDING]: [PipelineStatus.CONTRACTED],
    [PipelineStatus.CONTRACTED]: [PipelineStatus.ENRICHED, PipelineStatus.PENDING],
    [PipelineStatus.ENRICHED]: [PipelineStatus.VERIFIED, PipelineStatus.CONTRACTED],
    [PipelineStatus.VERIFIED]: [],
};
export const canTransition = (from, to) => (TRANSITIONS[from] ?? []).includes(to);
export const nextStatus = (current) => {
    const options = TRANSITIONS[current] ?? [];
    return options[0] ?? null;
};
export const isTerminal = (status) => status === PipelineStatus.VERIFIED;
export const statusOrder = (status) => {
    switch (status) {
        case PipelineStatus.PENDING: return 0;
        case PipelineStatus.CONTRACTED: return 1;
        case PipelineStatus.ENRICHED: return 2;
        case PipelineStatus.VERIFIED: return 3;
        default: return -1;
    }
};
export const isAtLeast = (status, minimum) => statusOrder(status) >= statusOrder(minimum);
//# sourceMappingURL=pipeline.js.map