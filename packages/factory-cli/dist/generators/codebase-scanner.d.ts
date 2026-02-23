/**
 * Codebase Scanner: scan web codebase to find existing implementations.
 * Matches spec items (rules, tables, callees) to source files.
 */
import type { ContractRule, ContractTable, ContractCallee, ContractVariable } from '../core/types.js';
export interface ScanResult {
    rules: ContractRule[];
    tables: ContractTable[];
    callees: ContractCallee[];
    variables: ContractVariable[];
}
export interface ScanOptions {
    codebaseDir: string;
    projectDir?: string;
}
export declare const scanCodebase: (rules: ContractRule[], tables: ContractTable[], callees: ContractCallee[], variables: ContractVariable[], options: ScanOptions) => ScanResult;
