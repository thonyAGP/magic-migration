/**
 * Migration Factory Action Server: serves the interactive dashboard
 * with API endpoints for pipeline operations.
 *
 * Usage: migration-factory serve [--port 3070] [--dir ADH]
 */
import http from 'node:http';
import { URL } from 'node:url';
import { json, handleStatus, handleGaps, handlePreflight, handlePipelineRun, handlePipelineStream, handleVerify, handleProjects, handleCalibrate, handleGenerate, handleGenerateStream, handleMigrateStream, handleMigrateStatus, handleMigrateBatchCreate, handleMigrateActive, handleMigrateAbort, handleAnalyze, handleAnalyzeGet, } from './api-routes.js';
import { generateServerDashboard } from './dashboard-html.js';
import { endMigration } from './migrate-state.js';
const readBody = (req) => new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
        try {
            resolve(JSON.parse(Buffer.concat(chunks).toString()));
        }
        catch {
            resolve({});
        }
    });
    req.on('error', reject);
});
export const startActionServer = async (config) => {
    const ctx = { projectDir: config.projectDir, dir: config.dir };
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
            }
            else if (pathname === '/api/status' && req.method === 'GET') {
                handleStatus(ctx, res);
            }
            else if (pathname === '/api/gaps' && req.method === 'GET') {
                handleGaps(ctx, url.searchParams, res);
            }
            else if (pathname === '/api/preflight' && req.method === 'GET') {
                handlePreflight(ctx, url.searchParams, res);
            }
            else if (pathname === '/api/pipeline/stream' && req.method === 'GET') {
                if (pipelineRunning) {
                    json(res, { error: 'Pipeline already running' }, 409);
                    return;
                }
                pipelineRunning = true;
                try {
                    await handlePipelineStream(ctx, url.searchParams, res);
                }
                finally {
                    pipelineRunning = false;
                }
            }
            else if (pathname === '/api/pipeline/run' && req.method === 'POST') {
                if (pipelineRunning) {
                    json(res, { error: 'Pipeline already running' }, 409);
                    return;
                }
                pipelineRunning = true;
                try {
                    const body = await readBody(req);
                    await handlePipelineRun(ctx, body, res);
                }
                finally {
                    pipelineRunning = false;
                }
            }
            else if (pathname === '/api/verify' && req.method === 'POST') {
                const body = await readBody(req);
                handleVerify(ctx, body, res);
            }
            else if (pathname === '/api/projects' && req.method === 'GET') {
                handleProjects(ctx, res);
            }
            else if (pathname === '/api/calibrate' && req.method === 'POST') {
                const body = await readBody(req);
                handleCalibrate(ctx, body, res);
            }
            else if (pathname === '/api/generate' && req.method === 'POST') {
                if (pipelineRunning) {
                    json(res, { error: 'Pipeline already running' }, 409);
                    return;
                }
                const body = await readBody(req);
                handleGenerate(ctx, body, res);
            }
            else if (pathname === '/api/generate/stream' && req.method === 'GET') {
                if (pipelineRunning) {
                    json(res, { error: 'Pipeline already running' }, 409);
                    return;
                }
                pipelineRunning = true;
                try {
                    await handleGenerateStream(ctx, url.searchParams, res);
                }
                finally {
                    pipelineRunning = false;
                }
            }
            else if (pathname === '/api/migrate/stream' && req.method === 'GET') {
                if (pipelineRunning) {
                    json(res, { error: 'Pipeline already running' }, 409);
                    return;
                }
                pipelineRunning = true;
                try {
                    await handleMigrateStream(ctx, url.searchParams, res);
                }
                finally {
                    pipelineRunning = false;
                    endMigration();
                }
            }
            else if (pathname === '/api/migrate/abort' && req.method === 'POST') {
                handleMigrateAbort(res);
            }
            else if (pathname === '/api/migrate/active' && req.method === 'GET') {
                handleMigrateActive(ctx, res);
            }
            else if (pathname === '/api/migrate/status' && req.method === 'GET') {
                handleMigrateStatus(ctx, res);
            }
            else if (pathname === '/api/migrate/batch' && req.method === 'POST') {
                const body = await readBody(req);
                handleMigrateBatchCreate(ctx, body, res);
            }
            else if (pathname === '/api/analyze' && req.method === 'POST') {
                const body = await readBody(req);
                await handleAnalyze(ctx, body, res);
            }
            else if (pathname === '/api/analyze' && req.method === 'GET') {
                await handleAnalyzeGet(ctx, res);
            }
            else {
                json(res, { error: 'Not found' }, 404);
            }
        }
        catch (err) {
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
//# sourceMappingURL=action-server.js.map