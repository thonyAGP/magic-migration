import { describe, it, expect } from 'vitest';
import type { Program, PipelineStatus, SCC } from '../src/core/types.js';
import { buildAdjacency, tarjanSCC, buildCondensation, computeLevels } from '../src/core/graph.js';
import { calculateDecommission } from '../src/calculators/decommission-calculator.js';

const loadFixture = (name: string): Program[] => {
  const data = require(`./fixtures/${name}.json`);
  return data as Program[];
};

const setupGraph = (programs: Program[]) => {
  const adjacency = buildAdjacency(programs);
  const sccs = tarjanSCC(adjacency);
  const dag = buildCondensation(adjacency, sccs);
  const levels = computeLevels(dag);
  return { adjacency, sccs, levels };
};

describe('calculateDecommission', () => {
  it('should decommission nothing when no programs are verified', () => {
    const programs = loadFixture('small-graph');
    const { sccs } = setupGraph(programs);

    const result = calculateDecommission({
      programs,
      programStatuses: new Map(),
      naPrograms: new Set(),
      sharedPrograms: new Set(),
      sccs,
    });

    expect(result.decommissionable.length).toBe(0);
    expect(result.blocked.length).toBe(5);
    expect(result.stats.blockedByStatus).toBe(5);
  });

  it('should decommission root when verified and all subtree verified', () => {
    const programs = loadFixture('small-graph');
    const { sccs } = setupGraph(programs);

    // All verified
    const statuses = new Map<string | number, PipelineStatus>(
      programs.map(p => [p.id, 'verified'])
    );

    const result = calculateDecommission({
      programs,
      programStatuses: statuses,
      naPrograms: new Set(),
      sharedPrograms: new Set(),
      sccs,
    });

    expect(result.decommissionable.length).toBe(5);
    expect(result.blocked.length).toBe(0);
    expect(result.stats.decommissionPct).toBe(100);
  });

  it('should NOT decommission leaf when caller is not verified', () => {
    const programs = loadFixture('small-graph');
    const { sccs } = setupGraph(programs);

    // Only leaves verified, not callers
    const statuses = new Map<string | number, PipelineStatus>([
      [4, 'verified'],
      [5, 'verified'],
    ]);

    const result = calculateDecommission({
      programs,
      programStatuses: statuses,
      naPrograms: new Set(),
      sharedPrograms: new Set(),
      sccs,
    });

    // Leaves are verified but their callers (2, 3) are not verified
    // So nobody can be decommissioned
    expect(result.decommissionable.length).toBe(0);
    expect(result.stats.blockedByCallers).toBe(2); // 4 and 5 verified but callers active
    expect(result.stats.blockedByStatus).toBe(3); // 1, 2, 3 not verified
  });

  it('should decommission subtree when entire branch is verified', () => {
    const programs = loadFixture('small-graph');
    const { sccs } = setupGraph(programs);

    // Main(1), MenuA(2), LeafA(4), SharedLeaf(5) all verified
    // MenuB(3) NOT verified
    const statuses = new Map<string | number, PipelineStatus>([
      [1, 'verified'],
      [2, 'verified'],
      [4, 'verified'],
      [5, 'verified'],
    ]);

    const result = calculateDecommission({
      programs,
      programStatuses: statuses,
      naPrograms: new Set(),
      sharedPrograms: new Set([5]),
      sccs,
    });

    // Main(1) is root, verified → decommissionable
    // MenuA(2) caller is Main(1) which is decommissionable → decommissionable
    // LeafA(4) caller is MenuA(2) which is decommissionable → decommissionable
    // SharedLeaf(5) callers are MenuA(2) and MenuB(3). MenuB(3) NOT verified → blocked
    // MenuB(3) caller is Main(1) which is decommissionable, but MenuB itself not verified → blocked
    expect(result.decommissionable.map(d => d.id).sort()).toEqual([1, 2, 4]);
    expect(result.blocked.map(b => b.id).sort()).toEqual([3, 5]);
  });

  it('should handle N/A programs as verified for decommission', () => {
    const programs = loadFixture('small-graph');
    const { sccs } = setupGraph(programs);

    // All verified or N/A
    const statuses = new Map<string | number, PipelineStatus>([
      [1, 'verified'],
      [2, 'verified'],
      [3, 'verified'],
      // 4 is N/A
      [5, 'verified'],
    ]);

    const result = calculateDecommission({
      programs,
      programStatuses: statuses,
      naPrograms: new Set([4]),
      sharedPrograms: new Set(),
      sccs,
    });

    expect(result.decommissionable.length).toBe(5);
    expect(result.stats.decommissionPct).toBe(100);
  });

  it('should handle cyclic graphs with SCC', () => {
    const programs = loadFixture('cyclic-graph');
    const { sccs } = setupGraph(programs);

    // All verified
    const statuses = new Map<string | number, PipelineStatus>(
      programs.map(p => [p.id, 'verified'])
    );

    const result = calculateDecommission({
      programs,
      programStatuses: statuses,
      naPrograms: new Set(),
      sharedPrograms: new Set(),
      sccs,
    });

    expect(result.decommissionable.length).toBe(4);
    expect(result.stats.decommissionPct).toBe(100);
  });

  it('should block SCC when not all members verified', () => {
    const programs = loadFixture('cyclic-graph');
    const { sccs } = setupGraph(programs);

    // CycleA(2) verified but CycleB(3) not
    const statuses = new Map<string | number, PipelineStatus>([
      [1, 'verified'],
      [2, 'verified'],
      // 3 not verified
      [4, 'verified'],
    ]);

    const result = calculateDecommission({
      programs,
      programStatuses: statuses,
      naPrograms: new Set(),
      sharedPrograms: new Set(),
      sccs,
    });

    // 1 (Root) is verified, no callers → decommissionable
    // 2 (CycleA) is verified, caller 1 decommissionable, but SCC member 3 not verified → blocked
    // 3 (CycleB) not verified → blocked
    // 4 (Leaf) verified, caller 3 not decommissionable → blocked
    expect(result.decommissionable.map(d => d.id)).toEqual([1]);
    expect(result.blocked.length).toBe(3);
  });

  it('should compute correct stats breakdown', () => {
    const programs = loadFixture('small-graph');
    const { sccs } = setupGraph(programs);

    const statuses = new Map<string | number, PipelineStatus>([
      [1, 'verified'],
      [2, 'contracted'],
      [3, 'enriched'],
      [4, 'verified'],
      [5, 'verified'],
    ]);

    const result = calculateDecommission({
      programs,
      programStatuses: statuses,
      naPrograms: new Set(),
      sharedPrograms: new Set([5]),
      sccs,
    });

    expect(result.stats.totalLive).toBe(5);
    expect(result.stats.blockedByStatus).toBe(2); // 2 (contracted), 3 (enriched)
    expect(result.stats.blockedByCallers).toBe(2); // 4 and 5: verified but callers not decommissionable
  });
});
