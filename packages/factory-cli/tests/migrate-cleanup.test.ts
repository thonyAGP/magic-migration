import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { cleanupBatch, findBatchFiles, resetBatchTracker } from '../src/migrate/migrate-cleanup.js';
import type { CleanupOptions } from '../src/migrate/migrate-cleanup.js';

const createTempDir = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-cleanup-'));
  return dir;
};

describe('migrate-cleanup', () => {
  let tmpDir: string;
  let targetDir: string;
  let migrationDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
    targetDir = path.join(tmpDir, 'target');
    migrationDir = path.join(tmpDir, 'migration');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.mkdirSync(path.join(migrationDir, 'ADH'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const makeTracker = (batchId: string, programs: Record<string, { files: string[] }>) => {
    const tracker = {
      batches: {
        [batchId]: {
          programs: Object.fromEntries(
            Object.entries(programs).map(([id, p]) => [id, {
              status: 'completed',
              currentPhase: null,
              phases: {},
              files: p.files,
              errors: [],
            }]),
          ),
        },
      },
    };
    fs.writeFileSync(
      path.join(migrationDir, 'ADH', 'migration-tracker.json'),
      JSON.stringify(tracker, null, 2),
    );
  };

  const baseOpts: Omit<CleanupOptions, 'batchId' | 'dryRun'> = {
    targetDir: '',
    migrationDir: '',
    contractSubDir: 'ADH',
  };

  it('should find batch files from tracker', () => {
    const file1 = path.join(targetDir, 'src', 'types', 'session.ts');
    const file2 = path.join(targetDir, 'src', 'stores', 'sessionStore.ts');
    fs.mkdirSync(path.dirname(file1), { recursive: true });
    fs.mkdirSync(path.dirname(file2), { recursive: true });
    fs.writeFileSync(file1, 'export type Session = {};');
    fs.writeFileSync(file2, 'export const useSessionStore = {};');

    makeTracker('B2', { '121': { files: [file1, file2] } });

    const files = findBatchFiles({
      ...baseOpts,
      batchId: 'B2',
      targetDir,
      migrationDir,
      dryRun: false,
    });
    expect(files).toHaveLength(2);
  });

  it('should return empty array when tracker missing', () => {
    const files = findBatchFiles({
      ...baseOpts,
      batchId: 'B99',
      targetDir,
      migrationDir,
      dryRun: false,
    });
    expect(files).toEqual([]);
  });

  it('should delete files in non-dry-run mode', () => {
    const file1 = path.join(targetDir, 'src', 'types', 'session.ts');
    fs.mkdirSync(path.dirname(file1), { recursive: true });
    fs.writeFileSync(file1, 'export type Session = {};');

    makeTracker('B2', { '121': { files: [file1] } });

    const result = cleanupBatch({
      ...baseOpts,
      batchId: 'B2',
      targetDir,
      migrationDir,
      dryRun: false,
    });
    expect(result.filesDeleted).toBe(1);
    expect(fs.existsSync(file1)).toBe(false);
  });

  it('should not delete files in dry-run mode', () => {
    const file1 = path.join(targetDir, 'src', 'types', 'session.ts');
    fs.mkdirSync(path.dirname(file1), { recursive: true });
    fs.writeFileSync(file1, 'export type Session = {};');

    makeTracker('B2', { '121': { files: [file1] } });

    const result = cleanupBatch({
      ...baseOpts,
      batchId: 'B2',
      targetDir,
      migrationDir,
      dryRun: true,
    });
    expect(result.dryRun).toBe(true);
    expect(result.files).toHaveLength(1);
    expect(fs.existsSync(file1)).toBe(true);
  });

  it('should reset tracker entries for batch', () => {
    makeTracker('B2', {
      '121': { files: ['src/types/session.ts'] },
      '122': { files: ['src/stores/loginStore.ts'] },
    });

    const count = resetBatchTracker({
      ...baseOpts,
      batchId: 'B2',
      targetDir,
      migrationDir,
      dryRun: false,
    });
    expect(count).toBe(2);

    const tracker = JSON.parse(
      fs.readFileSync(path.join(migrationDir, 'ADH', 'migration-tracker.json'), 'utf8'),
    );
    expect(tracker.batches.B2.programs['121'].status).toBe('pending');
    expect(tracker.batches.B2.programs['122'].files).toEqual([]);
  });
});
