/**
 * Readiness Checker: score + blockers per module.
 * Produces a ReadinessReport with deliverable/close/inProgress/notStarted groups.
 */

import type { DeliverableModule, ReadinessReport, GlobalReadiness, PipelineStatus } from '../core/types.js';
import type { ModuleCalculatorOutput } from './module-calculator.js';

export interface ReadinessInput {
  calculatorOutput: ModuleCalculatorOutput;
  totalLive: number;
  programStatuses: Map<string | number, PipelineStatus>;
}

/**
 * Build a readiness report from module calculator output.
 */
export const checkReadiness = (input: ReadinessInput): ReadinessReport => {
  const { calculatorOutput, totalLive, programStatuses } = input;
  const modules = calculatorOutput.maximalModules;

  const deliverable: DeliverableModule[] = [];
  const close: DeliverableModule[] = [];
  const inProgress: DeliverableModule[] = [];
  const notStarted: DeliverableModule[] = [];

  for (const mod of modules) {
    if (mod.deliverable) {
      deliverable.push(mod);
    } else if (mod.readinessPct >= 80) {
      close.push(mod);
    } else if (mod.readinessPct > 0) {
      inProgress.push(mod);
    } else {
      notStarted.push(mod);
    }
  }

  // Sort each group by readiness DESC (priority-based sort applied at report level)
  close.sort((a, b) => b.readinessPct - a.readinessPct);
  inProgress.sort((a, b) => b.readinessPct - a.readinessPct);

  // Compute global stats
  let contracted = 0, enriched = 0, verified = 0;
  for (const [, status] of programStatuses) {
    switch (status) {
      case 'contracted': contracted++; break;
      case 'enriched': enriched++; break;
      case 'verified': verified++; break;
    }
  }

  const global: GlobalReadiness = {
    totalLive,
    contracted,
    enriched,
    verified,
    modulesDeliverable: deliverable.length,
    modulesTotal: modules.length,
  };

  return { deliverable, close, inProgress, notStarted, global };
};

/**
 * Format a single module's readiness as a summary line.
 */
export const formatModuleSummary = (mod: DeliverableModule): string => {
  const bar = formatMiniBar(mod.readinessPct);
  const blockerSummary = mod.blockers.length > 0
    ? ` - Blockers: ${mod.blockers.slice(0, 3).map(b => String(b.programId)).join(', ')}${mod.blockers.length > 3 ? '...' : ''}`
    : '';
  return `  ${String(mod.root).padStart(4)} ${mod.rootName.padEnd(30).slice(0, 30)} [${mod.memberCount} progs] ${bar}${blockerSummary}`;
};

/**
 * Find the critical path: the sequence of blockers that if resolved
 * would unlock the most modules.
 */
export const findCriticalBlockers = (
  modules: DeliverableModule[],
  limit = 10
): Map<string | number, number> => {
  const blockerImpact = new Map<string | number, number>();

  for (const mod of modules) {
    if (mod.deliverable) continue;
    for (const blocker of mod.blockers) {
      const count = blockerImpact.get(blocker.programId) ?? 0;
      blockerImpact.set(blocker.programId, count + 1);
    }
  }

  // Sort by impact DESC
  const sorted = [...blockerImpact.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return new Map(sorted);
};

const formatMiniBar = (pct: number, width = 10): string => {
  const filled = Math.round(pct / 100 * width);
  const empty = width - filled;
  return `[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${String(pct).padStart(3)}%`;
};
