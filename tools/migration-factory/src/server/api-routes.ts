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
import { runCodegen, runCodegenEnriched } from '../generators/codegen/codegen-runner.js';
import type { CodegenEnrichConfig, EnrichMode } from '../generators/codegen/enrich-model.js';
import { runMigration, getMigrateStatus, createBatch } from '../migrate/migrate-runner.js';
import { DEFAULT_PHASE_MODELS } from '../migrate/migrate-types.js';
import type { MigrateConfig, MigratePhase } from '../migrate/migrate-types.js';

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
  const targetDir = query.get('targetDir');
  const dryRun = query.get('dryRun') === 'true';
  const parallel = Number(query.get('parallel') ?? '1');
  const maxPasses = Number(query.get('maxPasses') ?? '5');
  const model = query.get('model') ?? 'sonnet';

  if (!targetDir) {
    json(res, { error: 'Missing targetDir parameter' }, 400);
    return;
  }

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
  } else if (programs) {
    programIds = programs.split(',').map(s => s.trim()).filter(Boolean);
    batchId = `auto-${Date.now()}`;
    batchName = 'Ad-hoc migration';
  } else {
    json(res, { error: 'Missing batch or programs parameter' }, 400);
    return;
  }

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
  };

  const sse = createSSEStream(res);
  migrateConfig.onEvent = (event) => sse.send(event);

  sse.send({ type: 'migrate_started', batch: batchId, programs: programIds.length, targetDir, dryRun });

  try {
    const result = await runMigration(programIds, batchId, batchName, migrateConfig);
    sse.send({ type: 'migrate_result', data: result });
  } catch (err) {
    sse.send({ type: 'error', message: String(err) });
  }

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
