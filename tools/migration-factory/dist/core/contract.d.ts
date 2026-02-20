/**
 * Migration contract I/O: parse, validate, write YAML contracts.
 */
import type { MigrationContract } from './types.js';
export declare const parseContract: (filePath: string) => MigrationContract;
export declare const writeContract: (contract: MigrationContract, filePath: string) => void;
export interface ContractValidation {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare const validateContract: (contract: MigrationContract) => ContractValidation;
export declare const loadContracts: (dir: string, pattern?: RegExp) => Map<string | number, MigrationContract>;
