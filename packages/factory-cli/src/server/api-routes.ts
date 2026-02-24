/**
 * API route handlers for the Migration Factory action server.
 * Each handler reuses existing core functions and returns JSON.
 */

import type { ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePipelineConfig } from '../pipeline/pipeline-config.js';
import { getBatchesStatus, preflightBatch, runBatchPipeline } from '../pipeline/pipeline-runner.js';
import { computeGapReport } from './gap-report.js';
import { verifyContracts } from './verify-contracts.js';
import { discoverProjects, readProjectRegistry } from '../dashboard/project-discovery.js';
import { runCalibration } from '../calculators/calibration-runner.js';
import { createSSEStream } from './sse-stream.js';
import { loadContracts } from '../core/contract.js';
import { readTracker } from '../core/tracker.js';
import { getTokensData, getBatchTokens, getProgramTokens } from './token-tracker.js';
import { readLogs, searchLogs, getLatestLogs } from './log-storage.js';
import { runCodegen, runCodegenEnriched } from '../generators/codegen/codegen-runner.js';
import type { CodegenEnrichConfig, EnrichMode } from '../generators/codegen/enrich-model.js';
import { runMigration, getMigrateStatus, createBatch } from '../migrate/migrate-runner.js';
import { DEFAULT_PHASE_MODELS } from '../migrate/migrate-types.js';
import type { MigrateConfig, MigratePhase } from '../migrate/migrate-types.js';
import { configureClaudeMode } from '../migrate/migrate-claude.js';
import { startMigration, addMigrateEvent, endMigration, getMigrateActiveState } from './migrate-state.js';
import { createMagicAdapter } from '../adapters/magic-adapter.js';
import { resolveDependencies } from '../calculators/dependency-resolver.js';
import { analyzeProject, analyzedBatchesToTrackerBatches } from '../calculators/project-analyzer.js';
import { upsertBatches, writeTracker } from '../core/tracker.js';

export interface RouteContext {
  projectDir: string;
  dir: string;
}

export const json = (res: ServerResponse, data: unknown, status = 200): void => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
};

const resolveConfig = (ctx: RouteContext, overrides?: Record<string, unknown>) => {
  const input: Record<string, unknown> = {
    projectDir: ctx.projectDir,
    dir: ctx.dir,
    ...overrides,
  };
  return resolvePipelineConfig(input as unknown as Parameters<typeof resolvePipelineConfig>[0]);
};

export const handleStatus = (ctx: RouteContext, res: ServerResponse): void => {
  const config = resolveConfig(ctx);
  json(res, getBatchesStatus(config));
};

export const handleGaps = (ctx: RouteContext, query: URLSearchParams, res: ServerResponse): void => {
  const dir = query.get('dir') ?? ctx.dir;
  const config = resolveConfig({ ...ctx, dir });
  const contractDir = path.join(config.migrationDir, config.contractSubDir);
  const report = computeGapReport(contractDir, query.get('status') ?? undefined);
  json(res, report);
};

export const handlePreflight = (ctx: RouteContext, query: URLSearchParams, res: ServerResponse): void => {
  const batch = query.get('batch');
  if (!batch) {
    json(res, { error: 'Missing batch parameter' }, 400);
    return;
  }
  const config = resolveConfig(ctx);
  const result = preflightBatch(batch, config);
  json(res, result);
};

export const handlePipelineRun = async (
  ctx: RouteContext,
  body: Record<string, unknown>,
  res: ServerResponse,
): Promise<void> => {
  const batch = body.batch as string;
  if (!batch) {
    json(res, { error: 'Missing batch in body' }, 400);
    return;
  }
  const config = resolveConfig(ctx, {
    enrich: body.enrich as string | undefined,
    model: body.model as string | undefined,
    dryRun: body.dryRun === true,
  });
  const result = await runBatchPipeline(batch, config);
  json(res, result);
};

export const handleVerify = (ctx: RouteContext, body: Record<string, unknown>, res: ServerResponse): void => {
  const dir = (body.dir as string) ?? ctx.dir;
  const config = resolveConfig({ ...ctx, dir });
  const contractDir = path.join(config.migrationDir, config.contractSubDir);
  const result = verifyContracts(contractDir, {
    programs: body.programs as string | undefined,
    dryRun: body.dryRun === true,
  });
  json(res, result);
};

export const handleProjects = (ctx: RouteContext, res: ServerResponse): void => {
  const migDir = path.join(ctx.projectDir, '.openspec', 'migration');
  const active = discoverProjects(migDir);
  const registry = readProjectRegistry(migDir);
  json(res, { active, registry });
};

export const handleCalibrate = (ctx: RouteContext, body: Record<string, unknown>, res: ServerResponse): void => {
  const dir = (body.dir as string) ?? ctx.dir;
  const config = resolveConfig({ ...ctx, dir });
  const result = runCalibration(config, body.dryRun === true);
  json(res, result);
};

export const handleGenerate = async (
  ctx: RouteContext,
  body: Record<string, unknown>,
  res: ServerResponse,
): Promise<void> => {
  const batch = body.batch as string | undefined;
  const outputDir = body.outputDir as string | undefined;
  const dryRun = body.dryRun === true;
  const overwrite = body.overwrite === true;
  const enrichMode = (body.enrich as EnrichMode) ?? 'none';
  const enrichModel = body.model as string | undefined;

  if (!batch || !outputDir) {
    json(res, { error: 'Missing batch or outputDir in body' }, 400);
    return;
  }

  const config = resolveConfig(ctx);
  const contractDir = path.join(config.migrationDir, config.contractSubDir);
  const trackerFile = path.join(config.migrationDir, config.contractSubDir, 'tracker.json');

  if (!fs.existsSync(trackerFile)) {
    json(res, { error: `Tracker not found: ${trackerFile}` }, 404);
    return;
  }

  const tracker = readTracker(trackerFile);
  const batchDef = tracker.batches.find(b => b.id === batch);
  if (!batchDef) {
    json(res, { error: `Batch "${batch}" not found` }, 404);
    return;
  }

  const contracts = loadContracts(contractDir);
  const results = [];
  const enrichConfig: CodegenEnrichConfig = { mode: enrichMode, model: enrichModel };

  for (const progId of batchDef.priorityOrder) {
    const contract = contracts.get(progId);
    if (!contract) continue;
    const result = enrichMode !== 'none'
      ? await runCodegenEnriched(contract, { outputDir, dryRun, overwrite }, enrichConfig)
      : runCodegen(contract, { outputDir, dryRun, overwrite });
    results.push(result);
  }

  const totalWritten = results.reduce((sum, r) => sum + r.written, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  json(res, { batch, programs: results.length, totalWritten, totalSkipped, dryRun, enrich: enrichMode, results });
};

export const handleGenerateStream = async (
  ctx: RouteContext,
  query: URLSearchParams,
  res: ServerResponse,
): Promise<void> => {
  const batch = query.get('batch');
  const outputDir = query.get('outputDir');
  const dryRun = query.get('dryRun') === 'true';
  const overwrite = query.get('overwrite') === 'true';
  const enrichMode = (query.get('enrich') ?? 'none') as EnrichMode;
  const enrichModel = query.get('model') ?? undefined;

  if (!batch || !outputDir) {
    json(res, { error: 'Missing batch or outputDir parameter' }, 400);
    return;
  }

  const config = resolveConfig(ctx);
  const contractDir = path.join(config.migrationDir, config.contractSubDir);
  const trackerFile = path.join(config.migrationDir, config.contractSubDir, 'tracker.json');

  if (!fs.existsSync(trackerFile)) {
    json(res, { error: `Tracker not found` }, 404);
    return;
  }

  const tracker = readTracker(trackerFile);
  const batchDef = tracker.batches.find(b => b.id === batch);
  if (!batchDef) {
    json(res, { error: `Batch "${batch}" not found` }, 404);
    return;
  }

  const contracts = loadContracts(contractDir);
  const sse = createSSEStream(res);
  const enrichConfig: CodegenEnrichConfig = { mode: enrichMode, model: enrichModel };

  sse.send({ type: 'codegen_started', batch, total: batchDef.priorityOrder.length, enrich: enrichMode });

  let totalWritten = 0;
  let totalSkipped = 0;
  let processed = 0;

  for (const progId of batchDef.priorityOrder) {
    const contract = contracts.get(progId);
    if (!contract) {
      sse.send({ type: 'codegen_skip', programId: progId, message: 'No contract found' });
      continue;
    }

    const result = enrichMode !== 'none'
      ? await runCodegenEnriched(contract, { outputDir, dryRun, overwrite }, enrichConfig)
      : runCodegen(contract, { outputDir, dryRun, overwrite });
    totalWritten += result.written;
    totalSkipped += result.skipped;
    processed++;

    sse.send({
      type: 'codegen_program',
      programId: result.programId,
      programName: result.programName,
      written: result.written,
      skipped: result.skipped,
      files: result.files.map(f => ({ path: f.relativePath, skipped: f.skipped })),
      progress: `${processed}/${batchDef.priorityOrder.length}`,
    });
  }

  sse.send({ type: 'codegen_completed', batch, processed, totalWritten, totalSkipped, dryRun, enrich: enrichMode });
  sse.close();
};

export const handlePipelineStream = async (
  ctx: RouteContext,
  query: URLSearchParams,
  res: ServerResponse,
): Promise<void> => {
  const batch = query.get('batch');
  if (!batch) {
    json(res, { error: 'Missing batch parameter' }, 400);
    return;
  }

  const dryRun = query.get('dryRun') === 'true';
  const enrich = query.get('enrich') ?? undefined;
  const model = query.get('model') ?? undefined;

  // Auto-preflight
  const preConfig = resolveConfig(ctx);
  const preflight = preflightBatch(batch, preConfig);

  const sse = createSSEStream(res);
  sse.send({ type: 'preflight', data: preflight });

  if (preflight.summary.blocked > 0 && preflight.summary.ready === 0 && preflight.summary.alreadyDone === 0) {
    sse.send({ type: 'error', message: `Batch ${batch} blocked: ${preflight.summary.blocked} programs cannot proceed` });
    sse.close();
    return;
  }

  // Run pipeline with live events
  const config = resolveConfig(ctx, { dryRun, enrich, model });
  config.onEvent = (event) => sse.send(event);

  const result = await runBatchPipeline(batch, config);

  sse.send({ type: 'pipeline_result', data: result });
  sse.close();
};

// ─── Migrate Module (v10) ─────────────────────────────────────

export const handleMigrateStream = async (
  ctx: RouteContext,
  query: URLSearchParams,
  res: ServerResponse,
): Promise<void> => {
  const batch = query.get('batch');
  const programs = query.get('programs');
  const rawTargetDir = query.get('targetDir');
  const dryRun = query.get('dryRun') === 'true';
  const parallel = Number(query.get('parallel') ?? '0');
  const maxPasses = Number(query.get('maxPasses') ?? '5');
  const model = query.get('model') ?? 'sonnet';
  const claudeMode = (query.get('mode') ?? 'cli') as 'api' | 'cli';

  if (!rawTargetDir) {
    json(res, { error: 'Missing targetDir parameter' }, 400);
    return;
  }

  // Configure Claude invocation mode (API key or CLI)
  configureClaudeMode(claudeMode, claudeMode === 'api' ? process.env.ANTHROPIC_API_KEY : undefined);

  // Resolve relative paths against project dir
  const targetDir = path.isAbsolute(rawTargetDir) ? rawTargetDir : path.resolve(ctx.projectDir, rawTargetDir);

  const config = resolveConfig(ctx);
  const trackerFile = path.join(config.migrationDir, config.contractSubDir, 'tracker.json');

  if (!fs.existsSync(trackerFile)) {
    json(res, { error: 'Tracker not found' }, 404);
    return;
  }

  // Resolve program IDs
  let programIds: (string | number)[];
  let batchId: string;
  let batchName: string;
  let batchEstimatedHours = 0;

  if (batch) {
    const tracker = readTracker(trackerFile);
    const batchDef = tracker.batches.find(b => b.id === batch);
    if (!batchDef) {
      json(res, { error: `Batch "${batch}" not found` }, 404);
      return;
    }
    programIds = batchDef.priorityOrder;
    batchId = batchDef.id;
    batchName = batchDef.name;
    batchEstimatedHours = batchDef.estimatedHours ?? 0;
  } else if (programs) {
    programIds = programs.split(',').map(s => s.trim()).filter(Boolean);
    batchId = `auto-${Date.now()}`;
    batchName = 'Ad-hoc migration';
  } else {
    json(res, { error: 'Missing batch or programs parameter' }, 400);
    return;
  }

  _migrateAbortController = new AbortController();

  const migrateConfig: MigrateConfig = {
    projectDir: ctx.projectDir,
    targetDir,
    migrationDir: config.migrationDir,
    specDir: path.join(ctx.projectDir, '.openspec', 'specs'),
    contractSubDir: config.contractSubDir,
    parallel,
    maxPasses,
    dryRun,
    model,
    phaseModels: DEFAULT_PHASE_MODELS,
    cliBin: 'claude',
    onEvent: undefined,
    autoCommit: true,
    abortSignal: _migrateAbortController.signal,
  };

  // Build program list with names for dashboard grid
  const contractDir = path.join(config.migrationDir, config.contractSubDir);
  const contracts = loadContracts(contractDir);
  const programList = programIds.map(id => ({
    id,
    name: contracts.get(id)?.program.name ?? `IDE-${id}`,
  }));

  const sse = createSSEStream(res);

  // Buffer events for dashboard reconnection after page refresh
  startMigration(batchId, programIds.length, targetDir, claudeMode, dryRun, programList, batchEstimatedHours);

  const bufferedSend = (event: unknown) => {
    addMigrateEvent(event);
    sse.send(event);
  };

  migrateConfig.onEvent = (event) => bufferedSend(event);

  bufferedSend({ type: 'migrate_started', batch: batchId, programs: programIds.length, targetDir, dryRun, mode: claudeMode, programList, estimatedHours: batchEstimatedHours || null, parallel });

  try {
    const result = await runMigration(programIds, batchId, batchName, migrateConfig);
    bufferedSend({ type: 'migrate_result', data: result });
  } catch (err) {
    bufferedSend({ type: 'error', message: String(err) });
  }

  _migrateAbortController = null;
  endMigration();
  sse.close();
};

export const handleMigrateStatus = (ctx: RouteContext, res: ServerResponse): void => {
  const config = resolveConfig(ctx);
  const trackerFile = path.join(config.migrationDir, config.contractSubDir, 'tracker.json');
  if (!fs.existsSync(trackerFile)) {
    json(res, []);
    return;
  }
  json(res, getMigrateStatus(trackerFile));
};

export const handleMigrateBatchCreate = (
  ctx: RouteContext,
  body: Record<string, unknown>,
  res: ServerResponse,
): void => {
  const id = body.id as string;
  const name = body.name as string;
  const programs = body.programs as (string | number)[];

  if (!id || !name || !programs?.length) {
    json(res, { error: 'Missing id, name, or programs' }, 400);
    return;
  }

  const config = resolveConfig(ctx);
  const migrateConfig: MigrateConfig = {
    projectDir: ctx.projectDir,
    targetDir: '',
    migrationDir: config.migrationDir,
    specDir: '',
    contractSubDir: config.contractSubDir,
    parallel: 1,
    maxPasses: 5,
    dryRun: false,
    model: 'sonnet',
    cliBin: 'claude',
  };

  try {
    createBatch(id, name, programs, migrateConfig);
    json(res, { ok: true, id, name, programs: programs.length });
  } catch (err) {
    json(res, { error: err instanceof Error ? err.message : String(err) }, 400);
  }
};

export const handleMigrateActive = (_ctx: RouteContext, res: ServerResponse): void => {
  json(res, getMigrateActiveState());
};

// ─── Abort running migration ────────────────────────────────────

let _migrateAbortController: AbortController | null = null;

export const handleMigrateAbort = (res: ServerResponse): void => {
  if (_migrateAbortController) {
    _migrateAbortController.abort();
    _migrateAbortController = null;
    json(res, { aborted: true });
  } else {
    json(res, { aborted: false, message: 'No migration running' });
  }
};

// ─── Analyze Project (v11) ───────────────────────────────────────

export const handleAnalyze = async (
  ctx: RouteContext,
  body: Record<string, unknown>,
  res: ServerResponse,
): Promise<void> => {
  const dryRun = body.dryRun === true;
  const config = resolveConfig(ctx);
  const projMigDir = path.join(config.migrationDir, config.contractSubDir);
  const projLiveFile = path.join(projMigDir, 'live-programs.json');
  const projTrackerFile = path.join(projMigDir, 'tracker.json');

  const adapter = createMagicAdapter(ctx.projectDir, {
    migrationDir: projMigDir,
    liveProgramsFile: projLiveFile,
    contractPattern: new RegExp(`${config.contractSubDir}-IDE-.*\\.contract\\.yaml$`),
  });

  const graph = await adapter.extractProgramGraph();
  const resolved = resolveDependencies(graph.programs);

  const tracker = fs.existsSync(projTrackerFile) ? readTracker(projTrackerFile) : undefined;

  const analysis = analyzeProject({
    projectName: ctx.dir,
    programs: graph.programs,
    adjacency: resolved.adjacency,
    levels: resolved.levels,
    sccs: resolved.sccs,
    maxLevel: resolved.maxLevel,
    tracker,
  });

  if (!dryRun && tracker) {
    const newBatches = analyzedBatchesToTrackerBatches(analysis.batches);
    const updated = upsertBatches(tracker, newBatches);
    writeTracker(updated, projTrackerFile);
  }

  json(res, analysis);
};

export const handleAnalyzeGet = async (
  ctx: RouteContext,
  res: ServerResponse,
): Promise<void> => {
  const config = resolveConfig(ctx);
  const projMigDir = path.join(config.migrationDir, config.contractSubDir);
  const projTrackerFile = path.join(projMigDir, 'tracker.json');

  if (!fs.existsSync(projTrackerFile)) {
    json(res, { batches: [], message: 'No tracker found' });
    return;
  }

  const tracker = readTracker(projTrackerFile);
  json(res, {
    batches: tracker.batches.map(b => ({
      id: b.id,
      name: b.name,
      programs: b.programs,
      domain: b.domain,
      complexityGrade: b.complexityGrade,
      estimatedHours: b.estimatedHours,
      autoDetected: b.autoDetected,
      status: b.status,
    })),
  });
};

// ─── Token Endpoints ────────────────────────────────────────────

/**
 * GET /api/tokens?dir={project}
 * Returns global + batch + program token usage.
 */
export const handleTokensGet = (ctx: RouteContext, query: URLSearchParams, res: ServerResponse): void => {
  const dir = query.get('dir') ?? ctx.dir;
  const config = resolveConfig({ ...ctx, dir });
  const migrationDir = path.join(config.migrationDir, config.contractSubDir);

  const data = getTokensData(migrationDir);
  if (!data) {
    json(res, { global: { input: 0, output: 0, costUsd: 0, totalCalls: 0 }, batches: {}, programs: {} });
    return;
  }

  json(res, data);
};

/**
 * GET /api/tokens/batch?dir={project}&batch={batchId}
 * Returns token usage for a specific batch.
 */
export const handleTokensBatchGet = (ctx: RouteContext, query: URLSearchParams, res: ServerResponse): void => {
  const dir = query.get('dir') ?? ctx.dir;
  const batch = query.get('batch');
  if (!batch) {
    json(res, { error: 'Missing batch parameter' }, 400);
    return;
  }

  const config = resolveConfig({ ...ctx, dir });
  const migrationDir = path.join(config.migrationDir, config.contractSubDir);

  const data = getBatchTokens(migrationDir, batch);
  if (!data) {
    json(res, { input: 0, output: 0, costUsd: 0, perPhase: {} });
    return;
  }

  json(res, data);
};

/**
 * GET /api/tokens/program?dir={project}&program={programId}
 * Returns token usage for a specific program.
 */
export const handleTokensProgramGet = (ctx: RouteContext, query: URLSearchParams, res: ServerResponse): void => {
  const dir = query.get('dir') ?? ctx.dir;
  const program = query.get('program');
  if (!program) {
    json(res, { error: 'Missing program parameter' }, 400);
    return;
  }

  const config = resolveConfig({ ...ctx, dir });
  const migrationDir = path.join(config.migrationDir, config.contractSubDir);

  const data = getProgramTokens(migrationDir, program);
  if (!data) {
    json(res, { input: 0, output: 0, costUsd: 0 });
    return;
  }

  json(res, data);
};

// ─── Log Endpoints ──────────────────────────────────────────────

/**
 * GET /api/logs?dir={project}&batch={batchId}&offset=0&limit=100&level=info
 * Returns migration logs with pagination and filtering.
 */
export const handleLogsGet = (ctx: RouteContext, query: URLSearchParams, res: ServerResponse): void => {
  const dir = query.get('dir') ?? ctx.dir;
  const batch = query.get('batch');
  if (!batch) {
    json(res, { error: 'Missing batch parameter' }, 400);
    return;
  }

  const config = resolveConfig({ ...ctx, dir });
  const logDir = path.join(config.migrationDir, config.contractSubDir, 'logs');

  const offset = Number(query.get('offset') ?? '0');
  const limit = Number(query.get('limit') ?? '100');
  const level = query.get('level') as 'info' | 'warn' | 'error' | 'debug' | undefined;

  const result = readLogs(logDir, batch, { offset, limit, level });
  json(res, result);
};

/**
 * GET /api/logs/search?dir={project}&batch={batchId}&q={searchText}&level=info
 * Search logs by text.
 */
export const handleLogsSearchGet = (ctx: RouteContext, query: URLSearchParams, res: ServerResponse): void => {
  const dir = query.get('dir') ?? ctx.dir;
  const batch = query.get('batch');
  const q = query.get('q');
  if (!batch || !q) {
    json(res, { error: 'Missing batch or q parameter' }, 400);
    return;
  }

  const config = resolveConfig({ ...ctx, dir });
  const logDir = path.join(config.migrationDir, config.contractSubDir, 'logs');

  const level = query.get('level') as 'info' | 'warn' | 'error' | 'debug' | undefined;
  const limit = Number(query.get('limit') ?? '100');

  const logs = searchLogs(logDir, batch, q, { level, limit });
  json(res, logs);
};

/**
 * GET /api/logs/latest?dir={project}&batch={batchId}&count=100&level=info
 * Get latest N logs (most recent first).
 */
export const handleLogsLatestGet = (ctx: RouteContext, query: URLSearchParams, res: ServerResponse): void => {
  const dir = query.get('dir') ?? ctx.dir;
  const batch = query.get('batch');
  if (!batch) {
    json(res, { error: 'Missing batch parameter' }, 400);
    return;
  }

  const config = resolveConfig({ ...ctx, dir });
  const logDir = path.join(config.migrationDir, config.contractSubDir, 'logs');

  const count = Number(query.get('count') ?? '100');
  const level = query.get('level') as 'info' | 'warn' | 'error' | 'debug' | undefined;

  const logs = getLatestLogs(logDir, batch, count, level);
  json(res, logs);
};
