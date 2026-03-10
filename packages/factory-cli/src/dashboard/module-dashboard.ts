/**
 * Module Dashboard - Display migration progress grouped by functional modules.
 */

import type { FunctionalModule, Tracker } from '../core/types.js';
import type { ProgramMigration, PhaseRecord } from '../migrate/migrate-types.js';
import { readTracker } from '../core/tracker.js';
import { readMigrateTracker } from '../migrate/migrate-tracker.js';
import { loadModules, computeModuleStatus } from '../core/module-mapper.js';
import { formatCoverageBar } from '../core/coverage.js';

/**
 * Get completion stats aggregated by module.
 */
export const getModuleCompletionStats = (
  module: FunctionalModule,
  trackerFile: string,
): { completed: number; total: number; pct: number; weightedPct: number } => {
  const migrateData = readMigrateTracker(trackerFile);
  let totalCompleted = 0;
  let totalTotal = 0;
  let totalWeightedPct = 0;
  let count = 0;

  for (const progId of module.programs) {
    const prog: ProgramMigration | undefined = migrateData[String(progId)];
    if (!prog) continue;

    // Calculate completion stats for this program
    // Using phase weights from migrate-tracker.ts
    const phases = Object.values(prog.phases) as PhaseRecord[];
    const completed = phases.filter((p: PhaseRecord) => p.status === 'completed').length;
    const total = phases.length;

    // Weighted percentage using phase weights
    let weighted = 0;
    for (const [phase, record] of Object.entries(prog.phases)) {
      const phaseRecord = record as PhaseRecord;
      if (phaseRecord.status === 'completed') {
        // Weight from PHASE_WEIGHTS (we'll import this if needed)
        // For now, simple average
        weighted += 100 / total;
      }
    }

    totalCompleted += completed;
    totalTotal += total;
    totalWeightedPct += weighted;
    count++;
  }

  const pct = totalTotal > 0 ? Math.round((totalCompleted / totalTotal) * 100) : 0;
  const weightedPct = count > 0 ? Math.round(totalWeightedPct / count) : 0;

  return { completed: totalCompleted, total: totalTotal, pct, weightedPct };
};

/**
 * Render module-oriented dashboard (text format).
 */
export const renderModuleDashboard = (trackerFile: string): string => {
  const modules = loadModules();
  const tracker = readTracker(trackerFile);

  const lines: string[] = [];
  lines.push('='.repeat(80));
  lines.push('  MIGRATION MODULAIRE - Scénario B (66 programmes, 6 modules)');
  lines.push('='.repeat(80));
  lines.push('');

  // Group by wave
  const byWave = new Map<number, FunctionalModule[]>();
  for (const mod of modules) {
    const wave = mod.wave ?? 0;
    if (!byWave.has(wave)) byWave.set(wave, []);
    byWave.get(wave)!.push(mod);
  }

  // Display by wave
  for (const [wave, mods] of [...byWave.entries()].sort(([a], [b]) => a - b)) {
    lines.push(`VAGUE ${wave}:`);
    for (const mod of mods) {
      const stats = getModuleCompletionStats(mod, trackerFile);
      const bar = formatCoverageBar(stats.weightedPct);
      const status = computeModuleStatus(mod, tracker);

      lines.push(`  ${mod.id.padEnd(25)} ${status.padEnd(12)} ${bar} ${mod.programs.length} progs`);
      lines.push(`    Batches: ${mod.batches.join(', ')}`);
      if (mod.dependencies.length > 0) {
        lines.push(`    Dépend de: ${mod.dependencies.join(', ')}`);
      }
      lines.push(`    Estimé: ${mod.estimatedHours}h | Couverture: ${stats.weightedPct}%`);
    }
    lines.push('');
  }

  // Global stats
  const totalPrograms = modules.reduce((sum, m) => sum + m.programs.length, 0);
  const verifiedModules = modules.filter((m) => computeModuleStatus(m, tracker) === 'verified').length;
  const enrichedModules = modules.filter((m) => computeModuleStatus(m, tracker) === 'enriched').length;
  const pendingModules = modules.filter((m) => computeModuleStatus(m, tracker) === 'pending').length;

  lines.push('GLOBAL:');
  lines.push(`  Total modules: ${modules.length}`);
  lines.push(`  Total programmes: ${totalPrograms}`);
  lines.push(`  Modules verified: ${verifiedModules}`);
  lines.push(`  Modules en cours: ${enrichedModules}`);
  lines.push(`  Modules pending: ${pendingModules}`);
  lines.push('');

  return lines.join('\n');
};
