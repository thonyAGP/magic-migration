/**
 * Project Analyzer: orchestrates batch detection from program graph.
 * Detects functional modules, excludes infrastructure, preserves existing batches.
 */

import type {
  Program, SCC, Tracker, Batch, PipelineStatus,
  ProjectAnalysis, AnalyzedBatch, ComplexityGrade,
} from '../core/types.js';
import type { AdjacencyGraph } from '../core/graph.js';
import { planBatchesWithExclusions, inferDomain } from './batch-planner.js';
import { scoreProgram, DEFAULT_ESTIMATION_CONFIG } from './complexity-scorer.js';

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

const gradeFromAvgScore = (avg: number): ComplexityGrade => {
  if (avg >= 80) return 'S';
  if (avg >= 60) return 'A';
  if (avg >= 40) return 'B';
  if (avg >= 20) return 'C';
  return 'D';
};

export const analyzeProject = (input: AnalyzeProjectInput): ProjectAnalysis => {
  const { projectName, programs, adjacency, levels, sccs, maxLevel, tracker } = input;
  const programMap = new Map(programs.map(p => [p.id, p]));

  // 1. Collect programs already in existing batches
  const existingBatches = tracker?.batches ?? [];
  const existingBatchPrograms = new Set<NodeId>();
  for (const batch of existingBatches) {
    for (const pid of batch.priorityOrder) {
      existingBatchPrograms.add(pid);
    }
    // Also add root
    existingBatchPrograms.add(batch.root);
  }

  // Find next batch number
  const existingNumbers = existingBatches
    .map(b => {
      const match = b.id.match(/^B(\d+)$/);
      return match ? Number(match[1]) : 0;
    });
  const startBatchNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

  // 2. Run enhanced planner on non-assigned programs
  const plan = planBatchesWithExclusions(programs, adjacency, levels, sccs, {
    existingBatchPrograms,
    excludeInfrastructure: true,
    startBatchNumber,
    minBatchSize: 3,
    maxBatchSize: 25,
  });

  // 3. Build analyzed batches - existing ones first
  const analyzedBatches: AnalyzedBatch[] = [];

  for (const batch of existingBatches) {
    const members = batch.priorityOrder;
    const scores = members
      .map(pid => {
        const prog = programMap.get(pid);
        if (!prog) return null;
        return scoreProgram({ program: prog, maxLevel }, DEFAULT_ESTIMATION_CONFIG);
      })
      .filter((s): s is NonNullable<typeof s> => s != null);

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.normalizedScore, 0) / scores.length)
      : 0;
    const totalHours = scores.reduce((sum, s) => sum + s.estimatedHours, 0);
    const grade = gradeFromAvgScore(avgScore);

    analyzedBatches.push({
      id: batch.id,
      name: batch.name,
      domain: batch.domain ?? inferDomain(batch.name),
      members,
      memberCount: members.length,
      root: batch.root,
      complexityGrade: grade,
      estimatedHours: Math.round(totalHours * 10) / 10,
      isNew: false,
    });
  }

  // New batches from planner
  for (const suggested of plan.suggestedBatches) {
    const scores = suggested.members
      .map(pid => {
        const prog = programMap.get(pid);
        if (!prog) return null;
        return scoreProgram({ program: prog, maxLevel }, DEFAULT_ESTIMATION_CONFIG);
      })
      .filter((s): s is NonNullable<typeof s> => s != null);

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.normalizedScore, 0) / scores.length)
      : 0;
    const totalHours = scores.reduce((sum, s) => sum + s.estimatedHours, 0);
    const grade = gradeFromAvgScore(avgScore);

    analyzedBatches.push({
      id: suggested.id,
      name: suggested.name,
      domain: suggested.domain,
      members: suggested.members,
      memberCount: suggested.memberCount,
      root: suggested.root,
      complexityGrade: grade,
      estimatedHours: Math.round(totalHours * 10) / 10,
      isNew: true,
    });
  }

  // Count unassigned (programs not in any batch)
  const allAssigned = new Set<NodeId>();
  for (const b of analyzedBatches) {
    for (const m of b.members) allAssigned.add(m);
  }
  const unassignedCount = programs.filter(p => !allAssigned.has(p.id)).length;

  return {
    projectName,
    analyzedAt: new Date().toISOString(),
    totalLivePrograms: programs.length,
    batchesCreated: plan.suggestedBatches.length,
    batchesPreserved: existingBatches.length,
    batches: analyzedBatches,
    unassignedCount,
  };
};

/**
 * Convert analyzed batches to Tracker Batch format for persistence.
 */
export const analyzedBatchesToTrackerBatches = (analyzed: AnalyzedBatch[]): Batch[] =>
  analyzed.filter(a => a.isNew).map(a => ({
    id: a.id,
    name: a.name,
    root: a.root,
    programs: a.memberCount,
    status: 'pending' as PipelineStatus,
    stats: {
      backendNa: 0,
      frontendEnrich: 0,
      fullyImpl: 0,
      coverageAvgFrontend: 0,
      totalPartial: 0,
      totalMissing: 0,
    },
    priorityOrder: a.members,
    domain: a.domain,
    complexityGrade: a.complexityGrade,
    estimatedHours: a.estimatedHours,
    autoDetected: true,
  }));
