#!/usr/bin/env node
/**
 * Migration Factory CLI
 *
 * Usage:
 *   npx migration-factory graph     --project <dir> [--adapter magic|generic]
 *   npx migration-factory modules   --project <dir>
 *   npx migration-factory dashboard --project <dir>
 *   npx migration-factory plan      --project <dir>
 *   npx migration-factory init      --project <dir> --name <name>
 */

import fs from 'node:fs';
import path from 'node:path';
import type { SpecExtractor, Program, PipelineStatus } from './core/types.js';
import { createMagicAdapter } from './adapters/magic-adapter.js';
import { createGenericAdapter } from './adapters/generic-adapter.js';
import { resolveDependencies } from './calculators/dependency-resolver.js';
import { calculateModules } from './calculators/module-calculator.js';
import { checkReadiness } from './calculators/readiness-checker.js';
import { planBatches } from './calculators/batch-planner.js';
import { calculateDecommission } from './calculators/decommission-calculator.js';
import { getPipelineStatus } from './orchestrator/orchestrator.js';
import { readTracker, createTracker, writeTracker } from './core/tracker.js';
import { renderDashboard } from './dashboard/dashboard.js';
import { renderModuleReadiness } from './dashboard/module-readiness.js';
import { buildReport } from './dashboard/report-builder.js';
import { generateHtmlReport } from './dashboard/html-report.js';

const args = process.argv.slice(2);
const command = args[0];

const getArg = (name: string): string | undefined => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
};

const hasFlag = (name: string): boolean => args.includes(`--${name}`);

const run = async () => {
  const projectDir = getArg('project') ?? process.cwd();
  const migrationDir = path.join(projectDir, '.openspec', 'migration');
  const trackerFile = path.join(migrationDir, 'tracker.json');

  switch (command) {
    case 'init': {
      const name = getArg('name') ?? path.basename(projectDir);
      if (!fs.existsSync(migrationDir)) fs.mkdirSync(migrationDir, { recursive: true });
      if (fs.existsSync(trackerFile)) {
        console.log('Tracker already exists:', trackerFile);
        break;
      }
      const tracker = createTracker(name);
      writeTracker(tracker, trackerFile);
      console.log(`Initialized migration factory for "${name}" at ${migrationDir}`);
      break;
    }

    case 'graph': {
      const adapter = await createAdapterFromArgs(projectDir);
      const graph = await adapter.extractProgramGraph();
      const resolved = resolveDependencies(graph.programs);

      console.log(`Graph analysis complete:`);
      console.log(`  Programs: ${graph.programs.length}`);
      console.log(`  Max level: ${resolved.maxLevel}`);
      console.log(`  SCCs (cycles): ${resolved.multiNodeSccs.length}`);
      for (const scc of resolved.multiNodeSccs) {
        console.log(`    SCC [${scc.members.join(',')}] level ${scc.level}`);
      }
      console.log(`  Levels:`);
      for (const [level, count] of Object.entries(resolved.dependencyGraph.programsByLevel)) {
        console.log(`    Level ${level}: ${count} programs`);
      }
      break;
    }

    case 'modules': {
      const adapter = await createAdapterFromArgs(projectDir);
      const graph = await adapter.extractProgramGraph();
      const resolved = resolveDependencies(graph.programs);
      const shared = new Set(await adapter.getSharedPrograms());

      const statuses = fs.existsSync(trackerFile)
        ? getPipelineStatus({ migrationDir, trackerFile, adapter })
        : new Map<string | number, PipelineStatus>();

      const calcOutput = calculateModules({
        programs: graph.programs,
        adjacency: resolved.adjacency,
        sccs: resolved.sccs,
        levels: resolved.levels,
        programStatuses: statuses,
        sharedPrograms: shared,
        naPrograms: new Set(),
      });

      const report = checkReadiness({
        calculatorOutput: calcOutput,
        totalLive: graph.liveCount,
        programStatuses: statuses,
      });

      console.log(renderModuleReadiness(report));
      break;
    }

    case 'dashboard': {
      if (!fs.existsSync(trackerFile)) {
        console.error('No tracker found. Run `migration-factory init` first.');
        process.exit(1);
      }
      const adapter = await createAdapterFromArgs(projectDir);
      const graph = await adapter.extractProgramGraph();
      const tracker = readTracker(trackerFile);

      console.log(renderDashboard({
        tracker,
        contractsDir: migrationDir,
        programs: graph.programs,
      }));
      break;
    }

    case 'plan': {
      const adapter = await createAdapterFromArgs(projectDir);
      const graph = await adapter.extractProgramGraph();
      const resolved = resolveDependencies(graph.programs);

      const batchPlan = planBatches(
        graph.programs,
        resolved.adjacency,
        resolved.levels,
        resolved.sccs,
      );

      console.log(`Auto-suggested ${batchPlan.totalBatches} batches for ${batchPlan.totalPrograms} programs:\n`);
      for (const batch of batchPlan.suggestedBatches) {
        console.log(`  ${batch.id} - ${batch.name} (${batch.memberCount} progs, level ${batch.level}, ${batch.domain})`);
        console.log(`    Members: ${batch.members.slice(0, 10).join(', ')}${batch.members.length > 10 ? '...' : ''}`);
      }
      break;
    }

    case 'report': {
      const adapter = await createAdapterFromArgs(projectDir);
      const graph = await adapter.extractProgramGraph();
      const resolved = resolveDependencies(graph.programs);
      const shared = new Set(await adapter.getSharedPrograms());

      const statuses = fs.existsSync(trackerFile)
        ? getPipelineStatus({ migrationDir, trackerFile, adapter })
        : new Map<string | number, PipelineStatus>();

      const calcOutput = calculateModules({
        programs: graph.programs,
        adjacency: resolved.adjacency,
        sccs: resolved.sccs,
        levels: resolved.levels,
        programStatuses: statuses,
        sharedPrograms: shared,
        naPrograms: new Set(),
      });

      const readiness = checkReadiness({
        calculatorOutput: calcOutput,
        totalLive: graph.liveCount,
        programStatuses: statuses,
      });

      const decommission = calculateDecommission({
        programs: graph.programs,
        programStatuses: statuses,
        naPrograms: new Set(),
        sharedPrograms: shared,
        sccs: resolved.sccs,
      });

      const tracker = fs.existsSync(trackerFile) ? readTracker(trackerFile) : undefined;
      const projectName = getArg('name') ?? tracker?.methodology ?? path.basename(projectDir);

      const report = buildReport({
        projectName,
        programs: graph.programs,
        programStatuses: statuses,
        sharedPrograms: shared,
        sccs: resolved.sccs,
        maxLevel: resolved.maxLevel,
        modulesOutput: calcOutput,
        readiness,
        decommission,
        tracker,
      });

      const html = generateHtmlReport(report);
      const outFile = getArg('output') ?? path.join(migrationDir, 'migration-report.html');
      const outDir = path.dirname(outFile);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, html, 'utf8');
      console.log(`HTML report generated: ${outFile}`);
      break;
    }

    default:
      console.log('Migration Factory - Reusable SPECMAP migration pipeline\n');
      console.log('Commands:');
      console.log('  init      --project <dir> --name <name>     Initialize migration');
      console.log('  graph     --project <dir>                   Analyze dependency graph');
      console.log('  modules   --project <dir>                   Show deliverable modules');
      console.log('  dashboard --project <dir>                   Show progress dashboard');
      console.log('  plan      --project <dir>                   Auto-suggest batches');
      console.log('  report    --project <dir> [--output file]   Generate HTML dashboard');
      console.log('\nOptions:');
      console.log('  --adapter magic|generic                     Source adapter (default: magic)');
      console.log('  --programs <file>                           Programs file (generic adapter)');
      console.log('  --output <file>                             Output file for report command');
      break;
  }
};

const createAdapterFromArgs = async (projectDir: string): Promise<SpecExtractor> => {
  const adapterType = getArg('adapter') ?? 'magic';

  if (adapterType === 'generic') {
    const programsFile = getArg('programs');
    if (!programsFile) {
      console.error('Generic adapter requires --programs <file>');
      process.exit(1);
    }
    const format = programsFile.endsWith('.csv') ? 'csv' as const : 'json' as const;
    return createGenericAdapter({
      programsFile,
      format,
      seeds: [],
      sharedPrograms: [],
    });
  }

  return createMagicAdapter(projectDir);
};

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
