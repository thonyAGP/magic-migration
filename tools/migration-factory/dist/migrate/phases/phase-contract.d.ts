/**
 * Phase 1: CONTRACT - Generate migration contract from spec.
 * Wraps the existing generateAutoContract() function.
 */
import type { MigrateConfig } from '../migrate-types.js';
export interface ContractResult {
    contractFile: string;
    skipped: boolean;
    duration: number;
}
export declare const runContractPhase: (programId: string | number, config: MigrateConfig) => ContractResult;
