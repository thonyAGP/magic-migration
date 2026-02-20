/**
 * Graph algorithms: BFS traversal, Tarjan SCC, topological sort, level computation.
 * Extracted and genericized from build-graph.mjs.
 */
import type { Program, SCC } from './types.js';
type NodeId = string | number;
export interface AdjacencyGraph {
    nodes: Set<NodeId>;
    edges: Map<NodeId, Set<NodeId>>;
}
export declare const buildAdjacency: (programs: Program[]) => AdjacencyGraph;
export declare const bfs: (graph: AdjacencyGraph, seeds: NodeId[]) => Set<NodeId>;
export declare const tarjanSCC: (graph: AdjacencyGraph) => SCC[];
export interface CondensationDAG {
    sccs: SCC[];
    nodeToScc: Map<NodeId, number>;
    sccEdges: Map<number, Set<number>>;
}
export declare const buildCondensation: (graph: AdjacencyGraph, sccs: SCC[]) => CondensationDAG;
export declare const computeLevels: (dag: CondensationDAG) => Map<NodeId, number>;
export declare const transitiveClosure: (graph: AdjacencyGraph, root: NodeId) => Set<NodeId>;
export declare const topologicalSort: (dag: CondensationDAG) => number[];
export interface GraphAnalysis {
    adjacency: AdjacencyGraph;
    sccs: SCC[];
    dag: CondensationDAG;
    levels: Map<NodeId, number>;
    maxLevel: number;
    multiNodeSccs: SCC[];
}
export declare const analyzeGraph: (programs: Program[]) => GraphAnalysis;
export {};
