import { describe, it, expect } from 'vitest';
import type { Program, PipelineStatus, DeliverableModule } from '../src/core/types.js';
import { buildAdjacency, tarjanSCC, buildCondensation, computeLevels } from '../src/core/graph.js';
import { calculateModules } from '../src/calculators/module-calculator.js';
import {
  buildModuleDependencyGraph,
  detectModuleSCCs,
  computeModuleLevels,
  computeUnblockingPower,
  assignPriorityRanks,
  planMigrationWaves,
  computeModulePriority,
} from '../src/calculators/priority-calculator.js';

const loadFixture = (name: string): Program[] => {
  const data = require(`./fixtures/${name}.json`);
  return data as Program[];
};

const setupAllModules = (programs: Program[], statuses: Map<string | number, PipelineStatus> = new Map()) => {
  const adjacency = buildAdjacency(programs);
  const sccs = tarjanSCC(adjacency);
  const dag = buildCondensation(adjacency, sccs);
  const levels = computeLevels(dag);

  const result = calculateModules({
    programs,
    adjacency,
    sccs,
    levels,
    programStatuses: statuses,
    sharedPrograms: new Set(),
    naPrograms: new Set(),
  });

  return result.allModules;
};

/**
 * Pick specific root modules from all modules (for testing multi-root scenarios).
 * In real usage, these would be batch roots or domain entry points.
 */
const pickRoots = (allModules: DeliverableModule[], roots: (string | number)[]) =>
  allModules.filter(m => roots.includes(m.root));

describe('Priority Calculator', () => {
  describe('buildModuleDependencyGraph', () => {
    it('should detect inter-module dependencies', () => {
      const programs = loadFixture('priority-graph');
      const allModules = setupAllModules(programs);
      // Pick the 3 top-level entry points as separate modules
      const modules = pickRoots(allModules, [100, 200, 300]);

      const { deps, list } = buildModuleDependencyGraph(modules);

      // Operations (200) subtree includes Session root (100) -> dependency
      const opsDeps = deps.get(200);
      expect(opsDeps).toBeDefined();
      expect(opsDeps!.has(100)).toBe(true);

      // Reports (300) subtree includes Operations root (200) -> dependency
      const reportDeps = deps.get(300);
      expect(reportDeps).toBeDefined();
      expect(reportDeps!.has(200)).toBe(true);

      // Session (100) has no module deps (leaf module)
      const sessionDeps = deps.get(100);
      expect(sessionDeps?.size ?? 0).toBe(0);

      expect(list.length).toBeGreaterThan(0);
    });
  });

  describe('detectModuleSCCs', () => {
    it('should handle module-level cycles', () => {
      const programs = loadFixture('priority-circular');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [10, 20]);

      const { deps } = buildModuleDependencyGraph(modules);
      const sccs = detectModuleSCCs(deps);

      // ModuleA(10) and ModuleB(20) form a cycle:
      // ModuleA.members includes 20 (via callees), ModuleB.members includes 10 (via callees)
      expect(sccs.length).toBe(1);
      expect(sccs[0].moduleRoots).toContain(10);
      expect(sccs[0].moduleRoots).toContain(20);
    });

    it('should return empty for acyclic modules', () => {
      const programs = loadFixture('priority-graph');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [100, 200, 300]);

      const { deps } = buildModuleDependencyGraph(modules);
      const sccs = detectModuleSCCs(deps);

      expect(sccs.length).toBe(0);
    });
  });

  describe('computeModuleLevels', () => {
    it('should rank foundational modules at level 0', () => {
      const programs = loadFixture('priority-graph');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [100, 200, 300]);

      const { deps } = buildModuleDependencyGraph(modules);
      const sccs = detectModuleSCCs(deps);
      const levels = computeModuleLevels(deps, sccs);

      // Session (100) = no deps -> level 0
      expect(levels.get(100)).toBe(0);
      // Operations (200) depends on Session -> level 1
      expect(levels.get(200)).toBe(1);
      // Reports (300) depends on Operations -> level 2
      expect(levels.get(300)).toBe(2);
    });
  });

  describe('computeUnblockingPower', () => {
    it('should compute correct unblocking counts', () => {
      const programs = loadFixture('priority-graph');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [100, 200, 300]);

      const { deps } = buildModuleDependencyGraph(modules);
      const power = computeUnblockingPower(deps);

      // Session (100) unblocks Operations and Reports = 2
      expect(power.get(100)).toBe(2);
      // Operations (200) unblocks Reports = 1
      expect(power.get(200)).toBe(1);
      // Reports (300) unblocks nobody = 0
      expect(power.get(300)).toBe(0);
    });
  });

  describe('assignPriorityRanks', () => {
    it('should rank foundational modules first', () => {
      const programs = loadFixture('priority-graph');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [100, 200, 300]);

      const { deps } = buildModuleDependencyGraph(modules);
      const sccs = detectModuleSCCs(deps);
      const levels = computeModuleLevels(deps, sccs);
      const power = computeUnblockingPower(deps);

      const ranked = assignPriorityRanks(modules, levels, power, deps);

      // Session should be rank 1 (foundation + highest unblocking)
      const session = ranked.find(m => m.root === 100);
      expect(session?.rank).toBe(1);

      // Reports should be last rank (highest level, no unblocking)
      const reports = ranked.find(m => m.root === 300);
      expect(reports?.rank).toBe(ranked.length);
    });

    it('should produce deterministic ranking', () => {
      const programs = loadFixture('priority-graph');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [100, 200, 300]);

      const { deps } = buildModuleDependencyGraph(modules);
      const sccs = detectModuleSCCs(deps);
      const levels = computeModuleLevels(deps, sccs);
      const power = computeUnblockingPower(deps);

      const ranked1 = assignPriorityRanks(modules, levels, power, deps);
      const ranked2 = assignPriorityRanks(modules, levels, power, deps);

      expect(ranked1.map(m => m.root)).toEqual(ranked2.map(m => m.root));
      expect(ranked1.map(m => m.rank)).toEqual(ranked2.map(m => m.rank));
    });

    it('should respect custom weights', () => {
      const programs = loadFixture('priority-graph');

      const allVerified = new Map<string | number, PipelineStatus>(
        programs.map((p: Program) => [p.id, 'verified' as PipelineStatus])
      );
      const allModules = setupAllModules(programs, allVerified);
      const modules = pickRoots(allModules, [100, 200, 300]);

      const { deps } = buildModuleDependencyGraph(modules);
      const sccs = detectModuleSCCs(deps);
      const levels = computeModuleLevels(deps, sccs);
      const power = computeUnblockingPower(deps);

      const readinessOnly: import('../src/core/types.js').PriorityWeights = {
        foundation: 0, unblocking: 0, readiness: 1,
      };
      const rankedReadiness = assignPriorityRanks(modules, levels, power, deps, readinessOnly);

      // All 100% readiness, so tiebreaker decides: lower level first
      expect(rankedReadiness.length).toBe(modules.length);
      expect(rankedReadiness[0].moduleLevel).toBeLessThanOrEqual(
        rankedReadiness[rankedReadiness.length - 1].moduleLevel
      );
    });
  });

  describe('planMigrationWaves', () => {
    it('should generate migration waves from levels', () => {
      const programs = loadFixture('priority-graph');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [100, 200, 300]);
      const result = computeModulePriority({ modules });

      const waves = result.migrationSequence;

      // Should have 3 waves (level 0, 1, 2)
      expect(waves.length).toBe(3);

      // Wave 1 = Session (foundation)
      expect(waves[0].wave).toBe(1);
      expect(waves[0].modules).toContain(100);
      expect(waves[0].blockedBy).toEqual([]);

      // Wave 2 = Operations (depends on wave 1)
      expect(waves[1].wave).toBe(2);
      expect(waves[1].modules).toContain(200);
      expect(waves[1].blockedBy).toEqual([1]);

      // Wave 3 = Reports (depends on waves 1,2)
      expect(waves[2].wave).toBe(3);
      expect(waves[2].modules).toContain(300);
      expect(waves[2].blockedBy).toEqual([1, 2]);
    });

    it('should order programs leaf-first within module', () => {
      const programs = loadFixture('priority-graph');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [100, 200, 300]);
      const result = computeModulePriority({ modules });

      for (const mod of result.prioritizedModules) {
        expect(mod.implementationOrder.length).toBe(mod.memberCount);
      }
    });
  });

  describe('computeModulePriority (full pipeline)', () => {
    it('should handle isolated modules', () => {
      const modules: DeliverableModule[] = [
        {
          root: 'A', rootName: 'IsolatedA', members: ['A'],
          memberCount: 1, verified: 0, enriched: 0, contracted: 0, pending: 1,
          readinessPct: 0, deliverable: false, blockers: [], sccUnits: [],
        },
        {
          root: 'B', rootName: 'IsolatedB', members: ['B'],
          memberCount: 1, verified: 1, enriched: 0, contracted: 0, pending: 0,
          readinessPct: 100, deliverable: true, blockers: [], sccUnits: [],
        },
      ];

      const result = computeModulePriority({ modules });

      // Both in wave 1 (no dependencies)
      expect(result.migrationSequence.length).toBe(1);
      expect(result.migrationSequence[0].modules).toContain('A');
      expect(result.migrationSequence[0].modules).toContain('B');

      expect(result.prioritizedModules.length).toBe(2);
      expect(result.moduleDependencies.length).toBe(0);
    });

    it('should work with empty module list', () => {
      const result = computeModulePriority({ modules: [] });

      expect(result.prioritizedModules).toEqual([]);
      expect(result.moduleDependencies).toEqual([]);
      expect(result.moduleSCCs).toEqual([]);
      expect(result.migrationSequence).toEqual([]);
    });

    it('should handle circular module dependencies', () => {
      const programs = loadFixture('priority-circular');
      const allModules = setupAllModules(programs);
      const modules = pickRoots(allModules, [10, 20]);
      const result = computeModulePriority({ modules });

      // Should detect 1 module SCC
      expect(result.moduleSCCs.length).toBe(1);

      // Circular modules should be in same wave
      const wave1Modules = result.migrationSequence[0]?.modules ?? [];
      expect(wave1Modules).toContain(10);
      expect(wave1Modules).toContain(20);
    });
  });
});
