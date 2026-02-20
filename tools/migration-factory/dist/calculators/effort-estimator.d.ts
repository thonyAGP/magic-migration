/**
 * Project-level effort estimator.
 * Aggregates individual program scores into project estimation.
 */
import type { Program, MigrationContract, PipelineStatus, EstimationConfig, ProjectEstimation } from '../core/types.js';
export interface EstimateProjectInput {
    programs: Program[];
    contracts: Map<string | number, MigrationContract>;
    programStatuses: Map<string | number, PipelineStatus>;
    maxLevel?: number;
    config?: EstimationConfig;
}
export declare const estimateProject: (input: EstimateProjectInput) => ProjectEstimation;
/**
 * Compute remaining hours (programs not yet verified).
 */
export declare const computeRemainingHours: (estimation: ProjectEstimation) => number;
