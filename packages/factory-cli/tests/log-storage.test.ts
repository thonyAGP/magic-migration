/**
 * Tests for Log Storage - JSONL log persistence.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  writeLogEntry,
  readLogs,
  searchLogs,
  getLatestLogs,
  clearLogs,
  listLoggedBatches,
} from '../src/server/log-storage.js';

const TEST_LOG_DIR = path.join(process.cwd(), '.test-logs');

describe('LogStorage', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true });
    }
  });

  it('should create log directory and file on first write', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', {
      timestamp: new Date().toISOString(),
      level: 'info',
      type: 'program_started',
      programId: 117,
      message: 'Starting IDE 117',
    });

    expect(fs.existsSync(TEST_LOG_DIR)).toBe(true);
    expect(fs.existsSync(path.join(TEST_LOG_DIR, 'B2.jsonl'))).toBe(true);
  });

  it('should write log entry with timestamp', () => {
    const timestamp = new Date().toISOString();
    writeLogEntry(TEST_LOG_DIR, 'B2', {
      timestamp,
      level: 'info',
      type: 'program_started',
      message: 'Starting program',
    });

    const { logs } = readLogs(TEST_LOG_DIR, 'B2');
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      timestamp,
      level: 'info',
      type: 'program_started',
      message: 'Starting program',
    });
  });

  it('should append multiple log entries', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:00:00Z', level: 'info', type: 'start', message: 'Start' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:01:00Z', level: 'info', type: 'progress', message: 'Progress' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:02:00Z', level: 'info', type: 'end', message: 'End' });

    const { total, logs } = readLogs(TEST_LOG_DIR, 'B2');
    expect(total).toBe(3);
    expect(logs).toHaveLength(3);
  });

  it('should filter by level correctly', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:00:00Z', level: 'debug', type: 'debug', message: 'Debug' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:01:00Z', level: 'info', type: 'info', message: 'Info' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:02:00Z', level: 'warn', type: 'warn', message: 'Warning' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:03:00Z', level: 'error', type: 'error', message: 'Error' });

    // Filter to warn+ (warn, error)
    const { logs } = readLogs(TEST_LOG_DIR, 'B2', { level: 'warn' });
    expect(logs).toHaveLength(2);
    expect(logs.map(l => l.level)).toEqual(['warn', 'error']);
  });

  it('should paginate results correctly', () => {
    for (let i = 0; i < 10; i++) {
      writeLogEntry(TEST_LOG_DIR, 'B2', {
        timestamp: `2026-02-24T10:00:${i.toString().padStart(2, '0')}Z`,
        level: 'info',
        type: 'event',
        message: `Event ${i}`,
      });
    }

    const page1 = readLogs(TEST_LOG_DIR, 'B2', { offset: 0, limit: 5 });
    expect(page1.total).toBe(10);
    expect(page1.logs).toHaveLength(5);

    const page2 = readLogs(TEST_LOG_DIR, 'B2', { offset: 5, limit: 5 });
    expect(page2.total).toBe(10);
    expect(page2.logs).toHaveLength(5);
    expect(page2.logs[0].message).toBe('Event 5');
  });

  it('should search logs by text', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:00:00Z', level: 'info', type: 'program_started', programId: 117, message: 'Starting IDE 117' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:01:00Z', level: 'info', type: 'program_started', programId: 125, message: 'Starting IDE 125' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:02:00Z', level: 'error', type: 'program_failed', programId: 117, message: 'IDE 117 timeout' });

    const results = searchLogs(TEST_LOG_DIR, 'B2', '117');
    expect(results).toHaveLength(2);
    expect(results.every(r => r.message.includes('117') || r.programId === 117)).toBe(true);
  });

  it('should get latest N logs', () => {
    for (let i = 0; i < 20; i++) {
      writeLogEntry(TEST_LOG_DIR, 'B2', {
        timestamp: `2026-02-24T10:00:${i.toString().padStart(2, '0')}Z`,
        level: 'info',
        type: 'event',
        message: `Event ${i}`,
      });
    }

    const latest = getLatestLogs(TEST_LOG_DIR, 'B2', 5);
    expect(latest).toHaveLength(5);
    // Latest first (reversed)
    expect(latest[0].message).toBe('Event 19');
    expect(latest[4].message).toBe('Event 15');
  });

  it('should clear logs for a batch', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:00:00Z', level: 'info', type: 'event', message: 'Event' });
    expect(fs.existsSync(path.join(TEST_LOG_DIR, 'B2.jsonl'))).toBe(true);

    clearLogs(TEST_LOG_DIR, 'B2');
    expect(fs.existsSync(path.join(TEST_LOG_DIR, 'B2.jsonl'))).toBe(false);
  });

  it('should list logged batches', () => {
    writeLogEntry(TEST_LOG_DIR, 'B1', { timestamp: '2026-02-24T10:00:00Z', level: 'info', type: 'event', message: 'B1' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:00:00Z', level: 'info', type: 'event', message: 'B2' });
    writeLogEntry(TEST_LOG_DIR, 'B3', { timestamp: '2026-02-24T10:00:00Z', level: 'info', type: 'event', message: 'B3' });

    const batches = listLoggedBatches(TEST_LOG_DIR);
    expect(batches).toHaveLength(3);
    expect(batches).toContain('B1');
    expect(batches).toContain('B2');
    expect(batches).toContain('B3');
  });

  it('should return empty result for non-existent batch', () => {
    const { total, logs } = readLogs(TEST_LOG_DIR, 'B99');
    expect(total).toBe(0);
    expect(logs).toEqual([]);
  });

  it('should handle level hierarchy correctly', () => {
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:00:00Z', level: 'debug', type: 'debug', message: 'Debug' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:01:00Z', level: 'info', type: 'info', message: 'Info' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:02:00Z', level: 'warn', type: 'warn', message: 'Warning' });
    writeLogEntry(TEST_LOG_DIR, 'B2', { timestamp: '2026-02-24T10:03:00Z', level: 'error', type: 'error', message: 'Error' });

    // Error level should only show errors
    const errors = readLogs(TEST_LOG_DIR, 'B2', { level: 'error' });
    expect(errors.logs).toHaveLength(1);
    expect(errors.logs[0].level).toBe('error');

    // Info level should show info, warn, error (not debug)
    const infos = readLogs(TEST_LOG_DIR, 'B2', { level: 'info' });
    expect(infos.logs).toHaveLength(3);
    expect(infos.logs.map(l => l.level)).toEqual(['info', 'warn', 'error']);
  });
});
