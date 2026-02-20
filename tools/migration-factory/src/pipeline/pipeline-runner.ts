/**
 * Pipeline Runner v4: orchestrates the full batch pipeline with optional Claude enrichment.
 *
 * pipeline run --batch B2                    → auto-contract → gap-analysis → auto-verify → tracker-sync
 * pipeline run --batch B2 --enrich claude    → + Claude API enrichment for gaps
 */

import fs from 'node:fs';
import path from 'node:path';
import type {
  PipelineConfig, PipelineRunResult, PipelineStepResult, PipelineEvent,
  PreflightResult, PreflightProgram, PreflightCheck,
  BatchStatusView, MigrationContract, Batch, PipelineAction,
} from '../core/types.js';
import { PipelineStatus, PipelineEventType, PipelineAction as PA, EnrichmentMode } from '../core/types.js';
import { parseContract, writeContract, loadContracts } from '../core/contract.js';
import { readTracker, writeTracker, updateTrackerStats, updateBatchStatus } from '../core/tracker.js';
import { isTerminal, statusOrder } from '../core/pipeline.js';
import { generateAutoContract } from '../generators/auto-contract.js';
import { trackStatusChange, computeActualHours } from '../calculators/effort-tracker.js';
import { createPipelineEmitter, createEvent } from './event-emitter.js';
import type { EnrichmentHook } from './enrichment-hook.js';
import { createClaudeEnrichmentHook } from './claude-enrichment-hook.js';

// ─── Helpers ─────────────────────────────────────────────────────

const contractDir = (config: PipelineConfig): string =>
  path.join(config.migrationDir, config.contractSubDir);

const specFile = (config: PipelineConfig, programId: string | number): string =>
  path.join(config.specDir, `${config.contractSubDir}-IDE-${programId}.md`);

const contractFile = (config: PipelineConfig, programId: string | number): string =>
  path.join(contractDir(config), `${config.contractSubDir}-IDE-${programId}.contract.yaml`);

const findContractFile = (config: PipelineConfig, programId: string | number): string | null => {
  const dir = contractDir(config);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f =>
    f.endsWith('.contract.yaml') && f.includes(`-IDE-${programId}.`),
  );
  return files.length > 0 ? path.join(dir, files[0]) : null;
};

const countGaps = (contract: MigrationContract): number => {
  const allItems = [
    ...contract.rules,
    ...contract.variables,
    ...contract.tables,
    ...contract.callees,
  ];
  return allItems.filter(i => i.status !== 'IMPL' && i.status !== 'N/A').length;
};

const getProgramName = (batch: Batch, programId: string | number, contracts: Map<string | number, MigrationContract>): string => {
  const contract = contracts.get(programId) ?? contracts.get(Number(programId)) ?? contracts.get(String(programId));
  return contract?.program.name ?? `Program ${programId}`;
};

const resolveEnrichmentHook = (config: PipelineConfig): EnrichmentHook | null => {
  if (config.enrichmentMode === EnrichmentMode.CLAUDE) {
    return createClaudeEnrichmentHook({ model: config.claudeModel });
  }
  return null;
};

// ─── computeBatchStatus ──────────────────────────────────────────

const computeBatchStatus = (steps: PipelineStepResult[]): PipelineStatus => {
  if (steps.length === 0) return PipelineStatus.PENDING;

  const allVerified = steps.every(s => s.newStatus === PipelineStatus.VERIFIED);
  if (allVerified) return PipelineStatus.VERIFIED;

  const allEnrichedOrBetter = steps.every(s =>
    statusOrder(s.newStatus) >= statusOrder(PipelineStatus.ENRICHED),
  );
  if (allEnrichedOrBetter) return PipelineStatus.ENRICHED;

  const allContractedOrBetter = steps.every(s =>
    statusOrder(s.newStatus) >= statusOrder(PipelineStatus.CONTRACTED),
  );
  if (allContractedOrBetter) return PipelineStatus.CONTRACTED;

  return PipelineStatus.PENDING;
};

// ─── syncTrackerFromContracts ────────────────────────────────────

const syncTrackerFromContracts = (config: PipelineConfig): void => {
  if (config.dryRun) return;
  if (!fs.existsSync(config.trackerFile)) return;

  const tracker = readTracker(config.trackerFile);
  const contracts = loadContracts(contractDir(config));

  let contracted = 0, enriched = 0, verified = 0;
  for (const [, c] of contracts) {
    switch (c.overall.status) {
      case PipelineStatus.CONTRACTED: contracted++; break;
      case PipelineStatus.ENRICHED: enriched++; break;
      case PipelineStatus.VERIFIED: verified++; break;
    }
  }

  const updated = updateTrackerStats(tracker, {
    contracted,
    enriched,
    verified,
    lastComputed: new Date().toISOString(),
  });
  writeTracker(updated, config.trackerFile);
};

// ─── preflightBatch ─────────────────────────────────────────────

export const preflightBatch = (batchId: string, config: PipelineConfig): PreflightResult => {
  const checks: PreflightCheck[] = [];
  const programs: PreflightProgram[] = [];

  // Check tracker exists
  const trackerExists = fs.existsSync(config.trackerFile);
  checks.push({
    check: 'Tracker exists',
    passed: trackerExists,
    message: trackerExists ? config.trackerFile : 'Tracker not found',
  });

  if (!trackerExists) {
    return {
      batchId,
      batchName: batchId,
      programs: [],
      checks,
      summary: { ready: 0, blocked: 0, willContract: 0, willVerify: 0, needsEnrichment: 0, alreadyDone: 0 },
    };
  }

  const tracker = readTracker(config.trackerFile);
  const batch = tracker.batches.find(b => b.id === batchId);

  if (!batch) {
    checks.push({ check: 'Batch found', passed: false, message: `Batch ${batchId} not in tracker` });
    return {
      batchId,
      batchName: batchId,
      programs: [],
      checks,
      summary: { ready: 0, blocked: 0, willContract: 0, willVerify: 0, needsEnrichment: 0, alreadyDone: 0 },
    };
  }

  checks.push({ check: 'Batch found', passed: true, message: `${batch.name} (${batch.priorityOrder.length} programs)` });

  // Check spec directory
  const specDirExists = fs.existsSync(config.specDir);
  checks.push({
    check: 'Spec directory',
    passed: specDirExists,
    message: specDirExists ? config.specDir : 'Spec directory not found',
  });

  // Check codebase directory
  const codebaseDirExists = fs.existsSync(config.codebaseDir);
  checks.push({
    check: 'Codebase directory',
    passed: codebaseDirExists,
    message: codebaseDirExists ? config.codebaseDir : 'Codebase directory not found',
  });

  // Analyze each program
  const contracts = loadContracts(contractDir(config));
  let willContract = 0, willVerify = 0, needsEnrichment = 0, alreadyDone = 0, blocked = 0;

  for (const programId of batch.priorityOrder) {
    const existing = contracts.get(programId) ?? contracts.get(Number(programId)) ?? contracts.get(String(programId));
    const specPath = specFile(config, programId);
    const specOk = fs.existsSync(specPath);
    const currentStatus = existing?.overall.status ?? PipelineStatus.PENDING;

    let action = 'blocked';
    let gaps = 0;

    if (isTerminal(currentStatus)) {
      action = 'already-verified';
      alreadyDone++;
    } else if (!existing && config.autoContract) {
      if (specOk) {
        action = 'will-contract';
        willContract++;
      } else {
        action = 'spec-missing';
        blocked++;
      }
    } else if (existing) {
      gaps = countGaps(existing);
      if (currentStatus === PipelineStatus.CONTRACTED && gaps === 0) {
        action = 'will-auto-enrich';
        willVerify++;
      } else if (currentStatus === PipelineStatus.CONTRACTED && gaps > 0) {
        action = 'needs-enrichment';
        needsEnrichment++;
      } else if (currentStatus === PipelineStatus.ENRICHED && gaps === 0 && config.autoVerify) {
        action = 'will-verify';
        willVerify++;
      } else if (currentStatus === PipelineStatus.ENRICHED && gaps > 0) {
        action = 'needs-enrichment';
        needsEnrichment++;
      } else {
        action = 'blocked';
        blocked++;
      }
    } else {
      action = 'blocked';
      blocked++;
    }

    programs.push({
      id: programId,
      name: getProgramName(batch, programId, contracts),
      currentStatus,
      specExists: specOk,
      contractExists: !!existing,
      action,
      gaps,
    });
  }

  return {
    batchId,
    batchName: batch.name,
    programs,
    checks,
    summary: {
      ready: willContract + willVerify,
      blocked,
      willContract,
      willVerify,
      needsEnrichment,
      alreadyDone,
    },
  };
};

// ─── runBatchPipeline ────────────────────────────────────────────

export const runBatchPipeline = async (batchId: string, config: PipelineConfig): Promise<PipelineRunResult> => {
  const started = new Date().toISOString();
  const emitter = createPipelineEmitter();
  if (config.onEvent) emitter.on('*', config.onEvent);
  const steps: PipelineStepResult[] = [];
  const enrichmentHook = resolveEnrichmentHook(config);

  // Load tracker
  if (!fs.existsSync(config.trackerFile)) {
    emitter.emit(createEvent(PipelineEventType.ERROR, `Tracker not found: ${config.trackerFile}`));
    return buildResult(batchId, '', started, config.dryRun, steps, emitter.events());
  }

  const tracker = readTracker(config.trackerFile);
  const batch = tracker.batches.find(b => b.id === batchId);

  if (!batch) {
    emitter.emit(createEvent(PipelineEventType.ERROR, `Batch ${batchId} not found in tracker`));
    return buildResult(batchId, '', started, config.dryRun, steps, emitter.events());
  }

  emitter.emit(createEvent(PipelineEventType.PIPELINE_STARTED, `Pipeline started: ${batch.name}`, { batchId }));

  const cDir = contractDir(config);
  if (!config.dryRun && !fs.existsSync(cDir)) {
    fs.mkdirSync(cDir, { recursive: true });
  }

  // Process each program in priority order
  for (const programId of batch.priorityOrder) {
    const step = await processProgram(programId, batch, config, emitter, enrichmentHook);
    steps.push(step);
  }

  // Sync tracker
  if (!config.dryRun) {
    const batchStatus = computeBatchStatus(steps);
    const updatedTracker = updateBatchStatus(readTracker(config.trackerFile), batchId, batchStatus);
    writeTracker(updatedTracker, config.trackerFile);
    syncTrackerFromContracts(config);
    emitter.emit(createEvent(PipelineEventType.TRACKER_SYNCED, 'Tracker synced', { batchId }));
  }

  emitter.emit(createEvent(PipelineEventType.PIPELINE_COMPLETED, `Pipeline completed: ${batch.name}`, { batchId }));

  return buildResult(batchId, batch.name, started, config.dryRun, steps, emitter.events());
};

// ─── processProgram ──────────────────────────────────────────────

const processProgram = async (
  programId: string | number,
  batch: Batch,
  config: PipelineConfig,
  emitter: ReturnType<typeof createPipelineEmitter>,
  enrichmentHook: EnrichmentHook | null,
): Promise<PipelineStepResult> => {
  const cFilePath = findContractFile(config, programId);
  let contract: MigrationContract | null = null;

  if (cFilePath) {
    contract = parseContract(cFilePath);
  }

  const currentStatus = contract?.overall.status ?? PipelineStatus.PENDING;
  const programName = contract?.program.name ?? `Program ${programId}`;

  // Already verified → skip
  if (isTerminal(currentStatus)) {
    return {
      programId, programName,
      action: PA.ALREADY_DONE,
      previousStatus: currentStatus, newStatus: currentStatus,
      coveragePct: contract?.overall.coveragePct ?? 100, gaps: 0,
      message: 'Already verified',
    };
  }

  // Step 1: Auto-contract if no contract exists
  if (!contract && config.autoContract) {
    const sFile = specFile(config, programId);

    if (!fs.existsSync(sFile)) {
      emitter.emit(createEvent(PipelineEventType.PROGRAM_SPEC_MISSING,
        `Spec missing for IDE ${programId}`, { batchId: batch.id, programId }));
      return {
        programId, programName: `Program ${programId}`,
        action: PA.SPEC_MISSING,
        previousStatus: PipelineStatus.PENDING, newStatus: PipelineStatus.PENDING,
        coveragePct: 0, gaps: 0,
        message: `Spec not found: ${path.basename(sFile)}`,
      };
    }

    const newContract = generateAutoContract({
      specFile: sFile,
      codebaseDir: config.codebaseDir,
      projectDir: config.projectDir,
    });

    if (!newContract) {
      return {
        programId, programName: `Program ${programId}`,
        action: PA.ERROR,
        previousStatus: PipelineStatus.PENDING, newStatus: PipelineStatus.PENDING,
        coveragePct: 0, gaps: 0,
        message: 'Failed to generate contract',
      };
    }

    // Apply effort tracking
    newContract.overall.effort = trackStatusChange(newContract, PipelineStatus.CONTRACTED);

    if (!config.dryRun) {
      const outPath = contractFile(config, programId);
      writeContract(newContract, outPath);
    }

    contract = newContract;
    emitter.emit(createEvent(PipelineEventType.PROGRAM_CONTRACTED,
      `Contract generated for IDE ${programId} (${newContract.rules.length} rules, ${newContract.overall.coveragePct}%)`,
      { batchId: batch.id, programId, data: { coveragePct: newContract.overall.coveragePct } }));
  }

  // If still no contract (autoContract=false or other), skip
  if (!contract) {
    return {
      programId, programName: `Program ${programId}`,
      action: PA.SKIPPED,
      previousStatus: PipelineStatus.PENDING, newStatus: PipelineStatus.PENDING,
      coveragePct: 0, gaps: 0,
      message: 'No contract and auto-contract disabled',
    };
  }

  // Step 2: Gap analysis → auto-enrich if 0 gaps, or Claude enrich if hook available
  if (contract.overall.status === PipelineStatus.CONTRACTED) {
    const gaps = countGaps(contract);

    if (gaps === 0) {
      // All items IMPL/N/A → auto-enrich
      contract.overall.status = PipelineStatus.ENRICHED;
      contract.overall.effort = trackStatusChange(contract, PipelineStatus.ENRICHED);

      if (!config.dryRun) {
        const outPath = findContractFile(config, programId) ?? contractFile(config, programId);
        writeContract(contract, outPath);
      }

      emitter.emit(createEvent(PipelineEventType.PROGRAM_AUTO_ENRICHED,
        `IDE ${programId} auto-enriched (0 gaps)`,
        { batchId: batch.id, programId }));
    } else if (enrichmentHook && !config.dryRun) {
      // v4: Try Claude enrichment
      const context = {
        contract,
        specFile: specFile(config, programId),
        codebaseDir: config.codebaseDir,
      };

      if (enrichmentHook.canEnrich(context)) {
        const result = await enrichmentHook.enrich(context);

        emitter.emit(createEvent(PipelineEventType.PROGRAM_CLAUDE_ENRICHED,
          `IDE ${programId}: ${result.message}`,
          { batchId: batch.id, programId, data: { gapsResolved: result.gapsResolved, gapsRemaining: result.gapsRemaining } }));

        if (result.enriched && result.updatedContract) {
          contract = result.updatedContract;
          const remainingGaps = countGaps(contract);

          if (remainingGaps === 0) {
            contract.overall.status = PipelineStatus.ENRICHED;
            contract.overall.effort = trackStatusChange(contract, PipelineStatus.ENRICHED);
          }

          const outPath = findContractFile(config, programId) ?? contractFile(config, programId);
          writeContract(contract, outPath);

          if (remainingGaps > 0) {
            return {
              programId, programName: contract.program.name,
              action: PA.CLAUDE_ENRICHED,
              previousStatus: PipelineStatus.CONTRACTED, newStatus: contract.overall.status,
              coveragePct: contract.overall.coveragePct, gaps: remainingGaps,
              message: `${result.message} - ${remainingGaps} gaps remain`,
            };
          }
          // If 0 gaps remaining, fall through to auto-verify
        } else {
          // Claude couldn't resolve any gaps → still needs manual enrichment
          emitter.emit(createEvent(PipelineEventType.PROGRAM_NEEDS_ENRICHMENT,
            `IDE ${programId} needs enrichment: ${gaps} gaps (Claude could not resolve)`,
            { batchId: batch.id, programId, data: { gaps } }));

          return {
            programId, programName: contract.program.name,
            action: PA.NEEDS_ENRICHMENT,
            previousStatus: PipelineStatus.CONTRACTED, newStatus: PipelineStatus.CONTRACTED,
            coveragePct: contract.overall.coveragePct, gaps,
            message: `${gaps} items need enrichment (Claude: ${result.message})`,
          };
        }
      } else {
        // Hook can't enrich (no API key or no spec)
        emitter.emit(createEvent(PipelineEventType.PROGRAM_NEEDS_ENRICHMENT,
          `IDE ${programId} needs enrichment: ${gaps} gaps`,
          { batchId: batch.id, programId, data: { gaps } }));

        return {
          programId, programName: contract.program.name,
          action: PA.NEEDS_ENRICHMENT,
          previousStatus: PipelineStatus.CONTRACTED, newStatus: PipelineStatus.CONTRACTED,
          coveragePct: contract.overall.coveragePct, gaps,
          message: `${gaps} items need enrichment`,
        };
      }
    } else {
      // No hook or dry-run → report gaps
      emitter.emit(createEvent(PipelineEventType.PROGRAM_NEEDS_ENRICHMENT,
        `IDE ${programId} needs enrichment: ${gaps} gaps`,
        { batchId: batch.id, programId, data: { gaps } }));

      return {
        programId, programName: contract.program.name,
        action: PA.NEEDS_ENRICHMENT,
        previousStatus: PipelineStatus.CONTRACTED, newStatus: PipelineStatus.CONTRACTED,
        coveragePct: contract.overall.coveragePct, gaps,
        message: `${gaps} items need enrichment`,
      };
    }
  }

  // Step 3: Auto-verify if enriched and 0 gaps
  if (contract.overall.status === PipelineStatus.ENRICHED && config.autoVerify) {
    const gaps = countGaps(contract);

    if (gaps === 0) {
      contract.overall.status = PipelineStatus.VERIFIED;
      contract.overall.coveragePct = 100;
      contract.overall.effort = trackStatusChange(contract, PipelineStatus.VERIFIED);

      // Auto-compute actualHours from timestamps
      if (contract.overall.effort) {
        const actual = computeActualHours(contract.overall.effort);
        if (actual !== null) {
          contract.overall.effort.actualHours = actual;
        }
      }

      if (!config.dryRun) {
        const outPath = findContractFile(config, programId) ?? contractFile(config, programId);
        writeContract(contract, outPath);
      }

      emitter.emit(createEvent(PipelineEventType.PROGRAM_VERIFIED,
        `IDE ${programId} verified (100%)`,
        { batchId: batch.id, programId }));

      return {
        programId, programName: contract.program.name,
        action: PA.VERIFIED,
        previousStatus: currentStatus, newStatus: PipelineStatus.VERIFIED,
        coveragePct: 100, gaps: 0,
        message: 'Verified (all items IMPL/N/A)',
      };
    } else {
      emitter.emit(createEvent(PipelineEventType.PROGRAM_VERIFY_FAILED,
        `IDE ${programId} verify failed: ${gaps} gaps remaining`,
        { batchId: batch.id, programId, data: { gaps } }));

      return {
        programId, programName: contract.program.name,
        action: PA.VERIFY_FAILED,
        previousStatus: PipelineStatus.ENRICHED, newStatus: PipelineStatus.ENRICHED,
        coveragePct: contract.overall.coveragePct, gaps,
        message: `${gaps} gaps prevent verification`,
      };
    }
  }

  // Determine final action (using string comparison to avoid TS narrowing issues)
  const finalGaps = countGaps(contract);
  const finalStatus = contract.overall.status as string;
  const wasContracted = (currentStatus as string) === 'pending' && finalStatus === 'contracted';
  const wasAutoEnriched = finalStatus === 'enriched' && (currentStatus as string) !== 'enriched';

  let action: PipelineAction = PA.CONTRACTED;
  if (wasAutoEnriched) action = PA.AUTO_ENRICHED;
  else if (wasContracted) action = PA.CONTRACTED;
  else action = PA.SKIPPED;

  return {
    programId, programName: contract.program.name,
    action,
    previousStatus: currentStatus, newStatus: contract.overall.status,
    coveragePct: contract.overall.coveragePct, gaps: finalGaps,
    message: `Status: ${contract.overall.status} (${contract.overall.coveragePct}%)`,
  };
};

// ─── getBatchesStatus ────────────────────────────────────────────

export const getBatchesStatus = (config: PipelineConfig): BatchStatusView[] => {
  if (!fs.existsSync(config.trackerFile)) return [];

  const tracker = readTracker(config.trackerFile);
  const contracts = loadContracts(contractDir(config));
  const views: BatchStatusView[] = [];

  for (const batch of tracker.batches) {
    let pending = 0, contracted = 0, enriched = 0, verified = 0;
    let coverageSum = 0;
    let estimatedHoursSum = 0;
    let lastActivity: string | undefined;

    for (const programId of batch.priorityOrder) {
      const contract = contracts.get(programId) ?? contracts.get(Number(programId)) ?? contracts.get(String(programId));

      if (!contract) {
        pending++;
        continue;
      }

      switch (contract.overall.status) {
        case PipelineStatus.PENDING: pending++; break;
        case PipelineStatus.CONTRACTED: contracted++; break;
        case PipelineStatus.ENRICHED: enriched++; break;
        case PipelineStatus.VERIFIED: verified++; break;
      }

      coverageSum += contract.overall.coveragePct;
      if (contract.overall.effort?.estimatedHours) {
        estimatedHoursSum += contract.overall.effort.estimatedHours;
      }

      const activity = contract.overall.effort?.verifiedAt
        ?? contract.overall.effort?.enrichedAt
        ?? contract.overall.effort?.contractedAt;
      if (activity && (!lastActivity || activity > lastActivity)) {
        lastActivity = activity;
      }
    }

    const total = batch.priorityOrder.length;
    views.push({
      id: batch.id,
      name: batch.name,
      programCount: total,
      status: batch.status,
      pending,
      contracted,
      enriched,
      verified,
      coverageAvg: total > 0 ? Math.round(coverageSum / total) : 0,
      estimatedHours: estimatedHoursSum,
      lastActivity,
    });
  }

  return views;
};

// ─── buildResult ─────────────────────────────────────────────────

const buildResult = (
  batchId: string, batchName: string, started: string,
  dryRun: boolean, steps: PipelineStepResult[], events: PipelineEvent[],
): PipelineRunResult => {
  const summary = {
    total: steps.length,
    contracted: steps.filter(s => s.action === PA.CONTRACTED).length,
    needsEnrichment: steps.filter(s => s.action === PA.NEEDS_ENRICHMENT).length,
    autoEnriched: steps.filter(s => s.action === PA.AUTO_ENRICHED).length,
    claudeEnriched: steps.filter(s => s.action === PA.CLAUDE_ENRICHED).length,
    verified: steps.filter(s => s.action === PA.VERIFIED).length,
    verifyFailed: steps.filter(s => s.action === PA.VERIFY_FAILED).length,
    specsMissing: steps.filter(s => s.action === PA.SPEC_MISSING).length,
    alreadyDone: steps.filter(s => s.action === PA.ALREADY_DONE).length,
    errors: steps.filter(s => s.action === PA.ERROR).length,
  };

  return {
    batchId, batchName, started,
    completed: new Date().toISOString(),
    dryRun, steps, summary, events,
  };
};
