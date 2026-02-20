import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  readMigrateTracker, writeMigrateTracker, getOrCreateProgram,
  startPhase, completePhase, failPhase, isPhaseCompleted,
  markProgramCompleted, markProgramFailed, getCompletionStats,
} from '../src/migrate/migrate-tracker.js';
import { MigratePhase } from '../src/migrate/migrate-types.js';

let tmpDir: string;
let trackerFile: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-tracker-'));
  trackerFile = path.join(tmpDir, 'tracker.json');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('readMigrateTracker', () => {
  it('should return empty record for missing file', () => {
    expect(readMigrateTracker('/nonexistent/tracker.json')).toEqual({});
  });

  it('should return empty record for file without migrate section', () => {
    fs.writeFileSync(trackerFile, JSON.stringify({ version: '1.0' }));
    expect(readMigrateTracker(trackerFile)).toEqual({});
  });

  it('should return migrate data from existing file', () => {
    const data = { version: '1.0', migrate: { '69': { status: 'completed', currentPhase: null, phases: {}, files: [], errors: [] } } };
    fs.writeFileSync(trackerFile, JSON.stringify(data));
    const result = readMigrateTracker(trackerFile);
    expect(result['69'].status).toBe('completed');
  });
});

describe('writeMigrateTracker', () => {
  it('should create file with migrate section', () => {
    const data = { '69': { status: 'pending' as const, currentPhase: null, phases: {}, files: [], errors: [] } };
    writeMigrateTracker(trackerFile, data);
    const raw = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
    expect(raw.migrate['69'].status).toBe('pending');
  });

  it('should preserve existing fields', () => {
    fs.writeFileSync(trackerFile, JSON.stringify({ version: '2.0', batches: [] }));
    writeMigrateTracker(trackerFile, { '70': { status: 'generating' as const, currentPhase: 'spec', phases: {}, files: [], errors: [] } });
    const raw = JSON.parse(fs.readFileSync(trackerFile, 'utf8'));
    expect(raw.version).toBe('2.0');
    expect(raw.batches).toEqual([]);
    expect(raw.migrate['70'].status).toBe('generating');
  });
});

describe('getOrCreateProgram', () => {
  it('should create a new program record', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 69);
    expect(prog.status).toBe('pending');
    expect(prog.currentPhase).toBeNull();
    expect(prog.phases).toEqual({});
    expect(data['69']).toBe(prog);
  });

  it('should return existing program record', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {
      '69': { status: 'completed', currentPhase: null, phases: {}, files: ['a.ts'], errors: [] },
    };
    const prog = getOrCreateProgram(data, 69);
    expect(prog.status).toBe('completed');
    expect(prog.files).toEqual(['a.ts']);
  });
});

describe('phase lifecycle', () => {
  it('should track start, complete, and fail phases', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 69);

    // Start
    startPhase(prog, MigratePhase.SPEC);
    expect(prog.status).toBe('generating');
    expect(prog.currentPhase).toBe('spec');
    expect(prog.phases.spec?.status).toBe('generating');
    expect(prog.startedAt).toBeDefined();

    // Complete
    completePhase(prog, MigratePhase.SPEC, { file: 'spec.md', duration: 3000 });
    expect(prog.phases.spec?.status).toBe('completed');
    expect(prog.phases.spec?.duration).toBe(3000);
    expect(prog.phases.spec?.file).toBe('spec.md');
    expect(prog.files).toContain('spec.md');
    expect(isPhaseCompleted(prog, MigratePhase.SPEC)).toBe(true);
    expect(isPhaseCompleted(prog, MigratePhase.CONTRACT)).toBe(false);
  });

  it('should handle phase failure', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 70);

    startPhase(prog, MigratePhase.ANALYZE);
    failPhase(prog, MigratePhase.ANALYZE, 'timeout');
    expect(prog.phases.analyze?.status).toBe('failed');
    expect(prog.phases.analyze?.error).toBe('timeout');
    expect(prog.errors).toContain('[analyze] timeout');
  });

  it('should not duplicate files', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 69);
    completePhase(prog, MigratePhase.SPEC, { file: 'spec.md' });
    completePhase(prog, MigratePhase.SPEC, { file: 'spec.md' });
    expect(prog.files.filter(f => f === 'spec.md')).toHaveLength(1);
  });
});

describe('program completion', () => {
  it('should mark program completed', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 69);
    markProgramCompleted(prog);
    expect(prog.status).toBe('completed');
    expect(prog.currentPhase).toBeNull();
    expect(prog.completedAt).toBeDefined();
  });

  it('should mark program failed', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 69);
    markProgramFailed(prog, 'fatal error');
    expect(prog.status).toBe('failed');
    expect(prog.errors).toContain('fatal error');
  });
});

describe('getCompletionStats', () => {
  it('should compute correct stats', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 69);
    completePhase(prog, MigratePhase.SPEC, {});
    completePhase(prog, MigratePhase.CONTRACT, {});
    startPhase(prog, MigratePhase.ANALYZE);

    const stats = getCompletionStats(prog);
    expect(stats.completed).toBe(2);
    expect(stats.total).toBe(3);
    expect(stats.pct).toBe(67);
  });

  it('should return 0 for empty phases', () => {
    const data: Record<string, import('../src/migrate/migrate-types.js').ProgramMigration> = {};
    const prog = getOrCreateProgram(data, 69);
    const stats = getCompletionStats(prog);
    expect(stats.pct).toBe(0);
  });
});
