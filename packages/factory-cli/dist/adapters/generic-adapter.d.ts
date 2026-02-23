/**
 * Generic adapter: imports program graphs from CSV or JSON files.
 * For legacy systems without an automatic parser (COBOL, VB6, Delphi, etc.)
 */
import type { SpecExtractor } from '../core/types.js';
export interface GenericProgramRow {
    id: string | number;
    name: string;
    complexity?: string;
    callees?: string;
    callers?: string;
    domain?: string;
    shared?: boolean;
}
export interface GenericAdapterConfig {
    programsFile: string;
    format: 'json' | 'csv';
    seeds: (string | number)[];
    sharedPrograms: (string | number)[];
}
export declare const createGenericAdapter: (config: GenericAdapterConfig) => SpecExtractor;
