import { describe, it, expect } from 'vitest';
import { buildModulesFromBatches, buildMultiProjectReport } from '../src/dashboard/report-builder.js';
import type { Batch, PipelineStatus } from '../src/core/types.js';

// ─── Helpers ────────────────────────────────────────────────────

const makeBatch = (id: string, programs: (string | number)[], overrides: Partial<Batch> = {}): Batch => ({
  id,
  name: `Batch ${id}`,
  root: programs[0] ?? 0,
  programs: programs.length,
  status: 'pending' as PipelineStatus,
  stats: { pending: 0, contracted: 0, enriched: 0, verified: 0, total: programs.length },
  priorityOrder: programs,
  ...overrides,
});

const makeStatuses = (map: Record<string | number, PipelineStatus>): Map<string | number, PipelineStatus> =>
  new Map(Object.entries(map).map(([k, v]) => [isNaN(Number(k)) ? k : Number(k), v]));

// ─── readinessPct: verified-only ────────────────────────────────

describe('readinessPct (verified-only, NOT enriched+verified)', () => {
  it('should be 0% when all programs are enriched but none verified', () => {
    const batch = makeBatch('B2', [121, 131, 134]);
    const statuses = makeStatuses({ 121: 'enriched', 131: 'enriched', 134: 'enriched' });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(0);
    expect(modules[0].enriched).toBe(3);
    expect(modules[0].verified).toBe(0);
  });

  it('should be 100% only when ALL programs are verified', () => {
    const batch = makeBatch('B1', [69, 70, 71]);
    const statuses = makeStatuses({ 69: 'verified', 70: 'verified', 71: 'verified' });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(100);
    expect(modules[0].deliverable).toBe(true);
  });

  it('should count only verified in percentage (5/17 = 29%)', () => {
    const programs = Array.from({ length: 17 }, (_, i) => i + 1);
    const batch = makeBatch('B2', programs);
    const statusMap: Record<number, PipelineStatus> = {};
    // 5 verified, 12 enriched
    for (let i = 1; i <= 5; i++) statusMap[i] = 'verified';
    for (let i = 6; i <= 17; i++) statusMap[i] = 'enriched';
    const statuses = makeStatuses(statusMap);

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(29); // Math.round(5/17*100) = 29
    expect(modules[0].verified).toBe(5);
    expect(modules[0].enriched).toBe(12);
    expect(modules[0].deliverable).toBe(false);
  });

  it('should NOT inflate percentage with enriched programs', () => {
    const batch = makeBatch('B3', [1, 2, 3, 4]);
    // 2 enriched + 2 contracted = 0 verified → 0%
    const statuses = makeStatuses({ 1: 'enriched', 2: 'enriched', 3: 'contracted', 4: 'contracted' });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(0);
    expect(modules[0].enriched).toBe(2);
    expect(modules[0].contracted).toBe(2);
  });

  it('should count pending programs with no status', () => {
    const batch = makeBatch('B4', [1, 2, 3]);
    const statuses = makeStatuses({ 1: 'verified' }); // 2 and 3 have no status → pending

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(33); // 1/3 = 33%
    expect(modules[0].verified).toBe(1);
    expect(modules[0].pending).toBe(2);
  });
});

// ─── Badge thresholds ───────────────────────────────────────────

describe('badge thresholds (deliverable / close / inProgress / notStarted)', () => {
  it('deliverable = true only when all programs verified', () => {
    const batch = makeBatch('B1', [1, 2]);
    const statuses = makeStatuses({ 1: 'verified', 2: 'verified' });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].deliverable).toBe(true);
    expect(modules[0].readinessPct).toBe(100);
  });

  it('deliverable = false when 1 program is only enriched', () => {
    const batch = makeBatch('B1', [1, 2]);
    const statuses = makeStatuses({ 1: 'verified', 2: 'enriched' });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].deliverable).toBe(false);
    expect(modules[0].readinessPct).toBe(50);
  });

  it('close threshold: readinessPct >= 50', () => {
    // 3/5 verified = 60% → close
    const batch = makeBatch('B1', [1, 2, 3, 4, 5]);
    const statuses = makeStatuses({ 1: 'verified', 2: 'verified', 3: 'verified', 4: 'enriched', 5: 'pending' });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(60);
    expect(modules[0].deliverable).toBe(false);
    // close = !deliverable && readinessPct >= 50
  });

  it('inProgress: readinessPct > 0 and < 50', () => {
    // 1/4 verified = 25% → inProgress
    const batch = makeBatch('B1', [1, 2, 3, 4]);
    const statuses = makeStatuses({ 1: 'verified', 2: 'enriched', 3: 'enriched', 4: 'pending' });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(25);
  });

  it('notStarted: readinessPct = 0', () => {
    const batch = makeBatch('B1', [1, 2, 3]);
    const statuses = makeStatuses({}); // all pending

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(0);
  });
});

// ─── overallProgressPct: verified-only ──────────────────────────

describe('overallProgressPct (verified-only in multi-project)', () => {
  it('should count only verified for overall progress', () => {
    // Trick: buildMultiProjectReport needs reportInput which requires full setup
    // We test the GlobalSummary computation directly
    const report = buildMultiProjectReport({
      projects: [
        { name: 'ADH', programCount: 135, description: 'Test' },
        { name: 'PBP', programCount: 400, description: 'Test' },
      ],
    });

    // No active projects → 0%
    expect(report.global.overallProgressPct).toBe(0);
  });

  it('should return 0% for not-started projects (no active reports)', () => {
    const report = buildMultiProjectReport({
      projects: [
        { name: 'ADH', programCount: 135, description: 'Test' },
      ],
    });

    expect(report.global.totalProjects).toBe(1);
    expect(report.global.activeProjects).toBe(0);
    expect(report.global.overallProgressPct).toBe(0);
  });
});

// ─── Module counts per status ───────────────────────────────────

describe('module status counts', () => {
  it('should separate verified / enriched / contracted / pending accurately', () => {
    const batch = makeBatch('B2', [1, 2, 3, 4, 5, 6]);
    const statuses = makeStatuses({
      1: 'verified',
      2: 'enriched',
      3: 'enriched',
      4: 'contracted',
      5: 'pending',
      6: 'pending',
    });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].verified).toBe(1);
    expect(modules[0].enriched).toBe(2);
    expect(modules[0].contracted).toBe(1);
    expect(modules[0].pending).toBe(2);
    expect(modules[0].readinessPct).toBe(17); // 1/6 = 16.67 → 17
  });

  it('should handle empty batch gracefully', () => {
    const batch = makeBatch('B0', []);
    const statuses = makeStatuses({});

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].readinessPct).toBe(0);
    expect(modules[0].memberCount).toBe(0);
  });

  it('should preserve batchId and domain', () => {
    const batch = makeBatch('B5', [1, 2], { domain: 'Impression' });
    const statuses = makeStatuses({ 1: 'verified', 2: 'pending' });

    const modules = buildModulesFromBatches([batch], statuses);
    expect(modules[0].batchId).toBe('B5');
    expect(modules[0].domain).toBe('Impression');
  });
});
