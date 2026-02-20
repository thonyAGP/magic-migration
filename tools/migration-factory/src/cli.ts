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
import type { SpecExtractor, Program } from './core/types.js';
import { PipelineStatus } from './core/types.js';
import { createMagicAdapter, type MagicAdapterConfig } from './adapters/magic-adapter.js';
import { createGenericAdapter } from './adapters/generic-adapter.js';
import { resolveDependencies } from './calculators/dependency-resolver.js';
import { calculateModules } from './calculators/module-calculator.js';
import { checkReadiness } from './calculators/readiness-checker.js';
import { planBatches } from './calculators/batch-planner.js';
import { calculateDecommission } from './calculators/decommission-calculator.js';
import { getPipelineStatus } from './orchestrator/orchestrator.js';
import { readTracker, createTracker, writeTracker } from './core/tracker.js';
import { parseContract, writeContract, loadContracts } from './core/contract.js';
import { canTransition } from './core/pipeline.js';
import { renderDashboard } from './dashboard/dashboard.js';
import { renderModuleReadiness } from './dashboard/module-readiness.js';
import { buildReport, buildMultiProjectReport } from './dashboard/report-builder.js';
import { generateHtmlReport, generateMultiProjectHtmlReport } from './dashboard/html-report.js';
import { estimateProject } from './calculators/effort-estimator.js';
import { trackStatusChange } from './calculators/effort-tracker.js';
import { generateAutoContract } from './generators/auto-contract.js';
import { resolvePipelineConfig } from './pipeline/pipeline-config.js';
import { preflightBatch, runBatchPipeline, getBatchesStatus } from './pipeline/pipeline-runner.js';
import { formatCoverageBar } from './core/coverage.js';
import { discoverProjects, readProjectRegistry, resolveCodebaseDir } from './dashboard/project-discovery.js';
import { computeGapReport } from './server/gap-report.js';
import { runCalibration } from './calculators/calibration-runner.js';
import { runCodegen } from './generators/codegen/codegen-runner.js';

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
      const isMulti = hasFlag('multi');

      if (isMulti) {
        // Multi-project mode: auto-discover active projects + read registry for all known
        const activeProjects = discoverProjects(migrationDir);
        const registry = readProjectRegistry(migrationDir);

        const projectInputs: { name: string; reportInput?: Parameters<typeof buildReport>[0]; programCount?: number; description?: string }[] = [];

        // Build full reports for active projects (those with live-programs.json)
        for (const projName of activeProjects) {
          const projMigDir = path.join(migrationDir, projName);
          const projLiveFile = path.join(projMigDir, 'live-programs.json');
          const projTrackerFile = path.join(projMigDir, 'tracker.json');

          const projAdapter = createMagicAdapter(projectDir, {
            migrationDir: projMigDir,
            liveProgramsFile: projLiveFile,
            contractPattern: new RegExp(`${projName}-IDE-.*\\.contract\\.yaml$`),
          });
          const graph = await projAdapter.extractProgramGraph();
          const resolved = resolveDependencies(graph.programs);
          const shared = new Set(await projAdapter.getSharedPrograms());
          const statuses = fs.existsSync(projTrackerFile)
            ? getPipelineStatus({ migrationDir: projMigDir, trackerFile: projTrackerFile, adapter: projAdapter })
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

          const readinessReport = checkReadiness({
            calculatorOutput: calcOutput,
            totalLive: graph.liveCount,
            programStatuses: statuses,
          });

          const decommResult = calculateDecommission({
            programs: graph.programs,
            programStatuses: statuses,
            naPrograms: new Set(),
            sharedPrograms: shared,
            sccs: resolved.sccs,
          });

          const projTracker = fs.existsSync(projTrackerFile) ? readTracker(projTrackerFile) : undefined;
          const regEntry = registry.find(r => r.name === projName);

          projectInputs.push({
            name: projName,
            description: regEntry?.description ?? '',
            reportInput: {
              projectName: projName,
              programs: graph.programs,
              programStatuses: statuses,
              sharedPrograms: shared,
              sccs: resolved.sccs,
              maxLevel: resolved.maxLevel,
              modulesOutput: calcOutput,
              readiness: readinessReport,
              decommission: decommResult,
              tracker: projTracker,
            },
          });
        }

        // Add non-started projects from registry (not already in active list)
        const activeSet = new Set(activeProjects);
        for (const regEntry of registry) {
          if (!activeSet.has(regEntry.name)) {
            projectInputs.push({
              name: regEntry.name,
              programCount: regEntry.programs,
              description: regEntry.description,
            });
          }
        }

        const multiReport = buildMultiProjectReport({ projects: projectInputs });
        const html = generateMultiProjectHtmlReport(multiReport);
        const outFile = getArg('output') ?? path.join(migrationDir, 'migration-report.html');
        const outDir = path.dirname(outFile);
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(outFile, html, 'utf8');
        console.log(`Multi-project HTML report generated: ${outFile} (${activeProjects.length} active / ${registry.length} total)`);
      } else {
        // Single-project mode (backward compat)
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
      }
      break;
    }

    case 'set-status': {
      // Batch-update contract pipeline statuses
      // Usage: set-status --project <dir> --programs 120,122,123 --status enriched [--dir ADH]
      const programsArg = getArg('programs');
      const targetStatus = getArg('status') as PipelineStatus | undefined;
      const subDir = getArg('dir');

      if (!programsArg || !targetStatus) {
        console.error('Usage: set-status --project <dir> --programs 120,122,... --status <pending|contracted|enriched|verified> [--dir ADH]');
        process.exit(1);
      }

      const validStatuses = new Set(Object.values(PipelineStatus));
      if (!validStatuses.has(targetStatus)) {
        console.error(`Invalid status "${targetStatus}". Valid: ${[...validStatuses].join(', ')}`);
        process.exit(1);
      }

      const programIds = programsArg.split(',').map(s => s.trim()).filter(Boolean);
      const contractDir = subDir ? path.join(migrationDir, subDir) : migrationDir;

      if (!fs.existsSync(contractDir)) {
        console.error(`Contract directory not found: ${contractDir}`);
        process.exit(1);
      }

      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const id of programIds) {
        // Find contract file matching this ID
        const files = fs.readdirSync(contractDir).filter(f =>
          f.endsWith('.contract.yaml') && f.includes(`-IDE-${id}.`),
        );

        if (files.length === 0) {
          errors.push(`IDE ${id}: no contract file found`);
          continue;
        }

        const filePath = path.join(contractDir, files[0]);
        const contract = parseContract(filePath);
        const currentStatus = contract.overall.status;

        if (currentStatus === targetStatus) {
          console.log(`  IDE ${id}: already ${targetStatus}`);
          skipped++;
          continue;
        }

        if (!canTransition(currentStatus, targetStatus)) {
          errors.push(`IDE ${id}: cannot transition ${currentStatus} → ${targetStatus}`);
          continue;
        }

        contract.overall.status = targetStatus;
        contract.overall.effort = trackStatusChange(contract, targetStatus);
        writeContract(contract, filePath);
        console.log(`  IDE ${id}: ${currentStatus} → ${targetStatus}`);
        updated++;
      }

      console.log(`\nResult: ${updated} updated, ${skipped} unchanged, ${errors.length} errors`);
      for (const err of errors) {
        console.error(`  ERROR: ${err}`);
      }
      break;
    }

    case 'reclassify': {
      // Reclassify items in a contract (e.g., PARTIAL → N/A for backend-only items)
      // Usage: reclassify --project <dir> --program 126 --items "var:EW,table:249,table:250,table:222,table:247,callee:142" --to N/A [--dir ADH]
      const reclProgram = getArg('program');
      const reclItems = getArg('items');
      const reclTo = getArg('to');
      const reclSubDir = getArg('dir');
      const reclNotes = getArg('notes');

      if (!reclProgram || !reclItems || !reclTo) {
        console.error('Usage: reclassify --program <id> --items "type:id,..." --to <IMPL|N/A|PARTIAL|MISSING> [--dir ADH] [--notes "reason"]');
        process.exit(1);
      }

      const validItemStatuses = new Set(['IMPL', 'PARTIAL', 'MISSING', 'N/A']);
      if (!validItemStatuses.has(reclTo.toUpperCase())) {
        console.error(`Invalid item status "${reclTo}". Valid: ${[...validItemStatuses].join(', ')}`);
        process.exit(1);
      }

      const reclContractDir = reclSubDir ? path.join(migrationDir, reclSubDir) : migrationDir;
      const reclFiles = fs.readdirSync(reclContractDir).filter(f =>
        f.endsWith('.contract.yaml') && f.includes(`-IDE-${reclProgram}.`),
      );

      if (reclFiles.length === 0) {
        console.error(`No contract found for IDE ${reclProgram} in ${reclContractDir}`);
        process.exit(1);
      }

      const reclFilePath = path.join(reclContractDir, reclFiles[0]);
      const contract = parseContract(reclFilePath);

      const itemPairs = reclItems.split(',').map(s => {
        const [type, id] = s.trim().split(':');
        return { type, id };
      });

      let reclUpdated = 0;
      const targetStatus = reclTo.toUpperCase() as 'IMPL' | 'PARTIAL' | 'MISSING' | 'N/A';

      for (const { type, id } of itemPairs) {
        let found = false;

        if (type === 'rule') {
          const item = contract.rules.find(r => r.id === id);
          if (item) { item.status = targetStatus; if (reclNotes) item.gapNotes = reclNotes; found = true; }
        } else if (type === 'var') {
          const item = contract.variables.find(v => v.localId === id);
          if (item) { item.status = targetStatus; if (reclNotes) item.gapNotes = reclNotes; found = true; }
        } else if (type === 'table') {
          const item = contract.tables.find(t => String(t.id) === id);
          if (item) { item.status = targetStatus; if (reclNotes) item.gapNotes = reclNotes; found = true; }
        } else if (type === 'callee') {
          const item = contract.callees.find(c => String(c.id) === id);
          if (item) { item.status = targetStatus; if (reclNotes) item.gapNotes = reclNotes; found = true; }
        }

        if (found) {
          console.log(`  ${type}:${id} → ${targetStatus}`);
          reclUpdated++;
        } else {
          console.error(`  ${type}:${id} NOT FOUND`);
        }
      }

      // Recalculate coverage
      const allItems = [...contract.rules, ...contract.variables, ...contract.tables, ...contract.callees];
      const totalItems = allItems.length;
      const naItems = allItems.filter(i => i.status === 'N/A').length;
      const implItems = allItems.filter(i => i.status === 'IMPL').length;
      const partialItems = allItems.filter(i => i.status === 'PARTIAL').length;
      const denominator = totalItems - naItems;
      const newCoverage = denominator > 0 ? Math.round(((implItems + partialItems * 0.5) / denominator) * 100) : 100;

      contract.overall.rulesImpl = contract.rules.filter(r => r.status === 'IMPL').length;
      contract.overall.rulesPartial = contract.rules.filter(r => r.status === 'PARTIAL').length;
      contract.overall.rulesMissing = contract.rules.filter(r => r.status === 'MISSING').length;
      contract.overall.rulesNa = contract.rules.filter(r => r.status === 'N/A').length;
      contract.overall.calleesImpl = contract.callees.filter(c => c.status === 'IMPL').length;
      contract.overall.calleesMissing = contract.callees.filter(c => c.status === 'MISSING').length;
      contract.overall.coveragePct = newCoverage;

      writeContract(contract, reclFilePath);
      console.log(`\n  IDE ${reclProgram}: ${reclUpdated} items reclassified, coverage ${newCoverage}%`);
      break;
    }

    case 'gaps': {
      // Show consolidated gap report across all contracts
      // Usage: gaps --project <dir> [--dir ADH] [--status enriched|contracted]
      const gapsSubDir = getArg('dir');
      const gapsFilterStatus = getArg('status');
      const gapsContractDir = gapsSubDir ? path.join(migrationDir, gapsSubDir) : migrationDir;

      if (!fs.existsSync(gapsContractDir)) {
        console.error(`Contract directory not found: ${gapsContractDir}`);
        process.exit(1);
      }

      const gapReport = computeGapReport(gapsContractDir, gapsFilterStatus ?? undefined);

      console.log(`\n  Gap Report (${gapsContractDir})\n`);
      for (const cg of gapReport.contracts) {
        const pct = cg.total > 0 ? Math.round((cg.impl / cg.total) * 100) : 0;
        console.log(`  IDE ${cg.id} - ${cg.name} [${cg.pipelineStatus}] ${cg.impl}/${cg.total} (${pct}%)`);
        const byStatus = new Map<string, number>();
        for (const g of cg.gaps) byStatus.set(g.status, (byStatus.get(g.status) ?? 0) + 1);
        console.log(`    ${[...byStatus].map(([s, n]) => `${n} ${s}`).join(', ')}`);
      }

      console.log(`\n  Total: ${gapReport.grandTotalGaps} gaps across ${gapReport.contracts.length} contracts (${gapReport.globalPct}% complete)\n`);
      break;
    }

    case 'verify': {
      // Auto-verify enriched contracts: check all items are IMPL or N/A
      // Usage: verify --project <dir> [--programs 120,122,...] [--dir ADH] [--dry-run]
      const verifyProgramsArg = getArg('programs');
      const verifySubDir = getArg('dir');
      const dryRun = hasFlag('dry-run');
      const verifyContractDir = verifySubDir ? path.join(migrationDir, verifySubDir) : migrationDir;

      if (!fs.existsSync(verifyContractDir)) {
        console.error(`Contract directory not found: ${verifyContractDir}`);
        process.exit(1);
      }

      // Load all contracts or filter by --programs
      const allFiles = fs.readdirSync(verifyContractDir).filter(f => f.endsWith('.contract.yaml'));
      const targetIds = verifyProgramsArg
        ? new Set(verifyProgramsArg.split(',').map(s => s.trim()))
        : null;

      let verified = 0;
      let notReady = 0;
      let alreadyVerified = 0;

      for (const file of allFiles) {
        const filePath = path.join(verifyContractDir, file);
        const contract = parseContract(filePath);
        const id = String(contract.program.id);

        if (targetIds && !targetIds.has(id)) continue;

        if (contract.overall.status === PipelineStatus.VERIFIED) {
          alreadyVerified++;
          continue;
        }

        if (contract.overall.status !== PipelineStatus.ENRICHED) {
          console.log(`  IDE ${id}: skip (status=${contract.overall.status}, need enriched)`);
          continue;
        }

        // Check all items are IMPL or N/A
        const completedStatuses = new Set(['IMPL', 'N/A']);
        const gaps: string[] = [];

        for (const r of contract.rules) {
          if (!completedStatuses.has(r.status)) gaps.push(`rule ${r.id}: ${r.status}`);
        }
        for (const v of contract.variables) {
          if (!completedStatuses.has(v.status)) gaps.push(`var ${v.localId}: ${v.status}`);
        }
        for (const t of contract.tables) {
          if (!completedStatuses.has(t.status)) gaps.push(`table ${t.id}: ${t.status}`);
        }
        for (const c of contract.callees) {
          if (!completedStatuses.has(c.status)) gaps.push(`callee ${c.id}: ${c.status}`);
        }

        if (gaps.length > 0) {
          console.log(`  IDE ${id}: NOT READY (${gaps.length} gaps)`);
          for (const g of gaps.slice(0, 5)) console.log(`    - ${g}`);
          if (gaps.length > 5) console.log(`    ... and ${gaps.length - 5} more`);
          notReady++;
        } else {
          if (dryRun) {
            console.log(`  IDE ${id}: WOULD verify (all items IMPL/N/A)`);
          } else {
            contract.overall.status = PipelineStatus.VERIFIED;
            contract.overall.coveragePct = 100;
            writeContract(contract, filePath);
            console.log(`  IDE ${id}: enriched → verified (100%)`);
          }
          verified++;
        }
      }

      console.log(`\nVerify result: ${verified} ${dryRun ? 'would verify' : 'verified'}, ${notReady} not ready, ${alreadyVerified} already verified`);
      break;
    }

    case 'estimate': {
      const adapter = await createAdapterFromArgs(projectDir);
      const graph = await adapter.extractProgramGraph();
      const estSubDir = getArg('dir');
      const estContractDir = estSubDir ? path.join(migrationDir, estSubDir) : migrationDir;
      const contracts = loadContracts(estContractDir);

      const statuses = fs.existsSync(trackerFile)
        ? getPipelineStatus({ migrationDir, trackerFile, adapter })
        : new Map<string | number, PipelineStatus>();

      const estimation = estimateProject({
        programs: graph.programs,
        contracts,
        programStatuses: statuses,
      });

      console.log(`\nEstimation for ${graph.programs.length} programs:\n`);
      console.log(`  Total estimated: ${estimation.totalEstimatedHours}h`);
      console.log(`  Average score: ${estimation.avgComplexityScore}/100`);
      console.log(`  Grade distribution:`);
      for (const [grade, count] of Object.entries(estimation.gradeDistribution)) {
        if (count > 0) console.log(`    ${grade}: ${count} programs`);
      }

      console.log(`\n  Top 10 most complex:`);
      for (const p of estimation.programs.slice(0, 10)) {
        console.log(`    IDE ${p.id} - ${p.name}: ${p.score.grade} (${p.score.normalizedScore}) ~${p.score.estimatedHours}h`);
      }
      break;
    }

    case 'contract': {
      if (!hasFlag('auto')) {
        console.error('Usage: contract --auto --project <dir> --program <id> [--programs <id,id,...>] [--dir ADH]');
        process.exit(1);
      }

      const contractSubDir = getArg('dir') ?? 'ADH';
      const contractContractDir = path.join(migrationDir, contractSubDir);
      const specDir = path.join(projectDir, '.openspec', 'specs');
      const registry = readProjectRegistry(migrationDir);
      const codebaseDir = resolveCodebaseDir(projectDir, contractSubDir, registry);

      const singleProg = getArg('program');
      const multiProgs = getArg('programs');
      const programIds = singleProg
        ? [singleProg]
        : multiProgs
          ? multiProgs.split(',').map(s => s.trim()).filter(Boolean)
          : [];

      if (programIds.length === 0) {
        console.error('Specify --program <id> or --programs <id,id,...>');
        process.exit(1);
      }

      if (!fs.existsSync(contractContractDir)) fs.mkdirSync(contractContractDir, { recursive: true });

      let generated = 0;
      for (const id of programIds) {
        const specFile = path.join(specDir, `${contractSubDir}-IDE-${id}.md`);
        if (!fs.existsSync(specFile)) {
          console.error(`  IDE ${id}: spec not found (${specFile})`);
          continue;
        }

        const contract = generateAutoContract({
          specFile,
          codebaseDir,
          projectDir,
        });

        if (!contract) {
          console.error(`  IDE ${id}: failed to generate contract`);
          continue;
        }

        const outFile = path.join(contractContractDir, `${contractSubDir}-IDE-${id}.contract.yaml`);
        writeContract(contract, outFile);
        console.log(`  IDE ${id}: contract generated (${contract.rules.length} rules, ${contract.tables.length} tables, ${contract.callees.length} callees, ${contract.overall.coveragePct}% coverage)`);
        generated++;
      }

      console.log(`\nResult: ${generated} contracts generated out of ${programIds.length} requested`);
      break;
    }

    case 'pipeline': {
      const pipelineSubCmd = args[1];
      const pipelineConfig = resolvePipelineConfig({
        projectDir,
        dir: getArg('dir') ?? 'ADH',
        dryRun: hasFlag('dry-run'),
        noContract: hasFlag('no-contract'),
        noVerify: hasFlag('no-verify'),
        report: hasFlag('report'),
        enrich: getArg('enrich'),
        model: getArg('model'),
      });

      switch (pipelineSubCmd) {
        case 'run': {
          const batchId = getArg('batch');
          if (!batchId) {
            console.error('Usage: pipeline run --batch <id> --project <dir> [--dir ADH] [--dry-run] [--no-contract] [--no-verify] [--enrich manual|claude] [--model haiku|sonnet]');
            process.exit(1);
          }

          const result = await runBatchPipeline(batchId, pipelineConfig);

          console.log(`\nPipeline ${result.dryRun ? '(DRY-RUN) ' : ''}run: ${batchId} - ${result.batchName}\n`);

          for (const step of result.steps) {
            const icon = step.action === 'verified' ? '\u2714'
              : step.action === 'already-done' ? '\u25CB'
              : step.action === 'needs-enrichment' ? '\u25B7'
              : step.action === 'claude-enriched' ? '\u25C9'
              : step.action === 'spec-missing' ? '\u2717'
              : step.action === 'error' ? '\u2717'
              : '\u002B';
            console.log(`  ${icon} [${step.programId}] ${step.programName}`);
            console.log(`    ${step.message}`);
          }

          console.log(`\n  --- Summary ---`);
          console.log(`  Total: ${result.summary.total} | Contracted: ${result.summary.contracted} | Auto-enriched: ${result.summary.autoEnriched} | Claude-enriched: ${result.summary.claudeEnriched} | Needs enrichment: ${result.summary.needsEnrichment} | Verified: ${result.summary.verified} | Already done: ${result.summary.alreadyDone} | Errors: ${result.summary.errors}`);

          const elapsed = (new Date(result.completed).getTime() - new Date(result.started).getTime()) / 1000;
          console.log(`  Duration: ${elapsed.toFixed(1)}s`);
          break;
        }

        case 'status': {
          const views = getBatchesStatus(pipelineConfig);

          if (views.length === 0) {
            console.log('No batches found. Run `migration-factory init` and configure batches in tracker.json.');
            break;
          }

          const dir = getArg('dir') ?? 'ADH';
          console.log(`\nPipeline Status - ${dir}\n`);
          console.log('  Batch  Name                      Progs  Status      Progress');
          console.log('  -----  ------------------------  -----  ----------  -------------------------');

          let totalVerified = 0;
          let totalProgs = 0;
          let totalEstHours = 0;

          for (const v of views) {
            const bar = formatCoverageBar(Math.round((v.verified / Math.max(v.programCount, 1)) * 100), 20);
            const statusPad = v.status.padEnd(10);
            const namePad = v.name.padEnd(24).slice(0, 24);
            console.log(`  ${v.id.padEnd(5)}  ${namePad}  ${String(v.programCount).padStart(5)}  ${statusPad}  ${bar}`);
            totalVerified += v.verified;
            totalProgs += v.programCount;
            totalEstHours += v.estimatedHours;
          }

          const totalPct = totalProgs > 0 ? Math.round((totalVerified / totalProgs) * 100) : 0;
          console.log(`\n  Total: ${totalVerified}/${totalProgs} verified (${totalPct}%)${totalEstHours > 0 ? ` | Est. restant: ${totalEstHours}h` : ''}`);
          break;
        }

        case 'preflight': {
          const pfBatchId = getArg('batch');
          if (!pfBatchId) {
            console.error('Usage: pipeline preflight --batch <id> --project <dir> [--dir ADH]');
            process.exit(1);
          }

          const pfResult = preflightBatch(pfBatchId, pipelineConfig);

          console.log(`\nPreflight: ${pfBatchId} - ${pfResult.batchName}\n`);
          console.log('  Prerequisites:');
          for (const check of pfResult.checks) {
            const icon = check.passed ? 'OK' : 'FAIL';
            console.log(`    ${icon}  ${check.check}: ${check.message}`);
          }

          if (pfResult.programs.length > 0) {
            console.log('\n  Programs:');
            for (const prog of pfResult.programs) {
              const spec = prog.specExists ? 'OK' : 'MISSING';
              const contract = prog.contractExists ? 'OK' : 'MISSING';
              console.log(`    IDE ${prog.id} - ${prog.name}`);
              console.log(`      Spec: ${spec} | Contract: ${contract} | Action: ${prog.action}${prog.gaps > 0 ? ` (${prog.gaps} gaps)` : ''}`);
            }
          }

          console.log(`\n  Summary: ${pfResult.summary.willContract} will contract, ${pfResult.summary.willVerify} will verify, ${pfResult.summary.needsEnrichment} needs enrichment, ${pfResult.summary.alreadyDone} already done, ${pfResult.summary.blocked} blocked`);
          break;
        }

        default:
          console.error('Pipeline sub-commands: run, status, preflight');
          console.error('  pipeline run       --batch <id> --project <dir> [--dry-run] [--no-contract] [--no-verify] [--enrich manual|claude] [--model haiku|sonnet]');
          console.error('  pipeline status    --project <dir> [--dir ADH]');
          console.error('  pipeline preflight --batch <id> --project <dir> [--dir ADH]');
          process.exit(1);
      }
      break;
    }

    case 'calibrate': {
      const calDir = getArg('dir') ?? 'ADH';
      const calConfig = resolvePipelineConfig({ projectDir, dir: calDir });
      const calDryRun = hasFlag('dry-run');
      const result = runCalibration(calConfig, calDryRun);

      console.log(`\n  Calibration${calDryRun ? ' (DRY-RUN)' : ''} - ${calDir}`);
      console.log(`  Verified contracts: ${result.dataPoints}`);
      console.log(`  Previous: ${result.previousHpp} h/pt → Calibrated: ${result.calibratedHpp} h/pt`);
      console.log(`  Estimated: ${result.totalEstimated}h | Actual: ${result.totalActual}h`);
      console.log(`  Accuracy: ${result.accuracyPct}%`);

      if (result.details.length > 0) {
        console.log(`\n  Details:`);
        for (const d of result.details) {
          console.log(`    IDE ${d.programId}: score=${d.score} est=${d.estimated}h act=${d.actual}h`);
        }
      }
      break;
    }

    case 'generate': {
      // Generate React/TS scaffolds from verified/enriched contracts
      // Usage: generate --batch B1 --project <dir> --output ./adh-web/src [--dir ADH] [--dry-run] [--overwrite]
      //        generate --contract ADH-IDE-131 --project <dir> --output ./adh-web/src [--dry-run]
      const genBatch = getArg('batch');
      const genContract = getArg('contract');
      const genOutput = getArg('output');
      const genSubDir = getArg('dir') ?? 'ADH';
      const genDryRun = hasFlag('dry-run');
      const genOverwrite = hasFlag('overwrite');

      if (!genOutput) {
        console.error('Usage: generate --batch <id> --project <dir> --output <dir> [--dir ADH] [--dry-run] [--overwrite]');
        console.error('       generate --contract <name> --project <dir> --output <dir> [--dry-run]');
        process.exit(1);
      }

      const genContractDir = path.join(migrationDir, genSubDir);
      if (!fs.existsSync(genContractDir)) {
        console.error(`Contract directory not found: ${genContractDir}`);
        process.exit(1);
      }

      const genConfig = { outputDir: genOutput, dryRun: genDryRun, overwrite: genOverwrite };

      if (genContract) {
        // Single contract mode
        const files = fs.readdirSync(genContractDir).filter(f =>
          f.endsWith('.contract.yaml') && f.includes(genContract),
        );
        if (files.length === 0) {
          console.error(`No contract found matching "${genContract}" in ${genContractDir}`);
          process.exit(1);
        }
        const contract = parseContract(path.join(genContractDir, files[0]));
        const result = runCodegen(contract, genConfig);
        console.log(`\n  IDE ${result.programId} - ${result.programName}: ${result.written} files generated, ${result.skipped} skipped`);
        for (const f of result.files) {
          const icon = f.skipped ? 'SKIP' : genDryRun ? 'WOULD' : 'OK';
          console.log(`    ${icon}  ${f.relativePath}`);
        }
      } else if (genBatch) {
        // Batch mode: load tracker to find programs in batch
        const genTrackerFile = path.join(migrationDir, genSubDir, 'tracker.json');
        if (!fs.existsSync(genTrackerFile)) {
          console.error(`Tracker not found: ${genTrackerFile}`);
          process.exit(1);
        }
        const tracker = readTracker(genTrackerFile);
        const batch = tracker.batches.find(b => b.id === genBatch);
        if (!batch) {
          console.error(`Batch "${genBatch}" not found in tracker. Available: ${tracker.batches.map(b => b.id).join(', ')}`);
          process.exit(1);
        }

        const contracts = loadContracts(genContractDir);
        let totalWritten = 0;
        let totalSkipped = 0;
        let processed = 0;

        console.log(`\nGenerate${genDryRun ? ' (DRY-RUN)' : ''}: batch ${genBatch} - ${batch.name}\n`);

        for (const progId of batch.priorityOrder) {
          const contract = contracts.get(progId);
          if (!contract) {
            console.log(`  IDE ${progId}: no contract, skipping`);
            continue;
          }
          const result = runCodegen(contract, genConfig);
          console.log(`  IDE ${result.programId} - ${result.programName}: ${result.written} written, ${result.skipped} skipped`);
          totalWritten += result.written;
          totalSkipped += result.skipped;
          processed++;
        }

        console.log(`\n  Summary: ${processed} programs, ${totalWritten} files ${genDryRun ? 'would be written' : 'written'}, ${totalSkipped} skipped`);
      } else {
        console.error('Specify --batch <id> or --contract <name>');
        process.exit(1);
      }
      break;
    }

    case 'serve': {
      const servePort = Number(getArg('port') ?? 3070);
      const serveDir = getArg('dir') ?? 'ADH';
      const { startActionServer } = await import('./server/action-server.js');
      await startActionServer({ port: servePort, projectDir, dir: serveDir });
      break;
    }

    default:
      console.log('Migration Factory - Reusable SPECMAP migration pipeline\n');
      console.log('Commands:');
      console.log('  init       --project <dir> --name <name>     Initialize migration');
      console.log('  graph      --project <dir>                   Analyze dependency graph');
      console.log('  modules    --project <dir>                   Show deliverable modules');
      console.log('  dashboard  --project <dir>                   Show progress dashboard');
      console.log('  plan       --project <dir>                   Auto-suggest batches');
      console.log('  report     --project <dir> [--output file]   Generate HTML dashboard');
      console.log('  set-status --project <dir> --programs 1,2,3 --status enriched [--dir ADH]');
      console.log('  verify     --project <dir> [--programs 1,2,3] [--dir ADH] [--dry-run]');
      console.log('  gaps       --project <dir> [--dir ADH] [--status enriched]');
      console.log('  estimate   --project <dir> [--dir ADH]                      Estimate effort');
      console.log('  contract   --auto --project <dir> --program <id> [--dir ADH]  Auto-generate contract');
      console.log('  pipeline   run|status|preflight                               Pipeline orchestrator v4 (Claude enrichment)');
      console.log('  calibrate  --project <dir> [--dir ADH] [--dry-run]             Calibrate hoursPerPoint from verified contracts');
      console.log('  generate   --batch <id>|--contract <name> --output <dir>      Generate React/TS scaffolds from contracts');
      console.log('  serve      [--port 3070] [--dir ADH]                          Interactive dashboard server');
      console.log('\nOptions:');
      console.log('  --adapter magic|generic                     Source adapter (default: magic)');
      console.log('  --programs <file|id,id,...>                  Programs file or IDs');
      console.log('  --output <file>                             Output file for report command');
      console.log('  --dir <subdir>                              Subdirectory for contracts');
      console.log('  --dry-run                                   Preview without modifying files');
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
