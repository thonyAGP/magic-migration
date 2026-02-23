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

// ─── Build adjacency from programs ───────────────────────────────

export const buildAdjacency = (programs: Program[]): AdjacencyGraph => {
  const nodes = new Set<NodeId>(programs.map(p => p.id));
  const edges = new Map<NodeId, Set<NodeId>>();

  for (const p of programs) {
    edges.set(p.id, new Set(p.callees.filter(c => nodes.has(c))));
  }

  return { nodes, edges };
};

// ─── BFS from seeds ──────────────────────────────────────────────

export const bfs = (
  graph: AdjacencyGraph,
  seeds: NodeId[]
): Set<NodeId> => {
  const visited = new Set<NodeId>();
  const queue: NodeId[] = [];

  for (const seed of seeds) {
    if (graph.nodes.has(seed) && !visited.has(seed)) {
      visited.add(seed);
      queue.push(seed);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = graph.edges.get(current) ?? new Set();
    for (const next of neighbors) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return visited;
};

// ─── Tarjan's SCC algorithm ─────────────────────────────────────

export const tarjanSCC = (graph: AdjacencyGraph): SCC[] => {
  let index = 0;
  const stack: NodeId[] = [];
  const onStack = new Set<NodeId>();
  const indices = new Map<NodeId, number>();
  const lowlinks = new Map<NodeId, number>();
  const sccs: SCC[] = [];
  let sccIndex = 0;

  const strongConnect = (v: NodeId): void => {
    indices.set(v, index);
    lowlinks.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    const neighbors = graph.edges.get(v) ?? new Set();
    for (const w of neighbors) {
      if (!graph.nodes.has(w)) continue;
      if (!indices.has(w)) {
        strongConnect(w);
        lowlinks.set(v, Math.min(lowlinks.get(v)!, lowlinks.get(w)!));
      } else if (onStack.has(w)) {
        lowlinks.set(v, Math.min(lowlinks.get(v)!, indices.get(w)!));
      }
    }

    if (lowlinks.get(v) === indices.get(v)) {
      const scc: NodeId[] = [];
      let w: NodeId;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);

      sccs.push({ index: sccIndex++, members: scc, level: -1 });
    }
  };

  for (const node of graph.nodes) {
    if (!indices.has(node)) {
      strongConnect(node);
    }
  }

  return sccs;
};

// ─── Build condensation DAG from SCCs ────────────────────────────

export interface CondensationDAG {
  sccs: SCC[];
  nodeToScc: Map<NodeId, number>;
  sccEdges: Map<number, Set<number>>;
}

export const buildCondensation = (
  graph: AdjacencyGraph,
  sccs: SCC[]
): CondensationDAG => {
  const nodeToScc = new Map<NodeId, number>();
  for (const scc of sccs) {
    for (const node of scc.members) {
      nodeToScc.set(node, scc.index);
    }
  }

  const sccEdges = new Map<number, Set<number>>();
  for (const scc of sccs) {
    sccEdges.set(scc.index, new Set());
  }

  for (const node of graph.nodes) {
    const sccIdx = nodeToScc.get(node)!;
    const neighbors = graph.edges.get(node) ?? new Set();
    for (const neighbor of neighbors) {
      const neighborScc = nodeToScc.get(neighbor);
      if (neighborScc !== undefined && neighborScc !== sccIdx) {
        sccEdges.get(sccIdx)!.add(neighborScc);
      }
    }
  }

  return { sccs, nodeToScc, sccEdges };
};

// ─── Compute levels on condensation DAG ──────────────────────────
// Level 0 = leaf (no outgoing edges in DAG)
// Level N = max(child levels) + 1

export const computeLevels = (dag: CondensationDAG): Map<NodeId, number> => {
  const sccLevels = new Map<number, number>();

  const computeSccLevel = (sccIdx: number): number => {
    if (sccLevels.has(sccIdx)) return sccLevels.get(sccIdx)!;

    const children = dag.sccEdges.get(sccIdx) ?? new Set();
    if (children.size === 0) {
      sccLevels.set(sccIdx, 0);
      return 0;
    }

    let maxChildLevel = 0;
    for (const child of children) {
      const childLevel = computeSccLevel(child);
      if (childLevel + 1 > maxChildLevel) {
        maxChildLevel = childLevel + 1;
      }
    }

    sccLevels.set(sccIdx, maxChildLevel);
    return maxChildLevel;
  };

  for (const scc of dag.sccs) {
    computeSccLevel(scc.index);
    scc.level = sccLevels.get(scc.index)!;
  }

  const nodeLevels = new Map<NodeId, number>();
  for (const scc of dag.sccs) {
    for (const node of scc.members) {
      nodeLevels.set(node, scc.level);
    }
  }

  return nodeLevels;
};

// ─── Transitive closure (all descendants) ────────────────────────

export const transitiveClosure = (
  graph: AdjacencyGraph,
  root: NodeId
): Set<NodeId> => {
  const visited = new Set<NodeId>();
  const queue: NodeId[] = [root];
  visited.add(root);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = graph.edges.get(current) ?? new Set();
    for (const next of neighbors) {
      if (!visited.has(next) && graph.nodes.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return visited;
};

// ─── Topological sort (Kahn's algorithm on condensation DAG) ─────

export const topologicalSort = (dag: CondensationDAG): number[] => {
  const inDegree = new Map<number, number>();
  for (const scc of dag.sccs) {
    inDegree.set(scc.index, 0);
  }

  for (const [, children] of dag.sccEdges) {
    for (const child of children) {
      inDegree.set(child, (inDegree.get(child) ?? 0) + 1);
    }
  }

  const queue: number[] = [];
  for (const [idx, degree] of inDegree) {
    if (degree === 0) queue.push(idx);
  }

  const sorted: number[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    const children = dag.sccEdges.get(current) ?? new Set();
    for (const child of children) {
      const newDegree = inDegree.get(child)! - 1;
      inDegree.set(child, newDegree);
      if (newDegree === 0) queue.push(child);
    }
  }

  return sorted;
};

// ─── Full pipeline: programs → graph with levels ─────────────────

export interface GraphAnalysis {
  adjacency: AdjacencyGraph;
  sccs: SCC[];
  dag: CondensationDAG;
  levels: Map<NodeId, number>;
  maxLevel: number;
  multiNodeSccs: SCC[];
}

export const analyzeGraph = (programs: Program[]): GraphAnalysis => {
  const adjacency = buildAdjacency(programs);
  const sccs = tarjanSCC(adjacency);
  const dag = buildCondensation(adjacency, sccs);
  const levels = computeLevels(dag);

  const maxLevel = Math.max(...[...levels.values()], 0);
  const multiNodeSccs = sccs.filter(s => s.members.length > 1);

  return { adjacency, sccs, dag, levels, maxLevel, multiNodeSccs };
};
