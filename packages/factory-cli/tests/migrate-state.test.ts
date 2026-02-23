import { describe, it, expect, beforeEach } from 'vitest';
import { getMigrateActiveState, startMigration, addMigrateEvent, endMigration } from '../src/server/migrate-state.js';

describe('migrate-state', () => {
  beforeEach(() => {
    // Reset state by starting then ending
    startMigration('reset', 0, '', '', false);
    endMigration();
  });

  it('should start with running=false', () => {
    const state = getMigrateActiveState();
    expect(state.running).toBe(false);
  });

  it('should track migration start', () => {
    startMigration('B1', 18, '/target', 'cli', false);
    const state = getMigrateActiveState();
    expect(state.running).toBe(true);
    expect(state.batch).toBe('B1');
    expect(state.totalPrograms).toBe(18);
    expect(state.targetDir).toBe('/target');
    expect(state.mode).toBe('cli');
    expect(state.dryRun).toBe(false);
    expect(state.startedAt).toBeGreaterThan(0);
    expect(state.events).toEqual([]);
  });

  it('should buffer events', () => {
    startMigration('B1', 5, '/t', 'cli', false);
    addMigrateEvent({ type: 'phase_started', phase: 'spec', message: 'Starting spec' });
    addMigrateEvent({ type: 'phase_completed', phase: 'spec', message: 'Done spec' });

    const state = getMigrateActiveState();
    expect(state.events).toHaveLength(2);
    expect((state.events[0] as Record<string, unknown>).type).toBe('phase_started');
  });

  it('should count completed and failed programs separately', () => {
    startMigration('B1', 5, '/t', 'cli', false);
    addMigrateEvent({ type: 'program_completed', programId: '69' });
    addMigrateEvent({ type: 'program_completed', programId: '70' });
    addMigrateEvent({ type: 'program_failed', programId: '71' });

    const state = getMigrateActiveState();
    expect(state.completedPrograms).toBe(2);
    expect(state.failedPrograms).toBe(1);
  });

  it('should update totalPrograms from migrate_started event', () => {
    startMigration('B1', 0, '/t', 'cli', false);
    addMigrateEvent({ type: 'migrate_started', programs: 18 });

    const state = getMigrateActiveState();
    expect(state.totalPrograms).toBe(18);
  });

  it('should cap events at MAX_EVENTS (500)', () => {
    startMigration('B1', 5, '/t', 'cli', false);
    for (let i = 0; i < 510; i++) {
      addMigrateEvent({ type: 'log', index: i });
    }

    const state = getMigrateActiveState();
    expect(state.events).toHaveLength(500);
    // First 10 should have been evicted
    expect((state.events[0] as Record<string, unknown>).index).toBe(10);
  });

  it('should end migration', () => {
    startMigration('B1', 5, '/t', 'cli', false);
    addMigrateEvent({ type: 'log' });
    endMigration();

    const state = getMigrateActiveState();
    expect(state.running).toBe(false);
    expect(state.events).toHaveLength(1); // events preserved after end
  });

  it('should return a copy (not reference)', () => {
    startMigration('B1', 5, '/t', 'cli', false);
    addMigrateEvent({ type: 'log' });

    const state1 = getMigrateActiveState();
    addMigrateEvent({ type: 'log2' });
    const state2 = getMigrateActiveState();

    expect(state1.events).toHaveLength(1);
    expect(state2.events).toHaveLength(2);
  });

  // ─── estimatedHours tracking (anti-regression) ──────────────────

  it('should store estimatedHours from startMigration', () => {
    startMigration('B2', 17, '/target', 'cli', false, [], 25.7);
    const state = getMigrateActiveState();
    expect(state.estimatedHours).toBe(25.7);
  });

  it('should update estimatedHours from migrate_started event', () => {
    startMigration('B2', 17, '/target', 'cli', false);
    addMigrateEvent({ type: 'migrate_started', programs: 17, estimatedHours: 12.5 });

    const state = getMigrateActiveState();
    expect(state.estimatedHours).toBe(12.5);
  });

  it('should keep estimatedHours=0 if not provided', () => {
    startMigration('B2', 17, '/target', 'cli', false);
    const state = getMigrateActiveState();
    expect(state.estimatedHours).toBe(0);
  });

  it('should preserve programList through events', () => {
    const programs = [{ id: 69, name: 'EXTRAIT_COMPTE' }, { id: 70, name: 'EXTRAIT_NOM' }];
    startMigration('B1', 2, '/t', 'cli', false, programs, 5.0);
    addMigrateEvent({ type: 'program_completed', programId: '69' });

    const state = getMigrateActiveState();
    expect(state.programList).toHaveLength(2);
    expect(state.programList[0].name).toBe('EXTRAIT_COMPTE');
    expect(state.estimatedHours).toBe(5.0);
  });

  it('should track dryRun flag', () => {
    startMigration('B1', 5, '/t', 'cli', true);
    const state = getMigrateActiveState();
    expect(state.dryRun).toBe(true);
  });
});
