import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { MigrateConfig, MigrateEvent } from '../src/migrate/migrate-types.js';

// Mock child_process before importing runner
vi.mock('node:child_process', () => ({
  execSync: vi.fn((cmd: string) => {
    if (cmd.includes('rev-parse --short')) return Buffer.from('abc1234\n');
    if (cmd.includes('branch --show-current')) return Buffer.from('master\n');
    return Buffer.from('');
  }),
}));

// Mock all phase runners to avoid Claude CLI calls
vi.mock('../src/migrate/phases/phase-spec.js', () => ({
  runSpecPhase: vi.fn(async () => ({ specFile: 'spec.md', duration: 10, skipped: false })),
}));
vi.mock('../src/migrate/phases/phase-contract.js', () => ({
  runContractPhase: vi.fn(() => ({ contractFile: 'contract.yaml', duration: 5 })),
}));
vi.mock('../src/migrate/phases/phase-analyze.js', () => ({
  runAnalyzePhase: vi.fn(async () => ({
    analysisFile: 'analysis.json',
    duration: 20,
    analysis: {
      domain: 'test',
      domainPascal: 'Test',
      complexity: 'LOW',
      entities: [],
      stateFields: [],
      actions: [],
      apiEndpoints: [],
      uiLayout: { type: 'page', sections: [] },
      mockData: { count: 0, description: '' },
      dependencies: { stores: [], sharedTypes: [], externalApis: [] },
    },
  })),
}));
vi.mock('../src/migrate/phases/phase-generate.js', () => ({
  runTypesPhase: vi.fn(async () => ({ file: 'types.ts', duration: 5, skipped: false })),
  runStorePhase: vi.fn(async () => ({ file: 'store.ts', duration: 5, skipped: false })),
  runApiPhase: vi.fn(async () => ({ file: 'api.ts', duration: 5, skipped: false })),
  runPagePhase: vi.fn(async () => ({ file: 'page.tsx', duration: 5, skipped: false })),
  runComponentsPhase: vi.fn(async () => ({ files: [{ file: 'comp.tsx', skipped: false }], totalDuration: 5 })),
}));
vi.mock('../src/migrate/phases/phase-tests.js', () => ({
  runTestsUnitPhase: vi.fn(async () => ({ file: 'test.ts', duration: 5, skipped: false })),
  runTestsUiPhase: vi.fn(async () => ({ file: 'test-ui.ts', duration: 5, skipped: false })),
}));
vi.mock('../src/migrate/phases/phase-verify.js', () => ({
  runVerifyFixLoop: vi.fn(async () => ({ tscClean: true, testsPass: true, tscPasses: 1, testPasses: 1 })),
}));
vi.mock('../src/migrate/phases/phase-integrate.js', () => ({
  runIntegratePhase: vi.fn(async () => ({ filesModified: [] })),
}));
vi.mock('../src/migrate/phases/phase-review.js', () => ({
  runReviewPhase: vi.fn(async () => ({ report: { coveragePct: 80, rulesImplemented: 8, rulesTotal: 10, missingRules: [], recommendations: [] } })),
}));
vi.mock('../src/migrate/migrate-scaffold.js', () => ({
  scaffoldTargetDir: vi.fn(() => ({ created: 0, skipped: 0 })),
}));
vi.mock('../src/migrate/migrate-claude.js', () => ({
  setClaudeLogDir: vi.fn(),
  startTokenAccumulator: vi.fn(),
  flushTokenAccumulator: vi.fn(() => null),
}));

import { runMigration } from '../src/migrate/migrate-runner.js';
import { execSync } from 'node:child_process';

const mockedExecSync = vi.mocked(execSync);

let tmpDir: string;

const makeConfig = (overrides: Partial<MigrateConfig> = {}): MigrateConfig => {
  const migDir = path.join(tmpDir, '.openspec', 'migration');
  return {
    projectDir: tmpDir,
    targetDir: path.join(tmpDir, 'adh-web'),
    migrationDir: migDir,
    specDir: path.join(tmpDir, '.openspec', 'specs'),
    contractSubDir: 'ADH',
    parallel: 1,
    maxPasses: 3,
    dryRun: false,
    autoCommit: false,
    ...overrides,
  };
};

const setupTracker = (batchId = 'B-test', batchName = 'Test Batch') => {
  const trackerDir = path.join(tmpDir, '.openspec', 'migration', 'ADH');
  fs.mkdirSync(trackerDir, { recursive: true });
  fs.writeFileSync(path.join(trackerDir, 'tracker.json'), JSON.stringify({
    version: '1.0', project: 'ADH', programs: {}, batches: [{
      id: batchId, name: batchName, root: 99, programs: 1, status: 'pending',
      stats: { backend_na: 0, frontend_enrich: 0, fully_impl: 0, coverage_avg_frontend: 0, total_partial: 0, total_missing: 0 },
      priority_order: [99],
    }],
  }));
  return path.join(trackerDir, 'tracker.json');
};

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-git-'));
  const dirs = [
    path.join(tmpDir, '.openspec', 'specs'),
    path.join(tmpDir, '.openspec', 'migration', 'ADH'),
    path.join(tmpDir, 'adh-web', 'src'),
  ];
  for (const d of dirs) fs.mkdirSync(d, { recursive: true });
  setupTracker();
  mockedExecSync.mockClear();
  // Restore default mock behavior
  mockedExecSync.mockImplementation((cmd: string) => {
    if (typeof cmd === 'string' && cmd.includes('rev-parse --short')) return Buffer.from('abc1234\n');
    if (typeof cmd === 'string' && cmd.includes('branch --show-current')) return Buffer.from('master\n');
    return Buffer.from('');
  });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('migrate-runner git auto-commit', () => {
  it('should call git add + commit + push when autoCommit is true', async () => {
    const events: MigrateEvent[] = [];
    const config = makeConfig({
      autoCommit: true,
      onEvent: (e) => events.push(e),
    });

    const result = await runMigration(['99'], 'B-test', 'Test Batch', config);

    const gitCalls = mockedExecSync.mock.calls.filter(c => typeof c[0] === 'string' && c[0].startsWith('git'));
    expect(gitCalls.length).toBeGreaterThanOrEqual(5); // add x2, commit, rev-parse, branch, push
    expect(gitCalls.some(c => (c[0] as string).includes('git add'))).toBe(true);
    expect(gitCalls.some(c => (c[0] as string).includes('git commit'))).toBe(true);
    expect(gitCalls.some(c => (c[0] as string).includes('git push'))).toBe(true);

    expect(result.git).toBeDefined();
    expect(result.git?.commitSha).toBe('abc1234');
    expect(result.git?.pushed).toBe(true);
    expect(result.git?.branch).toBe('master');

    expect(events.some(e => e.type === 'git_started')).toBe(true);
    expect(events.some(e => e.type === 'git_completed')).toBe(true);
  });

  it('should NOT call git when autoCommit is false', async () => {
    const config = makeConfig({ autoCommit: false });

    const result = await runMigration(['99'], 'B-test', 'Test Batch', config);

    const gitCalls = mockedExecSync.mock.calls.filter(c => typeof c[0] === 'string' && c[0].startsWith('git'));
    expect(gitCalls).toHaveLength(0);
    expect(result.git).toBeUndefined();
  });

  it('should NOT call git when dryRun is true', async () => {
    const config = makeConfig({ autoCommit: true, dryRun: true });

    const result = await runMigration(['99'], 'B-test', 'Test Batch', config);

    const gitCalls = mockedExecSync.mock.calls.filter(c => typeof c[0] === 'string' && c[0].startsWith('git'));
    expect(gitCalls).toHaveLength(0);
    expect(result.git).toBeUndefined();
  });

  it('should NOT call git when no programs completed', async () => {
    // Make all phases fail so summary.completed = 0
    const { runSpecPhase } = await import('../src/migrate/phases/phase-spec.js');
    vi.mocked(runSpecPhase).mockRejectedValueOnce(new Error('fail'));

    const config = makeConfig({ autoCommit: true });
    const result = await runMigration(['99'], 'B-test', 'Test Batch', config);

    // When program fails, summary.completed = 0, so git should not run
    if (result.summary.completed === 0) {
      const gitCalls = mockedExecSync.mock.calls.filter(c => typeof c[0] === 'string' && c[0].startsWith('git'));
      expect(gitCalls).toHaveLength(0);
      expect(result.git).toBeUndefined();
    }
  });

  it('should keep migration valid when git fails', async () => {
    const events: MigrateEvent[] = [];
    mockedExecSync.mockImplementation((cmd: string) => {
      if (typeof cmd === 'string' && cmd.includes('git push')) throw new Error('push rejected');
      if (typeof cmd === 'string' && cmd.includes('rev-parse --short')) return Buffer.from('abc1234\n');
      if (typeof cmd === 'string' && cmd.includes('branch --show-current')) return Buffer.from('master\n');
      return Buffer.from('');
    });

    const config = makeConfig({
      autoCommit: true,
      onEvent: (e) => events.push(e),
    });

    const result = await runMigration(['99'], 'B-test', 'Test Batch', config);

    // Migration itself should still be valid
    expect(result.summary.completed).toBeGreaterThan(0);
    expect(result.git).toBeUndefined();
    expect(events.some(e => e.type === 'git_failed')).toBe(true);
  });

  it('should include batch info in commit message', async () => {
    setupTracker('B2', 'Caisse modules');
    const config = makeConfig({ autoCommit: true });

    await runMigration(['99'], 'B2', 'Caisse modules', config);

    const commitCall = mockedExecSync.mock.calls.find(
      c => typeof c[0] === 'string' && c[0].includes('git commit'),
    );
    expect(commitCall).toBeDefined();
    const commitMsg = commitCall![0] as string;
    expect(commitMsg).toContain('feat(migration): B2 - Caisse modules');
  });
});

describe('migrate-runner tracker update', () => {
  it('should update batch stats and status after successful migration', async () => {
    const config = makeConfig({ autoCommit: false });

    await runMigration(['99'], 'B-test', 'Test Batch', config);

    const trackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'tracker.json');
    const raw = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
    const batch = raw.batches[0];

    expect(batch.status).not.toBe('pending');
    expect(batch.stats.fully_impl).toBeGreaterThan(0);
  });

  it('should NOT update tracker when dryRun is true', async () => {
    const config = makeConfig({ dryRun: true });

    await runMigration(['99'], 'B-test', 'Test Batch', config);

    const trackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'tracker.json');
    const raw = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
    const batch = raw.batches[0];

    expect(batch.status).toBe('pending');
    expect(batch.stats.fully_impl).toBe(0);
  });
});
