/**
 * Multi-factor complexity scorer for migration programs.
 * Produces a normalized 0-100 score with letter grade and effort estimate.
 */
import type { ComplexityScore, EstimationConfig, Program, MigrationContract } from '../core/types.js';
export declare const DEFAULT_ESTIMATION_CONFIG: EstimationConfig;
export interface ScoreProgramInput {
    program: Program;
    contract?: MigrationContract;
    formsCount?: number;
    maxLevel?: number;
}
export declare const scoreProgram: (input: ScoreProgramInput, config?: EstimationConfig) => ComplexityScore;
export interface CalibrationData {
    programId: string | number;
    actualHours: number;
    normalizedScore: number;
}
export declare const calibrateHoursPerPoint: (data: CalibrationData[]) => number;
