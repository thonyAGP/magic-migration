import { describe, it, expect } from 'vitest';
import type {
  MigrationContract, ContractOverall, ContractRevision, PipelineStatus,
} from '../src/core/types.js';
import { PipelineStatus as PS } from '../src/core/types.js';

/** Helper: add a revision entry when contract status changes. */
const addRevision = (
  overall: ContractOverall,
  previousStatus: PipelineStatus,
  newStatus: PipelineStatus,
  note?: string,
): void => {
  if (!overall.revisions) overall.revisions = [];
  overall.revisions.push({
    version: overall.revisions.length + 1,
    previousStatus,
    newStatus,
    timestamp: new Date().toISOString(),
    coveragePct: overall.coveragePct,
    note,
  });
};

const makeOverall = (status: PipelineStatus = PS.PENDING, coveragePct = 0): ContractOverall => ({
  rulesTotal: 5,
  rulesImpl: 3,
  rulesPartial: 1,
  rulesMissing: 1,
  rulesNa: 0,
  variablesKeyCount: 2,
  calleesTotal: 1,
  calleesImpl: 1,
  calleesMissing: 0,
  coveragePct,
  status,
  generated: '2026-02-20',
  notes: '',
});

describe('contract-versioning', () => {
  it('should support ContractRevision type', () => {
    const revision: ContractRevision = {
      version: 1,
      previousStatus: PS.PENDING,
      newStatus: PS.CONTRACTED,
      timestamp: '2026-02-23T10:00:00Z',
      coveragePct: 60,
    };
    expect(revision.version).toBe(1);
    expect(revision.previousStatus).toBe('pending');
  });

  it('should add revisions array to ContractOverall', () => {
    const overall = makeOverall(PS.PENDING, 0);
    expect(overall.revisions).toBeUndefined();

    addRevision(overall, PS.PENDING, PS.CONTRACTED);
    expect(overall.revisions).toHaveLength(1);
    expect(overall.revisions![0].version).toBe(1);
    expect(overall.revisions![0].previousStatus).toBe('pending');
    expect(overall.revisions![0].newStatus).toBe('contracted');
  });

  it('should increment version on each status change', () => {
    const overall = makeOverall(PS.PENDING, 0);

    addRevision(overall, PS.PENDING, PS.CONTRACTED);
    addRevision(overall, PS.CONTRACTED, PS.ENRICHED);
    addRevision(overall, PS.ENRICHED, PS.VERIFIED, 'All items verified');

    expect(overall.revisions).toHaveLength(3);
    expect(overall.revisions![0].version).toBe(1);
    expect(overall.revisions![1].version).toBe(2);
    expect(overall.revisions![2].version).toBe(3);
    expect(overall.revisions![2].note).toBe('All items verified');
  });

  it('should record coveragePct at each revision', () => {
    const overall = makeOverall(PS.PENDING, 50);
    addRevision(overall, PS.PENDING, PS.CONTRACTED);

    overall.coveragePct = 85;
    addRevision(overall, PS.CONTRACTED, PS.ENRICHED);

    overall.coveragePct = 100;
    addRevision(overall, PS.ENRICHED, PS.VERIFIED);

    expect(overall.revisions![0].coveragePct).toBe(50);
    expect(overall.revisions![1].coveragePct).toBe(85);
    expect(overall.revisions![2].coveragePct).toBe(100);
  });

  it('should be backward compatible (revisions optional)', () => {
    const overall = makeOverall(PS.VERIFIED, 100);
    // Old contracts without revisions should still work
    expect(overall.revisions).toBeUndefined();
    expect(overall.status).toBe('verified');
  });

  it('should serialize/deserialize revisions via JSON', () => {
    const overall = makeOverall(PS.PENDING, 30);
    addRevision(overall, PS.PENDING, PS.CONTRACTED);
    addRevision(overall, PS.CONTRACTED, PS.ENRICHED);

    const json = JSON.stringify(overall);
    const parsed = JSON.parse(json) as ContractOverall;

    expect(parsed.revisions).toHaveLength(2);
    expect(parsed.revisions![0].newStatus).toBe('contracted');
    expect(parsed.revisions![1].newStatus).toBe('enriched');
  });
});
