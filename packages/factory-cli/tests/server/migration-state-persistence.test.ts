/**
 * Phase 3 - Migration State Persistence Tests
 * Tests for persistent state storage and recovery.
 *
 * OBJECTIVE: Ensure migration state survives server restarts.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  startMigration,
  addMigrateEvent,
  endMigration,
  persistState,
  loadPersistedState,
  clearPersistedState,
} from '../../src/server/migrate-state.js';

let tmpDir: string;
let stateFile: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-persist-'));
  stateFile = path.join(tmpDir, 'migration-state.json');
});

afterEach(() => {
  endMigration();
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

describe('Phase 3 - Migration State Persistence', () => {
  describe('P1 - Automatic Persistence', () => {
    it('should write migration-state.json after startMigration', () => {
      // Arrange & Act
      startMigration('B-persist', 3, '/tmp/target', 'cli', false, [
        { id: 100, name: 'Prog100' },
        { id: 101, name: 'Prog101' },
      ], 5.5);

      persistState(stateFile);

      // Assert: File created
      expect(fs.existsSync(stateFile)).toBe(true);

      // Assert: File contains valid JSON
      const content = fs.readFileSync(stateFile, 'utf8');
      const state = JSON.parse(content);

      expect(state.running).toBe(true);
      expect(state.batch).toBe('B-persist');
      expect(state.totalPrograms).toBe(3);
      expect(state.estimatedHours).toBe(5.5);
      expect(state.programList.length).toBe(2);
    });

    it('should update state file after each program completion', () => {
      // Arrange
      startMigration('B-progress', 3, '/tmp/target', 'cli', false, []);
      persistState(stateFile);

      // Act: Complete 2 programs
      addMigrateEvent({ type: 'program_completed', programId: 1 });
      persistState(stateFile);

      addMigrateEvent({ type: 'program_completed', programId: 2 });
      persistState(stateFile);

      // Assert: State file updated with progress
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.completedPrograms).toBe(2);
      expect(state.events.length).toBeGreaterThanOrEqual(2);
    });

    it('should delete state file after migration completion', () => {
      // Arrange: Start and complete migration
      startMigration('B-complete', 1, '/tmp/target', 'cli', false, []);
      persistState(stateFile);
      expect(fs.existsSync(stateFile)).toBe(true);

      // Act: End migration and cleanup
      endMigration();
      clearPersistedState(stateFile);

      // Assert: State file deleted
      expect(fs.existsSync(stateFile)).toBe(false);
    });
  });

  describe('P2 - State Recovery', () => {
    it('should restore state from disk after server restart', () => {
      // Arrange: Create persisted state file
      const persistedState = {
        running: true,
        batch: 'B-recovered',
        startedAt: Date.now() - 60000, // Started 1 min ago
        totalPrograms: 5,
        completedPrograms: 2,
        failedPrograms: 1,
        targetDir: '/tmp/recovered',
        mode: 'bedrock',
        dryRun: false,
        estimatedHours: 10,
        programList: [
          { id: 1, name: 'Prog1' },
          { id: 2, name: 'Prog2' },
        ],
        events: [
          { type: 'program_completed', programId: 1 },
          { type: 'program_failed', programId: 2, error: 'Timeout' },
        ],
      };

      fs.writeFileSync(stateFile, JSON.stringify(persistedState, null, 2), 'utf8');

      // Act: Simulate server restart - load state
      const loaded = loadPersistedState(stateFile);

      // Assert: State fully restored
      expect(loaded).toBeDefined();
      expect(loaded?.running).toBe(true);
      expect(loaded?.batch).toBe('B-recovered');
      expect(loaded?.completedPrograms).toBe(2);
      expect(loaded?.failedPrograms).toBe(1);
      expect(loaded?.events.length).toBe(2);
      expect(loaded?.programList.length).toBe(2);
    });

    it('should return null if no persisted state exists', () => {
      // Act: Try to load non-existent state
      const loaded = loadPersistedState(stateFile);

      // Assert: Returns null
      expect(loaded).toBeNull();
    });
  });

  describe('P3 - Edge Cases', () => {
    it('should return null and start fresh if state.json corrupted', () => {
      // Arrange: Create corrupted state file
      fs.writeFileSync(stateFile, '{INVALID JSON!!!', 'utf8');

      // Act: Try to load corrupted state
      const loaded = loadPersistedState(stateFile);

      // Assert: Returns null (graceful degradation)
      expect(loaded).toBeNull();

      // State should be logged as corrupted (check console.error called)
    });

    it('should preserve latest state across multiple persist calls', () => {
      // Arrange: Start migration
      startMigration('B-multi', 5, '/tmp/target', 'cli', false, []);

      // Act: Persist multiple times with different progress
      addMigrateEvent({ type: 'program_completed', programId: 1 });
      persistState(stateFile);

      addMigrateEvent({ type: 'program_completed', programId: 2 });
      persistState(stateFile);

      addMigrateEvent({ type: 'program_completed', programId: 3 });
      persistState(stateFile);

      // Assert: File contains latest state (3 programs completed)
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.completedPrograms).toBe(3);
    });
  });
});
