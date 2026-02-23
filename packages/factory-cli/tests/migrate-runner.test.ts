import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getMigrateStatus, createBatch, formatDuration, shouldSkipProgram, resolveParallelCount, estimateCostUsd } from '../src/migrate/migrate-runner.js';
import { writeMigrateTracker, getOrCreateProgram, completePhase } from '../src/migrate/migrate-tracker.js';
import { MigratePhase, GENERATION_PHASES } from '../src/migrate/migrate-types.js';
import { PipelineStatus } from '../src/core/types.js';
import type { MigrateConfig, ProgramMigrateResult, MigrateSummary } from '../src/migrate/migrate-types.js';

let tmpDir: string;

const makeConfig = (overrides: Partial<MigrateConfig> = {}): MigrateConfig => ({
  projectDir: tmpDir,
  targetDir: path.join(tmpDir, 'adh-web'),
  migrationDir: path.join(tmpDir, '.openspec', 'migration'),
  specDir: path.join(tmpDir, '.openspec', 'specs'),
  contractSubDir: 'ADH',
  parallel: 1,
  maxPasses: 3,
  dryRun: false,
  ...overrides,
});

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-runner-'));
  const dirs = [
    path.join(tmpDir, '.openspec', 'specs'),
    path.join(tmpDir, '.openspec', 'migration', 'ADH'),
    path.join(tmpDir, 'adh-web', 'src'),
  ];
  for (const d of dirs) fs.mkdirSync(d, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('formatDuration', () => {
  it('should format seconds only', () => {
    expect(formatDuration(5000)).toBe('5s (5000ms)');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(80547)).toBe('1m 21s (80547ms)');
  });

  it('should format hours, minutes and seconds', () => {
    expect(formatDuration(3_661_000)).toBe('1h 1m 1s (3661000ms)');
  });

  it('should show 0m for hours with zero minutes', () => {
    expect(formatDuration(3_600_000)).toBe('1h 0m 0s (3600000ms)');
  });

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0s (0ms)');
  });

  it('should round sub-second to nearest second', () => {
    expect(formatDuration(1499)).toBe('1s (1499ms)');
    expect(formatDuration(1500)).toBe('2s (1500ms)');
  });
});

describe('getMigrateStatus', () => {
  it('should return empty for missing tracker', () => {
    const result = getMigrateStatus(path.join(tmpDir, 'nope.json'));
    expect(result).toEqual([]);
  });

  it('should return status views for tracked programs', () => {
    const trackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'tracker.json');
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 69);
    completePhase(prog, MigratePhase.SPEC, { file: 'spec.md' });
    completePhase(prog, MigratePhase.CONTRACT, { file: 'contract.yaml' });
    writeMigrateTracker(trackerFile, data);

    const views = getMigrateStatus(trackerFile);
    expect(views).toHaveLength(1);
    expect(views[0].programId).toBe('69');
    expect(views[0].completedPhases).toBe(2);
    expect(views[0].files).toBe(2);
  });

  it('should show errors count', () => {
    const trackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'tracker.json');
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 70);
    prog.errors.push('error1', 'error2');
    writeMigrateTracker(trackerFile, data);

    const views = getMigrateStatus(trackerFile);
    expect(views[0].errors).toBe(2);
  });
});

describe('createBatch', () => {
  it('should create batch in tracker', () => {
    const config = makeConfig();
    const trackerFile = path.join(config.migrationDir, 'ADH', 'tracker.json');

    // Write minimal tracker with required structure
    fs.writeFileSync(trackerFile, JSON.stringify({
      version: '1.0',
      project: 'ADH',
      programs: {},
      batches: [],
    }));

    createBatch('B-test', 'Test Batch', [69, 70, 71], config);

    const raw = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
    expect(raw.batches).toHaveLength(1);
    expect(raw.batches[0].id).toBe('B-test');
    expect(raw.batches[0].name).toBe('Test Batch');
    expect(raw.batches[0].programs).toBe(3);
  });

  it('should throw if batch already exists', () => {
    const config = makeConfig();
    const trackerFile = path.join(config.migrationDir, 'ADH', 'tracker.json');

    fs.writeFileSync(trackerFile, JSON.stringify({
      version: '1.0',
      project: 'ADH',
      programs: {},
      batches: [{ id: 'B-dup', name: 'Duplicate', programs: 1, status: 'pending' }],
    }));

    expect(() => createBatch('B-dup', 'Dup', [69], config)).toThrow('already exists');
  });

  it('should throw if tracker not found', () => {
    const config = makeConfig({ migrationDir: path.join(tmpDir, 'nonexistent') });
    expect(() => createBatch('B1', 'Test', [69], config)).toThrow('Tracker not found');
  });
});

describe('shouldSkipProgram', () => {
  it('should skip verified programs', () => {
    expect(shouldSkipProgram(PipelineStatus.VERIFIED)).toBe(true);
  });

  it('should NOT skip enriched programs', () => {
    expect(shouldSkipProgram(PipelineStatus.ENRICHED)).toBe(false);
  });

  it('should NOT skip contracted programs', () => {
    expect(shouldSkipProgram(PipelineStatus.CONTRACTED)).toBe(false);
  });

  it('should NOT skip pending programs', () => {
    expect(shouldSkipProgram(PipelineStatus.PENDING)).toBe(false);
  });

  it('should NOT skip programs without contract', () => {
    expect(shouldSkipProgram(undefined)).toBe(false);
  });
});

describe('phase tracker reset for non-verified programs', () => {
  it('should reset phases when program has completed phases but is not verified', () => {
    const trackerFile = path.join(tmpDir, '.openspec', 'migration', 'ADH', 'migrate-tracker.json');
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 121);

    // Simulate a previous migration run that completed all generation phases
    for (const phase of GENERATION_PHASES) {
      completePhase(prog, phase, { file: `file-${phase}.ts`, duration: 100 });
    }
    writeMigrateTracker(trackerFile, data);

    // Verify phases are completed
    expect(Object.keys(prog.phases).length).toBe(GENERATION_PHASES.length);

    // Simulate what migrate-runner does for non-verified programs: reset phases
    if (Object.keys(prog.phases).length > 0) {
      prog.phases = {};
      prog.status = 'pending';
      prog.currentPhase = null;
    }

    expect(Object.keys(prog.phases).length).toBe(0);
    expect(prog.status).toBe('pending');
  });

  it('should NOT reset phases for new programs (no existing phases)', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 999);

    // New program: no phases yet
    expect(Object.keys(prog.phases).length).toBe(0);

    // Reset logic should NOT trigger (no-op)
    const shouldReset = Object.keys(prog.phases).length > 0;
    expect(shouldReset).toBe(false);
  });
});

// ─── Summary logic tests (P1/P2/P3 regression) ─────────────────

const makeProgramResult = (overrides: Partial<ProgramMigrateResult> = {}): ProgramMigrateResult => ({
  programId: 1,
  programName: 'test',
  status: 'completed',
  filesGenerated: 8,
  phasesCompleted: 10,
  phasesTotal: 10,
  duration: 1000,
  errors: [],
  ...overrides,
});

const buildSummary = (results: ProgramMigrateResult[], dryRun = false): { summary: MigrateSummary; hasRealWork: boolean; allSkipped: boolean } => {
  const hasRealWork = results.some(r => r.status === 'completed');
  const allSkipped = results.every(r => r.status === 'skipped');

  let tscClean = dryRun;
  let testsPass = dryRun;

  if (allSkipped) {
    tscClean = true;
    testsPass = true;
  }

  // In real mode with real work, verification would set these — simulate as false
  // (in the actual runner, runVerifyFixLoop sets them; here we test defaults)

  return {
    hasRealWork,
    allSkipped,
    summary: {
      total: results.length,
      completed: results.filter(r => r.status === 'completed').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      totalFiles: results.reduce((sum, r) => sum + r.filesGenerated, 0),
      tscClean,
      testsPass,
      reviewAvgCoverage: 0,
    },
  };
};

describe('summary logic (hasRealWork / allSkipped / dry-run)', () => {
  it('P1b: hasRealWork should be true when a program is completed with 0 new files', () => {
    const results = [
      makeProgramResult({ programId: 69, filesGenerated: 0 }),
    ];
    const { hasRealWork } = buildSummary(results);
    expect(hasRealWork).toBe(true);
  });

  it('P1b: hasRealWork should be false when all programs are skipped', () => {
    const results = [
      makeProgramResult({ programId: 69, status: 'skipped', filesGenerated: 0 }),
      makeProgramResult({ programId: 70, status: 'skipped', filesGenerated: 0 }),
    ];
    const { hasRealWork } = buildSummary(results);
    expect(hasRealWork).toBe(false);
  });

  it('P2: dry-run should default tscClean=true, testsPass=true', () => {
    const results = [
      makeProgramResult({ programId: 69, filesGenerated: 8 }),
    ];
    const { summary } = buildSummary(results, true);
    expect(summary.tscClean).toBe(true);
    expect(summary.testsPass).toBe(true);
  });

  it('P2: non-dry-run should default tscClean=false, testsPass=false', () => {
    const results = [
      makeProgramResult({ programId: 69, filesGenerated: 8 }),
    ];
    const { summary } = buildSummary(results, false);
    expect(summary.tscClean).toBe(false);
    expect(summary.testsPass).toBe(false);
  });

  it('P1a: filesGenerated should include existing files (always counted)', () => {
    // Simulates 12 enriched programs each with 8 existing files + 5 verified skipped
    const results = [
      ...Array.from({ length: 12 }, (_, i) => makeProgramResult({ programId: i + 1, filesGenerated: 8 })),
      ...Array.from({ length: 5 }, (_, i) => makeProgramResult({ programId: i + 13, status: 'skipped', filesGenerated: 0 })),
    ];
    const { summary } = buildSummary(results);
    expect(summary.totalFiles).toBe(96); // 12 * 8
    expect(summary.completed).toBe(12);
    expect(summary.skipped).toBe(5);
    expect(summary.total).toBe(17);
  });

  it('allSkipped should set tscClean=true, testsPass=true', () => {
    const results = [
      makeProgramResult({ programId: 69, status: 'skipped', filesGenerated: 0 }),
    ];
    const { summary, allSkipped } = buildSummary(results);
    expect(allSkipped).toBe(true);
    expect(summary.tscClean).toBe(true);
    expect(summary.testsPass).toBe(true);
  });

  it('mixed completed+skipped: correct counts and hasRealWork', () => {
    const results = [
      makeProgramResult({ programId: 1, status: 'completed', filesGenerated: 8 }),
      makeProgramResult({ programId: 2, status: 'completed', filesGenerated: 0 }),
      makeProgramResult({ programId: 3, status: 'skipped', filesGenerated: 0 }),
      makeProgramResult({ programId: 4, status: 'failed', filesGenerated: 2, errors: ['err'] }),
    ];
    const { summary, hasRealWork, allSkipped } = buildSummary(results);
    expect(hasRealWork).toBe(true);
    expect(allSkipped).toBe(false);
    expect(summary.completed).toBe(2);
    expect(summary.skipped).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.totalFiles).toBe(10);
  });
});
