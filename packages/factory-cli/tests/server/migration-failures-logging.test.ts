/**
 * BLOC A2 - Migration Logging Failures
 * Tests for log/token persistence failures during migration.
 *
 * OBJECTIVE: Ensure logs and tokens are never silently lost.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeLogEntry, readLogs } from '../../src/server/log-storage.js';
import { updateTokens, getTokensData } from '../../src/server/token-tracker.js';
import type { LogEntry } from '../../src/server/log-storage.js';

// ─── Test Fixtures ────────────────────────────────────────────────

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-logging-'));
});

afterEach(() => {
  vi.restoreAllMocks();
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ─── Tests ─────────────────────────────────────────────────────────

describe('BLOC A2 - Migration Logging Failures', () => {
  describe('[R5] Log Write Failures', () => {
    it('should CREATE logs directory if missing', () => {
      // Arrange: Log dir does not exist
      const logDir = path.join(tmpDir, 'logs');
      const batch = 'B-test';
      expect(fs.existsSync(logDir)).toBe(false);

      // Act: Write a log entry
      writeLogEntry(logDir, batch, {
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'test',
        message: 'Test message',
      });

      // Assert: Directory was created
      expect(fs.existsSync(logDir)).toBe(true);

      // Assert: Log file exists ({batch}.jsonl format)
      const logFile = path.join(logDir, `${batch}.jsonl`);
      expect(fs.existsSync(logFile)).toBe(true);
    });

    it('should APPEND to existing log file', () => {
      // Arrange: Create log dir and initial log
      const logDir = path.join(tmpDir, 'logs');
      const batch = 'B-test';

      writeLogEntry(logDir, batch, {
        timestamp: '2026-02-25T10:00:00Z',
        level: 'info',
        type: 'start',
        message: 'First entry',
      });

      // Act: Write second entry
      writeLogEntry(logDir, batch, {
        timestamp: '2026-02-25T10:01:00Z',
        level: 'info',
        type: 'end',
        message: 'Second entry',
      });

      // Assert: Both entries exist
      const result = readLogs(logDir, batch, { offset: 0, limit: 10 });
      expect(result.logs.length).toBe(2);
      expect(result.logs[0].message).toBe('First entry');
      expect(result.logs[1].message).toBe('Second entry');
    });

    it('should HANDLE corrupted JSONL gracefully (R5 FIXED)', () => {
      // Arrange: Create JSONL file with valid and invalid lines
      const logDir = path.join(tmpDir, 'logs');
      const batch = 'B-corrupted';
      fs.mkdirSync(logDir, { recursive: true });

      const logFile = path.join(logDir, `${batch}.jsonl`);
      fs.writeFileSync(logFile, 'INVALID JSON LINE 1\n{"valid": true, "level": "info", "message": "Valid entry"}\nINVALID LINE 2\n', 'utf8');

      // Act: Read logs (should NOT crash)
      const result = readLogs(logDir, batch, { offset: 0, limit: 10 });

      // Assert: Invalid lines are skipped, valid entries are returned
      expect(result.logs.length).toBe(1); // Only 1 valid entry
      expect(result.logs[0]).toHaveProperty('valid', true);
      expect(result.logs[0].message).toBe('Valid entry');
    });

    it.todo('[R5] should FALLBACK to console if JSONL write fails', () => {
      // TODO: Test that if fs.appendFileSync throws ENOSPC, log is written to console.error
      // Current behavior: May crash or silently fail
      // Expected: console.error fallback + warning emitted
      //
      // Implementation needed in log-storage.ts writeLogEntry():
      // try {
      //   fs.appendFileSync(logFile, line);
      // } catch (err) {
      //   console.error('[LOG WRITE FAILED]', { batch, entry, error: err });
      // }
    });
  });

  describe('[R6] Token Tracking Failures', () => {
    it('should CREATE tokens.json if missing', () => {
      // Arrange: Migration dir exists but no tokens.json
      const migrationDir = path.join(tmpDir, 'migration');
      fs.mkdirSync(migrationDir, { recursive: true });

      expect(fs.existsSync(path.join(migrationDir, 'tokens.json'))).toBe(false);

      // Act: Update tokens (programId, phase, tokens, model)
      updateTokens(migrationDir, 'P1', 'SPEC', { input: 1000, output: 500 }, 'sonnet');

      // Assert: tokens.json created
      expect(fs.existsSync(path.join(migrationDir, 'tokens.json'))).toBe(true);

      const data = getTokensData(migrationDir);
      expect(data?.global.input).toBe(1000);
      expect(data?.global.output).toBe(500);
    });

    it('should ACCUMULATE tokens across multiple calls', () => {
      // Arrange
      const migrationDir = path.join(tmpDir, 'migration');
      fs.mkdirSync(migrationDir, { recursive: true });

      // Act: Update tokens 3 times (programId, phase, tokens, model)
      updateTokens(migrationDir, 'P1', 'SPEC', { input: 1000, output: 500 }, 'sonnet');
      updateTokens(migrationDir, 'P2', 'CONTRACT', { input: 2000, output: 1000 }, 'sonnet');
      updateTokens(migrationDir, 'P3', 'ANALYZE', { input: 1500, output: 750 }, 'sonnet');

      // Assert: Global tokens accumulated
      const data = getTokensData(migrationDir);
      expect(data?.global.input).toBe(4500); // 1000 + 2000 + 1500
      expect(data?.global.output).toBe(2250); // 500 + 1000 + 750
    });

    it('should RECOVER from corrupted tokens.json', () => {
      // Arrange: Create corrupted tokens.json
      const migrationDir = path.join(tmpDir, 'migration');
      fs.mkdirSync(migrationDir, { recursive: true });

      const tokensFile = path.join(migrationDir, 'tokens.json');
      fs.writeFileSync(tokensFile, 'INVALID JSON {{{', 'utf8');

      // Act: Try to read tokens (should return null/default)
      const data = getTokensData(migrationDir);

      // Assert: Returns safe default instead of crashing
      expect(data).toBeNull(); // Current behavior: returns null on parse error
    });

    it.todo('[R6] should LOG ERROR if tokens.json corrupted', () => {
      // TODO: Add error logging when JSON parse fails
      // Current behavior: Returns null silently
      // Expected: console.error + continue with fresh tokens
      //
      // Implementation needed in token-tracker.ts getTokensData():
      // } catch (err) {
      //   console.error('[TOKENS CORRUPTED]', { migrationDir, error: err });
      //   return null; // Start fresh
      // }
    });

    it.todo('[R6] should NOT CRASH if updateTokens() fails', () => {
      // TODO: Wrap updateTokens in try/catch in migrate-runner
      // Current behavior: May crash migration if disk full
      // Expected: Log warning + continue migration
      //
      // Test approach:
      // 1. Mock fs.writeFileSync to throw ENOSPC
      // 2. Call updateTokens()
      // 3. Verify: Error logged, function returns without throwing
    });
  });

  describe('[R5-bis] Log Filtering', () => {
    it('should filter logs by level', () => {
      // Arrange
      const logDir = path.join(tmpDir, 'logs');
      const batch = 'B-filter';

      writeLogEntry(logDir, batch, { timestamp: '2026-02-25T10:00:00Z', level: 'info', type: 'test', message: 'Info message' });
      writeLogEntry(logDir, batch, { timestamp: '2026-02-25T10:01:00Z', level: 'error', type: 'test', message: 'Error message' });
      writeLogEntry(logDir, batch, { timestamp: '2026-02-25T10:02:00Z', level: 'warn', type: 'test', message: 'Warning message' });

      // Act: Filter only errors
      const result = readLogs(logDir, batch, { offset: 0, limit: 10, level: 'error' });

      // Assert: Only error entries
      expect(result.logs.length).toBe(1);
      expect(result.logs[0].level).toBe('error');
      expect(result.logs[0].message).toBe('Error message');
    });

    it('should paginate logs with offset and limit', () => {
      // Arrange: Write 10 log entries
      const logDir = path.join(tmpDir, 'logs');
      const batch = 'B-paginate';

      for (let i = 0; i < 10; i++) {
        writeLogEntry(logDir, batch, {
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
          level: 'info',
          type: 'test',
          message: `Entry ${i}`,
        });
      }

      // Act: Read entries 5-7 (offset 5, limit 3)
      const result = readLogs(logDir, batch, { offset: 5, limit: 3 });

      // Assert: 3 entries starting from index 5
      expect(result.logs.length).toBe(3);
      expect(result.logs[0].message).toBe('Entry 5');
      expect(result.logs[1].message).toBe('Entry 6');
      expect(result.logs[2].message).toBe('Entry 7');
    });
  });
});
