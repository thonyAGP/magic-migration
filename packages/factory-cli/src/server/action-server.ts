/**
 * Migration Factory Action Server: serves the interactive dashboard
 * with API endpoints for pipeline operations.
 *
 * Usage: migration-factory serve [--port 3070] [--dir ADH]
 */

import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { URL } from 'node:url';
import path from 'node:path';
import {
  json, handleStatus, handleGaps, handlePreflight, handlePipelineRun, handlePipelineStream,
  handleVerify, handleProjects, handleCalibrate, handleGenerate, handleGenerateStream,
  handleMigrateStream, handleMigrateStatus, handleMigrateBatchCreate, handleMigrateActive,
  handleMigrateAbort,
  handleAnalyze, handleAnalyzeGet,
  handleTokensGet, handleTokensBatchGet, handleTokensProgramGet,
  handleLogsGet, handleLogsSearchGet, handleLogsLatestGet,
} from './api-routes.js';
import type { RouteContext } from './api-routes.js';
import { generateServerDashboard } from './dashboard-html.js';
import { endMigration } from './migrate-state.js';
import { createLogger, logError, startTimer } from '../utils/logger.js';

export interface ActionServerConfig {
  port: number;
  projectDir: string;
  dir: string;
}

const readBody = (req: http.IncomingMessage): Promise<Record<string, unknown>> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });

export const startActionServer = async (config: ActionServerConfig): Promise<http.Server> => {
  const ctx: RouteContext = { projectDir: config.projectDir, dir: config.dir };
  let pipelineRunning = false;

  // Server logger for lifecycle events
  const serverLogger = createLogger({
    component: 'action-server',
    port: config.port,
    dir: config.dir,
  });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost`);
    const pathname = url.pathname;

    // Generate correlation ID for request tracing
    const correlationId = randomUUID();
    const reqLogger = createLogger({
      component: 'action-server',
      correlationId,
      method: req.method,
      pathname,
    });

    // Start request timer
    const endTimer = startTimer(
      { correlationId, pathname },
      `HTTP ${req.method} ${pathname}`
    );

    reqLogger.debug({
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
      ip: req.socket.remoteAddress,
    }, 'Request received');

    // CORS headers (whitelist known origins)
    const ALLOWED_ORIGINS = [
      'http://localhost:3070',
      'http://localhost:3071',
      'https://specmap-dashboard.vercel.app',
    ];
    const origin = req.headers.origin ?? '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      reqLogger.debug('CORS preflight request');
      res.writeHead(204);
      res.end();
      endTimer();
      return;
    }

    try {
      if (pathname === '/' && req.method === 'GET') {
        reqLogger.debug('Serving dashboard HTML');
        const html = await generateServerDashboard(config);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' });
        res.end(html);
        reqLogger.info({ statusCode: 200, size: html.length }, 'Dashboard served');
      } else if (pathname === '/api/status' && req.method === 'GET') {
        reqLogger.debug('Handling status request');
        handleStatus(ctx, res);
      } else if (pathname === '/api/gaps' && req.method === 'GET') {
        handleGaps(ctx, url.searchParams, res);
      } else if (pathname === '/api/preflight' && req.method === 'GET') {
        handlePreflight(ctx, url.searchParams, res);
      } else if (pathname === '/api/pipeline/stream' && req.method === 'GET') {
        if (pipelineRunning) {
          reqLogger.warn('Pipeline already running - request rejected');
          json(res, { error: 'Pipeline already running' }, 409);
          return;
        }
        reqLogger.info({ batchId: url.searchParams.get('batch') }, 'Starting pipeline stream');
        pipelineRunning = true;
        try {
          await handlePipelineStream(ctx, url.searchParams, res);
          reqLogger.info('Pipeline stream completed');
        } finally {
          pipelineRunning = false;
        }
      } else if (pathname === '/api/pipeline/run' && req.method === 'POST') {
        if (pipelineRunning) {
          json(res, { error: 'Pipeline already running' }, 409);
          return;
        }
        pipelineRunning = true;
        try {
          const body = await readBody(req);
          await handlePipelineRun(ctx, body, res);
        } finally {
          pipelineRunning = false;
        }
      } else if (pathname === '/api/verify' && req.method === 'POST') {
        const body = await readBody(req);
        handleVerify(ctx, body, res);
      } else if (pathname === '/api/projects' && req.method === 'GET') {
        handleProjects(ctx, res);
      } else if (pathname === '/api/calibrate' && req.method === 'POST') {
        const body = await readBody(req);
        handleCalibrate(ctx, body, res);
      } else if (pathname === '/api/generate' && req.method === 'POST') {
        if (pipelineRunning) {
          json(res, { error: 'Pipeline already running' }, 409);
          return;
        }
        const body = await readBody(req);
        handleGenerate(ctx, body, res);
      } else if (pathname === '/api/generate/stream' && req.method === 'GET') {
        if (pipelineRunning) {
          json(res, { error: 'Pipeline already running' }, 409);
          return;
        }
        pipelineRunning = true;
        try {
          await handleGenerateStream(ctx, url.searchParams, res);
        } finally {
          pipelineRunning = false;
        }
      } else if (pathname === '/api/migrate/stream' && req.method === 'GET') {
        if (pipelineRunning) {
          json(res, { error: 'Pipeline already running' }, 409);
          return;
        }
        pipelineRunning = true;
        try {
          await handleMigrateStream(ctx, url.searchParams, res);
        } finally {
          pipelineRunning = false;
          endMigration();
        }
      } else if (pathname === '/api/migrate/abort' && req.method === 'POST') {
        handleMigrateAbort(res);
      } else if (pathname === '/api/migrate/active' && req.method === 'GET') {
        handleMigrateActive(ctx, res);
      } else if (pathname === '/api/migrate/status' && req.method === 'GET') {
        handleMigrateStatus(ctx, res);
      } else if (pathname === '/api/migrate/batch' && req.method === 'POST') {
        const body = await readBody(req);
        handleMigrateBatchCreate(ctx, body, res);
      } else if (pathname === '/api/analyze' && req.method === 'POST') {
        const body = await readBody(req);
        await handleAnalyze(ctx, body, res);
      } else if (pathname === '/api/analyze' && req.method === 'GET') {
        await handleAnalyzeGet(ctx, res);
      } else if (pathname === '/api/tokens' && req.method === 'GET') {
        reqLogger.debug('Handling tokens request');
        handleTokensGet(ctx, url.searchParams, res);
      } else if (pathname === '/api/tokens/batch' && req.method === 'GET') {
        handleTokensBatchGet(ctx, url.searchParams, res);
      } else if (pathname === '/api/tokens/program' && req.method === 'GET') {
        handleTokensProgramGet(ctx, url.searchParams, res);
      } else if (pathname === '/api/logs' && req.method === 'GET') {
        reqLogger.debug('Handling logs request');
        handleLogsGet(ctx, url.searchParams, res);
      } else if (pathname === '/api/logs/search' && req.method === 'GET') {
        handleLogsSearchGet(ctx, url.searchParams, res);
      } else if (pathname === '/api/logs/latest' && req.method === 'GET') {
        handleLogsLatestGet(ctx, url.searchParams, res);
      } else {
        reqLogger.warn({ pathname }, 'Route not found');
        json(res, { error: 'Not found' }, 404);
      }

      // Log successful completion
      reqLogger.info({ statusCode: res.statusCode }, 'Request completed');
      endTimer();

    } catch (err) {
      // Log error with full context
      logError(
        { correlationId, pathname, method: req.method },
        err as Error,
        'Request failed'
      );

      // Return error to client with correlation ID for debugging
      json(res, { error: String(err), correlationId }, 500);
      endTimer();
    }
  });

  return new Promise(resolve => {
    server.listen(config.port, () => {
      // Console.log for user-facing output (UX)
      console.log(`\n  Migration Factory Dashboard`);
      console.log(`  http://localhost:${config.port}\n`);
      console.log(`  Project: ${config.projectDir}`);
      console.log(`  Dir: ${config.dir}`);
      console.log(`  Press Ctrl+C to stop\n`);

      // Structured log for production monitoring
      serverLogger.info({
        port: config.port,
        projectDir: config.projectDir,
        dir: config.dir,
      }, 'Action server started');

      resolve(server);
    });
  });
};
