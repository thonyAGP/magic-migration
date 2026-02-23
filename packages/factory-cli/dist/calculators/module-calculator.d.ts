/**
 * Module Calculator: identifies deliverable subtrees.
 *
 * A module = root program + ALL transitive callees (full subtree).
 * Deliverable = 100% of subtree is verified (or N/A).
 *
 * Special cases:
 * - SCC (cycles): atomic unit - all must be verified together
 * - N/A programs: count as verified
 * - Shared programs (ECF): verified once, counts everywhere
 * - Maximal modules: if A is subset of B and both deliverable, only report B
 */
import type { Program, DeliverableModule, SCC, PipelineStatus } from '../core/types.js';
import { type AdjacencyGraph } from '../core/graph.js';
type NodeId = string | number;
export interface ModuleCalculatorInput {
    programs: Program[];
    adjacency: AdjacencyGraph;
    sccs: SCC[];
    levels: Map<NodeId, number>;
    programStatuses: Map<NodeId, PipelineStatus>;
    sharedPrograms: Set<NodeId>;
    naPrograms: Set<NodeId>;
}
export interface ModuleCalculatorOutput {
    allModules: DeliverableModule[];
    maximalModules: DeliverableModule[];
    deliverableModules: DeliverableModule[];
}
/**
 * Calculate all modules (one per program as potential root).
 */
export declare const calculateModules: (input: ModuleCalculatorInput) => ModuleCalculatorOutput;
export {};
