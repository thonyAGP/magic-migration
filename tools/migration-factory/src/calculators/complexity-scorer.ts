/**
 * Multi-factor complexity scorer for migration programs.
 * Produces a normalized 0-100 score with letter grade and effort estimate.
 */

import type {
  ComplexityFactors, ComplexityScore, ComplexityGrade, EstimationConfig,
  Program, MigrationContract,
} from '../core/types.js';

// ─── Normalization ceilings (calibrated from ADH project) ────────

const MAX_STRUCTURAL = 200;   // tasks × 0.3 + expressions × 0.7
const MAX_DATA = 30;          // tables weighted by access mode
const MAX_INTEGRATION = 40;   // callees × 2 + callers × 1
const MAX_UI = 5;             // forms count from spec

// ─── Default config ──────────────────────────────────────────────

export const DEFAULT_ESTIMATION_CONFIG: EstimationConfig = {
  weights: {
    structural: 0.30,
    dataAccess: 0.25,
    integration: 0.20,
    depth: 0.10,
    uiComplexity: 0.15,
  },
  hoursPerPoint: 0.15,
  calibrationSource: 'default',
};

// ─── Grade thresholds ────────────────────────────────────────────

const gradeFromScore = (score: number): ComplexityGrade => {
  if (score >= 80) return 'S';
  if (score >= 60) return 'A';
  if (score >= 40) return 'B';
  if (score >= 20) return 'C';
  return 'D';
};

// ─── Confidence from data availability ───────────────────────────

const computeConfidence = (
  hasContract: boolean,
  hasSpec: boolean,
): 'high' | 'medium' | 'low' => {
  if (hasContract && hasSpec) return 'high';
  if (hasContract || hasSpec) return 'medium';
  return 'low';
};

// ─── Core scoring ────────────────────────────────────────────────

export interface ScoreProgramInput {
  program: Program;
  contract?: MigrationContract;
  formsCount?: number;
  maxLevel?: number;
}

export const scoreProgram = (
  input: ScoreProgramInput,
  config: EstimationConfig = DEFAULT_ESTIMATION_CONFIG,
): ComplexityScore => {
  const { program, contract, formsCount = 0, maxLevel = 8 } = input;
  const { weights, hoursPerPoint } = config;

  const tasksCount = contract?.program.tasksCount ?? 1;
  const expressionsCount = contract?.program.expressionsCount ?? 0;
  const calleesCount = program.callees.length;
  const callersCount = program.callers.length;

  // Count tables by access mode (from contract if available)
  let tablesR = 0, tablesW = 0, tablesRW = 0;
  if (contract) {
    for (const t of contract.tables) {
      if (t.mode === 'RW') tablesRW++;
      else if (t.mode === 'W') tablesW++;
      else tablesR++;
    }
  } else {
    tablesR = program.callees.length > 0 ? 2 : 1;
  }

  // Compute raw factors (0-1 each, clamped)
  const structural = Math.min((tasksCount * 0.3 + expressionsCount * 0.7) / MAX_STRUCTURAL, 1);
  const dataAccess = Math.min((tablesR * 1 + tablesW * 3 + tablesRW * 2) / MAX_DATA, 1);
  const integration = Math.min((calleesCount * 2 + callersCount * 1) / MAX_INTEGRATION, 1);
  const depth = maxLevel > 0 ? Math.min(program.level / maxLevel, 1) : 0;
  const uiComplexity = Math.min(formsCount / MAX_UI, 1);

  const factors: ComplexityFactors = {
    structural,
    dataAccess,
    integration,
    depth,
    uiComplexity,
  };

  // Weighted sum → normalized 0-100
  const rawScore =
    factors.structural * weights.structural +
    factors.dataAccess * weights.dataAccess +
    factors.integration * weights.integration +
    factors.depth * weights.depth +
    factors.uiComplexity * weights.uiComplexity;

  const normalizedScore = Math.round(rawScore * 100);
  const grade = gradeFromScore(normalizedScore);
  const estimatedHours = Math.round(normalizedScore * hoursPerPoint * 10) / 10;

  const hasContract = !!contract;
  const hasSpec = formsCount > 0 || (contract?.program.expressionsCount ?? 0) > 0;
  const confidence = computeConfidence(hasContract, hasSpec);

  return {
    factors,
    rawScore,
    normalizedScore,
    grade,
    estimatedHours,
    confidence,
  };
};

// ─── Calibrate hoursPerPoint from known data ─────────────────────

export interface CalibrationData {
  programId: string | number;
  actualHours: number;
  normalizedScore: number;
}

export const calibrateHoursPerPoint = (data: CalibrationData[]): number => {
  if (data.length === 0) return DEFAULT_ESTIMATION_CONFIG.hoursPerPoint;

  const totalScore = data.reduce((sum, d) => sum + d.normalizedScore, 0);
  const totalHours = data.reduce((sum, d) => sum + d.actualHours, 0);

  if (totalScore === 0) return DEFAULT_ESTIMATION_CONFIG.hoursPerPoint;
  return Math.round((totalHours / totalScore) * 100) / 100;
};
