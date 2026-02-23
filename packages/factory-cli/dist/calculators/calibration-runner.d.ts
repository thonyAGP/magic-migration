/**
 * Calibration Runner: connects effort tracking data to the calibration formula.
 * Reads verified contracts, computes actual hours, and calibrates hoursPerPoint.
 */
import type { PipelineConfig } from '../core/types.js';
export interface CalibrationResult {
    dataPoints: number;
    previousHpp: number;
    calibratedHpp: number;
    totalEstimated: number;
    totalActual: number;
    accuracyPct: number;
    details: {
        programId: string;
        score: number;
        estimated: number;
        actual: number;
    }[];
}
export declare const runCalibration: (config: PipelineConfig, dryRun?: boolean) => CalibrationResult;
