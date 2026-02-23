import { describe, it, expect } from 'vitest';
import type { Program } from '../src/core/types.js';
import {
  buildAdjacency, tarjanSCC, buildCondensation, computeLevels,
  transitiveClosure, topologicalSort, bfs,
} from '../src/core/graph.js';

const loadFixture = (name: string): Program[] => {
   
  const data = require(`./fixtures/${name}.json`);
  return data as Program[];
};

describe('buildAdjacency', () => {
  it('should create nodes and edges from programs', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);

    expect(graph.nodes.size).toBe(5);
    expect(graph.edges.get(1)?.size).toBe(2); // Main calls MenuA, MenuB
    expect(graph.edges.get(4)?.size).toBe(0); // LeafA has no callees
  });
});

describe('bfs', () => {
  it('should find all reachable nodes from seed', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);
    const visited = bfs(graph, [1]);

    expect(visited.size).toBe(5); // All reachable from Main
  });

  it('should handle partial seeds', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);
    const visited = bfs(graph, [3]); // Start from MenuB

    expect(visited.has(3)).toBe(true);
    expect(visited.has(5)).toBe(true); // MenuB -> SharedLeaf
    expect(visited.has(1)).toBe(false); // Main not reachable going forward
    expect(visited.size).toBe(2);
  });
});

describe('tarjanSCC', () => {
  it('should find no cycles in acyclic graph', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);
    const sccs = tarjanSCC(graph);

    // All SCCs should be single-node
    expect(sccs.every(s => s.members.length === 1)).toBe(true);
    expect(sccs.length).toBe(5);
  });

  it('should detect cycle in cyclic graph', () => {
    const programs = loadFixture('cyclic-graph');
    const graph = buildAdjacency(programs);
    const sccs = tarjanSCC(graph);

    const multiNode = sccs.filter(s => s.members.length > 1);
    expect(multiNode.length).toBe(1);

    const cycleScc = multiNode[0];
    expect(cycleScc.members).toContain(2);
    expect(cycleScc.members).toContain(3);
    expect(cycleScc.members.length).toBe(2);
  });
});

describe('computeLevels', () => {
  it('should assign level 0 to leaves', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);
    const sccs = tarjanSCC(graph);
    const dag = buildCondensation(graph, sccs);
    const levels = computeLevels(dag);

    expect(levels.get(4)).toBe(0); // LeafA
    expect(levels.get(5)).toBe(0); // SharedLeaf
  });

  it('should assign correct levels to non-leaves', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);
    const sccs = tarjanSCC(graph);
    const dag = buildCondensation(graph, sccs);
    const levels = computeLevels(dag);

    expect(levels.get(3)).toBe(1); // MenuB (calls SharedLeaf at 0)
    expect(levels.get(2)).toBe(1); // MenuA (calls LeafA, SharedLeaf both at 0)
    expect(levels.get(1)).toBe(2); // Main (calls MenuA, MenuB at 1)
  });

  it('should assign same level to SCC members', () => {
    const programs = loadFixture('cyclic-graph');
    const graph = buildAdjacency(programs);
    const sccs = tarjanSCC(graph);
    const dag = buildCondensation(graph, sccs);
    const levels = computeLevels(dag);

    expect(levels.get(2)).toBe(levels.get(3)); // CycleA and CycleB same level
    expect(levels.get(4)).toBe(0); // Leaf
  });
});

describe('transitiveClosure', () => {
  it('should find all descendants', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);
    const closure = transitiveClosure(graph, 1);

    expect(closure.size).toBe(5); // Main + all descendants
    expect(closure.has(1)).toBe(true);
    expect(closure.has(4)).toBe(true);
  });

  it('should handle leaf nodes', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);
    const closure = transitiveClosure(graph, 4);

    expect(closure.size).toBe(1); // Only self
    expect(closure.has(4)).toBe(true);
  });

  it('should handle cycles without infinite loop', () => {
    const programs = loadFixture('cyclic-graph');
    const graph = buildAdjacency(programs);
    const closure = transitiveClosure(graph, 1);

    expect(closure.size).toBe(4); // All nodes
  });
});

describe('topologicalSort', () => {
  it('should produce valid ordering', () => {
    const programs = loadFixture('small-graph');
    const graph = buildAdjacency(programs);
    const sccs = tarjanSCC(graph);
    const dag = buildCondensation(graph, sccs);
    const sorted = topologicalSort(dag);

    expect(sorted.length).toBe(sccs.length);
  });
});
