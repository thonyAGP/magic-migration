/**
 * Tests for API endpoint handlers: tokens and logs.
 * Tests handleTokensGet, handleTokensBatchGet, handleTokensProgramGet,
 * handleLogsGet, handleLogsSearchGet, handleLogsLatestGet.
 *
 * Uses direct handler calls with mocked ServerResponse.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { ServerResponse } from 'node:http';
import {
  handleTokensGet,
  handleTokensBatchGet,
  handleTokensProgramGet,
  handleLogsGet,
  handleLogsSearchGet,
  handleLogsLatestGet,
} from '../src/server/api-routes.js';
import { updateTokens, updateBatchTokens } from '../src/server/token-tracker.js';
import { writeLogEntry } from '../src/server/log-storage.js';

// Minimal test project structure matching resolveConfig expectations
const TEST_BASE = path.join(os.tmpdir(), 'factory-cli-tests', 'api-tokens-logs');
const PROJECT_DIR = path.join(TEST_BASE, 'project');
const MIG_DIR = path.join(PROJECT_DIR, '.openspec', 'migration');
const CONTRACT_SUB = 'TST';
const FULL_MIG_DIR = path.join(MIG_DIR, CONTRACT_SUB);
const LOG_DIR = path.join(FULL_MIG_DIR, 'logs');

/** Create a mock ServerResponse that captures the JSON output. */
const createMockRes = (): { res: ServerResponse; getResult: () => { status: number; body: unknown } } => {
  let status = 200;
  let body = '';
  const res = {
    writeHead(s: number) { status = s; },
    end(data: string) { body = data; },
  } as unknown as ServerResponse;
  return {
    res,
    getResult: () => ({ status, body: JSON.parse(body as string) }),
  };
};

/** Create RouteContext pointing to test migration dir. */
const makeCtx = () => ({
  projectDir: PROJECT_DIR,
  dir: CONTRACT_SUB,
});

describe('API Tokens & Logs Endpoints', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_BASE)) {
      fs.rmSync(TEST_BASE, { recursive: true, force: true });
    }
    fs.mkdirSync(FULL_MIG_DIR, { recursive: true });
    fs.mkdirSync(LOG_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_BASE)) {
      fs.rmSync(TEST_BASE, { recursive: true, force: true });
    }
  });

  // ─── Token Endpoints ──────────────────────────────────────────────

  it('should return default shape when no tokens.json exists (GET /api/tokens)', () => {
    const { res, getResult } = createMockRes();
    const query = new URLSearchParams();

    handleTokensGet(makeCtx(), query, res);

    const { status, body } = getResult();
    expect(status).toBe(200);
    expect(body).toMatchObject({
      global: { input: 0, output: 0, costUsd: 0, totalCalls: 0 },
      batches: {},
      programs: {},
    });
  });

  it('should return populated data after updateTokens (GET /api/tokens)', () => {
    updateTokens(FULL_MIG_DIR, 117, 'types', { input: 1000, output: 500 });

    const { res, getResult } = createMockRes();
    handleTokensGet(makeCtx(), new URLSearchParams(), res);

    const { body } = getResult();
    expect(body.global.input).toBe(1000);
    expect(body.global.output).toBe(500);
    expect(body.global.totalCalls).toBe(1);
    expect(body.programs['117']).toMatchObject({ input: 1000, output: 500 });
  });

  it('should return default for unknown batch (GET /api/tokens/batch)', () => {
    const { res, getResult } = createMockRes();
    handleTokensBatchGet(makeCtx(), new URLSearchParams('batch=UNKNOWN'), res);

    const { body } = getResult();
    expect(body).toMatchObject({ input: 0, output: 0, costUsd: 0, perPhase: {} });
  });

  it('should return default for unknown program (GET /api/tokens/program)', () => {
    const { res, getResult } = createMockRes();
    handleTokensProgramGet(makeCtx(), new URLSearchParams('program=999'), res);

    const { body } = getResult();
    expect(body).toMatchObject({ input: 0, output: 0, costUsd: 0 });
  });

  // ─── Log Endpoints ────────────────────────────────────────────────

  it('should return paginated logs with total count (GET /api/logs)', () => {
    for (let i = 0; i < 10; i++) {
      writeLogEntry(LOG_DIR, 'B2', {
        timestamp: `2026-02-25T10:00:${i.toString().padStart(2, '0')}Z`,
        level: 'info',
        type: 'event',
        message: `Event ${i}`,
      });
    }

    const { res, getResult } = createMockRes();
    handleLogsGet(makeCtx(), new URLSearchParams('batch=B2&offset=0&limit=5'), res);

    const { body } = getResult();
    expect(body.total).toBe(10);
    expect(body.logs).toHaveLength(5);
    expect(body.logs[0].message).toBe('Event 0');
  });

  it('should filter logs by level=error (GET /api/logs)', () => {
    writeLogEntry(LOG_DIR, 'B2', { timestamp: '2026-02-25T10:00:00Z', level: 'info', type: 'i', message: 'Info' });
    writeLogEntry(LOG_DIR, 'B2', { timestamp: '2026-02-25T10:01:00Z', level: 'error', type: 'e', message: 'Error' });
    writeLogEntry(LOG_DIR, 'B2', { timestamp: '2026-02-25T10:02:00Z', level: 'warn', type: 'w', message: 'Warn' });

    const { res, getResult } = createMockRes();
    handleLogsGet(makeCtx(), new URLSearchParams('batch=B2&level=error'), res);

    const { body } = getResult();
    expect(body.total).toBe(1);
    expect(body.logs).toHaveLength(1);
    expect(body.logs[0].level).toBe('error');
  });

  it('should return most recent first (GET /api/logs/latest)', () => {
    for (let i = 0; i < 5; i++) {
      writeLogEntry(LOG_DIR, 'B2', {
        timestamp: `2026-02-25T10:00:0${i}Z`,
        level: 'info',
        type: 'event',
        message: `Msg ${i}`,
      });
    }

    const { res, getResult } = createMockRes();
    handleLogsLatestGet(makeCtx(), new URLSearchParams('batch=B2&count=3'), res);

    const { body } = getResult();
    expect(body).toHaveLength(3);
    expect(body[0].message).toBe('Msg 4');
    expect(body[2].message).toBe('Msg 2');
  });

  it('should limit results with count param (GET /api/logs/latest)', () => {
    for (let i = 0; i < 20; i++) {
      writeLogEntry(LOG_DIR, 'B2', {
        timestamp: `2026-02-25T10:00:${i.toString().padStart(2, '0')}Z`,
        level: 'info',
        type: 'event',
        message: `Event ${i}`,
      });
    }

    const { res, getResult } = createMockRes();
    handleLogsLatestGet(makeCtx(), new URLSearchParams('batch=B2&count=5'), res);

    const { body } = getResult();
    expect(body).toHaveLength(5);
  });

  it('should return matching entries (GET /api/logs/search)', () => {
    writeLogEntry(LOG_DIR, 'B2', { timestamp: '2026-02-25T10:00:00Z', level: 'info', type: 'start', programId: 117, message: 'Starting IDE 117' });
    writeLogEntry(LOG_DIR, 'B2', { timestamp: '2026-02-25T10:01:00Z', level: 'info', type: 'start', programId: 125, message: 'Starting IDE 125' });
    writeLogEntry(LOG_DIR, 'B2', { timestamp: '2026-02-25T10:02:00Z', level: 'error', type: 'fail', programId: 117, message: 'IDE 117 failed' });

    const { res, getResult } = createMockRes();
    handleLogsSearchGet(makeCtx(), new URLSearchParams('batch=B2&q=117'), res);

    const { body } = getResult();
    expect(body).toHaveLength(2);
  });

  it('should return empty for non-existent batch (GET /api/logs)', () => {
    const { res, getResult } = createMockRes();
    handleLogsGet(makeCtx(), new URLSearchParams('batch=NONEXISTENT'), res);

    const { body } = getResult();
    expect(body.total).toBe(0);
    expect(body.logs).toEqual([]);
  });
});
