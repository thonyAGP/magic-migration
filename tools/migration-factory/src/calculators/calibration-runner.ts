/**
 * Calibration Runner: connects effort tracking data to the calibration formula.
 * Reads verified contracts, computes actual hours, and calibrates hoursPerPoint.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { PipelineConfig } from '../core/types.js';
import { PipelineStatus } from '../core/types.js';
import { loadContracts } from '../core/contract.js';
import { computeActualHours } from './effort-tracker.js';
import { calibrateHoursPerPoint, DEFAULT_ESTIMATION_CONFIG } from './complexity-scorer.js';
import type { CalibrationData } from './complexity-scorer.js';
import { readTracker, writeTracker } from '../core/tracker.js';

export interface CalibrationResult {
  dataPoints: number;
  previousHpp: number;
  calibratedHpp: number;
  totalEstimated: number;
  totalActual: number;
  accuracyPct: number;
  details: { programId: string; score: number; estimated: number; actual: number }[];
}

export const runCalibration = (config: PipelineConfig, dryRun = false): CalibrationResult => {
  const contractDir = path.join(config.migrationDir, config.contractSubDir);
  const contracts = loadContracts(contractDir);

  const previousHpp = DEFAULT_ESTIMATION_CONFIG.hoursPerPoint;
  const dataPoints: CalibrationData[] = [];
  const details: CalibrationResult['details'] = [];
  let totalEstimated = 0;
  let totalActual = 0;

  for (const [id, contract] of contracts) {
    if (contract.overall.status !== PipelineStatus.VERIFIED) continue;

    const effort = contract.overall.effort;
    if (!effort) continue;

    const actual = computeActualHours(effort);
    if (actual === null) continue;

    const estimated = effort.estimatedHours ?? 0;
    const score = contract.overall.coveragePct > 0 ? contract.overall.coveragePct : 50;

    dataPoints.push({ programId: String(id), actualHours: actual, normalizedScore: score });
    details.push({ programId: String(id), score, estimated, actual });
    totalEstimated += estimated;
    totalActual += actual;
  }

  const calibratedHpp = calibrateHoursPerPoint(dataPoints);
  const accuracyPct = totalEstimated > 0
    ? Math.round((totalActual / totalEstimated) * 100)
    : 0;

  if (!dryRun && dataPoints.length > 0 && fs.existsSync(config.trackerFile)) {
    const tracker = readTracker(config.trackerFile);
    tracker.calibration = {
      hoursPerPoint: calibratedHpp,
      dataPoints: dataPoints.length,
      calibratedAt: new Date().toISOString(),
      accuracy: accuracyPct,
    };
    writeTracker(tracker, config.trackerFile);
  }

  return {
    dataPoints: dataPoints.length,
    previousHpp,
    calibratedHpp,
    totalEstimated,
    totalActual,
    accuracyPct,
    details,
  };
};
