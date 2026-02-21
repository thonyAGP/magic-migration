/**
 * Batch Planner: auto-suggests batches from program graph topology.
 *
 * Strategy:
 * 1. Find "natural roots" = programs with callers but no parent within same functional group
 * 2. For each root, compute subtree size
 * 3. Group by domain if available, otherwise by topology
 * 4. Target batch size: 10-30 programs (configurable)
 */
import type { Program, BatchPlan, SCC } from '../core/types.js';
import { type AdjacencyGraph } from '../core/graph.js';
type NodeId = string | number;
export interface BatchPlannerConfig {
    minBatchSize: number;
    maxBatchSize: number;
    preferDomainGrouping: boolean;
}
/**
 * Auto-suggest batches from the program graph.
 */
export declare const planBatches: (programs: Program[], adjacency: AdjacencyGraph, levels: Map<NodeId, number>, sccs: SCC[], config?: Partial<BatchPlannerConfig>) => BatchPlan;
export declare const isInfrastructureProgram: (name: string, level: number, maxLevel: number) => boolean;
export interface EnhancedBatchPlannerConfig extends BatchPlannerConfig {
    existingBatchPrograms: Set<NodeId>;
    excludeInfrastructure: boolean;
    startBatchNumber: number;
}
export declare const planBatchesWithExclusions: (programs: Program[], adjacency: AdjacencyGraph, levels: Map<NodeId, number>, sccs: SCC[], config?: Partial<EnhancedBatchPlannerConfig>) => BatchPlan;
export declare const groupByDomain: (ids: NodeId[], programMap: Map<string | number, Program>) => Map<string, NodeId[]>;
export declare const chunkArray: <T>(arr: T[], size: number) => T[][];
export declare const inferDomain: (name: string) => string;
export {};
