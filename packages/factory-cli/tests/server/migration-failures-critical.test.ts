/**
 * BLOC A1 - Migration Critical Failures
 * Tests for silent failures detection in migration pipeline.
 *
 * OBJECTIVE: Ensure NO error can fail silently during migration.
 * Each test validates that failures are logged/emitted properly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runMigration } from '../../src/migrate/migrate-runner.js';
import { writeTracker, readTracker } from '../../src/core/tracker.js';
import type { MigrateConfig, MigrateEvent } from '../../src/migrate/migrate-types.js';
import type { Tracker } from '../../src/core/types.js';
import { writeMigrateTracker } from '../../src/migrate/migrate-tracker.js';
import YAML from 'yaml';

// ─── Test Fixtures ────────────────────────────────────────────────

let tmpDir: string;
let capturedEvents: MigrateEvent[] = [];

const makeConfig = (overrides: Partial<MigrateConfig> = {}): MigrateConfig => ({
  projectDir: tmpDir,
  targetDir: path.join(tmpDir, 'adh-web'),
  migrationDir: path.join(tmpDir, '.openspec', 'migration'),
  specDir: path.join(tmpDir, '.openspec', 'specs'),
  contractSubDir: 'ADH',
  parallel: 1,
  maxPasses: 1,
  dryRun: false,
  model: 'sonnet',
  cliBin: 'claude',
  autoCommit: false,
  onEvent: (event) => capturedEvents.push(event),
  ...overrides,
});

const createMinimalTracker = (trackerFile: string, batchId = 'B1'): void => {
  const tracker: Tracker = {
    version: '1.0',
    methodology: 'SPECMAP',
    created: '2026-02-25',
    updated: '2026-02-25',
    status: 'active',
    stats: {
      totalPrograms: 1,
      livePrograms: 1,
      orphanPrograms: 0,
      sharedPrograms: 0,
      contracted: 1,
      enriched: 0,
      verified: 0,
      maxLevel: 0,
      lastComputed: '',
    },
    batches: [{
      id: batchId,
      name: 'Test Batch',
      root: 100,
      programs: 1,
      priorityOrder: [100],
      status: 'contracted',
      domain: 'test',
      complexityGrade: 'LOW' as const,
      estimatedHours: 1,
      autoDetected: false,
      stats: {
        backendNa: 0,
        frontendEnrich: 0,
        fullyImpl: 0,
        coverageAvgFrontend: 0,
        totalPartial: 0,
        totalMissing: 0,
      },
    }],
    notes: [],
  };

  fs.mkdirSync(path.dirname(trackerFile), { recursive: true });
  writeTracker(tracker, trackerFile);
};

const createMinimalContract = (contractFile: string, progId = 100): void => {
  const contract = {
    program: { id: progId, name: `IDE-${progId}`, complexity: 'LOW', callers: [], callees: [], tasks_count: 1, tables_count: 0, expressions_count: 0 },
    rules: [{ id: 'R1', description: 'Test rule', condition: '', variables: [], status: 'IMPL', target_file: 'test.ts', gap_notes: '' }],
    variables: [],
    tables: [],
    callees: [],
    overall: {
      rules_total: 1,
      rules_impl: 1,
      rules_partial: 0,
      rules_missing: 0,
      rules_na: 0,
      variables_key_count: 0,
      callees_total: 0,
      callees_impl: 0,
      callees_missing: 0,
      coverage_pct: 100,
      status: 'verified',
      generated: '2026-02-25T00:00:00Z',
      notes: '',
    },
  };

  fs.mkdirSync(path.dirname(contractFile), { recursive: true });
  fs.writeFileSync(contractFile, YAML.stringify(contract), 'utf8');
};

const createMinimalSpec = (specFile: string, progId = 100): void => {
  const content = `# Spec ADH IDE ${progId}\n\n## Fonctionnel\nTest program.\n\n## Technique\nTest.`;
  fs.mkdirSync(path.dirname(specFile), { recursive: true });
  fs.writeFileSync(specFile, content, 'utf8');
};

// ─── Setup/Teardown ────────────────────────────────────────────────

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-failures-'));
  capturedEvents = [];

  // Create minimal structure
  const dirs = [
    path.join(tmpDir, '.openspec', 'specs'),
    path.join(tmpDir, '.openspec', 'migration', 'ADH'),
    path.join(tmpDir, 'adh-web', 'src'),
  ];
  for (const d of dirs) fs.mkdirSync(d, { recursive: true });
});

afterEach(() => {
  vi.restoreAllMocks();
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ─── Tests ─────────────────────────────────────────────────────────

describe('BLOC A1 - Migration Critical Failures', () => {
  describe('[R1] Tracker Update Failures', () => {
    it.skip('should CURRENTLY fail silently if writeTracker() throws ENOSPC (disk full)', async () => {
      // SKIPPED: Mocking writeTracker in ESM is complex
      // This test documents the bug: migrate-runner.ts line 268-270 catches errors silently
      // Manual verification:
      // 1. Fill disk to 100%
      // 2. Run migration
      // 3. Observe: Migration completes but tracker.json not updated
      // 4. Observe: No error logged or emitted
    });

    it.todo('[R1] should LOG ERROR and EMIT event when writeTracker() fails', async () => {
      // TODO: Modify migrate-runner.ts line 268-270 to:
      // } catch (err) {
      //   const msg = `Tracker update failed: ${err instanceof Error ? err.message : 'unknown'}`;
      //   emit(config, ET.ERROR, msg, { phase: 'tracker_update', error: err });
      //   logger.error({ err }, msg);
      // }
      //
      // Then this test should pass:
      // - expect(errorEvents.length).toBe(1)
      // - expect(errorEvents[0].message).toContain('ENOSPC')
    });

    it.skip('should NOT break migration result if writeTracker() fails', async () => {
      // SKIPPED: Requires complex filesystem mocking
      // This test validates CORRECT behavior: migration continues despite tracker failure
      // The issue is NOT that it continues, but that it fails SILENTLY (no log)
    });
  });

  describe('[R2] Auto-Verify Failures', () => {
    it.skip('should CURRENTLY fail silently if verifyContracts() throws error', async () => {
      // SKIPPED: Mocking verifyContracts in ESM is complex
      // This test documents the bug: migrate-runner.ts line 283 catches errors silently
      // Manual verification:
      // 1. Corrupt a contract YAML (invalid target_file)
      // 2. Run migration
      // 3. Observe: Auto-verify fails but no error logged
    });

    it.todo('[R2] should LOG WARNING when auto-verify fails', async () => {
      // TODO: Modify migrate-runner.ts line 283 to:
      // } catch (err) {
      //   const msg = `Auto-verify failed: ${err instanceof Error ? err.message : 'unknown'}`;
      //   emit(config, ET.WARNING, msg, { phase: 'auto_verify', error: err });
      //   logger.warn({ err }, msg);
      // }
      //
      // Then this test should pass:
      // - expect(warningEvents.length).toBe(1)
      // - expect(warningEvents[0].message).toContain('verification failed')
    });
  });

  describe('[R3] State Persistence & Recovery', () => {
    it.todo('[R3] should PERSIST migration state to disk after each program completes', async () => {
      // TODO: Implement persistent state storage
      // Current: migrate-state.ts keeps state in memory only
      // Expected: Write state to .openspec/migration/ADH/migration-state.json after each program
      //
      // Test steps:
      // 1. Start migration with 3 programs
      // 2. After program 1 completes, check migration-state.json exists
      // 3. Verify state contains: completedPrograms=1, programList with status
    });

    it.todo('[R3] should RECOVER migration state from disk after server restart', async () => {
      // TODO: Implement state recovery on server start
      // Current: getMigrateActiveState() returns in-memory state only
      // Expected: Load from migration-state.json if exists
      //
      // Test steps:
      // 1. Create migration-state.json with partial migration (2/3 programs done)
      // 2. Restart server (simulate by calling getMigrateActiveState)
      // 3. GET /api/migrate/active should return recovered state
      // 4. Dashboard should show correct progress (2/3 programs)
    });

    it('should return empty state when no migration is running', async () => {
      // This already works - just documenting expected behavior
      const { getMigrateActiveState } = await import('../../src/server/migrate-state.js');
      const state = getMigrateActiveState();

      expect(state.running).toBe(false);
      expect(state.batch).toBe('');
      expect(state.events).toEqual([]);
    });
  });

  describe('[R1-bis] Event Emission Verification', () => {
    it('should emit migration_started event with batch info', async () => {
      // Arrange
      const trackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'tracker.json');
      const contractFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'ADH-IDE-100.contract.yaml');
      const specFile = path.join(tmpDir, '.openspec', 'specs', 'ADH-IDE-100.md');
      const migrateTrackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'migrate-tracker.json');

      createMinimalTracker(trackerFile, 'B1');
      createMinimalContract(contractFile, 100);
      createMinimalSpec(specFile, 100);
      writeMigrateTracker(migrateTrackerFile, {});

      const config = makeConfig({ dryRun: true });

      // Act
      await runMigration([100], 'B1', 'Test Batch', config);

      // Assert: migration_started event must be emitted
      const startEvent = capturedEvents.find(e => e.type === 'migration_started');
      expect(startEvent).toBeDefined();
      expect(startEvent?.message).toContain('B1');
      expect(startEvent?.message).toContain('1 programs');
    });

    it('should emit migration_completed event with summary', async () => {
      // Arrange
      const trackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'tracker.json');
      const contractFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'ADH-IDE-100.contract.yaml');
      const specFile = path.join(tmpDir, '.openspec', 'specs', 'ADH-IDE-100.md');
      const migrateTrackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'migrate-tracker.json');

      createMinimalTracker(trackerFile, 'B1');
      createMinimalContract(contractFile, 100);
      createMinimalSpec(specFile, 100);
      writeMigrateTracker(migrateTrackerFile, {});

      const config = makeConfig({ dryRun: true });

      // Act
      await runMigration([100], 'B1', 'Test Batch', config);

      // Assert: migration_completed event must be emitted
      const completedEvent = capturedEvents.find(e => e.type === 'migration_completed');
      expect(completedEvent).toBeDefined();
      expect(completedEvent?.message).toMatch(/Migration terminee|programmes/);
    });

    it('should emit phase events for each migration phase', async () => {
      // Arrange
      const trackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'tracker.json');
      const contractFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'ADH-IDE-100.contract.yaml');
      const specFile = path.join(tmpDir, '.openspec', 'specs', 'ADH-IDE-100.md');
      const migrateTrackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'migrate-tracker.json');

      createMinimalTracker(trackerFile, 'B1');
      createMinimalContract(contractFile, 100);
      createMinimalSpec(specFile, 100);
      writeMigrateTracker(migrateTrackerFile, {});

      const config = makeConfig({ dryRun: true });

      // Act
      await runMigration([100], 'B1', 'Test Batch', config);

      // Assert: Should emit phase-related events
      const phaseEvents = capturedEvents.filter(e =>
        e.type === 'phase_started' ||
        e.type === 'phase_completed' ||
        e.type === 'phase_failed'
      );
      expect(phaseEvents.length).toBeGreaterThan(0);
    });
  });

  describe('[R3-bis] State Tracking Verification', () => {
    it('should track completedPrograms counter correctly', async () => {
      // Arrange
      const { startMigration, addMigrateEvent, getMigrateActiveState } = await import('../../src/server/migrate-state.js');

      startMigration('B-test', 3, '/tmp/target', 'cli', false, [
        { id: 1, name: 'Prog1' },
        { id: 2, name: 'Prog2' },
        { id: 3, name: 'Prog3' },
      ]);

      // Act: Simulate 2 programs completing
      addMigrateEvent({ type: 'program_completed', programId: 1 });
      addMigrateEvent({ type: 'program_completed', programId: 2 });

      const state = getMigrateActiveState();

      // Assert
      expect(state.running).toBe(true);
      expect(state.completedPrograms).toBe(2);
      expect(state.totalPrograms).toBe(3);
      expect(state.batch).toBe('B-test');
    });

    it('should track failedPrograms counter correctly', async () => {
      // Arrange
      const { startMigration, addMigrateEvent, getMigrateActiveState } = await import('../../src/server/migrate-state.js');

      startMigration('B-test', 2, '/tmp/target', 'cli', false, []);

      // Act: Simulate 1 success, 1 failure
      addMigrateEvent({ type: 'program_completed', programId: 1 });
      addMigrateEvent({ type: 'program_failed', programId: 2 });

      const state = getMigrateActiveState();

      // Assert
      expect(state.completedPrograms).toBe(1);
      expect(state.failedPrograms).toBe(1);
    });

    it('should maintain circular buffer of last 500 events', async () => {
      // Arrange
      const { startMigration, addMigrateEvent, getMigrateActiveState } = await import('../../src/server/migrate-state.js');

      startMigration('B-test', 600, '/tmp/target', 'cli', false, []);

      // Act: Add 600 events (exceeds MAX_EVENTS=500)
      for (let i = 0; i < 600; i++) {
        addMigrateEvent({ type: 'test_event', index: i });
      }

      const state = getMigrateActiveState();

      // Assert: Should keep only last 500 events
      expect(state.events.length).toBe(500);
      // First event should be index 100 (0-99 were evicted)
      const firstEvent = state.events[0] as { index: number };
      expect(firstEvent.index).toBe(100);
    });
  });

  describe('[R4] Abort Safety', () => {
    it.todo('[R4] should NOT abort if migration already completed', async () => {
      // TODO: Add check in handleMigrateAbort (api-routes.ts line 526)
      // Current: Aborts immediately without checking state
      // Expected: Return {aborted: false, message: 'Migration already completed'}
      //
      // Test steps:
      // 1. Complete a migration
      // 2. POST /api/migrate/abort
      // 3. Should return {aborted: false}
      // 4. Should NOT set _migrateAbortController to null
    });

    it.todo('[R4] should mark in-progress programs as aborted when aborting', async () => {
      // TODO: Implement proper abort handling
      // Current: Just signals abort, programs may be left in limbo
      // Expected: Mark all in-progress programs as 'aborted' status
      //
      // Test steps:
      // 1. Start migration with 5 programs
      // 2. After 2 programs complete, POST /api/migrate/abort
      // 3. Verify: completedPrograms=2, abortedPrograms=3
      // 4. Verify: migrate-tracker.json shows 3 programs with status='aborted'
    });

    it.todo('[R4] should prevent new migration start if abort is in progress', async () => {
      // TODO: Add abort-in-progress check
      // Current: Can start new migration while abort is happening
      // Expected: Return 409 Conflict if abort signal is active
      //
      // Test steps:
      // 1. Start migration
      // 2. POST /api/migrate/abort
      // 3. Immediately POST /api/migrate/stream (new migration)
      // 4. Should return 409 with message 'Abort in progress, wait for completion'
    });
  });
});
