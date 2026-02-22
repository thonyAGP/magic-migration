/**
 * API route handlers for the Migration Factory action server.
 * Each handler reuses existing core functions and returns JSON.
 */
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
import { runMigration, getMigrateStatus, createBatch } from '../migrate/migrate-runner.js';
import { DEFAULT_PHASE_MODELS } from '../migrate/migrate-types.js';
import { configureClaudeMode } from '../migrate/migrate-claude.js';
import { startMigration, addMigrateEvent, endMigration, getMigrateActiveState } from './migrate-state.js';
import { createMagicAdapter } from '../adapters/magic-adapter.js';
import { resolveDependencies } from '../calculators/dependency-resolver.js';
import { analyzeProject, analyzedBatchesToTrackerBatches } from '../calculators/project-analyzer.js';
import { upsertBatches, writeTracker } from '../core/tracker.js';
export const json = (res, data, status = 200) => {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(data));
};
const resolveConfig = (ctx, overrides) => {
    const input = {
        projectDir: ctx.projectDir,
        dir: ctx.dir,
        ...overrides,
    };
    return resolvePipelineConfig(input);
};
export const handleStatus = (ctx, res) => {
    const config = resolveConfig(ctx);
    json(res, getBatchesStatus(config));
};
export const handleGaps = (ctx, query, res) => {
    const dir = query.get('dir') ?? ctx.dir;
    const config = resolveConfig({ ...ctx, dir });
    const contractDir = path.join(config.migrationDir, config.contractSubDir);
    const report = computeGapReport(contractDir, query.get('status') ?? undefined);
    json(res, report);
};
export const handlePreflight = (ctx, query, res) => {
    const batch = query.get('batch');
    if (!batch) {
        json(res, { error: 'Missing batch parameter' }, 400);
        return;
    }
    const config = resolveConfig(ctx);
    const result = preflightBatch(batch, config);
    json(res, result);
};
export const handlePipelineRun = async (ctx, body, res) => {
    const batch = body.batch;
    if (!batch) {
        json(res, { error: 'Missing batch in body' }, 400);
        return;
    }
    const config = resolveConfig(ctx, {
        enrich: body.enrich,
        model: body.model,
        dryRun: body.dryRun === true,
    });
    const result = await runBatchPipeline(batch, config);
    json(res, result);
};
export const handleVerify = (ctx, body, res) => {
    const dir = body.dir ?? ctx.dir;
    const config = resolveConfig({ ...ctx, dir });
    const contractDir = path.join(config.migrationDir, config.contractSubDir);
    const result = verifyContracts(contractDir, {
        programs: body.programs,
        dryRun: body.dryRun === true,
    });
    json(res, result);
};
export const handleProjects = (ctx, res) => {
    const migDir = path.join(ctx.projectDir, '.openspec', 'migration');
    const active = discoverProjects(migDir);
    const registry = readProjectRegistry(migDir);
    json(res, { active, registry });
};
export const handleCalibrate = (ctx, body, res) => {
    const dir = body.dir ?? ctx.dir;
    const config = resolveConfig({ ...ctx, dir });
    const result = runCalibration(config, body.dryRun === true);
    json(res, result);
};
export const handleGenerate = async (ctx, body, res) => {
    const batch = body.batch;
    const outputDir = body.outputDir;
    const dryRun = body.dryRun === true;
    const overwrite = body.overwrite === true;
    const enrichMode = body.enrich ?? 'none';
    const enrichModel = body.model;
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
    const enrichConfig = { mode: enrichMode, model: enrichModel };
    for (const progId of batchDef.priorityOrder) {
        const contract = contracts.get(progId);
        if (!contract)
            continue;
        const result = enrichMode !== 'none'
            ? await runCodegenEnriched(contract, { outputDir, dryRun, overwrite }, enrichConfig)
            : runCodegen(contract, { outputDir, dryRun, overwrite });
        results.push(result);
    }
    const totalWritten = results.reduce((sum, r) => sum + r.written, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
    json(res, { batch, programs: results.length, totalWritten, totalSkipped, dryRun, enrich: enrichMode, results });
};
export const handleGenerateStream = async (ctx, query, res) => {
    const batch = query.get('batch');
    const outputDir = query.get('outputDir');
    const dryRun = query.get('dryRun') === 'true';
    const overwrite = query.get('overwrite') === 'true';
    const enrichMode = (query.get('enrich') ?? 'none');
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
    const enrichConfig = { mode: enrichMode, model: enrichModel };
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
export const handlePipelineStream = async (ctx, query, res) => {
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
export const handleMigrateStream = async (ctx, query, res) => {
    const batch = query.get('batch');
    const programs = query.get('programs');
    const rawTargetDir = query.get('targetDir');
    const dryRun = query.get('dryRun') === 'true';
    const parallel = Number(query.get('parallel') ?? '0');
    const maxPasses = Number(query.get('maxPasses') ?? '5');
    const model = query.get('model') ?? 'sonnet';
    const claudeMode = (query.get('mode') ?? 'cli');
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
    let programIds;
    let batchId;
    let batchName;
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
    }
    else if (programs) {
        programIds = programs.split(',').map(s => s.trim()).filter(Boolean);
        batchId = `auto-${Date.now()}`;
        batchName = 'Ad-hoc migration';
    }
    else {
        json(res, { error: 'Missing batch or programs parameter' }, 400);
        return;
    }
    _migrateAbortController = new AbortController();
    const migrateConfig = {
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
    startMigration(batchId, programIds.length, targetDir, claudeMode, dryRun, programList);
    const bufferedSend = (event) => {
        addMigrateEvent(event);
        sse.send(event);
    };
    migrateConfig.onEvent = (event) => bufferedSend(event);
    bufferedSend({ type: 'migrate_started', batch: batchId, programs: programIds.length, targetDir, dryRun, mode: claudeMode, programList });
    try {
        const result = await runMigration(programIds, batchId, batchName, migrateConfig);
        bufferedSend({ type: 'migrate_result', data: result });
    }
    catch (err) {
        bufferedSend({ type: 'error', message: String(err) });
    }
    _migrateAbortController = null;
    endMigration();
    sse.close();
};
export const handleMigrateStatus = (ctx, res) => {
    const config = resolveConfig(ctx);
    const trackerFile = path.join(config.migrationDir, config.contractSubDir, 'tracker.json');
    if (!fs.existsSync(trackerFile)) {
        json(res, []);
        return;
    }
    json(res, getMigrateStatus(trackerFile));
};
export const handleMigrateBatchCreate = (ctx, body, res) => {
    const id = body.id;
    const name = body.name;
    const programs = body.programs;
    if (!id || !name || !programs?.length) {
        json(res, { error: 'Missing id, name, or programs' }, 400);
        return;
    }
    const config = resolveConfig(ctx);
    const migrateConfig = {
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
    }
    catch (err) {
        json(res, { error: err instanceof Error ? err.message : String(err) }, 400);
    }
};
export const handleMigrateActive = (_ctx, res) => {
    json(res, getMigrateActiveState());
};
// ─── Abort running migration ────────────────────────────────────
let _migrateAbortController = null;
export const handleMigrateAbort = (res) => {
    if (_migrateAbortController) {
        _migrateAbortController.abort();
        _migrateAbortController = null;
        json(res, { aborted: true });
    }
    else {
        json(res, { aborted: false, message: 'No migration running' });
    }
};
// ─── Analyze Project (v11) ───────────────────────────────────────
export const handleAnalyze = async (ctx, body, res) => {
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
export const handleAnalyzeGet = async (ctx, res) => {
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
//# sourceMappingURL=api-routes.js.map