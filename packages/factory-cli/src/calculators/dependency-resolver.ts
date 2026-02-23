/**
 * Dependency resolver: topological sort with SCC collapse and level computation.
 * Wraps graph.ts algorithms into a high-level API.
 */

import type { Program, SCC, DependencyGraph } from '../core/types.js';
import {
  buildAdjacency, tarjanSCC, buildCondensation, computeLevels,
  topologicalSort, type CondensationDAG, type AdjacencyGraph,
} from '../core/graph.js';

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
export const resolveDependencies = (programs: Program[]): ResolvedDependencies => {
  const adjacency = buildAdjacency(programs);
  const sccs = tarjanSCC(adjacency);
  const dag = buildCondensation(adjacency, sccs);
  const levels = computeLevels(dag);
  const maxLevel = Math.max(...[...levels.values()], 0);
  const multiNodeSccs = sccs.filter(s => s.members.length > 1);

  // Processing order: topological sort on DAG, then expand SCC members
  // Reversed = leaf-first (since topo sort gives roots first on callee graph)
  const topoOrder = topologicalSort(dag);
  const processingOrder: (string | number)[] = [];
  for (const sccIdx of topoOrder) {
    const scc = sccs.find(s => s.index === sccIdx);
    if (scc) {
      for (const member of scc.members) {
        processingOrder.push(member);
      }
    }
  }

  // Build dependency graph output
  const levelMap: Record<string, (string | number)[]> = {};
  const programsByLevel: Record<string, number> = {};
  for (let i = 0; i <= maxLevel; i++) {
    const key = String(i);
    levelMap[key] = [];
    programsByLevel[key] = 0;
  }
  for (const [nodeId, level] of levels) {
    const key = String(level);
    levelMap[key].push(nodeId);
    programsByLevel[key] = (programsByLevel[key] ?? 0) + 1;
  }

  const dependencyGraph: DependencyGraph = {
    generated: new Date().toISOString().slice(0, 10),
    levels: levelMap,
    maxLevel,
    programsByLevel,
  };

  return {
    adjacency,
    sccs,
    dag,
    levels,
    maxLevel,
    multiNodeSccs,
    processingOrder,
    dependencyGraph,
  };
};

/**
 * Get all ancestors (callers transitively) for a node.
 */
export const getAncestors = (
  programs: Program[],
  nodeId: string | number
): Set<string | number> => {
  // Build reverse graph (caller -> callee becomes callee -> caller)
  const reverseEdges = new Map<string | number, Set<string | number>>();
  for (const p of programs) {
    if (!reverseEdges.has(p.id)) reverseEdges.set(p.id, new Set());
    for (const callee of p.callees) {
      if (!reverseEdges.has(callee)) reverseEdges.set(callee, new Set());
      reverseEdges.get(callee)!.add(p.id);
    }
  }

  const visited = new Set<string | number>();
  const queue = [nodeId];
  visited.add(nodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const parents = reverseEdges.get(current) ?? new Set();
    for (const parent of parents) {
      if (!visited.has(parent)) {
        visited.add(parent);
        queue.push(parent);
      }
    }
  }

  visited.delete(nodeId); // exclude self
  return visited;
};
