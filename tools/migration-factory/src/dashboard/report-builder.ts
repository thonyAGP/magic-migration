/**
 * Report Builder: assembles all data into a FullMigrationReport
 * for consumption by the HTML dashboard generator.
 */

import type {
  Program, PipelineStatus, SCC, Tracker,
  FullMigrationReport, ModuleSummary, ProgramSummary, BatchSummary,
  ModuleDependency, MigrationWave, ModuleSCC,
  MultiProjectReport, GlobalSummary, ProjectEntry, ProjectStatus,
} from '../core/types.js';
import type { ModuleCalculatorOutput } from '../calculators/module-calculator.js';
import type { ReadinessReport } from '../core/types.js';
import type { DecommissionResult } from '../core/types.js';
import { computeModulePriority } from '../calculators/priority-calculator.js';

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

  // Compute module priority
  const priorityResult = computeModulePriority({
    modules: modulesOutput.maximalModules,
  });
  const priorityMap = new Map(
    priorityResult.prioritizedModules.map(p => [p.root, p])
  );

  // Module summaries from maximal modules, sorted by priority rank ASC
  const moduleList: ModuleSummary[] = modulesOutput.maximalModules
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

  // Batch summaries
  const batches: BatchSummary[] = (tracker?.batches ?? []).map(b => ({
    id: b.id,
    name: b.name,
    programs: b.programs,
    status: b.status,
    coveragePct: b.stats.coverageAvgFrontend,
  }));

  // Program list
  const programList: ProgramSummary[] = programs
    .sort((a, b) => (b.level ?? 0) - (a.level ?? 0))
    .map(p => ({
      id: p.id,
      name: p.name,
      level: p.level ?? 0,
      status: programStatuses.get(p.id) ?? 'pending' as PipelineStatus,
      decommissionable: decommissionSet.has(p.id),
      shared: sharedPrograms.has(p.id),
      domain: p.domain ?? '',
    }));

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
      total: modulesOutput.maximalModules.length,
      deliverable: readiness.deliverable.length,
      close: readiness.close.length,
      inProgress: readiness.inProgress.length,
      notStarted: readiness.notStarted.length,
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
  };
};

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
      const verified = activeReports.reduce((s, r) => s + r.pipeline.verified, 0);
      return total > 0 ? Math.round(verified / total * 100) : 0;
    })(),
  };

  return { generated: new Date().toISOString(), global, projects: entries };
};
