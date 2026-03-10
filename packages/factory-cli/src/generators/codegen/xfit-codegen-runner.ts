/**
 * XFIT-S Codegen Runner
 * Loads rules.json + tables.json from .factory/programs/IDE-XXX/
 * Builds enriched CodegenModel → runs all 5 generators → writes files.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { BusinessRulesResult, Table } from '@magic-migration/data-model';
import type { CodegenConfig, CodegenResult, GeneratedFile } from './codegen-model.js';
import { buildXfitCodegenModel } from './xfit-codegen-builder.js';
import { generateTypes } from './type-generator.js';
import { generateStore } from './store-generator.js';
import { generatePage } from './page-generator.js';
import { generateApi } from './api-generator.js';
import { generateTests } from './test-generator.js';

export interface XfitRunConfig extends CodegenConfig {
  /** Root project dir (contains .factory/) */
  projectDir: string;
  /** Output dir for generated files (adh-web/src) */
  outputDir: string;
  dryRun: boolean;
  overwrite: boolean;
}

/**
 * Run XFIT-S code generation for a single program.
 * Reads: .factory/programs/IDE-{id}/rules.json
 *        .factory/data-model/tables.json  (KB tables)
 * Writes: types/, stores/, pages/, services/api/, __tests__/
 */
export const runXfitCodegen = async (
  programId: number,
  config: XfitRunConfig
): Promise<CodegenResult> => {
  const programDir = path.join(config.projectDir, '.factory', 'programs', `IDE-${programId}`);
  const rulesPath = path.join(programDir, 'rules.json');
  const kbTablesPath = path.join(config.projectDir, '.factory', 'data-model', 'tables.json');
  const irTablesPath = path.join(programDir, 'tables.json');

  // Load rules (required)
  if (!fs.existsSync(rulesPath)) {
    throw new Error(`[xfit-codegen] rules.json not found for IDE ${programId}: ${rulesPath}. Run phase-data-model first.`);
  }
  const rulesResult: BusinessRulesResult = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

  // Load KB tables (optional — used for entity enrichment)
  const kbTables: Table[] = fs.existsSync(kbTablesPath)
    ? JSON.parse(fs.readFileSync(kbTablesPath, 'utf-8'))
    : [];

  // Load IR-extracted tables for this program (optional)
  const programTables: Table[] = fs.existsSync(irTablesPath)
    ? JSON.parse(fs.readFileSync(irTablesPath, 'utf-8'))
    : buildTablesFromRules(rulesResult);

  // Build enriched CodegenModel
  const model = buildXfitCodegenModel({ rulesResult, kbTables, programTables });

  // Generate all 5 files
  const files: GeneratedFile[] = [
    makeFile(`types/${model.domain}.ts`, generateTypes(model), config),
    makeFile(`stores/${model.domain}Store.ts`, generateStore(model), config),
    makeFile(`pages/${model.domainPascal}Page.tsx`, generatePage(model), config),
    makeFile(`services/api/${model.domain}Api.ts`, generateApi(model), config),
    makeFile(`__tests__/${model.domain}Store.test.ts`, generateTests(model), config),
  ];

  // Write to disk
  let written = 0;
  let skipped = 0;

  if (!config.dryRun) {
    for (const file of files) {
      if (file.skipped) { skipped++; continue; }

      const fullPath = path.join(config.outputDir, file.relativePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, file.content, 'utf-8');
      written++;
    }
  } else {
    written = files.filter(f => !f.skipped).length;
  }

  console.log(`[xfit-codegen] IDE ${programId}: ${model.entities.length} entities, ${model.actions.length} actions, ${written} files written`);

  return {
    programId: rulesResult.programId,
    programName: rulesResult.programName,
    files,
    written,
    skipped,
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Fallback: build minimal Table[] from data-read/write rules
 * when tables.json is not available for the program.
 */
const buildTablesFromRules = (rulesResult: BusinessRulesResult): Table[] => {
  const allTableNames = new Set([
    ...rulesResult.summary.tablesRead,
    ...rulesResult.summary.tablesWritten,
  ]);
  return Array.from(allTableNames).map((name, i) => ({
    id: i + 1,
    name,
    columns: [],
    confidence: 0.5,
  }));
};

const makeFile = (relativePath: string, content: string, config: CodegenConfig): GeneratedFile => {
  const fullPath = path.join(config.outputDir, relativePath);
  const exists = fs.existsSync(fullPath);
  return {
    relativePath,
    content,
    skipped: exists && !config.overwrite,
  };
};
