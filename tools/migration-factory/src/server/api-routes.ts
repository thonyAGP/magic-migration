/**
 * API route handlers for the Migration Factory action server.
 * Each handler reuses existing core functions and returns JSON.
 */

import type { ServerResponse } from 'node:http';
import path from 'node:path';
import { resolvePipelineConfig } from '../pipeline/pipeline-config.js';
import { getBatchesStatus, preflightBatch, runBatchPipeline } from '../pipeline/pipeline-runner.js';
import { computeGapReport } from './gap-report.js';
import { verifyContracts } from './verify-contracts.js';
import { discoverProjects, readProjectRegistry } from '../dashboard/project-discovery.js';
import { runCalibration } from '../calculators/calibration-runner.js';
import { createSSEStream } from './sse-stream.js';

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
