/**
 * Report Builder: assembles all data into a FullMigrationReport
 * for consumption by the HTML dashboard generator.
 */

import type {
  Program, PipelineStatus, SCC, Tracker,
  FullMigrationReport, ModuleSummary, ProgramSummary, BatchSummary,
} from '../core/types.js';
import type { ModuleCalculatorOutput } from '../calculators/module-calculator.js';
import type { ReadinessReport } from '../core/types.js';
import type { DecommissionResult } from '../core/types.js';

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

  // Module summaries from maximal modules
  const moduleList: ModuleSummary[] = modulesOutput.maximalModules
    .sort((a, b) => b.readinessPct - a.readinessPct)
    .map(m => ({
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
    }));

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
  };
};
