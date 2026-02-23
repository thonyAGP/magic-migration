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

const runFromModel = (model: CodegenModel, contract: MigrationContract, config: CodegenConfig): CodegenResult => {
  const files: GeneratedFile[] = [
    makeFile(`types/${model.domain}.ts`, generateTypes(model), config),
    makeFile(`stores/${model.domain}Store.ts`, generateStore(model), config),
    makeFile(`pages/${model.domainPascal}Page.tsx`, generatePage(model), config),
    makeFile(`services/api/${model.domain}Api.ts`, generateApi(model), config),
    makeFile(`__tests__/${model.domain}Store.test.ts`, generateTests(model), config),
  ];

  if (!config.dryRun) {
    for (const file of files) {
      if (file.skipped) continue;
      const fullPath = path.join(config.outputDir, file.relativePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, file.content, 'utf8');
    }

    // Auto-run coherence checks after file writes
    const coherenceResults = checkCoherence(config.outputDir, { fix: true });
    const summary = summarizeResults(coherenceResults);
    if (summary.warn > 0 || summary.error > 0) {
      console.log(`  [coherence] ${summary.ok} ok, ${summary.warn} fixed, ${summary.error} errors`);
    }
  }

  return {
    programId: contract.program.id,
    programName: contract.program.name,
    files,
    written: files.filter(f => !f.skipped).length,
    skipped: files.filter(f => f.skipped).length,
  };
};

/** v8 sync API (backward compat, no enrichment) */
export const runCodegen = (contract: MigrationContract, config: CodegenConfig): CodegenResult => {
  const model = buildCodegenModel(contract);
  return runFromModel(model, contract, config);
};

/** v9 async API with enrichment */
export const runCodegenEnriched = async (
  contract: MigrationContract,
  config: CodegenConfig,
  enrichConfig: CodegenEnrichConfig,
): Promise<CodegenResult> => {
  let model = buildCodegenModel(contract);

  if (enrichConfig.mode !== 'none') {
    model = applyHeuristicEnrichment(model);
  }

  if (enrichConfig.mode === 'claude') {
    model = await applyClaudeEnrichment(model, enrichConfig);
  } else if (enrichConfig.mode === 'claude-cli') {
    model = await applyClaudeCliEnrichment(model, enrichConfig);
  }

  return runFromModel(model, contract, config);
};

const makeFile = (relativePath: string, content: string, config: CodegenConfig): GeneratedFile => {
  const fullPath = path.join(config.outputDir, relativePath);
  const exists = fs.existsSync(fullPath);
  const skipped = exists && !config.overwrite;

  return { relativePath, content, skipped };
};
