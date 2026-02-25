/**
 * Advanced tests for Log Storage - rotation, getLatestLogs with large files, phase field.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  writeLogEntry,
  readLogs,
  getLatestLogs,
  clearLogs,
  listLoggedBatches,
} from '../src/server/log-storage.js';

const TEST_LOG_DIR = path.join(os.tmpdir(), 'factory-cli-tests', 'log-storage-adv');

describe('LogStorage advanced', () => {
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

  it('should persist phase field in log entries', () => {
    writeLogEntry(TEST_LOG_DIR, 'B1', {
      timestamp: '2026-02-25T10:00:00Z',
      level: 'info',
      type: 'phase_started',
      programId: 117,
      phase: 'scaffold',
      message: 'Starting scaffold phase',
    });

    const { logs } = readLogs(TEST_LOG_DIR, 'B1');
    expect(logs).toHaveLength(1);
    expect(logs[0].phase).toBe('scaffold');
  });

  it('should getLatestLogs from files with more than 100 entries (B7 regression)', () => {
    // Write 200 entries
    for (let i = 0; i < 200; i++) {
      writeLogEntry(TEST_LOG_DIR, 'B2', {
        timestamp: `2026-02-25T10:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}Z`,
        level: 'info',
        type: 'event',
        message: `Event ${i}`,
      });
    }

    // Get latest 5 - should be from the END, not from the first 100
    const latest = getLatestLogs(TEST_LOG_DIR, 'B2', 5);
    expect(latest).toHaveLength(5);
    expect(latest[0].message).toBe('Event 199');
    expect(latest[4].message).toBe('Event 195');
  });

  it('should getLatestLogs with level filter from large file', () => {
    for (let i = 0; i < 150; i++) {
      writeLogEntry(TEST_LOG_DIR, 'B3', {
        timestamp: `2026-02-25T10:00:${String(i % 60).padStart(2, '0')}Z`,
        level: i % 10 === 0 ? 'error' : 'info',
        type: 'event',
        message: `Event ${i}`,
      });
    }

    const latestErrors = getLatestLogs(TEST_LOG_DIR, 'B3', 3, 'error');
    expect(latestErrors).toHaveLength(3);
    expect(latestErrors.every(l => l.level === 'error')).toBe(true);
  });

  it('should clear rotated files along with primary', () => {
    // Create primary + fake rotated files
    writeLogEntry(TEST_LOG_DIR, 'B4', {
      timestamp: '2026-02-25T10:00:00Z',
      level: 'info',
      type: 'event',
      message: 'current',
    });
    fs.writeFileSync(path.join(TEST_LOG_DIR, 'B4.1.jsonl'), '{"old": true}\n');
    fs.writeFileSync(path.join(TEST_LOG_DIR, 'B4.2.jsonl'), '{"older": true}\n');

    clearLogs(TEST_LOG_DIR, 'B4');

    expect(fs.existsSync(path.join(TEST_LOG_DIR, 'B4.jsonl'))).toBe(false);
    expect(fs.existsSync(path.join(TEST_LOG_DIR, 'B4.1.jsonl'))).toBe(false);
    expect(fs.existsSync(path.join(TEST_LOG_DIR, 'B4.2.jsonl'))).toBe(false);
  });

  it('should exclude rotated files from listLoggedBatches', () => {
    writeLogEntry(TEST_LOG_DIR, 'B5', {
      timestamp: '2026-02-25T10:00:00Z',
      level: 'info',
      type: 'event',
      message: 'current',
    });
    // Simulate rotated files
    fs.writeFileSync(path.join(TEST_LOG_DIR, 'B5.1.jsonl'), '{"old": true}\n');
    fs.writeFileSync(path.join(TEST_LOG_DIR, 'B5.2.jsonl'), '{"older": true}\n');

    const batches = listLoggedBatches(TEST_LOG_DIR);
    expect(batches).toEqual(['B5']);
  });

  it('should include data field in log entries', () => {
    writeLogEntry(TEST_LOG_DIR, 'B6', {
      timestamp: '2026-02-25T10:00:00Z',
      level: 'info',
      type: 'pipeline_result',
      message: 'Pipeline completed',
      data: { total: 8, contracted: 5, enriched: 2, verified: 1 },
    });

    const { logs } = readLogs(TEST_LOG_DIR, 'B6');
    expect(logs[0].data).toEqual({ total: 8, contracted: 5, enriched: 2, verified: 1 });
  });
});
