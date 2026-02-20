/**
 * Code generation runner: orchestrates model building + 5 generators + file writing.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { MigrationContract } from '../../core/types.js';
import { buildCodegenModel, type CodegenConfig, type CodegenResult, type GeneratedFile } from './codegen-model.js';
import { generateTypes } from './type-generator.js';
import { generateStore } from './store-generator.js';
import { generatePage } from './page-generator.js';
import { generateApi } from './api-generator.js';
import { generateTests } from './test-generator.js';

export const runCodegen = (contract: MigrationContract, config: CodegenConfig): CodegenResult => {
  const model = buildCodegenModel(contract);

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
  }

  return {
    programId: contract.program.id,
    programName: contract.program.name,
    files,
    written: files.filter(f => !f.skipped).length,
    skipped: files.filter(f => f.skipped).length,
  };
};

const makeFile = (relativePath: string, content: string, config: CodegenConfig): GeneratedFile => {
  const fullPath = path.join(config.outputDir, relativePath);
  const exists = fs.existsSync(fullPath);
  const skipped = exists && !config.overwrite;

  return { relativePath, content, skipped };
};
