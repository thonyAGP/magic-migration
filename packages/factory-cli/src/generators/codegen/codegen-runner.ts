/**
 * Code generation runner: orchestrates model building + enrichment + 5 generators + file writing.
 * v8: sync runCodegen (no enrichment, backward compat)
 * v9: async runCodegenEnriched (heuristic or Claude enrichment)
 */

import fs from 'node:fs';
import path from 'node:path';
import type { MigrationContract } from '../../core/types.js';
import { buildCodegenModel, type CodegenConfig, type CodegenResult, type CodegenModel, type GeneratedFile } from './codegen-model.js';
import type { CodegenEnrichConfig } from './enrich-model.js';
import { applyHeuristicEnrichment } from './enrich-heuristics.js';
import { applyClaudeEnrichment } from './enrich-prompt.js';
import { applyClaudeCliEnrichment } from './enrich-cli.js';
import { generateTypes } from './type-generator.js';
import { generateStore } from './store-generator.js';
import { generatePage } from './page-generator.js';
import { generateApi } from './api-generator.js';
import { generateTests } from './test-generator.js';
import { checkCoherence, summarizeResults } from '../../coherence/checker.js';
import { createLogger, startTimer, logError } from '../../utils/logger.js';

const runFromModel = (model: CodegenModel, contract: MigrationContract, config: CodegenConfig): CodegenResult => {
  const log = createLogger({
    component: 'codegen-runner',
    programId: contract.program.id,
    programName: contract.program.name,
    domain: model.domain,
  });

  log.info('Starting code generation');

  const files: GeneratedFile[] = [
    makeFile(`types/${model.domain}.ts`, generateTypes(model), config),
    makeFile(`stores/${model.domain}Store.ts`, generateStore(model), config),
    makeFile(`pages/${model.domainPascal}Page.tsx`, generatePage(model), config),
    makeFile(`services/api/${model.domain}Api.ts`, generateApi(model), config),
    makeFile(`__tests__/${model.domain}Store.test.ts`, generateTests(model), config),
  ];

  log.debug({
    files: files.map(f => ({ path: f.relativePath, lines: f.content.split('\n').length, skipped: f.skipped })),
  }, 'Files generated in memory');

  if (!config.dryRun) {
    const endTimer = startTimer({ programId: contract.program.id }, 'File writing');

    for (const file of files) {
      if (file.skipped) {
        log.debug({ file: file.relativePath }, 'Skipping file (already exists)');
        continue;
      }

      const fullPath = path.join(config.outputDir, file.relativePath);
      const dir = path.dirname(fullPath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log.debug({ dir }, 'Created directory');
      }

      fs.writeFileSync(fullPath, file.content, 'utf8');
      log.info({
        file: file.relativePath,
        lines: file.content.split('\n').length,
        bytes: file.content.length,
      }, 'File written');
    }

    endTimer();

    // Auto-run coherence checks after file writes
    log.debug('Running coherence checks');
    const coherenceResults = checkCoherence(config.outputDir, { fix: true });
    const summary = summarizeResults(coherenceResults);

    log.info({
      coherence: {
        ok: summary.ok,
        fixed: summary.warn,
        errors: summary.error,
      },
    }, 'Coherence checks completed');

    // Console.log for user output (UX)
    if (summary.warn > 0 || summary.error > 0) {
      console.log(`  [coherence] ${summary.ok} ok, ${summary.warn} fixed, ${summary.error} errors`);
    }
  } else {
    log.info('Dry-run mode: skipping file writes');
  }

  const result = {
    programId: contract.program.id,
    programName: contract.program.name,
    files,
    written: files.filter(f => !f.skipped).length,
    skipped: files.filter(f => f.skipped).length,
  };

  log.info(result, 'Code generation completed');

  return result;
};

/** v8 sync API (backward compat, no enrichment) */
export const runCodegen = (contract: MigrationContract, config: CodegenConfig): CodegenResult => {
  const log = createLogger({
    component: 'codegen',
    version: 'v8',
    programId: contract.program.id,
  });

  log.debug('Building codegen model (no enrichment)');
  const model = buildCodegenModel(contract);

  return runFromModel(model, contract, config);
};

/** v9 async API with enrichment */
export const runCodegenEnriched = async (
  contract: MigrationContract,
  config: CodegenConfig,
  enrichConfig: CodegenEnrichConfig,
): Promise<CodegenResult> => {
  const log = createLogger({
    component: 'codegen',
    version: 'v9',
    programId: contract.program.id,
    enrichMode: enrichConfig.mode,
  });

  log.info({ enrichMode: enrichConfig.mode }, 'Starting enriched code generation');

  let model = buildCodegenModel(contract);

  if (enrichConfig.mode !== 'none') {
    log.debug('Applying heuristic enrichment');
    const endTimer = startTimer({ programId: contract.program.id }, 'Heuristic enrichment');
    model = applyHeuristicEnrichment(model);
    endTimer();
  }

  if (enrichConfig.mode === 'claude') {
    log.info('Applying Claude API enrichment');
    try {
      const endTimer = startTimer({ programId: contract.program.id }, 'Claude enrichment');
      model = await applyClaudeEnrichment(model, enrichConfig);
      endTimer();
      log.info('Claude enrichment completed');
    } catch (error) {
      logError({ programId: contract.program.id }, error as Error, 'Claude enrichment failed');
      throw error;
    }
  } else if (enrichConfig.mode === 'claude-cli') {
    log.info('Applying Claude CLI enrichment');
    try {
      const endTimer = startTimer({ programId: contract.program.id }, 'Claude CLI enrichment');
      model = await applyClaudeCliEnrichment(model, enrichConfig);
      endTimer();
      log.info('Claude CLI enrichment completed');
    } catch (error) {
      logError({ programId: contract.program.id }, error as Error, 'Claude CLI enrichment failed');
      throw error;
    }
  }

  return runFromModel(model, contract, config);
};

const makeFile = (relativePath: string, content: string, config: CodegenConfig): GeneratedFile => {
  const fullPath = path.join(config.outputDir, relativePath);
  const exists = fs.existsSync(fullPath);
  const skipped = exists && !config.overwrite;

  return { relativePath, content, skipped };
};
