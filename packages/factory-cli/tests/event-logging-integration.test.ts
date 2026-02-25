/**
 * Tests for event-to-log conversion and pipeline event persistence.
 * Covers: eventToLogEntry mapping, preflight logging, generate/migrate stream logging.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { writeLogEntry, readLogs } from '../src/server/log-storage.js';
import type { LogEntry } from '../src/server/log-storage.js';

const TEST_LOG_DIR = path.join(os.tmpdir(), 'factory-cli-tests', 'event-logging');

/**
 * Replicates the eventToLogEntry function from api-routes.ts (line 309-316)
 * for isolated testing without needing full server infrastructure.
 */
const eventToLogEntry = (event: {
  type: string;
  timestamp?: string;
  programId?: string | number;
  message?: string;
  data?: Record<string, unknown>;
}): LogEntry => ({
  timestamp: event.timestamp ?? new Date().toISOString(),
  level: event.type === 'error' ? 'error' : 'info',
  type: event.type,
  programId: event.programId,
  message: event.message ?? '',
  data: event.data,
});

/**
 * Replicates the logGen wrapper from handleGenerateStream (line 213-223)
 */
const createLogGen = (logDir: string, batchId: string) => {
  const sent: Record<string, unknown>[] = [];
  return {
    logGen: (event: Record<string, unknown>) => {
      sent.push(event);
      writeLogEntry(logDir, batchId, {
        timestamp: new Date().toISOString(),
        level: event.type === 'error' ? 'error' : 'info',
        type: String(event.type ?? 'unknown'),
        programId: event.programId as string | number | undefined,
        message: String(event.message ?? event.type ?? ''),
        data: event,
      });
    },
    sent,
  };
};

/**
 * Replicates the bufferedSend wrapper from handleMigrateStream (line 440-453)
 */
const createBufferedSend = (logDir: string, batchId: string) => {
  const events: unknown[] = [];
  return {
    bufferedSend: (event: unknown) => {
      events.push(event);
      const e = event as Record<string, unknown>;
      writeLogEntry(logDir, batchId, {
        timestamp: (e.timestamp as string) ?? new Date().toISOString(),
        level: e.type === 'error' ? 'error' : 'info',
        type: (e.type as string) ?? 'unknown',
        programId: e.programId as string | number | undefined,
        phase: e.phase as string | undefined,
        message: (e.message as string) ?? (e.type as string) ?? '',
        data: e.data as Record<string, unknown> | undefined,
      });
    },
    events,
  };
};

describe('Event Logging Integration', () => {
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

  // ─── eventToLogEntry mapping ──────────────────────────────────────

  it('should map all PipelineEvent fields correctly', () => {
    const event = {
      type: 'program_completed',
      timestamp: '2026-02-25T10:00:00Z',
      programId: 117,
      message: 'Program 117 completed',
      data: { gapsResolved: 5 },
    };

    const entry = eventToLogEntry(event);
    expect(entry.timestamp).toBe('2026-02-25T10:00:00Z');
    expect(entry.level).toBe('info');
    expect(entry.type).toBe('program_completed');
    expect(entry.programId).toBe(117);
    expect(entry.message).toBe('Program 117 completed');
    expect(entry.data).toEqual({ gapsResolved: 5 });
  });

  it('should default timestamp when missing', () => {
    const before = new Date().toISOString();
    const entry = eventToLogEntry({ type: 'start', message: 'Starting' });
    const after = new Date().toISOString();

    expect(entry.timestamp >= before).toBe(true);
    expect(entry.timestamp <= after).toBe(true);
    expect(entry.message).toBe('Starting');
  });

  it('should map error type to level=error', () => {
    const entry = eventToLogEntry({ type: 'error', message: 'Something failed' });
    expect(entry.level).toBe('error');
    expect(entry.type).toBe('error');
  });

  // ─── Pipeline event persistence ──────────────────────────────────

  it('should persist pipeline events to JSONL during run', () => {
    const batchId = 'B-integration';

    // Simulate eventToLogEntry + writeLogEntry for multiple events
    const events = [
      { type: 'pipeline_started', message: 'Pipeline started', timestamp: '2026-02-25T10:00:00Z' },
      { type: 'program_started', programId: 117, message: 'Starting 117', timestamp: '2026-02-25T10:00:01Z' },
      { type: 'program_completed', programId: 117, message: 'Completed 117', timestamp: '2026-02-25T10:00:05Z' },
      { type: 'pipeline_result', message: 'Pipeline done', timestamp: '2026-02-25T10:00:10Z' },
    ];

    for (const event of events) {
      const entry = eventToLogEntry(event);
      writeLogEntry(TEST_LOG_DIR, batchId, entry);
    }

    const { total, logs } = readLogs(TEST_LOG_DIR, batchId);
    expect(total).toBe(4);
    expect(logs[0].type).toBe('pipeline_started');
    expect(logs[1].programId).toBe(117);
    expect(logs[3].type).toBe('pipeline_result');
  });

  it('should log preflight event before pipeline starts', () => {
    const batchId = 'B-preflight';

    // Simulate: writeLogEntry for preflight BEFORE onEvent setup
    const preflightEntry: LogEntry = {
      timestamp: '2026-02-25T10:00:00Z',
      level: 'info',
      type: 'preflight',
      message: 'Preflight: 5 ready, 0 blocked, 2 done',
      data: { ready: 5, blocked: 0, alreadyDone: 2 },
    };

    writeLogEntry(TEST_LOG_DIR, batchId, preflightEntry);

    // Then pipeline events come after
    const pipelineEntry: LogEntry = {
      timestamp: '2026-02-25T10:00:01Z',
      level: 'info',
      type: 'pipeline_started',
      message: 'Pipeline started',
    };
    writeLogEntry(TEST_LOG_DIR, batchId, pipelineEntry);

    const { logs } = readLogs(TEST_LOG_DIR, batchId);
    expect(logs).toHaveLength(2);
    // Preflight comes FIRST
    expect(logs[0].type).toBe('preflight');
    expect(logs[1].type).toBe('pipeline_started');
  });

  it('should log generate stream events via logGen wrapper', () => {
    const batchId = 'B-gen';
    const { logGen } = createLogGen(TEST_LOG_DIR, batchId);

    logGen({ type: 'codegen_started', batch: batchId, total: 3 });
    logGen({ type: 'codegen_program', programId: 117, message: 'Generated IDE 117', written: 5, skipped: 0 });
    logGen({ type: 'codegen_completed', batch: batchId, processed: 3 });

    const { logs } = readLogs(TEST_LOG_DIR, batchId);
    expect(logs).toHaveLength(3);
    expect(logs[0].type).toBe('codegen_started');
    expect(logs[1].programId).toBe(117);
    expect(logs[2].type).toBe('codegen_completed');
  });

  it('should capture phase field in migrate stream log entries via bufferedSend', () => {
    const batchId = 'B-migrate';
    const { bufferedSend } = createBufferedSend(TEST_LOG_DIR, batchId);

    bufferedSend({
      type: 'migrate_phase',
      programId: 117,
      phase: 'scaffold',
      message: 'Scaffold phase started',
      timestamp: '2026-02-25T10:00:00Z',
    });

    const { logs } = readLogs(TEST_LOG_DIR, batchId);
    expect(logs).toHaveLength(1);
    expect(logs[0].type).toBe('migrate_phase');
    expect(logs[0].phase).toBe('scaffold');
    expect(logs[0].programId).toBe(117);
  });

  it('should log error events during pipeline with level=error', () => {
    const batchId = 'B-errors';

    const events = [
      { type: 'program_started', programId: 117, message: 'Starting' },
      { type: 'error', message: 'Claude API timeout' },
      { type: 'error', programId: 117, message: 'Program 117 failed: timeout' },
    ];

    for (const event of events) {
      writeLogEntry(TEST_LOG_DIR, batchId, eventToLogEntry(event));
    }

    const { logs } = readLogs(TEST_LOG_DIR, batchId, { level: 'error' });
    expect(logs).toHaveLength(2);
    expect(logs.every(l => l.level === 'error')).toBe(true);
  });
});
