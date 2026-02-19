import { describe, it, expect } from 'vitest';
import {
  scoreProgram, calibrateHoursPerPoint, DEFAULT_ESTIMATION_CONFIG,
} from '../src/calculators/complexity-scorer.js';
import type { Program, MigrationContract } from '../src/core/types.js';

const makeProgram = (overrides: Partial<Program> = {}): Program => ({
  id: 1,
  name: 'Test',
  complexity: 'MEDIUM',
  level: 3,
  callers: [2, 3],
  callees: [4, 5, 6],
  source: 'bfs',
  domain: 'test',
  ...overrides,
});

const makeContract = (overrides: Partial<MigrationContract['program']> = {}): MigrationContract => ({
  program: {
    id: 1, name: 'Test', complexity: 'MEDIUM',
    callers: [], callees: [],
    tasksCount: 5, tablesCount: 3, expressionsCount: 40,
    ...overrides,
  },
  rules: [],
  variables: [],
  tables: [
    { id: 1, name: 't1', mode: 'R', status: 'IMPL', targetFile: '', gapNotes: '' },
    { id: 2, name: 't2', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
    { id: 3, name: 't3', mode: 'RW', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  callees: [],
  overall: {
    rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0,
    variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0,
    coveragePct: 100, status: 'contracted', generated: '', notes: '',
  },
});

describe('scoreProgram', () => {
  it('should return a score between 0 and 100', () => {
    const result = scoreProgram({ program: makeProgram() });
    expect(result.normalizedScore).toBeGreaterThanOrEqual(0);
    expect(result.normalizedScore).toBeLessThanOrEqual(100);
  });

  it('should assign grade S for high scores (>=80)', () => {
    const program = makeProgram({ level: 8, callees: Array(20).fill(1), callers: Array(10).fill(1) });
    const contract: MigrationContract = {
      ...makeContract({ tasksCount: 50, expressionsCount: 200 }),
      tables: [
        { id: 1, name: 't1', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 2, name: 't2', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 3, name: 't3', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 4, name: 't4', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 5, name: 't5', mode: 'RW', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 6, name: 't6', mode: 'RW', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 7, name: 't7', mode: 'R', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 8, name: 't8', mode: 'R', status: 'IMPL', targetFile: '', gapNotes: '' },
      ],
    };
    const result = scoreProgram({ program, contract, formsCount: 5, maxLevel: 8 });
    expect(result.grade).toBe('S');
    expect(result.normalizedScore).toBeGreaterThanOrEqual(80);
  });

  it('should assign grade D for minimal programs', () => {
    const program = makeProgram({ level: 0, callees: [], callers: [] });
    const result = scoreProgram({
      program,
      contract: makeContract({ tasksCount: 1, expressionsCount: 0 }),
      maxLevel: 8,
    });
    expect(result.grade).toBe('D');
    expect(result.normalizedScore).toBeLessThan(20);
  });

  it('should weight structural factor highest by default', () => {
    const programHigh = makeProgram({ level: 0, callees: [], callers: [] });
    const contractHigh = makeContract({ tasksCount: 50, expressionsCount: 150 });
    const scoreHigh = scoreProgram({ program: programHigh, contract: contractHigh, maxLevel: 8 });

    const programLow = makeProgram({ level: 0, callees: [], callers: [] });
    const contractLow = makeContract({ tasksCount: 1, expressionsCount: 2 });
    const scoreLow = scoreProgram({ program: programLow, contract: contractLow, maxLevel: 8 });

    expect(scoreHigh.normalizedScore).toBeGreaterThan(scoreLow.normalizedScore);
  });

  it('should factor in table access modes (W > RW > R)', () => {
    const program = makeProgram({ level: 0, callees: [], callers: [] });
    const contractReadOnly: MigrationContract = {
      ...makeContract(),
      tables: [
        { id: 1, name: 't1', mode: 'R', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 2, name: 't2', mode: 'R', status: 'IMPL', targetFile: '', gapNotes: '' },
      ],
    };
    const contractWriteHeavy: MigrationContract = {
      ...makeContract(),
      tables: [
        { id: 1, name: 't1', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 2, name: 't2', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
      ],
    };

    const scoreR = scoreProgram({ program, contract: contractReadOnly, maxLevel: 8 });
    const scoreW = scoreProgram({ program, contract: contractWriteHeavy, maxLevel: 8 });

    expect(scoreW.factors.dataAccess).toBeGreaterThan(scoreR.factors.dataAccess);
  });

  it('should use depth factor from level/maxLevel', () => {
    const programDeep = makeProgram({ level: 8 });
    const programShallow = makeProgram({ level: 1 });

    const scoreDeep = scoreProgram({ program: programDeep, maxLevel: 8 });
    const scoreShallow = scoreProgram({ program: programShallow, maxLevel: 8 });

    expect(scoreDeep.factors.depth).toBeGreaterThan(scoreShallow.factors.depth);
  });

  it('should clamp factors to max 1.0', () => {
    const program = makeProgram({ level: 100, callees: Array(100).fill(1), callers: Array(100).fill(1) });
    const contract = makeContract({ tasksCount: 999, expressionsCount: 999 });
    const result = scoreProgram({ program, contract, formsCount: 100, maxLevel: 8 });

    expect(result.factors.structural).toBeLessThanOrEqual(1);
    expect(result.factors.dataAccess).toBeLessThanOrEqual(1);
    expect(result.factors.integration).toBeLessThanOrEqual(1);
    expect(result.factors.depth).toBeLessThanOrEqual(1);
    expect(result.factors.uiComplexity).toBeLessThanOrEqual(1);
  });

  it('should estimate hours proportional to score', () => {
    const resultLow = scoreProgram({ program: makeProgram({ level: 0, callees: [], callers: [] }), maxLevel: 8 });
    const resultHigh = scoreProgram({
      program: makeProgram({ level: 8, callees: Array(20).fill(1), callers: Array(5).fill(1) }),
      contract: makeContract({ tasksCount: 30, expressionsCount: 150 }),
      formsCount: 3,
      maxLevel: 8,
    });

    expect(resultHigh.estimatedHours).toBeGreaterThan(resultLow.estimatedHours);
  });

  it('should return high confidence with contract and spec data', () => {
    const result = scoreProgram({
      program: makeProgram(),
      contract: makeContract({ expressionsCount: 50 }),
    });
    expect(result.confidence).toBe('high');
  });

  it('should return low confidence without contract or spec', () => {
    const result = scoreProgram({ program: makeProgram() });
    expect(result.confidence).toBe('low');
  });

  it('should accept custom config weights', () => {
    const config = {
      ...DEFAULT_ESTIMATION_CONFIG,
      weights: { structural: 1, dataAccess: 0, integration: 0, depth: 0, uiComplexity: 0 },
    };
    const program = makeProgram({ level: 0, callees: [], callers: [] });
    const result = scoreProgram({ program, contract: makeContract({ tasksCount: 50, expressionsCount: 100 }) }, config);
    // Only structural matters, should be significant
    expect(result.normalizedScore).toBeGreaterThan(30);
  });
});

describe('calibrateHoursPerPoint', () => {
  it('should compute hours per point from known data', () => {
    const data = [
      { programId: 1, actualHours: 2, normalizedScore: 20 },
      { programId: 2, actualHours: 8, normalizedScore: 80 },
    ];
    const hpp = calibrateHoursPerPoint(data);
    // totalHours=10, totalScore=100 → 0.1
    expect(hpp).toBe(0.1);
  });

  it('should return default for empty data', () => {
    expect(calibrateHoursPerPoint([])).toBe(DEFAULT_ESTIMATION_CONFIG.hoursPerPoint);
  });

  it('should return default for zero total score', () => {
    const data = [{ programId: 1, actualHours: 5, normalizedScore: 0 }];
    expect(calibrateHoursPerPoint(data)).toBe(DEFAULT_ESTIMATION_CONFIG.hoursPerPoint);
  });
});
