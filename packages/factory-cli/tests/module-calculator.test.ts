import { describe, it, expect } from 'vitest';
import type { Program, PipelineStatus, SCC } from '../src/core/types.js';
import { buildAdjacency, tarjanSCC, buildCondensation, computeLevels } from '../src/core/graph.js';
import { calculateModules } from '../src/calculators/module-calculator.js';

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

describe('calculateModules', () => {
  it('should identify all modules in small graph', () => {
    const programs = loadFixture('small-graph');
    const { adjacency, sccs, levels } = setupGraph(programs);

    const result = calculateModules({
      programs,
      adjacency,
      sccs,
      levels,
      programStatuses: new Map(),
      sharedPrograms: new Set([5]),
      naPrograms: new Set(),
    });

    // 5 programs = 5 potential modules (one per root)
    expect(result.allModules.length).toBe(5);

    // Main module should contain all 5 programs
    const mainModule = result.allModules.find(m => m.root === 1);
    expect(mainModule?.memberCount).toBe(5);

    // Leaf module should contain only itself
    const leafModule = result.allModules.find(m => m.root === 4);
    expect(leafModule?.memberCount).toBe(1);
  });

  it('should mark module as deliverable when all verified', () => {
    const programs = loadFixture('small-graph');
    const { adjacency, sccs, levels } = setupGraph(programs);

    const statuses = new Map<string | number, PipelineStatus>([
      [4, 'verified'],
      [5, 'verified'],
    ]);

    const result = calculateModules({
      programs,
      adjacency,
      sccs,
      levels,
      programStatuses: statuses,
      sharedPrograms: new Set([5]),
      naPrograms: new Set(),
    });

    // LeafA (4) and SharedLeaf (5) are both verified
    const leafModule = result.allModules.find(m => m.root === 4);
    expect(leafModule?.deliverable).toBe(true);
    expect(leafModule?.readinessPct).toBe(100);

    // MenuB (3) calls SharedLeaf (verified) but MenuB itself is pending
    const menuBModule = result.allModules.find(m => m.root === 3);
    expect(menuBModule?.deliverable).toBe(false);
  });

  it('should handle N/A programs as verified', () => {
    const programs = loadFixture('small-graph');
    const { adjacency, sccs, levels } = setupGraph(programs);

    const result = calculateModules({
      programs,
      adjacency,
      sccs,
      levels,
      programStatuses: new Map(),
      sharedPrograms: new Set(),
      naPrograms: new Set([4]), // LeafA is N/A
    });

    const leafModule = result.allModules.find(m => m.root === 4);
    expect(leafModule?.deliverable).toBe(true);
    expect(leafModule?.verified).toBe(1);
  });

  it('should filter to maximal modules', () => {
    const programs = loadFixture('small-graph');
    const { adjacency, sccs, levels } = setupGraph(programs);

    // All verified
    const allVerified = new Map<string | number, PipelineStatus>(
      programs.map(p => [p.id, 'verified' as PipelineStatus])
    );

    const result = calculateModules({
      programs,
      adjacency,
      sccs,
      levels,
      programStatuses: allVerified,
      sharedPrograms: new Set(),
      naPrograms: new Set(),
    });

    // Maximal: only Main (which contains all others)
    expect(result.maximalModules.length).toBe(1);
    expect(result.maximalModules[0].root).toBe(1);
    expect(result.maximalModules[0].deliverable).toBe(true);
  });

  it('should handle cyclic graphs', () => {
    const programs = loadFixture('cyclic-graph');
    const { adjacency, sccs, levels } = setupGraph(programs);

    // CycleA and CycleB verified, but not Root or Leaf
    const statuses = new Map<string | number, PipelineStatus>([
      [2, 'verified'],
      [3, 'verified'],
      [4, 'verified'],
    ]);

    const result = calculateModules({
      programs,
      adjacency,
      sccs,
      levels,
      programStatuses: statuses,
      sharedPrograms: new Set(),
      naPrograms: new Set(),
    });

    // CycleA module includes CycleB (mutual) + Leaf
    const cycleAModule = result.allModules.find(m => m.root === 2);
    expect(cycleAModule).toBeDefined();
    // Should contain 2, 3, 4
    expect(cycleAModule!.members).toContain(2);
    expect(cycleAModule!.members).toContain(3);
    expect(cycleAModule!.members).toContain(4);
  });

  it('should report readiness percentage correctly', () => {
    const programs = loadFixture('small-graph');
    const { adjacency, sccs, levels } = setupGraph(programs);

    // 2/5 verified
    const statuses = new Map<string | number, PipelineStatus>([
      [4, 'verified'],
      [5, 'verified'],
    ]);

    const result = calculateModules({
      programs,
      adjacency,
      sccs,
      levels,
      programStatuses: statuses,
      sharedPrograms: new Set(),
      naPrograms: new Set(),
    });

    const mainModule = result.allModules.find(m => m.root === 1);
    expect(mainModule?.readinessPct).toBe(40); // 2/5 = 40%
    expect(mainModule?.blockers.length).toBe(3); // 1, 2, 3 are blockers
  });
});
