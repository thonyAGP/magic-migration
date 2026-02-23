import { describe, it, expect } from 'vitest';
import type { Tracker, Batch } from '../src/core/types.js';
import { upsertBatches } from '../src/core/tracker.js';

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

const makeBatch = (id: string, name: string, root: number, programs: number[], extra?: Partial<Batch>): Batch => ({
  id,
  name,
  root,
  programs: programs.length,
  status: 'verified',
  stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 100, totalPartial: 0, totalMissing: 0 },
  priorityOrder: programs,
  ...extra,
});

describe('upsertBatches', () => {
  it('should add new batches to empty tracker', () => {
    const tracker = makeTracker([]);
    const newBatches = [
      makeBatch('B1', 'First', 1, [1, 2, 3]),
      makeBatch('B2', 'Second', 4, [4, 5, 6]),
    ];

    const result = upsertBatches(tracker, newBatches);
    expect(result.batches).toHaveLength(2);
    expect(result.batches[0].id).toBe('B1');
    expect(result.batches[1].id).toBe('B2');
  });

  it('should not duplicate existing batch IDs', () => {
    const existing = makeBatch('B1', 'Existing', 1, [1, 2]);
    const tracker = makeTracker([existing]);
    const newBatches = [
      makeBatch('B1', 'Duplicate', 1, [1, 2, 3]),
      makeBatch('B2', 'New', 4, [4, 5]),
    ];

    const result = upsertBatches(tracker, newBatches);
    expect(result.batches).toHaveLength(2);
    expect(result.batches[0].name).toBe('Existing'); // B1 preserved
    expect(result.batches[1].name).toBe('New'); // B2 added
  });

  it('should preserve existing batch data', () => {
    const existing = makeBatch('B1', 'Existing', 1, [1, 2], {
      domain: 'Caisse',
      complexityGrade: 'B',
      estimatedHours: 12,
    });
    const tracker = makeTracker([existing]);

    const result = upsertBatches(tracker, [
      makeBatch('B1', 'Override Attempt', 1, [1, 2, 3, 4, 5]),
    ]);

    expect(result.batches).toHaveLength(1);
    expect(result.batches[0].name).toBe('Existing');
    expect(result.batches[0].domain).toBe('Caisse');
    expect(result.batches[0].complexityGrade).toBe('B');
    expect(result.batches[0].estimatedHours).toBe(12);
    expect(result.batches[0].priorityOrder).toEqual([1, 2]);
  });

  it('should update the updated date', () => {
    const tracker = makeTracker([]);
    const result = upsertBatches(tracker, [makeBatch('B1', 'New', 1, [1])]);
    expect(result.updated).not.toBe('2026-01-01');
  });

  it('should handle empty newBatches array', () => {
    const existing = makeBatch('B1', 'Only', 1, [1, 2]);
    const tracker = makeTracker([existing]);

    const result = upsertBatches(tracker, []);
    expect(result.batches).toHaveLength(1);
    expect(result.batches[0].id).toBe('B1');
  });

  it('should preserve new batch fields (domain, grade, hours, autoDetected)', () => {
    const tracker = makeTracker([]);
    const newBatch = makeBatch('B3', 'Auto Detected', 10, [10, 11, 12], {
      domain: 'Ventes',
      complexityGrade: 'A',
      estimatedHours: 25.5,
      autoDetected: true,
    });

    const result = upsertBatches(tracker, [newBatch]);
    expect(result.batches[0].domain).toBe('Ventes');
    expect(result.batches[0].complexityGrade).toBe('A');
    expect(result.batches[0].estimatedHours).toBe(25.5);
    expect(result.batches[0].autoDetected).toBe(true);
  });
});
