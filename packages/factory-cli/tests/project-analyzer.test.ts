import { describe, it, expect } from 'vitest';
import type { Program, SCC, Tracker, Batch } from '../src/core/types.js';
import { buildAdjacency, computeLevels, tarjanSCC, buildCondensation } from '../src/core/graph.js';
import { resolveDependencies } from '../src/calculators/dependency-resolver.js';
import { analyzeProject, analyzedBatchesToTrackerBatches } from '../src/calculators/project-analyzer.js';

const makeProgram = (id: number, name: string, level: number, callees: number[] = [], callers: number[] = []): Program => ({
  id, name, complexity: 'LOW', level, callers, callees, source: 'bfs', domain: 'General',
});

const makeTracker = (batches: Batch[]): Tracker => ({
  version: '1.0',
  methodology: 'SPECMAP',
  created: '2026-01-01',
  updated: '2026-01-01',
  status: 'active',
  stats: {
    totalPrograms: 100,
    livePrograms: 80,
    orphanPrograms: 20,
    sharedPrograms: 5,
    contracted: 0,
    enriched: 0,
    verified: 0,
    maxLevel: 8,
    lastComputed: '2026-01-01',
  },
  batches,
  notes: [],
});

const makeBatch = (id: string, name: string, root: number, programs: number[]): Batch => ({
  id,
  name,
  root,
  programs: programs.length,
  status: 'verified',
  stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 100, totalPartial: 0, totalMissing: 0 },
  priorityOrder: programs,
});

describe('analyzeProject', () => {
  it('should detect batches from a simple program graph', () => {
    // Build a graph: Main(8) -> MenuA(7) -> Worker1-5(0-3)
    const programs: Program[] = [
      makeProgram(1, 'Main', 8, [2], []),
      makeProgram(2, 'MenuCaisse', 7, [3, 4, 5, 6, 7], [1]),
      makeProgram(3, 'Worker1', 3, [], [2]),
      makeProgram(4, 'Worker2', 2, [], [2]),
      makeProgram(5, 'Worker3', 1, [], [2]),
      makeProgram(6, 'Worker4', 0, [], [2]),
      makeProgram(7, 'Worker5', 0, [], [2]),
    ];

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
    });

    expect(result.projectName).toBe('TEST');
    expect(result.totalLivePrograms).toBe(7);
    expect(result.batchesPreserved).toBe(0);
    // Main is excluded (infrastructure), so we should get batches from non-infrastructure roots
    expect(result.batches.every(b => b.isNew)).toBe(true);
  });

  it('should exclude Main from batch roots', () => {
    const programs: Program[] = [
      makeProgram(1, 'Main', 8, [2, 3, 4, 5, 6], []),
      makeProgram(2, 'VenteGP', 5, [6], [1]),
      makeProgram(3, 'SessionOuverture', 4, [6], [1]),
      makeProgram(4, 'Extrait', 3, [], [1]),
      makeProgram(5, 'Garantie', 2, [], [1]),
      makeProgram(6, 'Shared', 0, [], [1, 2, 3]),
    ];

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
    });

    // No batch should have root=1 (Main) or name "Main"
    for (const b of result.batches) {
      expect(b.root).not.toBe(1);
      expect(b.name).not.toBe('Main');
    }
  });

  it('should preserve existing B1 batch', () => {
    const programs: Program[] = [
      makeProgram(1, 'Main', 8, [2, 3, 4, 5, 6, 7, 8], []),
      makeProgram(2, 'SessionOuverture', 6, [3, 4], [1]),
      makeProgram(3, 'ApproForm', 3, [], [2]),
      makeProgram(4, 'TelecollectePanel', 3, [], [2]),
      makeProgram(5, 'VenteGP', 5, [6, 7, 8], [1]),
      makeProgram(6, 'SoldeGP', 2, [], [5]),
      makeProgram(7, 'HistoVentes', 2, [], [5]),
      makeProgram(8, 'PrintTicket', 1, [], [5]),
    ];

    const b1 = makeBatch('B1', 'Ouverture Session', 2, [2, 3, 4]);
    const tracker = makeTracker([b1]);

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
      tracker,
    });

    // B1 should be preserved
    const existing = result.batches.find(b => b.id === 'B1');
    expect(existing).toBeDefined();
    expect(existing!.isNew).toBe(false);
    expect(existing!.name).toBe('Ouverture Session');
    expect(existing!.memberCount).toBe(3);

    // B1 programs should NOT appear in new batches
    const newBatches = result.batches.filter(b => b.isNew);
    for (const nb of newBatches) {
      expect(nb.members).not.toContain(2);
      expect(nb.members).not.toContain(3);
      expect(nb.members).not.toContain(4);
    }

    expect(result.batchesPreserved).toBe(1);
  });

  it('should not re-assign programs already in batches', () => {
    const programs: Program[] = [
      makeProgram(10, 'Main', 8, [20, 30], []),
      makeProgram(20, 'ModuleA', 5, [21, 22, 23, 24, 25], [10]),
      makeProgram(21, 'A1', 2, [], [20]),
      makeProgram(22, 'A2', 2, [], [20]),
      makeProgram(23, 'A3', 1, [], [20]),
      makeProgram(24, 'A4', 1, [], [20]),
      makeProgram(25, 'A5', 0, [], [20]),
      makeProgram(30, 'ModuleB', 4, [31, 32, 33, 34, 35], [10]),
      makeProgram(31, 'B1', 2, [], [30]),
      makeProgram(32, 'B2', 2, [], [30]),
      makeProgram(33, 'B3', 1, [], [30]),
      makeProgram(34, 'B4', 1, [], [30]),
      makeProgram(35, 'B5', 0, [], [30]),
    ];

    const existingBatch = makeBatch('B1', 'Module A', 20, [20, 21, 22, 23, 24, 25]);
    const tracker = makeTracker([existingBatch]);

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
      tracker,
    });

    // Programs 20-25 should only appear in B1
    const b1Members = new Set(result.batches.find(b => b.id === 'B1')!.members.map(String));
    const newBatchMembers = result.batches
      .filter(b => b.isNew)
      .flatMap(b => b.members.map(String));

    for (const pid of ['20', '21', '22', '23', '24', '25']) {
      expect(b1Members.has(pid)).toBe(true);
      expect(newBatchMembers).not.toContain(pid);
    }
  });

  it('should calculate complexity and hours per batch', () => {
    const programs: Program[] = [
      makeProgram(1, 'VenteGP', 5, [2, 3, 4, 5, 6], []),
      makeProgram(2, 'SoldeGP', 3, [], [1]),
      makeProgram(3, 'HistoVentes', 3, [], [1]),
      makeProgram(4, 'PrintTicket', 2, [], [1]),
      makeProgram(5, 'EditionVente', 2, [], [1]),
      makeProgram(6, 'ResortCredit', 1, [], [1]),
    ];

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
    });

    // Each batch should have a grade and hours
    for (const b of result.batches) {
      expect(['S', 'A', 'B', 'C', 'D']).toContain(b.complexityGrade);
      expect(b.estimatedHours).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle empty graph', () => {
    const result = analyzeProject({
      projectName: 'EMPTY',
      programs: [],
      adjacency: { nodes: new Set(), edges: new Map() },
      levels: new Map(),
      sccs: [],
      maxLevel: 0,
    });

    expect(result.totalLivePrograms).toBe(0);
    expect(result.batches).toHaveLength(0);
    expect(result.unassignedCount).toBe(0);
  });

  it('should handle all programs already assigned', () => {
    const programs: Program[] = [
      makeProgram(1, 'A', 3, [2, 3], []),
      makeProgram(2, 'B', 1, [], [1]),
      makeProgram(3, 'C', 0, [], [1]),
    ];

    const b1 = makeBatch('B1', 'All', 1, [1, 2, 3]);
    const tracker = makeTracker([b1]);

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
      tracker,
    });

    expect(result.batchesPreserved).toBe(1);
    expect(result.batchesCreated).toBe(0);
    // All in B1
    const newBatches = result.batches.filter(b => b.isNew);
    expect(newBatches).toHaveLength(0);
  });

  it('should continue batch numbering after existing', () => {
    const programs: Program[] = Array.from({ length: 15 }, (_, i) =>
      makeProgram(i + 1, `Prog${i + 1}`, i < 5 ? 5 : i < 10 ? 3 : 1,
        i < 5 ? Array.from({ length: 5 }, (_, j) => j + 6 + i * 5).filter(id => id <= 15) : [],
        i >= 5 ? [Math.floor((i - 5) / 5) + 1] : [],
      )
    );

    const b1 = makeBatch('B3', 'Existing', 1, [1, 6, 7, 8, 9, 10]);
    const tracker = makeTracker([b1]);

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
      tracker,
    });

    // New batches should start at B4 or higher
    const newBatches = result.batches.filter(b => b.isNew);
    for (const nb of newBatches) {
      const num = parseInt(nb.id.replace('B', ''));
      expect(num).toBeGreaterThanOrEqual(4);
    }
  });

  it('should detect domain from batch name', () => {
    const programs: Program[] = [
      makeProgram(1, 'Fermeture_Session', 6, [2, 3, 4, 5, 6], []),
      makeProgram(2, 'CompteCaisse', 3, [], [1]),
      makeProgram(3, 'EcartSession', 2, [], [1]),
      makeProgram(4, 'ContenuCaisse', 2, [], [1]),
      makeProgram(5, 'ClotureCaisse', 1, [], [1]),
      makeProgram(6, 'PrintTicket', 0, [], [1]),
    ];

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
    });

    // Should detect some batches with meaningful domains
    expect(result.batches.length).toBeGreaterThan(0);
    for (const b of result.batches) {
      expect(b.domain).toBeTruthy();
    }
  });

  it('should split large subtrees into batches of max 25', () => {
    // Create a large graph with 50 programs under one root
    const children = Array.from({ length: 49 }, (_, i) =>
      makeProgram(i + 2, `Worker${i + 1}`, 1, [], [1]),
    );
    const root = makeProgram(1, 'BigRoot', 5, children.map(c => c.id as number), []);
    const programs = [root, ...children];

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST-SPLIT',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
    });

    // No batch should exceed 25 members
    for (const b of result.batches) {
      expect(b.memberCount).toBeLessThanOrEqual(25);
    }

    // All programs should be accounted for (minus infrastructure)
    const totalInBatches = result.batches.reduce((sum, b) => sum + b.memberCount, 0);
    expect(totalInBatches + result.unassignedCount).toBeLessThanOrEqual(programs.length);
  });

  it('should create multiple batches from domain splitting', () => {
    // 15 Vente + 15 Session = 30 > maxBatchSize 25
    const venteProgs = Array.from({ length: 15 }, (_, i) =>
      makeProgram(i + 2, `VenteW${i}`, 1, [], [1]),
    );
    const sessionProgs = Array.from({ length: 15 }, (_, i) =>
      makeProgram(i + 17, `SessionW${i}`, 1, [], [1]),
    );
    const allChildren = [...venteProgs, ...sessionProgs];
    const root = makeProgram(1, 'Orchestrator', 5, allChildren.map(c => c.id as number), []);
    const programs = [root, ...allChildren];

    const resolved = resolveDependencies(programs);
    const result = analyzeProject({
      projectName: 'TEST-DOMAINS',
      programs,
      adjacency: resolved.adjacency,
      levels: resolved.levels,
      sccs: resolved.sccs,
      maxLevel: resolved.maxLevel,
    });

    // Should have > 1 new batch
    const newBatches = result.batches.filter(b => b.isNew);
    expect(newBatches.length).toBeGreaterThanOrEqual(2);

    // No batch > 25
    for (const b of newBatches) {
      expect(b.memberCount).toBeLessThanOrEqual(25);
    }
  });
});

describe('analyzedBatchesToTrackerBatches', () => {
  it('should only convert isNew batches', () => {
    const analyzed = [
      { id: 'B1', name: 'Existing', domain: 'Caisse', members: [1, 2], memberCount: 2, root: 1, complexityGrade: 'C' as const, estimatedHours: 5, isNew: false },
      { id: 'B2', name: 'New', domain: 'Ventes', members: [3, 4], memberCount: 2, root: 3, complexityGrade: 'B' as const, estimatedHours: 8, isNew: true },
    ];

    const result = analyzedBatchesToTrackerBatches(analyzed);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('B2');
    expect(result[0].domain).toBe('Ventes');
    expect(result[0].autoDetected).toBe(true);
    expect(result[0].complexityGrade).toBe('B');
    expect(result[0].estimatedHours).toBe(8);
    expect(result[0].priorityOrder).toEqual([3, 4]);
  });

  it('should set pending status for new batches', () => {
    const analyzed = [
      { id: 'B5', name: 'Test', domain: 'General', members: [10], memberCount: 1, root: 10, complexityGrade: 'D' as const, estimatedHours: 1, isNew: true },
    ];

    const result = analyzedBatchesToTrackerBatches(analyzed);
    expect(result[0].status).toBe('pending');
  });
});
