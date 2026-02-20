/**
 * Auto-Contract Generator: combine spec parsing + codebase scanning
 * to produce a complete MigrationContract.
 */
import type { MigrationContract, PipelineStatus } from '../core/types.js';
export interface AutoContractOptions {
    specFile: string;
    codebaseDir: string;
    projectDir?: string;
    initialStatus?: PipelineStatus;
}
export declare const generateAutoContract: (options: AutoContractOptions) => MigrationContract | null;
