/**
 * Decommission Calculator: identifies which legacy programs can be safely turned off.
 *
 * A program P can be decommissioned from legacy if:
 * 1. P is verified (modern replacement works) or N/A (not applicable)
 * 2. ALL callers of P are also decommissionable (no legacy code still depends on P)
 *
 * Root programs (no callers) only need condition 1.
 * Shared programs (ECF) need ALL callers across ALL projects to be decommissionable.
 * SCC members: all must be decommissionable together (atomic unit).
 */
import type { Program, PipelineStatus, SCC, DecommissionResult } from '../core/types.js';
type NodeId = string | number;
export interface DecommissionInput {
    programs: Program[];
    programStatuses: Map<NodeId, PipelineStatus>;
    naPrograms: Set<NodeId>;
    sharedPrograms: Set<NodeId>;
    sccs: SCC[];
}
export declare const calculateDecommission: (input: DecommissionInput) => DecommissionResult;
export {};
