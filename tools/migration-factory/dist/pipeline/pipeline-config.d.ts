/**
 * Pipeline configuration: resolve defaults + user overrides.
 */
import type { PipelineConfig } from '../core/types.js';
export interface PipelineConfigInput {
    projectDir: string;
    dir?: string;
    dryRun?: boolean;
    noContract?: boolean;
    noVerify?: boolean;
    report?: boolean;
    enrich?: string;
    model?: string;
}
export declare const resolvePipelineConfig: (input: PipelineConfigInput) => PipelineConfig;
