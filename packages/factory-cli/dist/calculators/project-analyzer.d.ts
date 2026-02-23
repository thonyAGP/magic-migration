/**
 * Project Analyzer: orchestrates batch detection from program graph.
 * Detects functional modules, excludes infrastructure, preserves existing batches.
 */
import type { Program, SCC, Tracker, Batch, PipelineStatus, ProjectAnalysis, AnalyzedBatch } from '../core/types.js';
import type { AdjacencyGraph } from '../core/graph.js';
type NodeId = string | number;
export interface AnalyzeProjectInput {
    projectName: string;
    programs: Program[];
    adjacency: AdjacencyGraph;
    levels: Map<NodeId, number>;
    sccs: SCC[];
    maxLevel: number;
    tracker?: Tracker;
    programStatuses?: Map<NodeId, PipelineStatus>;
}
export declare const analyzeProject: (input: AnalyzeProjectInput) => ProjectAnalysis;
/**
 * Convert analyzed batches to Tracker Batch format for persistence.
 */
export declare const analyzedBatchesToTrackerBatches: (analyzed: AnalyzedBatch[]) => Batch[];
export {};
