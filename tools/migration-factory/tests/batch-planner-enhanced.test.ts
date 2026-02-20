import { describe, it, expect } from 'vitest';
import type { Program, SCC } from '../src/core/types.js';
import { resolveDependencies } from '../src/calculators/dependency-resolver.js';
import {
  isInfrastructureProgram,
  planBatchesWithExclusions,
  inferDomain,
} from '../src/calculators/batch-planner.js';

const makeProgram = (id: number, name: string, level: number, callees: number[] = [], callers: number[] = []): Program => ({
  id, name, complexity: 'LOW', level, callers, callees, source: 'bfs', domain: 'General',
});

describe('isInfrastructureProgram', () => {
  it('should detect Main as infrastructure', () => {
    expect(isInfrastructureProgram('Main', 8, 8)).toBe(true);
  });

  it('should detect MenuCaisse as infrastructure', () => {
    expect(isInfrastructureProgram('MenuCaisse', 7, 8)).toBe(true);
  });

  it('should detect InitSession as infrastructure', () => {
    expect(isInfrastructureProgram('InitSession', 6, 8)).toBe(true);
  });

  it('should detect program at max level as infrastructure', () => {
    expect(isInfrastructureProgram('SomeProgram', 8, 8)).toBe(true);
  });

  it('should not detect regular program as infrastructure', () => {
    expect(isInfrastructureProgram('VenteGP', 5, 8)).toBe(false);
  });

  it('should not detect max-level when maxLevel is low', () => {
    expect(isInfrastructureProgram('Worker', 2, 2)).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isInfrastructureProgram('MAIN_PROGRAM', 3, 8)).toBe(true);
    expect(isInfrastructureProgram('menu_caisse', 3, 8)).toBe(true);
  });
});

describe('inferDomain', () => {
  it('should detect Caisse domain', () => {
    expect(inferDomain('SessionCaisse')).toBe('Caisse');
  });

  it('should detect Ventes domain', () => {
    expect(inferDomain('VenteGP')).toBe('Ventes');
  });

  it('should detect Regroupement domain', () => {
    expect(inferDomain('Separation_Compte')).toBe('Regroupement');
    expect(inferDomain('Fusion_Comptes')).toBe('Regroupement');
  });

  it('should detect Stock domain', () => {
    expect(inferDomain('Appro_Produits')).toBe('Stock');
    expect(inferDomain('ArticleManager')).toBe('Stock');
    expect(inferDomain('StockCalcul')).toBe('Stock');
  });

  it('should detect Coffre domain', () => {
    expect(inferDomain('Coffre_Ouvert')).toBe('Coffre');
    expect(inferDomain('ApportCoffre')).toBe('Coffre');
  });

  it('should detect EasyCheckout domain', () => {
    expect(inferDomain('EasyCheckOut')).toBe('EasyCheckout');
    expect(inferDomain('DataCatch_Client')).toBe('EasyCheckout');
    expect(inferDomain('ClubMedPass')).toBe('EasyCheckout');
  });

  it('should detect Session domain', () => {
    expect(inferDomain('EcartSession')).toBe('Session');
    expect(inferDomain('ContenuCaisse')).toBe('Session');
  });

  it('should detect Compte domain', () => {
    expect(inferDomain('ExtraitCompte')).toBe('Compte');
  });

  it('should detect Change domain', () => {
    expect(inferDomain('ChangeDevise')).toBe('Change');
  });

  it('should detect Garantie domain', () => {
    expect(inferDomain('Garantie_Depot')).toBe('Garantie');
  });

  it('should detect Factures domain', () => {
    expect(inferDomain('Facture_TVA')).toBe('Factures');
  });

  it('should detect Impression domain', () => {
    expect(inferDomain('PrintTicket')).toBe('Impression');
    expect(inferDomain('EditionRecap')).toBe('Impression');
  });

  it('should return General for unknown', () => {
    expect(inferDomain('SomethingUnknown')).toBe('General');
  });
});

describe('planBatchesWithExclusions', () => {
  it('should exclude infrastructure from roots', () => {
    const programs: Program[] = [
      makeProgram(1, 'Main', 8, [2, 3, 4, 5, 6, 7], []),
      makeProgram(2, 'VenteGP', 5, [3, 4, 5, 6, 7], [1]),
      makeProgram(3, 'Worker1', 3, [], [2]),
      makeProgram(4, 'Worker2', 2, [], [2]),
      makeProgram(5, 'Worker3', 1, [], [2]),
      makeProgram(6, 'Worker4', 0, [], [2]),
      makeProgram(7, 'Worker5', 0, [], [2]),
    ];

    const resolved = resolveDependencies(programs);
    const result = planBatchesWithExclusions(programs, resolved.adjacency, resolved.levels, resolved.sccs, {
      excludeInfrastructure: true,
      minBatchSize: 3,
    });

    // Main (id=1) should not appear in any batch
    for (const batch of result.suggestedBatches) {
      expect(batch.members).not.toContain(1);
    }
  });

  it('should exclude already-assigned programs', () => {
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

    const resolved = resolveDependencies(programs);
    const existing = new Set<string | number>([20, 21, 22, 23, 24, 25]);

    const result = planBatchesWithExclusions(programs, resolved.adjacency, resolved.levels, resolved.sccs, {
      existingBatchPrograms: existing,
      excludeInfrastructure: true,
      minBatchSize: 3,
    });

    // Programs 20-25 should not appear in any batch
    for (const batch of result.suggestedBatches) {
      for (const id of [20, 21, 22, 23, 24, 25]) {
        expect(batch.members).not.toContain(id);
      }
    }
  });

  it('should start numbering from startBatchNumber', () => {
    const programs: Program[] = [
      makeProgram(1, 'Root', 5, [2, 3, 4, 5, 6], []),
      makeProgram(2, 'W1', 3, [], [1]),
      makeProgram(3, 'W2', 2, [], [1]),
      makeProgram(4, 'W3', 1, [], [1]),
      makeProgram(5, 'W4', 0, [], [1]),
      makeProgram(6, 'W5', 0, [], [1]),
    ];

    const resolved = resolveDependencies(programs);
    const result = planBatchesWithExclusions(programs, resolved.adjacency, resolved.levels, resolved.sccs, {
      startBatchNumber: 5,
      minBatchSize: 3,
    });

    for (const batch of result.suggestedBatches) {
      const num = parseInt(batch.id.replace('B', ''));
      expect(num).toBeGreaterThanOrEqual(5);
    }
  });

  it('should use domain from root program name', () => {
    const makeProg = (id: number, name: string, level: number, callees: number[] = [], callers: number[] = []): Program => ({
      id, name, complexity: 'LOW', level, callers, callees, source: 'bfs', domain: undefined as unknown as string,
    });
    const programs: Program[] = [
      makeProg(1, 'VenteGP', 5, [2, 3, 4, 5, 6], []),
      makeProg(2, 'SoldeGP', 3, [], [1]),
      makeProg(3, 'HistoVentes', 2, [], [1]),
      makeProg(4, 'PrintTicket', 1, [], [1]),
      makeProg(5, 'Worker1', 0, [], [1]),
      makeProg(6, 'Worker2', 0, [], [1]),
    ];

    const resolved = resolveDependencies(programs);
    const result = planBatchesWithExclusions(programs, resolved.adjacency, resolved.levels, resolved.sccs, {
      minBatchSize: 3,
    });

    // VenteGP root should produce Ventes domain
    const venteBatch = result.suggestedBatches.find(b => b.root === 1);
    if (venteBatch) {
      expect(venteBatch.domain).toBe('Ventes');
    }
  });

  it('should handle empty graph', () => {
    const result = planBatchesWithExclusions(
      [],
      { nodes: new Set(), edges: new Map() },
      new Map(),
      [],
      { minBatchSize: 3 },
    );

    expect(result.suggestedBatches).toHaveLength(0);
    expect(result.totalPrograms).toBe(0);
  });

  it('should handle all programs excluded', () => {
    const programs: Program[] = [
      makeProgram(1, 'A', 3, [2, 3], []),
      makeProgram(2, 'B', 1, [], [1]),
      makeProgram(3, 'C', 0, [], [1]),
    ];

    const resolved = resolveDependencies(programs);
    const result = planBatchesWithExclusions(programs, resolved.adjacency, resolved.levels, resolved.sccs, {
      existingBatchPrograms: new Set([1, 2, 3]),
      minBatchSize: 3,
    });

    expect(result.suggestedBatches).toHaveLength(0);
  });

  it('should respect minBatchSize threshold', () => {
    const programs: Program[] = [
      makeProgram(1, 'Root', 5, [2], []),
      makeProgram(2, 'Child', 0, [], [1]),
    ];

    const resolved = resolveDependencies(programs);
    const result = planBatchesWithExclusions(programs, resolved.adjacency, resolved.levels, resolved.sccs, {
      minBatchSize: 5,
    });

    // Subtree of 2 programs < minBatchSize of 5
    expect(result.suggestedBatches).toHaveLength(0);
  });
});
