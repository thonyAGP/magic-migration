/**
 * Codegen intermediate model: decouples contract shape from code generation.
 * Contract YAML → parseContract() → MigrationContract → buildCodegenModel() → CodegenModel → generators
 */
import type { MigrationContract } from '../../core/types.js';
import type { EnrichmentData } from './enrich-model.js';
export interface CodegenEntity {
    name: string;
    interfaceName: string;
    fields: CodegenField[];
    mode: 'R' | 'W' | 'RW';
}
export interface CodegenField {
    name: string;
    type: string;
    source: 'state' | 'prop' | 'computed' | 'table';
    description: string;
    localId?: string;
}
export interface CodegenAction {
    id: string;
    handlerName: string;
    description: string;
    condition: string;
    variables: string[];
}
export interface CodegenApiCall {
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    calleeId: string | number;
    calleeName: string;
}
export interface CodegenModel {
    programId: string | number;
    programName: string;
    domain: string;
    domainPascal: string;
    entities: CodegenEntity[];
    actions: CodegenAction[];
    apiCalls: CodegenApiCall[];
    stateFields: CodegenField[];
    enrichments?: EnrichmentData;
}
export interface GeneratedFile {
    relativePath: string;
    content: string;
    skipped: boolean;
}
export interface CodegenResult {
    programId: string | number;
    programName: string;
    files: GeneratedFile[];
    written: number;
    skipped: number;
}
export interface CodegenConfig {
    outputDir: string;
    dryRun: boolean;
    overwrite: boolean;
}
export declare const buildCodegenModel: (contract: MigrationContract) => CodegenModel;
