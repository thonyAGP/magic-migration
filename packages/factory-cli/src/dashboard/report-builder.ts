/**
 * Report Builder: assembles all data into a FullMigrationReport
 * for consumption by the HTML dashboard generator.
 */

import type {
  Program, PipelineStatus, SCC, Tracker, Batch,
  FullMigrationReport, ModuleSummary, ProgramSummary, BatchSummary,
  ModuleDependency, MigrationWave, ModuleSCC,
  MultiProjectReport, GlobalSummary, ProjectEntry, ProjectStatus,
  MigrationContract, ProgramEstimation,
} from '../core/types.js';
import type { ModuleCalculatorOutput } from '../calculators/module-calculator.js';
import type { ReadinessReport } from '../core/types.js';
import type { DecommissionResult } from '../core/types.js';
import { computeModulePriority } from '../calculators/priority-calculator.js';
import { estimateProject, computeRemainingHours } from '../calculators/effort-estimator.js';
import { scoreProgram, DEFAULT_ESTIMATION_CONFIG } from '../calculators/complexity-scorer.js';
import { inferDomain } from '../calculators/batch-planner.js';

export interface ReportInput {
  projectName: string;
  programs: Program[];
  programStatuses: Map<string | number, PipelineStatus>;
  sharedPrograms: Set<string | number>;
  sccs: SCC[];
  maxLevel: number;
  modulesOutput: ModuleCalculatorOutput;
  readiness: ReadinessReport;
  decommission: DecommissionResult;
  tracker?: Tracker;
  contracts?: Map<string | number, MigrationContract>;
}

export const buildReport = (input: ReportInput): FullMigrationReport => {
  const {
    projectName, programs, programStatuses, sharedPrograms,
    sccs, maxLevel, modulesOutput, readiness, decommission, tracker,
  } = input;

  const decommissionSet = new Set(decommission.decommissionable.map(d => d.id));

  // Pipeline counts
  let pending = 0, contracted = 0, enriched = 0, verified = 0;
  for (const p of programs) {
    const status = programStatuses.get(p.id) ?? 'pending';
    switch (status) {
      case 'verified': verified++; break;
      case 'enriched': enriched++; break;
      case 'contracted': contracted++; break;
      default: pending++;
    }
  }

  // Modules: use tracker batches as functional modules when available
  const trackerBatches = tracker?.batches ?? [];
  const useBatchesAsModules = trackerBatches.length > 0;

  let moduleList: ModuleSummary[];

  if (useBatchesAsModules) {
    moduleList = buildModulesFromBatches(trackerBatches, programStatuses);
  } else {
    // Fallback: compute from maximal modules (old behavior)
    const priorityResult = computeModulePriority({
      modules: modulesOutput.maximalModules,
    });
    const priorityMap = new Map(
      priorityResult.prioritizedModules.map(p => [p.root, p])
    );

    moduleList = modulesOutput.maximalModules
      .sort((a, b) => {
        const rankA = priorityMap.get(a.root)?.rank ?? 999;
        const rankB = priorityMap.get(b.root)?.rank ?? 999;
        return rankA - rankB;
      })
      .map(m => {
        const priority = priorityMap.get(m.root);
        return {
          root: m.root,
          rootName: m.rootName,
          memberCount: m.memberCount,
          readinessPct: m.readinessPct,
          verified: m.verified,
          enriched: m.enriched,
          contracted: m.contracted,
          pending: m.pending,
          deliverable: m.deliverable,
          blockerIds: m.blockers.map(b => b.programId),
          rank: priority?.rank,
          priorityScore: priority?.priorityScore,
          dependsOn: priority?.dependsOn,
          dependedBy: priority?.dependedBy,
          moduleLevel: priority?.moduleLevel,
          implementationOrder: priority?.implementationOrder,
        };
      });
  }

  // Recompute priority from old modules for sequence/dependencies
  const priorityResult = computeModulePriority({
    modules: modulesOutput.maximalModules,
  });

  // Batch summaries
  const batches: BatchSummary[] = (tracker?.batches ?? []).map(b => ({
    id: b.id,
    name: b.name,
    programs: b.programs,
    status: b.status,
    coveragePct: b.stats.coverageAvgFrontend,
    ...(b.stats.tokenStats ? { tokenStats: b.stats.tokenStats } : {}),
  }));

  // Aggregate cumulative token stats across all batches
  const cumulativeTokens = batches.reduce((acc, b) => {
    if (b.tokenStats) {
      acc.input += b.tokenStats.input;
      acc.output += b.tokenStats.output;
      acc.costUsd += b.tokenStats.costUsd;
    }
    return acc;
  }, { input: 0, output: 0, costUsd: 0 });
  const hasTokenStats = cumulativeTokens.input > 0 || cumulativeTokens.output > 0;

  // Estimation: score each program
  const estimation = estimateProject({
    programs,
    contracts: input.contracts ?? new Map(),
    programStatuses,
    maxLevel,
  });

  // Build a quick lookup for scores
  const scoreMap = new Map(estimation.programs.map(e => [e.id, e]));

  // Program list
  const programList: ProgramSummary[] = programs
    .sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
    .map(p => {
      const est = scoreMap.get(p.id);
      return {
        id: p.id,
        name: p.name,
        level: p.level ?? 0,
        status: programStatuses.get(p.id) ?? 'pending' as PipelineStatus,
        decommissionable: decommissionSet.has(p.id),
        shared: sharedPrograms.has(p.id),
        domain: p.domain ?? '',
        complexityScore: est?.score.normalizedScore,
        complexityGrade: est?.score.grade,
        estimatedHours: est?.score.estimatedHours,
      };
    });

  const remaining = computeRemainingHours(estimation);

  return {
    generated: new Date().toISOString(),
    projectName,
    graph: {
      totalPrograms: programs.length + (tracker?.stats.orphanPrograms ?? 0),
      livePrograms: programs.length,
      orphanPrograms: tracker?.stats.orphanPrograms ?? 0,
      sharedPrograms: sharedPrograms.size,
      maxLevel,
      sccCount: sccs.filter(s => s.members.length > 1).length,
    },
    pipeline: { pending, contracted, enriched, verified },
    modules: {
      total: moduleList.length,
      deliverable: moduleList.filter(m => m.deliverable).length,
      close: moduleList.filter(m => !m.deliverable && m.readinessPct >= 50).length,
      inProgress: moduleList.filter(m => !m.deliverable && m.readinessPct > 0 && m.readinessPct < 50).length,
      notStarted: moduleList.filter(m => m.readinessPct === 0).length,
      list: moduleList,
    },
    decommission: decommission.stats,
    batches,
    programs: programList,
    priority: {
      moduleDependencies: priorityResult.moduleDependencies,
      migrationSequence: priorityResult.migrationSequence,
      moduleSCCs: priorityResult.moduleSCCs,
    },
    estimation: {
      totalEstimatedHours: estimation.totalEstimatedHours,
      remainingHours: remaining,
      avgScore: estimation.avgComplexityScore,
      gradeDistribution: estimation.gradeDistribution,
      top10: estimation.programs.slice(0, 10),
    },
    ...(hasTokenStats ? { tokenStats: cumulativeTokens } : {}),
  };
};

// ─── Build modules from tracker batches ──────────────────────────

export const buildModulesFromBatches = (
  batches: Batch[],
  programStatuses: Map<string | number, PipelineStatus>,
): ModuleSummary[] =>
  batches.map((b, i) => {
    let vCount = 0, eCount = 0, cCount = 0, pCount = 0;
    for (const pid of b.priorityOrder) {
      const status = programStatuses.get(pid) ?? 'pending';
      switch (status) {
        case 'verified': vCount++; break;
        case 'enriched': eCount++; break;
        case 'contracted': cCount++; break;
        default: pCount++;
      }
    }
    const total = b.priorityOrder.length || 1;
    const readinessPct = Math.round((vCount / total) * 100);
    const deliverable = vCount === total && total > 0;

    return {
      root: b.root,
      rootName: b.name,
      memberCount: b.priorityOrder.length,
      readinessPct,
      verified: vCount,
      enriched: eCount,
      contracted: cCount,
      pending: pCount,
      deliverable,
      blockerIds: [],
      rank: i + 1,
      batchId: b.id,
      domain: b.domain ?? inferDomain(b.name),
      complexityGrade: b.complexityGrade,
      estimatedHours: b.estimatedHours,
    };
  });

// ─── Multi-Project Report ────────────────────────────────────────

export interface MultiProjectInput {
  projects: {
    name: string;
    reportInput?: ReportInput;
    programCount?: number;
    description?: string;
  }[];
}

export const buildMultiProjectReport = (input: MultiProjectInput): MultiProjectReport => {
  const entries: ProjectEntry[] = input.projects.map(p => {
    if (p.reportInput) {
      const report = buildReport(p.reportInput);
      return {
        name: p.name,
        status: 'active' as ProjectStatus,
        programCount: report.graph.livePrograms,
        description: p.description ?? '',
        report,
      };
    }
    return {
      name: p.name,
      status: 'not-started' as ProjectStatus,
      programCount: p.programCount ?? 0,
      description: p.description ?? '',
      report: null,
    };
  });

  const activeReports = entries.filter(e => e.report).map(e => e.report!);

  const global: GlobalSummary = {
    totalProjects: entries.length,
    activeProjects: activeReports.length,
    totalLivePrograms: activeReports.reduce((s, r) => s + r.graph.livePrograms, 0),
    totalVerified: activeReports.reduce((s, r) => s + r.pipeline.verified, 0),
    totalEnriched: activeReports.reduce((s, r) => s + r.pipeline.enriched, 0),
    totalContracted: activeReports.reduce((s, r) => s + r.pipeline.contracted, 0),
    totalPending: activeReports.reduce((s, r) => s + r.pipeline.pending, 0),
    overallProgressPct: (() => {
      const total = activeReports.reduce((s, r) => s + r.graph.livePrograms, 0);
      const migrated = activeReports.reduce((s, r) => s + r.pipeline.verified, 0);
      return total > 0 ? Math.round(migrated / total * 100) : 0;
    })(),
  };

  return { generated: new Date().toISOString(), global, projects: entries };
};
