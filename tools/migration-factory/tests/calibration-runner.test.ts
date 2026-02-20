import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import { runCalibration, type CalibrationResult } from '../src/calculators/calibration-runner.js';
import type { PipelineConfig } from '../src/core/types.js';
import { EnrichmentMode } from '../src/core/types.js';

// ─── Test Helpers ────────────────────────────────────────────────

let testDir: string;

const createConfig = (subDir = 'ADH'): PipelineConfig => ({
  projectDir: testDir,
  migrationDir: path.join(testDir, '.openspec', 'migration'),
  specDir: path.join(testDir, '.openspec', 'specs'),
  codebaseDir: testDir,
  contractSubDir: subDir,
  trackerFile: path.join(testDir, '.openspec', 'migration', subDir, 'tracker.json'),
  autoContract: true,
  autoVerify: true,
  dryRun: false,
  generateReport: false,
  enrichmentMode: EnrichmentMode.MANUAL,
});

const writeContract = (dir: string, id: number, opts: {
  status?: string;
  contractedAt?: string;
  verifiedAt?: string;
  estimatedHours?: number;
  allImpl?: boolean;
}): void => {
  fs.mkdirSync(dir, { recursive: true });
  const itemStatus = opts.allImpl !== false ? 'IMPL' : 'MISSING';
  const effort: Record<string, unknown> = {};
  if (opts.contractedAt) effort.contracted_at = opts.contractedAt;
  if (opts.verifiedAt) effort.verified_at = opts.verifiedAt;
  if (opts.estimatedHours != null) effort.estimated_hours = opts.estimatedHours;

  fs.writeFileSync(path.join(dir, `ADH-IDE-${id}.contract.yaml`), YAML.stringify({
    program: { id, name: `Program ${id}`, complexity: 'LOW', callers: [], callees: [], tasks_count: 1, tables_count: 1, expressions_count: 5 },
    rules: [{ id: 'R1', description: 'Test', condition: '', variables: [], status: itemStatus, target_file: '', gap_notes: '' }],
    variables: [],
    tables: [],
    callees: [],
    overall: {
      rules_total: 1, rules_impl: 1, rules_partial: 0, rules_missing: 0, rules_na: 0,
      variables_key_count: 0, callees_total: 0, callees_impl: 0, callees_missing: 0,
      coverage_pct: 100, status: opts.status ?? 'verified', generated: '2026-02-20', notes: '',
      effort: Object.keys(effort).length > 0 ? effort : undefined,
    },
  }), 'utf8');
};

const writeTracker = (filePath: string): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({
    version: '1.0', methodology: 'SPECMAP', created: '2026-02-20', updated: '2026-02-20', status: 'active',
    stats: { total_programs: 0, live_programs: 0, orphan_programs: 0, ecf_programs: 0, contracted: 0, enriched: 0, verified: 0, max_level: 0, last_computed: '' },
    batches: [],
    notes: [],
  }, null, 2), 'utf8');
};

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-calib-'));
});

afterEach(() => {
  if (testDir) fs.rmSync(testDir, { recursive: true, force: true });
});

// ─── Tests ───────────────────────────────────────────────────────

describe('runCalibration', () => {
  it('should return 0 dataPoints when no contracts exist', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');
    fs.mkdirSync(contractDir, { recursive: true });

    const result = runCalibration(config, true);
    expect(result.dataPoints).toBe(0);
    expect(result.calibratedHpp).toBe(0.15); // default
  });

  it('should return 0 dataPoints when no verified contracts', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');
    writeContract(contractDir, 100, { status: 'enriched' });

    const result = runCalibration(config, true);
    expect(result.dataPoints).toBe(0);
  });

  it('should calculate hoursPerPoint from verified contracts with timestamps', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');

    writeContract(contractDir, 100, {
      status: 'verified',
      contractedAt: '2026-02-01T10:00:00Z',
      verifiedAt: '2026-02-01T12:00:00Z',
      estimatedHours: 1.5,
    });
    writeContract(contractDir, 101, {
      status: 'verified',
      contractedAt: '2026-02-02T08:00:00Z',
      verifiedAt: '2026-02-02T11:00:00Z',
      estimatedHours: 2.0,
    });

    const result = runCalibration(config, true);
    expect(result.dataPoints).toBe(2);
    expect(result.totalActual).toBe(5); // 2h + 3h
    expect(result.totalEstimated).toBe(3.5); // 1.5h + 2.0h
    expect(result.calibratedHpp).toBeGreaterThan(0);
  });

  it('should ignore contracts without timestamps', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');

    writeContract(contractDir, 100, { status: 'verified' }); // no timestamps
    writeContract(contractDir, 101, {
      status: 'verified',
      contractedAt: '2026-02-01T10:00:00Z',
      verifiedAt: '2026-02-01T12:00:00Z',
    });

    const result = runCalibration(config, true);
    expect(result.dataPoints).toBe(1);
  });

  it('should calculate accuracy correctly', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');

    writeContract(contractDir, 100, {
      status: 'verified',
      contractedAt: '2026-02-01T10:00:00Z',
      verifiedAt: '2026-02-01T12:00:00Z',
      estimatedHours: 2.0,
    });

    const result = runCalibration(config, true);
    // actual = 2h, estimated = 2h → accuracy = 100%
    expect(result.accuracyPct).toBe(100);
  });

  it('should return 0 accuracy when no estimated hours', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');

    writeContract(contractDir, 100, {
      status: 'verified',
      contractedAt: '2026-02-01T10:00:00Z',
      verifiedAt: '2026-02-01T12:00:00Z',
    });

    const result = runCalibration(config, true);
    expect(result.accuracyPct).toBe(0);
    expect(result.totalEstimated).toBe(0);
  });

  it('should not modify tracker in dry-run mode', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');
    writeTracker(config.trackerFile);

    writeContract(contractDir, 100, {
      status: 'verified',
      contractedAt: '2026-02-01T10:00:00Z',
      verifiedAt: '2026-02-01T12:00:00Z',
    });

    const trackerBefore = fs.readFileSync(config.trackerFile, 'utf8');
    runCalibration(config, true);
    const trackerAfter = fs.readFileSync(config.trackerFile, 'utf8');
    expect(trackerAfter).toBe(trackerBefore);
  });

  it('should save calibration to tracker when not dry-run', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');
    writeTracker(config.trackerFile);

    writeContract(contractDir, 100, {
      status: 'verified',
      contractedAt: '2026-02-01T10:00:00Z',
      verifiedAt: '2026-02-01T12:00:00Z',
    });

    runCalibration(config, false);
    const trackerData = JSON.parse(fs.readFileSync(config.trackerFile, 'utf8'));
    expect(trackerData.calibration).toBeDefined();
    expect(trackerData.calibration.hoursPerPoint).toBeGreaterThan(0);
    expect(trackerData.calibration.dataPoints).toBe(1);
  });

  it('should return details for each verified contract', () => {
    const config = createConfig();
    const contractDir = path.join(config.migrationDir, 'ADH');

    writeContract(contractDir, 100, {
      status: 'verified',
      contractedAt: '2026-02-01T10:00:00Z',
      verifiedAt: '2026-02-01T14:00:00Z',
      estimatedHours: 3.0,
    });

    const result = runCalibration(config, true);
    expect(result.details).toHaveLength(1);
    expect(result.details[0].programId).toBe('100');
    expect(result.details[0].actual).toBe(4); // 4 hours
    expect(result.details[0].estimated).toBe(3);
  });

  it('should handle empty contract directory gracefully', () => {
    const config = createConfig();
    // Don't create contract dir
    const result = runCalibration(config, true);
    expect(result.dataPoints).toBe(0);
    expect(result.details).toHaveLength(0);
  });
});
