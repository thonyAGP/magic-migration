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
    /** Override programId (fallback when spec header parsing returns 0). */
    programId?: number | string;
}
export declare const generateAutoContract: (options: AutoContractOptions) => MigrationContract | null;
