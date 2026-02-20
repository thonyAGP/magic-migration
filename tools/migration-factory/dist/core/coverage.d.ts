/**
 * Coverage calculation for migration contracts.
 * Formula: (impl + partial * 0.5) / (total - na) * 100
 */
import type { MigrationContract } from './types.js';
export interface CoverageBreakdown {
    impl: number;
    partial: number;
    missing: number;
    na: number;
    total: number;
    coveragePct: number;
}
export declare const computeRulesCoverage: (contract: MigrationContract) => CoverageBreakdown;
export declare const computeVariablesCoverage: (contract: MigrationContract) => CoverageBreakdown;
export declare const computeTablesCoverage: (contract: MigrationContract) => CoverageBreakdown;
export declare const computeCalleesCoverage: (contract: MigrationContract) => CoverageBreakdown;
export declare const computeOverallCoverage: (contract: MigrationContract) => number;
export declare const formatCoverageBar: (pct: number, width?: number) => string;
