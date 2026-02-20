/**
 * Migration Runner - Orchestrates the 15-phase pipeline.
 * Supports per-program parallel execution (phases 0-9) and
 * sequential batch verification (phases 10-15).
 */

import fs from 'node:fs';
import path from 'node:path';
import type {
  MigrateConfig, MigrateResult, MigrateEvent, MigrateEventType,
  MigrateSummary, ProgramMigrateResult, AnalysisDocument, MigratePhase,
} from './migrate-types.js';
import { MigratePhase as MP, MigrateEventType as ET } from './migrate-types.js';
import {
  readMigrateTracker, writeMigrateTracker, getOrCreateProgram,
  startPhase, completePhase, failPhase, markProgramCompleted, markProgramFailed,
  isPhaseCompleted,
} from './migrate-tracker.js';
import { setClaudeLogDir } from './migrate-claude.js';
import { readTracker, writeTracker } from '../core/tracker.js';
import { loadContracts } from '../core/contract.js';
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

  // Run programs with concurrency limit
  const limit = config.parallel;
  const chunks: (string | number)[][] = [];
  for (let i = 0; i < programIds.length; i += limit) {
    chunks.push(programIds.slice(i, i + limit));
  }

  for (const chunk of chunks) {
    const results = await Promise.all(
      chunk.map(id => runProgramGeneration(id, config, trackerFile)),
    );

    for (const r of results) {
      programResults.push(r.result);
      if (r.analysis) analyses.set(r.result.programId, r.analysis);
    }
  }

  // Phase 10-13: Verify + Fix (sequential, batch-wide)
  let tscClean = false;
  let testsPass = false;

  if (!config.dryRun && programResults.some(r => r.status === 'completed')) {
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

  const summary: MigrateSummary = {
    total: programIds.length,
    completed: programResults.filter(r => r.status === 'completed').length,
    failed: programResults.filter(r => r.status === 'failed').length,
    skipped: programResults.filter(r => r.status === 'skipped').length,
    totalFiles: programResults.reduce((sum, r) => sum + r.filesGenerated, 0),
    tscClean,
    testsPass,
    reviewAvgCoverage: reviewCount > 0 ? Math.round(totalCoverage / reviewCount) : 0,
  };

  const totalDuration = Date.now() - migrationStart;
  emit(config, ET.MIGRATION_COMPLETED, `Migration complete: ${summary.completed}/${summary.total} programs, ${summary.totalFiles} files in ${formatDuration(totalDuration)}`);

  return {
    batchId,
    batchName,
    started,
    completed: new Date().toISOString(),
    dryRun: config.dryRun,
    programs: programResults,
    summary,
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

  emit(config, ET.PROGRAM_STARTED, `Starting IDE ${programId}`, { programId });

  try {
    // Phase 0: SPEC
    if (!isPhaseCompleted(prog, MP.SPEC)) {
      startPhase(prog, MP.SPEC);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating spec`, { phase: MP.SPEC, programId });
      const specResult = await runSpecPhase(programId, config);
      completePhase(prog, MP.SPEC, { file: specResult.specFile, duration: specResult.duration });
      if (!specResult.skipped) files.push(specResult.specFile);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 1: CONTRACT
    if (!isPhaseCompleted(prog, MP.CONTRACT)) {
      startPhase(prog, MP.CONTRACT);
      emit(config, ET.PHASE_STARTED, `IDE ${programId}: generating contract`, { phase: MP.CONTRACT, programId });
      const contractResult = runContractPhase(programId, config);
      completePhase(prog, MP.CONTRACT, { file: contractResult.contractFile, duration: contractResult.duration });
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 2: ANALYZE
    if (!isPhaseCompleted(prog, MP.ANALYZE)) {
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
    if (!isPhaseCompleted(prog, MP.TYPES)) {
      startPhase(prog, MP.TYPES);
      const typesResult = await runTypesPhase(programId, analysis, config);
      completePhase(prog, MP.TYPES, { file: typesResult.file, duration: typesResult.duration });
      if (!typesResult.skipped) files.push(typesResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 4: STORE
    if (!isPhaseCompleted(prog, MP.STORE)) {
      startPhase(prog, MP.STORE);
      const storeResult = await runStorePhase(programId, analysis, config);
      completePhase(prog, MP.STORE, { file: storeResult.file, duration: storeResult.duration });
      if (!storeResult.skipped) files.push(storeResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 5: API
    if (!isPhaseCompleted(prog, MP.API)) {
      startPhase(prog, MP.API);
      const apiResult = await runApiPhase(programId, analysis, config);
      completePhase(prog, MP.API, { file: apiResult.file, duration: apiResult.duration });
      if (!apiResult.skipped) files.push(apiResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 6: PAGE
    if (!isPhaseCompleted(prog, MP.PAGE)) {
      startPhase(prog, MP.PAGE);
      const pageResult = await runPagePhase(programId, analysis, config);
      completePhase(prog, MP.PAGE, { file: pageResult.file, duration: pageResult.duration });
      if (!pageResult.skipped) files.push(pageResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 7: COMPONENTS
    if (!isPhaseCompleted(prog, MP.COMPONENTS)) {
      startPhase(prog, MP.COMPONENTS);
      const compResult = await runComponentsPhase(programId, analysis, config);
      for (const r of compResult.files) {
        if (!r.skipped) files.push(r.file);
      }
      completePhase(prog, MP.COMPONENTS, { duration: compResult.totalDuration });
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 8: TESTS-UNIT
    if (!isPhaseCompleted(prog, MP.TESTS_UNIT)) {
      startPhase(prog, MP.TESTS_UNIT);
      const testUnitResult = await runTestsUnitPhase(programId, analysis, config);
      completePhase(prog, MP.TESTS_UNIT, { file: testUnitResult.file, duration: testUnitResult.duration });
      if (!testUnitResult.skipped) files.push(testUnitResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    // Phase 9: TESTS-UI
    if (!isPhaseCompleted(prog, MP.TESTS_UI)) {
      startPhase(prog, MP.TESTS_UI);
      const testUiResult = await runTestsUiPhase(programId, analysis, config);
      completePhase(prog, MP.TESTS_UI, { file: testUiResult.file, duration: testUiResult.duration });
      if (!testUiResult.skipped) files.push(testUiResult.file);
      saveMigrateTracker(trackerFile, migrateData);
    }

    markProgramCompleted(prog);
    saveMigrateTracker(trackerFile, migrateData);

    const elapsed = Date.now() - start;
    emit(config, ET.PROGRAM_COMPLETED, `IDE ${programId}: ${files.length} files generated in ${formatDuration(elapsed)}`, { programId });

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
      },
      analysis,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const currentPhase = prog.currentPhase;
    if (currentPhase) failPhase(prog, currentPhase, errorMsg);
    markProgramFailed(prog, errorMsg);
    saveMigrateTracker(trackerFile, migrateData);

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

const emit = (
  config: MigrateConfig,
  type: MigrateEventType,
  message: string,
  extra?: { phase?: MigratePhase; programId?: string | number; data?: Record<string, unknown> },
): void => {
  if (!config.onEvent) return;
  config.onEvent({
    type,
    timestamp: new Date().toISOString(),
    message,
    phase: extra?.phase,
    programId: extra?.programId,
    ...(extra?.data ? { data: extra.data } : {}),
  } as MigrateEvent);
};

const saveMigrateTracker = (trackerFile: string, data: Record<string, import('./migrate-types.js').ProgramMigration>): void => {
  try {
    writeMigrateTracker(trackerFile, data);
  } catch {
    // Non-critical: tracker save failure shouldn't stop migration
  }
};
