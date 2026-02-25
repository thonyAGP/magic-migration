/**
 * Tests for Log Storage - edge cases and robustness.
 * Covers: corrupted JSONL, getLatestLogs edge cases, searchLogs robustness,
 * clearLogs no-op, readLogs level hierarchy.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  writeLogEntry,
  readLogs,
  searchLogs,
  getLatestLogs,
  clearLogs,
  listLoggedBatches,
} from '../src/server/log-storage.js';

const TEST_LOG_DIR = path.join(os.tmpdir(), 'factory-cli-tests', 'log-storage-edge');

describe('LogStorage edge cases', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_LOG_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true, force: true });
    }
  });

  it('should skip corrupted JSON lines gracefully in readLogs', () => {
    // Write a mix of valid and corrupted lines directly
    const logsFile = path.join(TEST_LOG_DIR, 'B2.jsonl');
    const validEntry = JSON.stringify({
      timestamp: '2026-02-25T10:00:00Z',
      level: 'info',
      type: 'event',
      message: 'Valid entry',
    });
    const corruptLine = '{this is not valid json!!!';
    const validEntry2 = JSON.stringify({
      timestamp: '2026-02-25T10:01:00Z',
      level: 'warn',
      type: 'warning',
      message: 'Second valid',
    });

    fs.writeFileSync(logsFile, `${validEntry}\n${corruptLine}\n${validEntry2}\n`, 'utf8');

    // readLogs now skips corrupted lines instead of throwing (R5 fixed)
    const result = readLogs(TEST_LOG_DIR, 'B2');

    // Should return only valid entries (2 in this case), skip corrupted one
    expect(result.logs.length).toBe(2); // Two valid JSON lines
    expect(result.logs[0].message).toBe('Valid entry');
    expect(result.logs[1].message).toBe('Second valid');
  });

  it('should return empty for non-existent batch in readLogs', () => {
    const { total, logs } = readLogs(TEST_LOG_DIR, 'NONEXISTENT');
    expect(total).toBe(0);
    expect(logs).toEqual([]);
  });

  it('should return all available when getLatestLogs count > total entries', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:00:00Z', level: 'info', type: 'a', message: 'First' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:01:00Z', level: 'info', type: 'b', message: 'Second' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:02:00Z', level: 'info', type: 'c', message: 'Third' });

    // Request 1000 but only 3 exist
    const latest = getLatestLogs(TEST_LOG_DIR, 'B2', 1000);
    expect(latest).toHaveLength(3);
    // Most recent first
    expect(latest[0].message).toBe('Third');
    expect(latest[2].message).toBe('First');
  });

  it('should return all entries when getLatestLogs count=0 (slice(-0) returns all)', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:00:00Z', level: 'info', type: 'a', message: 'Entry 1' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:01:00Z', level: 'info', type: 'b', message: 'Entry 2' });

    // count=0 → logs.slice(-0) → logs.slice(0) → returns ALL entries (JS quirk)
    const latest = getLatestLogs(TEST_LOG_DIR, 'B2', 0);
    expect(latest).toHaveLength(2);
  });

  it('should not crash searchLogs with special regex characters', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:00:00Z', level: 'info', type: 'test', message: 'Normal message' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:01:00Z', level: 'info', type: 'test', message: 'Has [brackets] and (parens)' });

    // searchLogs uses String.includes, not regex - special chars should be safe
    const results = searchLogs(TEST_LOG_DIR, 'B2', '[brackets]');
    expect(results).toHaveLength(1);
    expect(results[0].message).toBe('Has [brackets] and (parens)');

    // Additional special chars
    const noMatch = searchLogs(TEST_LOG_DIR, 'B2', '.*+?^${}|');
    expect(noMatch).toHaveLength(0);
  });

  it('should return empty array when searchLogs finds no match', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:00:00Z', level: 'info', type: 'test', message: 'Some message' });

    const results = searchLogs(TEST_LOG_DIR, 'B2', 'ZZZZZ_NO_MATCH');
    expect(results).toEqual([]);
  });

  it('should not throw when clearLogs called on non-existent batch', () => {
    // clearLogs checks fs.existsSync before unlinking
    expect(() => clearLogs(TEST_LOG_DIR, 'B_NONEXISTENT')).not.toThrow();
  });

  it('should return warn + error entries when readLogs level=warn', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:00:00Z', level: 'debug', type: 'd', message: 'Debug msg' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:01:00Z', level: 'info', type: 'i', message: 'Info msg' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:02:00Z', level: 'warn', type: 'w', message: 'Warn msg' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-25T10:03:00Z', level: 'error', type: 'e', message: 'Error msg' });

    const { logs } = readLogs(TEST_LOG_DIR, 'B2', { level: 'warn' });
    expect(logs).toHaveLength(2);
    expect(logs.map(l => l.level)).toEqual(['warn', 'error']);
  });
});
