/**
 * Module Readiness Dashboard: deliverable subtrees and blockers.
 */

import type { ReadinessReport, DeliverableModule } from '../core/types.js';
import { formatModuleSummary, findCriticalBlockers } from '../calculators/readiness-checker.js';

/**
 * Render module readiness as text.
 */
export const renderModuleReadiness = (report: ReadinessReport): string => {
  const lines: string[] = [];
  lines.push('='.repeat(60));
  lines.push('  MODULE READINESS DASHBOARD');
  lines.push('='.repeat(60));
  lines.push('');

  // Deliverable
  lines.push(`DELIVERABLE (100% verified) : ${report.deliverable.length} modules`);
  if (report.deliverable.length === 0) {
    lines.push('  (none yet)');
  } else {
    for (const mod of report.deliverable) {
      lines.push(formatModuleSummary(mod));
    }
  }
  lines.push('');

  // Close
  lines.push(`CLOSE (>= 80%) : ${report.close.length} modules`);
  if (report.close.length === 0) {
    lines.push('  (none)');
  } else {
    for (const mod of report.close) {
      lines.push(formatModuleSummary(mod));
    }
  }
  lines.push('');

  // In progress
  lines.push(`IN PROGRESS (1-79%) : ${report.inProgress.length} modules`);
  for (const mod of report.inProgress.slice(0, 10)) {
    lines.push(formatModuleSummary(mod));
  }
  if (report.inProgress.length > 10) {
    lines.push(`  ... and ${report.inProgress.length - 10} more`);
  }
  lines.push('');

  // Not started
  lines.push(`NOT STARTED : ${report.notStarted.length} modules`);
  lines.push('');

  // Critical blockers
  const allNonDeliverable = [...report.close, ...report.inProgress];
  const criticalBlockers = findCriticalBlockers(allNonDeliverable);
  if (criticalBlockers.size > 0) {
    lines.push('CRITICAL BLOCKERS (resolve these to unlock the most modules):');
    for (const [programId, impactCount] of criticalBlockers) {
      lines.push(`  Program ${String(programId).padStart(4)} -> blocks ${impactCount} modules`);
    }
    lines.push('');
  }

  // Global
  lines.push('GLOBAL:');
  lines.push(`  Live programs:         ${report.global.totalLive}`);
  lines.push(`  Contracted:            ${report.global.contracted}`);
  lines.push(`  Enriched:              ${report.global.enriched}`);
  lines.push(`  Verified:              ${report.global.verified}`);
  lines.push(`  Modules deliverable:   ${report.global.modulesDeliverable} / ${report.global.modulesTotal}`);
  lines.push('');
  lines.push('='.repeat(60));

  return lines.join('\n');
};
