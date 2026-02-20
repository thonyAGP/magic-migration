import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getMigrateStatus, createBatch } from '../src/migrate/migrate-runner.js';
import { writeMigrateTracker, getOrCreateProgram, completePhase } from '../src/migrate/migrate-tracker.js';
import { MigratePhase } from '../src/migrate/migrate-types.js';
import type { MigrateConfig } from '../src/migrate/migrate-types.js';

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
