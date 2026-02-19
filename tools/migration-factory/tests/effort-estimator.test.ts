import { describe, it, expect } from 'vitest';
import { estimateProject, computeRemainingHours } from '../src/calculators/effort-estimator.js';
import type { Program, MigrationContract, PipelineStatus } from '../src/core/types.js';

const makeProgram = (id: number, overrides: Partial<Program> = {}): Program => ({
  id,
  name: `Prog-${id}`,
  complexity: 'MEDIUM',
  level: 2,
  callers: [],
  callees: [],
  source: 'bfs',
  domain: 'test',
  ...overrides,
});

const makeContract = (id: number): MigrationContract => ({
  program: {
    id, name: `Prog-${id}`, complexity: 'MEDIUM',
    callers: [], callees: [],
    tasksCount: 3, tablesCount: 2, expressionsCount: 20,
  },
  rules: [],
  variables: [],
  tables: [
    { id: 1, name: 't1', mode: 'R', status: 'IMPL', targetFile: '', gapNotes: '' },
    { id: 2, name: 't2', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  callees: [],
  overall: {
    rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0,
    variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0,
    coveragePct: 100, status: 'contracted', generated: '', notes: '',
  },
});

describe('estimateProject', () => {
  it('should estimate all programs in a project', () => {
    const programs = [makeProgram(1), makeProgram(2), makeProgram(3)];
    const contracts = new Map([[1, makeContract(1)], [2, makeContract(2)]]);
    const statuses = new Map<string | number, PipelineStatus>([
      [1, 'verified'], [2, 'enriched'], [3, 'pending'],
    ]);

    const result = estimateProject({ programs, contracts, programStatuses: statuses });

    expect(result.programs).toHaveLength(3);
    expect(result.totalEstimatedHours).toBeGreaterThan(0);
    expect(result.avgComplexityScore).toBeGreaterThanOrEqual(0);
  });

  it('should sort programs by score descending', () => {
    const programs = [
      makeProgram(1, { level: 0, callees: [], callers: [] }),
      makeProgram(2, { level: 5, callees: [3, 4, 5], callers: [1] }),
    ];
    const contracts = new Map([[2, makeContract(2)]]);
    const statuses = new Map<string | number, PipelineStatus>();

    const result = estimateProject({ programs, contracts, programStatuses: statuses, maxLevel: 8 });

    expect(result.programs[0].score.normalizedScore)
      .toBeGreaterThanOrEqual(result.programs[1].score.normalizedScore);
  });

  it('should compute grade distribution', () => {
    const programs = [makeProgram(1), makeProgram(2)];
    const statuses = new Map<string | number, PipelineStatus>();

    const result = estimateProject({ programs, contracts: new Map(), programStatuses: statuses });

    const totalGrades = Object.values(result.gradeDistribution).reduce((s, n) => s + n, 0);
    expect(totalGrades).toBe(2);
  });

  it('should handle empty project', () => {
    const result = estimateProject({
      programs: [],
      contracts: new Map(),
      programStatuses: new Map(),
    });

    expect(result.programs).toHaveLength(0);
    expect(result.totalEstimatedHours).toBe(0);
    expect(result.avgComplexityScore).toBe(0);
  });

  it('should aggregate total estimated hours', () => {
    const programs = [
      makeProgram(1, { level: 6, callees: [2, 3, 4, 5], callers: [10] }),
      makeProgram(2, { level: 1, callees: [], callers: [] }),
    ];
    const contracts = new Map([[1, makeContract(1)]]);
    const statuses = new Map<string | number, PipelineStatus>();

    const result = estimateProject({ programs, contracts, programStatuses: statuses, maxLevel: 8 });

    const sumHours = result.programs.reduce((s, p) => s + p.score.estimatedHours, 0);
    expect(Math.abs(result.totalEstimatedHours - Math.round(sumHours * 10) / 10)).toBeLessThan(0.2);
  });

  it('should use default status pending when not in map', () => {
    const programs = [makeProgram(1)];
    const result = estimateProject({
      programs,
      contracts: new Map(),
      programStatuses: new Map(),
    });

    expect(result.programs[0].status).toBe('pending');
  });
});

describe('computeRemainingHours', () => {
  it('should exclude verified programs from remaining', () => {
    const programs = [makeProgram(1), makeProgram(2)];
    const statuses = new Map<string | number, PipelineStatus>([
      [1, 'verified'], [2, 'enriched'],
    ]);
    const estimation = estimateProject({
      programs, contracts: new Map(), programStatuses: statuses,
    });

    const remaining = computeRemainingHours(estimation);
    const verifiedHours = estimation.programs.find(p => p.id === 1)?.score.estimatedHours ?? 0;

    expect(remaining).toBeLessThan(estimation.totalEstimatedHours);
    expect(remaining).toBeCloseTo(estimation.totalEstimatedHours - verifiedHours, 0);
  });

  it('should return 0 when all verified', () => {
    const programs = [makeProgram(1)];
    const statuses = new Map<string | number, PipelineStatus>([[1, 'verified']]);
    const estimation = estimateProject({
      programs, contracts: new Map(), programStatuses: statuses,
    });

    expect(computeRemainingHours(estimation)).toBe(0);
  });
});
