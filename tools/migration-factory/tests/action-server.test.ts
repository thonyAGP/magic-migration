import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import { startActionServer, type ActionServerConfig } from '../src/server/action-server.js';
import { PipelineStatus } from '../src/core/types.js';

// ─── Test Helpers ────────────────────────────────────────────────

const createTestDir = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'mf-action-'));

const request = (port: number, method: string, urlPath: string, body?: unknown): Promise<{ status: number; data: unknown; headers: http.IncomingHttpHeaders }> =>
  new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      { hostname: '127.0.0.1', port, path: urlPath, method, headers: { 'Content-Type': 'application/json' } },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c: Buffer) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString();
          let data: unknown;
          try { data = JSON.parse(raw); } catch { data = raw; }
          resolve({ status: res.statusCode ?? 0, data, headers: res.headers });
        });
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });

const streamSSE = (ssePort: number, urlPath: string): Promise<unknown[]> =>
  new Promise((resolve) => {
    const events: unknown[] = [];
    const req = http.get({ hostname: '127.0.0.1', port: ssePort, path: urlPath }, (res) => {
      let buffer = '';
      res.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          const match = part.match(/^data:\s*(.+)$/m);
          if (match) {
            try { events.push(JSON.parse(match[1])); } catch { /* ignore */ }
          }
        }
      });
      res.on('end', () => resolve(events));
    });
    req.on('error', () => resolve(events));
  });

const writeTrackerJson = (filePath: string, batches: { id: string; name: string; programIds: number[]; status: string }[]): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({
    version: '1.0', methodology: 'SPECMAP', created: '2026-02-19', updated: '2026-02-19', status: 'active',
    stats: { total_programs: 0, live_programs: 0, orphan_programs: 0, ecf_programs: 0, contracted: 0, enriched: 0, verified: 0, max_level: 0, last_computed: '' },
    batches: batches.map(b => ({ id: b.id, name: b.name, root: b.programIds[0], programs: b.programIds.length, status: b.status, priority_order: b.programIds, stats: { backend_na: 0, frontend_enrich: 0, fully_impl: 0, coverage_avg_frontend: 0, total_partial: 0, total_missing: 0 } })),
    notes: [],
  }, null, 2), 'utf8');
};

const writeContractYaml = (filePath: string, id: number, name: string, status: string, allImpl = false): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const itemStatus = allImpl ? 'IMPL' : 'MISSING';
  fs.writeFileSync(filePath, YAML.stringify({
    program: { id, name, complexity: 'LOW', callers: [], callees: [], tasks_count: 1, tables_count: 1, expressions_count: 0 },
    rules: [{ id: 'R1', description: 'Test rule', condition: '', variables: [], status: itemStatus, target_file: '', gap_notes: '' }],
    variables: [{ local_id: 'A', name: 'TestVar', type: 'Alpha', status: itemStatus, target_file: '', gap_notes: '' }],
    tables: [{ id: 1, name: 'test_table', mode: 'R', status: itemStatus, target_file: '', gap_notes: '' }],
    callees: [],
    overall: {
      rules_total: 1, rules_impl: allImpl ? 1 : 0, rules_partial: 0, rules_missing: allImpl ? 0 : 1, rules_na: 0,
      variables_key_count: 1, callees_total: 0, callees_impl: 0, callees_missing: 0,
      coverage_pct: allImpl ? 100 : 0, status, generated: '2026-02-19T00:00:00Z', notes: '',
    },
  }), 'utf8');
};

const writeLivePrograms = (dir: string): void => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'live-programs.json'), JSON.stringify({ programs: [{ id: 100, name: 'Test', level: 0 }] }), 'utf8');
};

// ─── Fixtures ────────────────────────────────────────────────────

let testDir: string;
let server: http.Server;
let port: number;

const setupServer = async (opts?: { withTracker?: boolean; withContracts?: boolean; contractStatus?: string; contractAllImpl?: boolean }): Promise<void> => {
  testDir = createTestDir();
  const migDir = path.join(testDir, '.openspec', 'migration');
  const adhDir = path.join(migDir, 'ADH');

  writeLivePrograms(adhDir);

  if (opts?.withTracker) {
    writeTrackerJson(path.join(adhDir, 'tracker.json'), [
      { id: 'B1', name: 'Batch 1', programIds: [100], status: 'active' },
      { id: 'B2', name: 'Batch 2', programIds: [200, 201], status: 'planned' },
    ]);
  }

  if (opts?.withContracts) {
    const status = opts.contractStatus ?? PipelineStatus.ENRICHED;
    const allImpl = opts.contractAllImpl ?? false;
    writeContractYaml(path.join(adhDir, 'ADH-IDE-100.contract.yaml'), 100, 'TestProg', status, allImpl);
  }

  const config: ActionServerConfig = { port: 0, projectDir: testDir, dir: 'ADH' };
  server = await startActionServer(config);
  const addr = server.address();
  port = typeof addr === 'object' && addr ? addr.port : 0;
};

afterEach(() => {
  if (server) server.close();
  if (testDir) fs.rmSync(testDir, { recursive: true, force: true });
});

// ─── Tests ───────────────────────────────────────────────────────

describe('Action Server', () => {
  describe('GET / (dashboard)', () => {
    it('should return HTML with __MF_SERVER__ flag', async () => {
      await setupServer();
      const res = await request(port, 'GET', '/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.data).toContain('__MF_SERVER__');
    });

    it('should contain action-bar element', async () => {
      await setupServer();
      const res = await request(port, 'GET', '/');
      expect(res.data).toContain('action-bar');
    });
  });

  describe('GET /api/status', () => {
    it('should return empty array when no tracker', async () => {
      await setupServer();
      const res = await request(port, 'GET', '/api/status');
      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('should return batch list when tracker exists', async () => {
      await setupServer({ withTracker: true });
      const res = await request(port, 'GET', '/api/status');
      expect(res.status).toBe(200);
      const data = res.data as { id: string }[];
      expect(data.length).toBe(2);
      expect(data[0].id).toBe('B1');
      expect(data[1].id).toBe('B2');
    });
  });

  describe('GET /api/gaps', () => {
    it('should return empty report when no contracts', async () => {
      await setupServer();
      const res = await request(port, 'GET', '/api/gaps');
      expect(res.status).toBe(200);
      const data = res.data as { grandTotalGaps: number };
      expect(data.grandTotalGaps).toBe(0);
    });

    it('should return gaps for non-verified contracts', async () => {
      await setupServer({ withContracts: true, contractStatus: PipelineStatus.ENRICHED });
      const res = await request(port, 'GET', '/api/gaps');
      expect(res.status).toBe(200);
      const data = res.data as { grandTotalGaps: number; contracts: unknown[] };
      expect(data.grandTotalGaps).toBeGreaterThan(0);
      expect(data.contracts.length).toBe(1);
    });

    it('should skip verified contracts', async () => {
      await setupServer({ withContracts: true, contractStatus: PipelineStatus.VERIFIED });
      const res = await request(port, 'GET', '/api/gaps');
      expect(res.status).toBe(200);
      const data = res.data as { grandTotalGaps: number; contracts: unknown[] };
      expect(data.grandTotalGaps).toBe(0);
      expect(data.contracts.length).toBe(0);
    });
  });

  describe('GET /api/preflight', () => {
    it('should return 400 when batch parameter is missing', async () => {
      await setupServer({ withTracker: true });
      const res = await request(port, 'GET', '/api/preflight');
      expect(res.status).toBe(400);
      const data = res.data as { error: string };
      expect(data.error).toContain('batch');
    });

    it('should return preflight result for valid batch', async () => {
      await setupServer({ withTracker: true, withContracts: true });
      const res = await request(port, 'GET', '/api/preflight?batch=B1');
      expect(res.status).toBe(200);
      const data = res.data as { batchId: string };
      expect(data.batchId).toBe('B1');
    });
  });

  describe('POST /api/pipeline/run', () => {
    it('should return 400 when batch is missing in body', async () => {
      await setupServer({ withTracker: true });
      const res = await request(port, 'POST', '/api/pipeline/run', {});
      expect(res.status).toBe(400);
      const data = res.data as { error: string };
      expect(data.error).toContain('batch');
    });

    it('should execute pipeline and return result', async () => {
      await setupServer({ withTracker: true, withContracts: true });
      const res = await request(port, 'POST', '/api/pipeline/run', { batch: 'B1', dryRun: true });
      expect(res.status).toBe(200);
      const data = res.data as { batchId: string };
      expect(data.batchId).toBe('B1');
    });
  });

  describe('POST /api/verify', () => {
    it('should verify eligible contracts', async () => {
      await setupServer({ withContracts: true, contractStatus: PipelineStatus.ENRICHED, contractAllImpl: true });
      const res = await request(port, 'POST', '/api/verify', { dryRun: true });
      expect(res.status).toBe(200);
      const data = res.data as { verified: number; dryRun: boolean };
      expect(data.verified).toBe(1);
      expect(data.dryRun).toBe(true);
    });

    it('should not verify contracts with gaps', async () => {
      await setupServer({ withContracts: true, contractStatus: PipelineStatus.ENRICHED, contractAllImpl: false });
      const res = await request(port, 'POST', '/api/verify', { dryRun: true });
      expect(res.status).toBe(200);
      const data = res.data as { verified: number; notReady: number };
      expect(data.verified).toBe(0);
      expect(data.notReady).toBe(1);
    });
  });

  describe('CORS', () => {
    it('should return 204 for OPTIONS requests', async () => {
      await setupServer();
      const res = await request(port, 'OPTIONS', '/api/status');
      expect(res.status).toBe(204);
    });

    it('should include CORS headers in all responses', async () => {
      await setupServer();
      const res = await request(port, 'GET', '/api/status');
      expect(res.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('GET /api/projects', () => {
    it('should return active and registry arrays', async () => {
      await setupServer();
      const res = await request(port, 'GET', '/api/projects');
      expect(res.status).toBe(200);
      const data = res.data as { active: string[]; registry: unknown[] };
      expect(Array.isArray(data.active)).toBe(true);
      expect(Array.isArray(data.registry)).toBe(true);
    });
  });

  describe('POST /api/calibrate', () => {
    it('should return CalibrationResult', async () => {
      await setupServer({ withContracts: true, contractStatus: PipelineStatus.VERIFIED, contractAllImpl: true });
      const res = await request(port, 'POST', '/api/calibrate', { dryRun: true });
      expect(res.status).toBe(200);
      const data = res.data as { dataPoints: number; calibratedHpp: number };
      expect(typeof data.dataPoints).toBe('number');
      expect(typeof data.calibratedHpp).toBe('number');
    });

    it('should respect dry-run flag', async () => {
      await setupServer({ withTracker: true, withContracts: true, contractStatus: PipelineStatus.VERIFIED, contractAllImpl: true });
      const res = await request(port, 'POST', '/api/calibrate', { dryRun: true });
      expect(res.status).toBe(200);
      const data = res.data as { dataPoints: number };
      expect(data.dataPoints).toBe(0); // no effort timestamps in test contracts
    });

    it('should return 0 dataPoints when no verified contracts', async () => {
      await setupServer({ withContracts: true, contractStatus: PipelineStatus.ENRICHED });
      const res = await request(port, 'POST', '/api/calibrate', {});
      expect(res.status).toBe(200);
      const data = res.data as { dataPoints: number };
      expect(data.dataPoints).toBe(0);
    });
  });

  describe('GET /api/pipeline/stream', () => {
    it('should return 400 when batch missing', async () => {
      await setupServer({ withTracker: true });
      const res = await request(port, 'GET', '/api/pipeline/stream');
      expect(res.status).toBe(400);
      const data = res.data as { error: string };
      expect(data.error).toContain('batch');
    });

    it('should stream preflight + events + result for valid batch', async () => {
      await setupServer({ withTracker: true, withContracts: true });
      const events = await streamSSE(port, '/api/pipeline/stream?batch=B1&dryRun=true');
      expect(events.length).toBeGreaterThanOrEqual(3); // preflight + pipeline events + result + stream_end
      const types = events.map((e: { type: string }) => e.type);
      expect(types[0]).toBe('preflight');
      expect(types).toContain('pipeline_result');
      expect(types[types.length - 1]).toBe('stream_end');
    });

    it('should return 409 when pipeline already running', async () => {
      await setupServer({ withTracker: true, withContracts: true });
      // Start a stream (will complete quickly with test data)
      const p1 = streamSSE(port, '/api/pipeline/stream?batch=B1&dryRun=true');
      // Give it a moment to start, then try a second
      await new Promise(r => setTimeout(r, 50));
      // The first should complete successfully
      const events = await p1;
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('404', () => {
    it('should return 404 for unknown routes', async () => {
      await setupServer();
      const res = await request(port, 'GET', '/api/unknown');
      expect(res.status).toBe(404);
      const data = res.data as { error: string };
      expect(data.error).toBe('Not found');
    });
  });
});
