/**
 * Migration Factory Action Server: serves the interactive dashboard
 * with API endpoints for pipeline operations.
 *
 * Usage: migration-factory serve [--port 3070] [--dir ADH]
 */

import http from 'node:http';
import { URL } from 'node:url';
import path from 'node:path';
import {
  json, handleStatus, handleGaps, handlePreflight, handlePipelineRun, handleVerify,
} from './api-routes.js';
import type { RouteContext } from './api-routes.js';
import { generateServerDashboard } from './dashboard-html.js';

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

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost`);
    const pathname = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (pathname === '/' && req.method === 'GET') {
        const html = await generateServerDashboard(config);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } else if (pathname === '/api/status' && req.method === 'GET') {
        handleStatus(ctx, res);
      } else if (pathname === '/api/gaps' && req.method === 'GET') {
        handleGaps(ctx, url.searchParams, res);
      } else if (pathname === '/api/preflight' && req.method === 'GET') {
        handlePreflight(ctx, url.searchParams, res);
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
      } else {
        json(res, { error: 'Not found' }, 404);
      }
    } catch (err) {
      json(res, { error: String(err) }, 500);
    }
  });

  return new Promise(resolve => {
    server.listen(config.port, () => {
      console.log(`\n  Migration Factory Dashboard`);
      console.log(`  http://localhost:${config.port}\n`);
      console.log(`  Project: ${config.projectDir}`);
      console.log(`  Dir: ${config.dir}`);
      console.log(`  Press Ctrl+C to stop\n`);
      resolve(server);
    });
  });
};
