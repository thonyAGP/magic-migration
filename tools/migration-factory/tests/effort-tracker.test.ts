import { describe, it, expect } from 'vitest';
import { trackStatusChange, computeActualHours, computeContractToEnrichHours } from '../src/calculators/effort-tracker.js';
import type { MigrationContract, ContractEffort } from '../src/core/types.js';

const makeContract = (status: string, effort?: ContractEffort): MigrationContract => ({
  program: {
    id: 1, name: 'Test', complexity: 'MEDIUM',
    callers: [], callees: [],
    tasksCount: 1, tablesCount: 1, expressionsCount: 10,
  },
  rules: [],
  variables: [],
  tables: [],
  callees: [],
  overall: {
    rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0,
    variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0,
    coveragePct: 0, status: status as 'pending', generated: '', notes: '',
    effort,
  },
});

describe('trackStatusChange', () => {
  it('should set contractedAt on contracted transition', () => {
    const contract = makeContract('pending');
    const effort = trackStatusChange(contract, 'contracted');
    expect(effort.contractedAt).toBeDefined();
    expect(new Date(effort.contractedAt!).getTime()).toBeGreaterThan(0);
  });

  it('should set enrichedAt on enriched transition', () => {
    const contract = makeContract('contracted', { contractedAt: '2026-01-01T00:00:00Z' });
    const effort = trackStatusChange(contract, 'enriched');
    expect(effort.enrichedAt).toBeDefined();
    expect(effort.contractedAt).toBe('2026-01-01T00:00:00Z');
  });

  it('should set verifiedAt on verified transition', () => {
    const contract = makeContract('enriched', {
      contractedAt: '2026-01-01T00:00:00Z',
      enrichedAt: '2026-01-05T00:00:00Z',
    });
    const effort = trackStatusChange(contract, 'verified');
    expect(effort.verifiedAt).toBeDefined();
    expect(effort.contractedAt).toBe('2026-01-01T00:00:00Z');
    expect(effort.enrichedAt).toBe('2026-01-05T00:00:00Z');
  });

  it('should not overwrite existing timestamps', () => {
    const existing: ContractEffort = { contractedAt: '2026-01-01T00:00:00Z' };
    const contract = makeContract('contracted', existing);
    const effort = trackStatusChange(contract, 'contracted');
    expect(effort.contractedAt).toBe('2026-01-01T00:00:00Z');
  });

  it('should create effort from scratch if none exists', () => {
    const contract = makeContract('pending');
    const effort = trackStatusChange(contract, 'enriched');
    expect(effort.enrichedAt).toBeDefined();
  });
});

describe('computeActualHours', () => {
  it('should compute hours between contracted and verified', () => {
    const effort: ContractEffort = {
      contractedAt: '2026-01-01T00:00:00Z',
      verifiedAt: '2026-01-01T08:00:00Z',
    };
    expect(computeActualHours(effort)).toBe(8);
  });

  it('should return null without contractedAt', () => {
    expect(computeActualHours({ verifiedAt: '2026-01-01T00:00:00Z' })).toBeNull();
  });

  it('should return null without verifiedAt', () => {
    expect(computeActualHours({ contractedAt: '2026-01-01T00:00:00Z' })).toBeNull();
  });

  it('should return null for invalid dates', () => {
    expect(computeActualHours({ contractedAt: 'invalid', verifiedAt: '2026-01-01T00:00:00Z' })).toBeNull();
  });

  it('should return null if verified before contracted', () => {
    expect(computeActualHours({
      contractedAt: '2026-01-02T00:00:00Z',
      verifiedAt: '2026-01-01T00:00:00Z',
    })).toBeNull();
  });

  it('should handle multi-day durations', () => {
    const effort: ContractEffort = {
      contractedAt: '2026-01-01T09:00:00Z',
      verifiedAt: '2026-01-03T17:00:00Z',
    };
    const hours = computeActualHours(effort)!;
    expect(hours).toBe(56); // 2 days + 8h = 56h calendar
  });
});

describe('computeContractToEnrichHours', () => {
  it('should compute hours between contracted and enriched', () => {
    const effort: ContractEffort = {
      contractedAt: '2026-01-01T00:00:00Z',
      enrichedAt: '2026-01-01T04:30:00Z',
    };
    expect(computeContractToEnrichHours(effort)).toBe(4.5);
  });

  it('should return null without enrichedAt', () => {
    expect(computeContractToEnrichHours({ contractedAt: '2026-01-01T00:00:00Z' })).toBeNull();
  });
});
