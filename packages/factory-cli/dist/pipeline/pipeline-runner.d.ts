/**
 * Pipeline Runner v4: orchestrates the full batch pipeline with optional Claude enrichment.
 *
 * pipeline run --batch B2                    → auto-contract → gap-analysis → auto-verify → tracker-sync
 * pipeline run --batch B2 --enrich claude    → + Claude API enrichment for gaps
 */
import type { PipelineConfig, PipelineRunResult, PreflightResult, BatchStatusView } from '../core/types.js';
export declare const preflightBatch: (batchId: string, config: PipelineConfig) => PreflightResult;
export declare const runBatchPipeline: (batchId: string, config: PipelineConfig) => Promise<PipelineRunResult>;
export declare const getBatchesStatus: (config: PipelineConfig) => BatchStatusView[];
