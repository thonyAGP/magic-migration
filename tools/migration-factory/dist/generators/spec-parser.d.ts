/**
 * Spec Parser: extract structured data from spec Markdown files.
 * Parses rules, tables, callees, and metadata from V3.5+ specs.
 */
import type { ContractRule, ContractTable, ContractCallee, ContractVariable } from '../core/types.js';
export interface ParsedSpec {
    programId: number;
    programName: string;
    tasksCount: number;
    tablesModified: number;
    expressionsCount: number;
    calleesCount: number;
    rules: ContractRule[];
    tables: ContractTable[];
    callees: ContractCallee[];
    variables: ContractVariable[];
}
/**
 * Parse a spec Markdown file into structured contract data.
 */
export declare const parseSpecFile: (filePath: string) => ParsedSpec | null;
export declare const parseSpecContent: (content: string) => ParsedSpec;
