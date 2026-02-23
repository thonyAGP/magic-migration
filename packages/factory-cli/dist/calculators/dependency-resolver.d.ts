/**
 * Dependency resolver: topological sort with SCC collapse and level computation.
 * Wraps graph.ts algorithms into a high-level API.
 */
import type { Program, SCC, DependencyGraph } from '../core/types.js';
import { type CondensationDAG, type AdjacencyGraph } from '../core/graph.js';
export interface ResolvedDependencies {
    adjacency: AdjacencyGraph;
    sccs: SCC[];
    dag: CondensationDAG;
    levels: Map<string | number, number>;
    maxLevel: number;
    multiNodeSccs: SCC[];
    processingOrder: (string | number)[];
    dependencyGraph: DependencyGraph;
}
/**
 * Full dependency resolution pipeline.
 * Returns processing order (leaf-first) and level assignments.
 */
export declare const resolveDependencies: (programs: Program[]) => ResolvedDependencies;
/**
 * Get all ancestors (callers transitively) for a node.
 */
export declare const getAncestors: (programs: Program[], nodeId: string | number) => Set<string | number>;
