/**
 * Migration Runner - Orchestrates the 15-phase pipeline.
 * Supports per-program parallel execution (phases 0-9) and
 * sequential batch verification (phases 10-15).
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {
  MigrateConfig, MigrateResult, MigrateEvent, MigrateEventType,
  MigrateSummary, ProgramMigrateResult, AnalysisDocument, MigratePhase,
} from './migrate-types.js';
import { MigratePhase as MP, MigrateEventType as ET, GENERATION_PHASES } from './migrate-types.js';
import {
  readMigrateTracker, writeMigrateTracker, getOrCreateProgram,
  startPhase, completePhase, failPhase, markProgramCompleted, markProgramFailed,
  isPhaseCompleted,
} from './migrate-tracker.js';
import { setClaudeLogDir, startTokenAccumulator, flushTokenAccumulator } from './migrate-claude.js';
import { readTracker, writeTracker } from '../core/tracker.js';
import { loadContracts, parseContract, writeContract } from '../core/contract.js';
import { createMigrationLogger } from './migrate-logger.js';
import type { MigrationLogger } from './migrate-logger.js';
import { updateTokens } from '../server/token-tracker.js';
import { PipelineStatus } from '../core/types.js';
import { runSpecPhase } from './phases/phase-spec.js';
import { runContractPhase } from './phases/phase-contract.js';
import { runAnalyzePhase } from './phases/phase-analyze.js';
import { runTypesPhase, runStorePhase, runApiPhase, runPagePhase, runComponentsPhase } from './phases/phase-generate.js';
import { runTestsUnitPhase, runTestsUiPhase } from './phases/phase-tests.js';
import { runVerifyFixLoop } from './phases/phase-verify.js';
import { runIntegratePhase } from './phases/phase-integrate.js';
import { runReviewPhase } from './phases/phase-review.js';
import { scaffoldTargetDir } from './migrate-scaffold.js';

// ─── Duration Formatter ────────────────────────────────────────

export const formatDuration = (ms: number): string => {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return `${parts.join(' ')} (${ms}ms)`;
};

// ─── Auto-parallel ────────────────────────────────────────────

/** Resolve parallel count: 0 = auto (based on CPU cores and program count). */
export const resolveParallelCount = (requested: number, programCount: number): number => {
  if (requested > 0) return requested;
  const cpus = os.cpus().length;
  const maxByHardware = Math.min(cpus, 6);
  const maxByPrograms = Math.max(1, Math.ceil(programCount / 2));
  return Math.max(1, Math.min(maxByHardware, maxByPrograms));
};

// ─── Token cost calculation ──────────────────────────────────

const PRICING: Record<string, { input: number; output: number }> = {
  sonnet: { input: 3, output: 15 },
  haiku: { input: 0.25, output: 1.25 },
  opus: { input: 15, output: 75 },
};

export const estimateCostUsd = (tokens: { input: number; output: number }, model?: string): number => {
  const key = model && PRICING[model] ? model : 'sonnet';
  const p = PRICING[key];
  return (tokens.input / 1_000_000) * p.input + (tokens.output / 1_000_000) * p.output;
};

/**
 * Determine if a program should be skipped during migration.
 * ONLY verified programs are skipped - enriched programs must be re-generated.
 */
export const shouldSkipProgram = (contractStatus: string | undefined): boolean => {
  return contractStatus === PipelineStatus.VERIFIED;
};

// ─── Main Entry Point ──────────────────────────────────────────

export const runMigration = async (
  programIds: (string | number)[],
  batchId: string,
  batchName: string,
  config: MigrateConfig,
): Promise<MigrateResult> => {
  const started = new Date().toISOString();
  const migrationStart = Date.now();
  const trackerFile = path.join(config.migrationDir, config.contractSubDir, 'tracker.json');

  emit(config, ET.MIGRATION_STARTED, `Starting migration for batch ${batchId} (${programIds.length} programs)`);

  // Setup decision log directory
  if (!config.dryRun && !config.logDir) {
    const logDir = path.join(config.targetDir, '.migration-log', batchId);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    config.logDir = logDir;
    setClaudeLogDir(logDir);
    emit(config, ET.PHASE_STARTED, `Decision log: ${logDir}`);
  }

  // Scaffold target directory with infrastructure stubs if needed
  if (!config.dryRun) {
    const scaffold = scaffoldTargetDir(config);
    if (scaffold.created > 0) {
      emit(config, ET.PHASE_STARTED, `Scaffolded target dir: ${scaffold.created} files created, ${scaffold.skipped} skipped`);
    }
  }

  // Phase 0-9: Generate per program (parallelizable)
  const programResults: ProgramMigrateResult[] = [];
  const analyses = new Map<string | number, AnalysisDocument>();

  // Resolve parallel count (0 = auto)
  const limit = resolveParallelCount(config.parallel, programIds.length);
  if (limit !== config.parallel) {
    emit(config, ET.PARALLEL_RESOLVED, `Auto-parallel: ${limit} agents (${os.cpus().length} CPUs, ${programIds.length} programs)`, { data: { requested: config.parallel, resolved: limit, cpus: os.cpus().length } });
  }

  const chunks: (string | number)[][] = [];
  for (let i = 0; i < programIds.length; i += limit) {
    chunks.push(programIds.slice(i, i + limit));
  }

  for (const chunk of chunks) {
    if (config.abortSignal?.aborted) {
      emit(config, ET.MIGRATION_COMPLETED, 'Migration aborted by user');
      break;
    }
    const results = await Promise.all(
      chunk.map(id => runProgramGeneration(id, config, trackerFile)),
    );

    for (const r of results) {
      programResults.push(r.result);
      if (r.analysis) analyses.set(r.result.programId, r.analysis);
    }
  }

  // Phase 10-13: Verify + Fix (sequential, batch-wide)
  // Dry-run: no verification runs, so no errors to report
  let tscClean = config.dryRun;
  let testsPass = config.dryRun;

  const hasRealWork = programResults.some(r => r.status === 'completed');
  const allSkipped = programResults.every(r => r.status === 'skipped');

  // When no real work was done (all programs skipped), report clean state
  if (allSkipped) {
    tscClean = true;
    testsPass = true;
  }

  if (!config.dryRun && hasRealWork) {
    emit(config, ET.PHASE_STARTED, 'Starting verification loop', { phase: MP.VERIFY_TSC });

    const verifyResult = await runVerifyFixLoop(config, config.maxPasses);
    tscClean = verifyResult.tscClean;
    testsPass = verifyResult.testsPass;

    emit(config, ET.VERIFY_PASS, `TSC: ${tscClean ? 'CLEAN' : 'ERRORS'} (${verifyResult.tscPasses} passes), Tests: ${testsPass ? 'PASS' : 'FAIL'} (${verifyResult.testPasses} passes)`);
  }

  // Phase 14: Integrate
  if (!config.dryRun && analyses.size > 0) {
    emit(config, ET.PHASE_STARTED, 'Starting integration', { phase: MP.INTEGRATE });

    try {
      const integrateResult = await runIntegratePhase([...analyses.values()], config);
      emit(config, ET.PHASE_COMPLETED, `Integration: ${integrateResult.filesModified.length} files modified`, { phase: MP.INTEGRATE });
    } catch (err) {
      emit(config, ET.PHASE_FAILED, `Integration failed: ${err instanceof Error ? err.message : 'unknown'}`, { phase: MP.INTEGRATE });
    }
  }

  // Phase 15: Review
  let totalCoverage = 0;
  let reviewCount = 0;

  if (!config.dryRun) {
    for (const [progId, analysis] of analyses) {
      emit(config, ET.PHASE_STARTED, `Reviewing IDE ${progId}`, { phase: MP.REVIEW, programId: progId });

      try {
        const reviewResult = await runReviewPhase(progId, analysis, config);
        totalCoverage += reviewResult.report.coveragePct;
        reviewCount++;

        emit(config, ET.PHASE_COMPLETED, `Review IDE ${progId}: ${reviewResult.report.coveragePct}% coverage`, {
          phase: MP.REVIEW,
          programId: progId,
          data: reviewResult.report as unknown as Record<string, unknown>,
        });
      } catch (err) {
        emit(config, ET.PHASE_FAILED, `Review failed for IDE ${progId}: ${err instanceof Error ? err.message : 'unknown'}`, { phase: MP.REVIEW, programId: progId });
      }
    }
  }

  // Aggregate token usage
  const totalTokens = { input: 0, output: 0 };
  for (const r of programResults) {
    if (r.tokens) {
      totalTokens.input += r.tokens.input;
      totalTokens.output += r.tokens.output;
    }
  }
  const hasTokens = totalTokens.input > 0 || totalTokens.output > 0;

  const summary: MigrateSummary = {
    total: programIds.length,
    completed: programResults.filter(r => r.status === 'completed').length,
    failed: programResults.filter(r => r.status === 'failed').length,
    skipped: programResults.filter(r => r.status === 'skipped').length,
    totalFiles: programResults.reduce((sum, r) => sum + r.filesGenerated, 0),
    tscClean,
    testsPass,
    reviewAvgCoverage: reviewCount > 0 ? Math.round(totalCoverage / reviewCount) : 0,
    ...(hasTokens ? { totalTokens, estimatedCostUsd: estimateCostUsd(totalTokens, config.model) } : {}),
  };

  const totalDuration = Date.now() - migrationStart;
  const costInfo = summary.totalTokens
    ? `, tokens: ${Math.round(summary.totalTokens.input / 1000)}K in / ${Math.round(summary.totalTokens.output / 1000)}K out (~$${summary.estimatedCostUsd?.toFixed(2)})`
    : '';
  const dryTag = config.dryRun ? '[DRY-RUN] ' : '';
  const completionMsg = allSkipped
    ? `${dryTag}Migration terminee : ${summary.total}/${summary.total} deja migres (rien a faire) en ${formatDuration(totalDuration)}`
    : `${dryTag}Migration terminee : ${summary.completed}/${summary.total} programmes, ${summary.totalFiles} fichiers en ${formatDuration(totalDuration)}${costInfo}`;
  emit(config, ET.MIGRATION_COMPLETED, completionMsg);

  // Update main tracker batch stats after migration
  if (!config.dryRun && summary.completed > 0) {
    try {
      const tracker = readTracker(trackerFile);
      const batchDef = tracker.batches.find(b => b.id === batchId);
      if (batchDef) {
        batchDef.stats.fullyImpl = summary.completed;
        batchDef.stats.coverageAvgFrontend = summary.reviewAvgCoverage;
        batchDef.stats.totalPartial = summary.failed;
        batchDef.stats.totalMissing = summary.total - summary.completed - summary.failed;
        if (summary.totalTokens) {
          const prev = batchDef.stats.tokenStats ?? { input: 0, output: 0, costUsd: 0 };
          batchDef.stats.tokenStats = {
            input: prev.input + summary.totalTokens.input,
            output: prev.output + summary.totalTokens.output,
            costUsd: (prev.costUsd) + (summary.estimatedCostUsd ?? 0),
          };
        }
        if (summary.completed === summary.total && summary.tscClean && summary.testsPass) {
          batchDef.status = 'verified';
          batchDef.verifiedDate = new Date().toISOString().slice(0, 10);
        } else if (summary.completed > 0) {
          batchDef.status = 'enriched';
          batchDef.enrichedDate = batchDef.enrichedDate ?? new Date().toISOString().slice(0, 10);
        }
        writeTracker(tracker, trackerFile);
        emit(config, ET.PHASE_COMPLETED, `Tracker updated: ${batchId} → ${batchDef.status} (${summary.completed}/${summary.total} impl, ${summary.reviewAvgCoverage}% coverage)`);
      }
    } catch {
      // Non-critical: tracker update failure shouldn't break the result
    }
  }

  // Auto-verify: promote enriched contracts → verified
  if (!config.dryRun && summary.completed > 0) {
    try {
      const { verifyContracts } = await import('../server/verify-contracts.js');
      const contractDir = path.join(config.migrationDir, config.contractSubDir);
      const programIds = programResults.filter(r => r.status === 'completed').map(r => String(r.programId));
      const verifyResult = verifyContracts(contractDir, { programs: programIds.join(',') });
      if (verifyResult.verified > 0) {
        emit(config, ET.PHASE_COMPLETED, `Auto-verify: ${verifyResult.verified} contracts promoted to verified`);
      }
    } catch { /* non-critical */ }
  }

  // Auto git commit + push if enabled
  let gitResult: MigrateResult['git'];

  if (config.autoCommit && !config.dryRun && summary.completed > 0) {
    try {
      emit(config, ET.GIT_STARTED, 'Auto-commit: staging files...');

      execSync(`git add "${config.targetDir}"`, { cwd: config.projectDir });
      execSync(`git add .openspec/migration/`, { cwd: config.projectDir });

      const msg = `feat(migration): ${batchId} - ${batchName} (${summary.completed} programs, ${summary.totalFiles} files)`;
      execSync(`git commit --no-verify -m "${msg}"`, { cwd: config.projectDir });

      const sha = execSync('git rev-parse --short HEAD', { cwd: config.projectDir }).toString().trim();
      const branch = execSync('git branch --show-current', { cwd: config.projectDir }).toString().trim();

      execSync(`git push origin ${branch}`, { cwd: config.projectDir });

      emit(config, ET.GIT_COMPLETED, `Committed ${sha} and pushed to ${branch}`);
      gitResult = { commitSha: sha, pushed: true, branch };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'unknown';
      emit(config, ET.GIT_FAILED, `Git failed: ${errMsg}`);
    }
  }

  return {
    batchId,
    batchName,
    started,
    completed: new Date().toISOString(),
    dryRun: config.dryRun,
    programs: programResults,
    summary,
    git: gitResult,
  };
};

// ─── Per-program generation (phases 0-9) ───────────────────────

interface ProgramGenerationOutput {
  result: ProgramMigrateResult;
  analysis: AnalysisDocument | null;
}

const runProgramGeneration = async (
  programId: string | number,
  config: MigrateConfig,
  trackerFile: string,
): Promise<ProgramGenerationOutput> => {
  const migrateData = readMigrateTracker(trackerFile);
  const prog = getOrCreateProgram(migrateData, programId);
  const start = Date.now();
  let analysis: AnalysisDocument | null = null;
  const files: string[] = [];

  // Start token accumulator for this program
  startTokenAccumulator();

  const aborted = () => config.abortSignal?.aborted === true;

  emit(config, ET.PROGRAM_STARTED, `Starting IDE ${programId}`, { programId });

  // Skip ONLY if contract is verified (fully migrated and validated)
  // Enriched programs must be re-generated even if phases exist in tracker from a previous run
  const contractFile = path.join(config.migrationDir, config.contractSubDir, `${config.contractSubDir}-IDE-${programId}.contract.yaml`);
  const contractExists = fs.existsSync(contractFile);
  const contractStatus = contractExists ? parseContract(contractFile).overall.status : undefined;
  const shouldSkip = shouldSkipProgram(contractStatus);

  if (shouldSkip) {
    flushTokenAccumulator();
    for (const p of GENERATION_PHASES) {
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: ${p} (verified)`, { phase: p, programId });
    }
    emit(config, ET.PROGRAM_COMPLETED, `IDE ${programId}: d\u00e9j\u00e0 migr\u00e9`, { programId, data: { skipped: true } });
    return {
      result: {
        programId,
        programName: `IDE-${programId}`,
        status: 'skipped',
        filesGenerated: 0,
        phasesCompleted: 10,
        phasesTotal: 10,
        duration: 0,
        errors: [],
      },
      analysis: null,
    };
  }

  // Check if program was fully generated in a previous run (resumable)
  const allGenPhasesCompleted = GENERATION_PHASES.every(p => isPhaseCompleted(prog, p));
  const wasFullyGenerated = prog.status === 'completed' && allGenPhasesCompleted;

  if (wasFullyGenerated) {
    // Resume: skip per-program generation, reuse existing files
    // Load analysis for batch phases (integrate, review)
    const project = config.contractSubDir;
    const analysisFile = path.join(config.migrationDir, project, `${project}-IDE-${programId}.analysis.json`);
    let resumedAnalysis: AnalysisDocument | null = null;
    if (fs.existsSync(analysisFile)) {
      resumedAnalysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
    }

    // Emit phase events so dashboard shows green dots
    for (const p of GENERATION_PHASES) {
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: ${p} (reprise)`, { phase: p, programId });
    }

    flushTokenAccumulator();
    emit(config, ET.PROGRAM_COMPLETED, `IDE ${programId}: déjà généré (reprise)`, { programId, data: { resumed: true, duration: 0 } });

    return {
      result: {
        programId,
        programName: resumedAnalysis?.domainPascal ?? `IDE-${programId}`,
        status: 'completed',
        filesGenerated: 0,
        phasesCompleted: 10,
        phasesTotal: 10,
        duration: 0,
        errors: [],
      },
      analysis: resumedAnalysis,
    };
  }

  // Not fully generated: reset and re-generate from scratch
  if (Object.keys(prog.phases).length > 0) {
    prog.phases = {};
    prog.status = 'pending';
    prog.currentPhase = null;
    saveMigrateTracker(trackerFile, migrateData);
  }

  try {
    // Phase 0: SPEC
    if (!aborted() && !isPhaseCompleted(prog, MP.SPEC)) {
      startPhase(prog, MP.SPEC);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating spec`, { phase: MP.SPEC, programId });
      const specResult = await runSpecPhase(programId, config);
      completePhase(prog, MP.SPEC, { file: specResult.specFile, duration: specResult.duration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: spec done`, { phase: MP.SPEC, programId });
      files.push(specResult.specFile);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 1: CONTRACT
    if (!aborted() && !isPhaseCompleted(prog, MP.CONTRACT)) {
      startPhase(prog, MP.CONTRACT);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating contract`, { phase: MP.CONTRACT, programId });
      const contractResult = runContractPhase(programId, config);
      completePhase(prog, MP.CONTRACT, { file: contractResult.contractFile, duration: contractResult.duration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: contract done`, { phase: MP.CONTRACT, programId });
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 2: ANALYZE
    if (!aborted() && !isPhaseCompleted(prog, MP.ANALYZE)) {
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: analyzing (Claude CLI)`, { phase: MP.ANALYZE, programId });
      startPhase(prog, MP.ANALYZE);
      const analyzeResult = await runAnalyzePhase(programId, config);
      analysis = analyzeResult.analysis;
      completePhase(prog, MP.ANALYZE, { file: analyzeResult.analysisFile, duration: analyzeResult.duration });
      saveMigrateTracker(trackerFile, migrateData);
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: analysis done in ${formatDuration(analyzeResult.duration)}, domain=${analysis.domain}`, { phase: MP.ANALYZE, programId });
    } else {
      // Load existing analysis - verify file actually exists
      const project = config.contractSubDir;
      const analysisFile = path.join(config.migrationDir, project, `${project}-IDE-${programId}.analysis.json`);
      if (fs.existsSync(analysisFile)) {
        analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
      } else {
        // Phase marked complete but file missing - re-run
        delete prog.phases[MP.ANALYZE];
        startPhase(prog, MP.ANALYZE);
        emit(config, ET.PHASE_STARTED, `IDE ${programId}: re-analyzing (file missing)`, { phase: MP.ANALYZE, programId });
        const analyzeResult = await runAnalyzePhase(programId, config);
        analysis = analyzeResult.analysis;
        completePhase(prog, MP.ANALYZE, { file: analyzeResult.analysisFile, duration: analyzeResult.duration });
        saveMigrateTracker(trackerFile, migrateData);
      }
    }

    if (!analysis) {
      throw new Error('Analysis document is required for code generation');
    }

    // Phase 3: TYPES
    if (!aborted() && !isPhaseCompleted(prog, MP.TYPES)) {
      startPhase(prog, MP.TYPES);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating types`, { phase: MP.TYPES, programId });
      const typesResult = await runTypesPhase(programId, analysis, config);
      completePhase(prog, MP.TYPES, { file: typesResult.file, duration: typesResult.duration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: types done`, { phase: MP.TYPES, programId });
      files.push(typesResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 4: STORE
    if (!aborted() && !isPhaseCompleted(prog, MP.STORE)) {
      startPhase(prog, MP.STORE);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating store`, { phase: MP.STORE, programId });
      const storeResult = await runStorePhase(programId, analysis, config);
      completePhase(prog, MP.STORE, { file: storeResult.file, duration: storeResult.duration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: store done`, { phase: MP.STORE, programId });
      files.push(storeResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 5: API
    if (!aborted() && !isPhaseCompleted(prog, MP.API)) {
      startPhase(prog, MP.API);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating api`, { phase: MP.API, programId });
      const apiResult = await runApiPhase(programId, analysis, config);
      completePhase(prog, MP.API, { file: apiResult.file, duration: apiResult.duration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: api done`, { phase: MP.API, programId });
      files.push(apiResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 6: PAGE
    if (!aborted() && !isPhaseCompleted(prog, MP.PAGE)) {
      startPhase(prog, MP.PAGE);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating page`, { phase: MP.PAGE, programId });
      const pageResult = await runPagePhase(programId, analysis, config);
      completePhase(prog, MP.PAGE, { file: pageResult.file, duration: pageResult.duration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: page done`, { phase: MP.PAGE, programId });
      files.push(pageResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 7: COMPONENTS
    if (!aborted() && !isPhaseCompleted(prog, MP.COMPONENTS)) {
      startPhase(prog, MP.COMPONENTS);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating components`, { phase: MP.COMPONENTS, programId });
      const compResult = await runComponentsPhase(programId, analysis, config);
      for (const r of compResult.files) {
        files.push(r.file);
      }
      completePhase(prog, MP.COMPONENTS, { duration: compResult.totalDuration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: components done`, { phase: MP.COMPONENTS, programId });
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 8: TESTS-UNIT
    if (!aborted() && !isPhaseCompleted(prog, MP.TESTS_UNIT)) {
      startPhase(prog, MP.TESTS_UNIT);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating unit tests`, { phase: MP.TESTS_UNIT, programId });
      const testUnitResult = await runTestsUnitPhase(programId, analysis, config);
      completePhase(prog, MP.TESTS_UNIT, { file: testUnitResult.file, duration: testUnitResult.duration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: unit tests done`, { phase: MP.TESTS_UNIT, programId });
      files.push(testUnitResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 9: TESTS-UI
    if (!aborted() && !isPhaseCompleted(prog, MP.TESTS_UI)) {
      startPhase(prog, MP.TESTS_UI);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating UI tests`, { phase: MP.TESTS_UI, programId });
      const testUiResult = await runTestsUiPhase(programId, analysis, config);
      completePhase(prog, MP.TESTS_UI, { file: testUiResult.file, duration: testUiResult.duration });
      emit(config, ET.PHASE_COMPLETED, `IDE ${programId}: UI tests done`, { phase: MP.TESTS_UI, programId });
      files.push(testUiResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    if (aborted()) {
      emit(config, ET.PROGRAM_FAILED, `IDE ${programId}: aborted`, { programId });
    }
    markProgramCompleted(prog);
    saveMigrateTracker(trackerFile, migrateData);

    // Promote contract status: contracted → enriched (so verify can then → verified)
    // Also create minimal enriched contract if none exists (e.g. CONTRACT phase was skipped)
    if (!config.dryRun) {
      try {
        const project = config.contractSubDir;
        const cFile = path.join(config.migrationDir, project, `${project}-IDE-${programId}.contract.yaml`);
        if (fs.existsSync(cFile)) {
          const contract = parseContract(cFile);
          if (contract.overall.status === PipelineStatus.CONTRACTED) {
            contract.overall.status = PipelineStatus.ENRICHED;
            writeContract(contract, cFile);
          }
        } else {
          // Create minimal enriched contract so batch progress reflects this program
          const minimalContract: import('../core/types.js').MigrationContract = {
            program: { id: programId, name: `IDE-${programId}`, complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 0, tablesCount: 0, expressionsCount: 0 },
            rules: [], variables: [], tables: [], callees: [],
            overall: { rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 0, status: PipelineStatus.ENRICHED, generated: new Date().toISOString(), notes: 'Auto-created after migration generation' },
          };
          writeContract(minimalContract, cFile);
        }
      } catch { /* non-critical */ }
    }

    const programTokens = flushTokenAccumulator();
    const elapsed = Date.now() - start;
    const tokenInfo = programTokens ? `, tokens: ${Math.round(programTokens.input / 1000)}K in / ${Math.round(programTokens.output / 1000)}K out` : '';
    const completedData: Record<string, unknown> = { duration: elapsed, filesGenerated: files.length };
    if (programTokens) completedData.tokens = programTokens;
    emit(config, ET.PROGRAM_COMPLETED, `IDE ${programId}: ${files.length} files generated in ${formatDuration(elapsed)}${tokenInfo}`, { programId, data: completedData });

    return {
      result: {
        programId,
        programName: analysis.domainPascal,
        status: 'completed',
        filesGenerated: files.length,
        phasesCompleted: Object.values(prog.phases).filter(p => p.status === 'completed').length,
        phasesTotal: 10,
        duration: Date.now() - start,
        errors: [],
        tokens: programTokens ?? undefined,
      },
      analysis,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const currentPhase = prog.currentPhase;
    if (currentPhase) failPhase(prog, currentPhase, errorMsg);
    markProgramFailed(prog, errorMsg);
    saveMigrateTracker(trackerFile, migrateData);

    const failedTokens = flushTokenAccumulator();
    const failedElapsed = Date.now() - start;
    emit(config, ET.PROGRAM_FAILED, `IDE ${programId} failed at ${currentPhase ?? 'unknown'} after ${formatDuration(failedElapsed)}: ${errorMsg}`, { programId });

    return {
      result: {
        programId,
        programName: analysis?.domainPascal ?? `IDE-${programId}`,
        status: 'failed',
        filesGenerated: files.length,
        phasesCompleted: Object.values(prog.phases).filter(p => p.status === 'completed').length,
        phasesTotal: 10,
        duration: Date.now() - start,
        errors: [errorMsg],
        tokens: failedTokens ?? undefined,
      },
      analysis,
    };
  }
};

// ─── Run single phase ──────────────────────────────────────────

export const runSinglePhase = async (
  phase: MigratePhase,
  programIds: (string | number)[],
  config: MigrateConfig,
): Promise<void> => {
  for (const programId of programIds) {
    emit(config, ET.PHASE_STARTED, `Phase ${phase} for IDE ${programId}`, { phase, programId });

    try {
      switch (phase) {
        case MP.SPEC:
          await runSpecPhase(programId, config);
          break;
        case MP.CONTRACT:
          runContractPhase(programId, config);
          break;
        case MP.ANALYZE:
          await runAnalyzePhase(programId, config);
          break;
        case MP.TYPES:
        case MP.STORE:
        case MP.API:
        case MP.PAGE:
        case MP.COMPONENTS:
        case MP.TESTS_UNIT:
        case MP.TESTS_UI: {
          // Load analysis required for code gen phases
          const project = config.contractSubDir;
          const analysisFile = path.join(config.migrationDir, project, `${project}-IDE-${programId}.analysis.json`);
          if (!fs.existsSync(analysisFile)) {
            throw new Error(`Analysis file not found: run 'analyze' phase first`);
          }
          const analysis: AnalysisDocument = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));

          if (phase === MP.TYPES) await runTypesPhase(programId, analysis, config);
          else if (phase === MP.STORE) await runStorePhase(programId, analysis, config);
          else if (phase === MP.API) await runApiPhase(programId, analysis, config);
          else if (phase === MP.PAGE) await runPagePhase(programId, analysis, config);
          else if (phase === MP.COMPONENTS) await runComponentsPhase(programId, analysis, config);
          else if (phase === MP.TESTS_UNIT) await runTestsUnitPhase(programId, analysis, config);
          else if (phase === MP.TESTS_UI) await runTestsUiPhase(programId, analysis, config);
          break;
        }
        case MP.VERIFY_TSC:
        case MP.FIX_TSC:
        case MP.VERIFY_TESTS:
        case MP.FIX_TESTS:
          await runVerifyFixLoop(config, config.maxPasses);
          return; // Verify phases are batch-wide, run once
        case MP.REVIEW: {
          const proj = config.contractSubDir;
          const aFile = path.join(config.migrationDir, proj, `${proj}-IDE-${programId}.analysis.json`);
          if (fs.existsSync(aFile)) {
            const analysis: AnalysisDocument = JSON.parse(fs.readFileSync(aFile, 'utf8'));
            await runReviewPhase(programId, analysis, config);
          }
          break;
        }
        default:
          throw new Error(`Unknown phase: ${phase}`);
      }

      emit(config, ET.PHASE_COMPLETED, `Phase ${phase} completed for IDE ${programId}`, { phase, programId });
    } catch (err) {
      emit(config, ET.PHASE_FAILED, `Phase ${phase} failed for IDE ${programId}: ${err instanceof Error ? err.message : 'unknown'}`, { phase, programId });
    }
  }
};

// ─── Migration status ──────────────────────────────────────────

export interface MigrateStatusView {
  programId: string;
  status: string;
  currentPhase: string | null;
  completedPhases: number;
  totalPhases: number;
  files: number;
  errors: number;
}

export const getMigrateStatus = (trackerFile: string): MigrateStatusView[] => {
  const data = readMigrateTracker(trackerFile);
  const views: MigrateStatusView[] = [];

  for (const [id, prog] of Object.entries(data)) {
    views.push({
      programId: id,
      status: prog.status,
      currentPhase: prog.currentPhase,
      completedPhases: Object.values(prog.phases).filter(p => p.status === 'completed').length,
      totalPhases: Object.keys(prog.phases).length,
      files: prog.files.length,
      errors: prog.errors.length,
    });
  }

  return views;
};

// ─── Batch creation ────────────────────────────────────────────

export const createBatch = (
  batchId: string,
  batchName: string,
  programIds: (string | number)[],
  config: MigrateConfig,
): void => {
  const trackerFile = path.join(config.migrationDir, config.contractSubDir, 'tracker.json');
  if (!fs.existsSync(trackerFile)) {
    throw new Error(`Tracker not found: ${trackerFile}`);
  }

  const tracker = readTracker(trackerFile);

  if (tracker.batches.some(b => b.id === batchId)) {
    throw new Error(`Batch "${batchId}" already exists`);
  }

  tracker.batches.push({
    id: batchId,
    name: batchName,
    root: programIds[0],
    programs: programIds.length,
    status: 'pending' as const,
    stats: {
      backendNa: 0,
      frontendEnrich: 0,
      fullyImpl: 0,
      coverageAvgFrontend: 0,
      totalPartial: 0,
      totalMissing: 0,
    },
    priorityOrder: programIds,
  });

  writeTracker(tracker, trackerFile);
};

// ─── Helpers ───────────────────────────────────────────────────

const PHASE_LABELS: Record<MigratePhase, string> = {
  [MP.SPEC]: 'Generating spec...',
  [MP.CONTRACT]: 'Generating contract...',
  [MP.ANALYZE]: 'Analyzing program...',
  [MP.TYPES]: 'Generating types...',
  [MP.STORE]: 'Generating store...',
  [MP.API]: 'Generating API...',
  [MP.PAGE]: 'Generating page...',
  [MP.COMPONENTS]: 'Generating components...',
  [MP.TESTS_UNIT]: 'Generating unit tests...',
  [MP.TESTS_UI]: 'Generating UI tests...',
  [MP.VERIFY_TSC]: 'Running tsc --noEmit...',
  [MP.FIX_TSC]: 'Fixing TypeScript errors...',
  [MP.VERIFY_TESTS]: 'Running tests...',
  [MP.FIX_TESTS]: 'Fixing test errors...',
  [MP.INTEGRATE]: 'Integrating modules...',
  [MP.REVIEW]: 'Reviewing coverage...',
};

const emit = (
  config: MigrateConfig,
  type: MigrateEventType,
  message: string,
  extra?: { phase?: MigratePhase; programId?: string | number; data?: Record<string, unknown> },
): void => {
  if (!config.onEvent) return;

  const event: MigrateEvent = {
    type,
    timestamp: new Date().toISOString(),
    message,
    phase: extra?.phase,
    programId: extra?.programId,
    ...(extra?.data ? { data: extra.data } : {}),
  };

  config.onEvent(event);

  // Emit token_update event if tokens present in data
  if (extra?.data?.tokens) {
    const tokens = extra.data.tokens as { input: number; output: number };
    const cumulative = updateTokens(config.migrationDir, extra.programId!, extra.phase!, tokens, config.model);
    config.onEvent({
      type: 'token_update' as MigrateEventType,
      timestamp: new Date().toISOString(),
      message: `Tokens updated: ${tokens.input} in / ${tokens.output} out`,
      programId: extra.programId,
      phase: extra.phase,
      data: { cumulative, programTokens: tokens },
    } as MigrateEvent);
  }

  // Emit phase_progress event with label for UI display
  if (type === ET.PHASE_STARTED && extra?.phase && extra?.programId) {
    const label = PHASE_LABELS[extra.phase] ?? extra.phase;
    config.onEvent({
      type: 'phase_progress' as MigrateEventType,
      timestamp: new Date().toISOString(),
      message: label,
      programId: extra.programId,
      phase: extra.phase,
      data: { label },
    } as MigrateEvent);
  }
};

const saveMigrateTracker = (trackerFile: string, data: Record<string, import('./migrate-types.js').ProgramMigration>): void => {
  try {
    writeMigrateTracker(trackerFile, data);
  } catch {
    // Non-critical: tracker save failure shouldn't stop migration
  }
};
