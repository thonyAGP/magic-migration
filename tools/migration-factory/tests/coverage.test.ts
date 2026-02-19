import { describe, it, expect } from 'vitest';
import type { MigrationContract } from '../src/core/types.js';
import {
  computeRulesCoverage, computeOverallCoverage, formatCoverageBar,
} from '../src/core/coverage.js';

const makeContract = (statuses: { rules?: string[]; vars?: string[]; tables?: string[]; callees?: string[] }): MigrationContract => ({
  program: { id: 1, name: 'Test', complexity: 'LOW', callers: [], callees: [], tasksCount: 0, tablesCount: 0, expressionsCount: 0 },
  rules: (statuses.rules ?? []).map((s, i) => ({
    id: `RM-${i}`, description: '', condition: '', variables: [],
    status: s as 'IMPL' | 'PARTIAL' | 'MISSING' | 'N/A',
    targetFile: '', gapNotes: '',
  })),
  variables: (statuses.vars ?? []).map((s, i) => ({
    localId: String.fromCharCode(65 + i), name: '', type: 'Virtual' as const,
    status: s as 'IMPL' | 'PARTIAL' | 'MISSING' | 'N/A',
    targetFile: '', gapNotes: '',
  })),
  tables: (statuses.tables ?? []).map((s, i) => ({
    id: i, name: '', mode: 'R' as const,
    status: s as 'IMPL' | 'PARTIAL' | 'MISSING' | 'N/A',
    targetFile: '', gapNotes: '',
  })),
  callees: (statuses.callees ?? []).map((s, i) => ({
    id: i, name: '', calls: 1, context: '',
    status: s as 'IMPL' | 'PARTIAL' | 'MISSING' | 'N/A',
    target: '', gapNotes: '',
  })),
  overall: {
    rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0,
    variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0,
    coveragePct: 0, status: 'pending', generated: '', notes: '',
  },
});

describe('computeRulesCoverage', () => {
  it('should return 100% for all IMPL', () => {
    const contract = makeContract({ rules: ['IMPL', 'IMPL', 'IMPL'] });
    expect(computeRulesCoverage(contract).coveragePct).toBe(100);
  });

  it('should return 0% for all MISSING', () => {
    const contract = makeContract({ rules: ['MISSING', 'MISSING'] });
    expect(computeRulesCoverage(contract).coveragePct).toBe(0);
  });

  it('should count PARTIAL as 0.5', () => {
    const contract = makeContract({ rules: ['PARTIAL', 'PARTIAL'] });
    expect(computeRulesCoverage(contract).coveragePct).toBe(50);
  });

  it('should exclude N/A from total', () => {
    const contract = makeContract({ rules: ['IMPL', 'N/A', 'N/A'] });
    expect(computeRulesCoverage(contract).coveragePct).toBe(100);
  });

  it('should return 100% for empty rules', () => {
    const contract = makeContract({});
    expect(computeRulesCoverage(contract).coveragePct).toBe(100);
  });

  it('should return 100% for all N/A', () => {
    const contract = makeContract({ rules: ['N/A', 'N/A'] });
    expect(computeRulesCoverage(contract).coveragePct).toBe(100);
  });
});

describe('computeOverallCoverage', () => {
  it('should combine all sections', () => {
    const contract = makeContract({
      rules: ['IMPL', 'MISSING'],     // 50%
      vars: ['IMPL', 'IMPL', 'N/A'],  // 100%
      tables: ['PARTIAL'],              // 50%
      callees: ['IMPL'],                // 100%
    });
    // 3 impl + 0.5 partial = 3.5 / (2+2+1+1 - 1 na) = 3.5 / 4 non-N/A across sections
    // Actually: rules(1/2), vars(2/2 applicable), tables(0.5/1), callees(1/1) -> each section independent
    // Overall: (1+2+0.5+1) / (2+2+1+1) = 4.5/6 non-N/A items... Let's just check the actual computed value
    // Rules: 1 IMPL, 1 MISSING = 2 applicable. Vars: 2 IMPL, 1 N/A = 2 applicable. Tables: 1 PARTIAL = 1 applicable. Callees: 1 IMPL = 1 applicable
    // Total applicable = 2 + 2 + 1 + 1 = 6. Total weighted = 1 + 2 + 0.5 + 1 = 4.5. 4.5/6 = 75%
    expect(computeOverallCoverage(contract)).toBe(75);
  });
});

describe('formatCoverageBar', () => {
  it('should format bar correctly', () => {
    const bar = formatCoverageBar(50, 10);
    expect(bar).toContain('50%');
    expect(bar.length).toBeGreaterThan(10);
  });

  it('should handle 0%', () => {
    const bar = formatCoverageBar(0, 10);
    expect(bar).toContain('0%');
  });

  it('should handle 100%', () => {
    const bar = formatCoverageBar(100, 10);
    expect(bar).toContain('100%');
  });
});
