/**
 * Phases 8-9: Generate test files (unit tests for store, UI tests for page).
 */

import fs from 'node:fs';
import path from 'node:path';
import { callClaude, parseFileResponse } from '../migrate-claude.js';
import { buildTestUnitPrompt, buildTestUiPrompt } from '../migrate-prompts.js';
import { loadReferencePatterns } from '../migrate-context.js';
import { getModelForPhase, MigratePhase as MP } from '../migrate-types.js';
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';

export interface TestResult {
  file: string;
  skipped: boolean;
  duration: number;
}

const writeFile = (filePath: string, content: string, dryRun: boolean): void => {
  if (dryRun) return;
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
};

const readIfExists = (filePath: string): string | null => {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
};

// ─── Phase 8: TESTS-UNIT ──────────────────────────────────────

export const runTestsUnitPhase = async (
  _programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<TestResult> => {
  const outFile = path.join(config.targetDir, 'src', '__tests__', `${analysis.domain}Store.test.ts`);

  if (fs.existsSync(outFile)) {
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const patterns = loadReferencePatterns(config.targetDir);

  const storeFile = path.join(config.targetDir, 'src', 'stores', `${analysis.domain}Store.ts`);
  const storeContent = readIfExists(storeFile) ?? '';

  const typesFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);
  const typesContent = readIfExists(typesFile) ?? '';

  const prompt = buildTestUnitPrompt(analysis, storeContent, typesContent, patterns.testStore);
  const result = await callClaude({
    prompt,
    model: getModelForPhase(config, MP.TESTS_UNIT),
    cliBin: config.cliBin,
    timeoutMs: 180_000,
  });
  const content = parseFileResponse(result.output);

  writeFile(outFile, content, config.dryRun);
  return { file: outFile, skipped: false, duration: Date.now() - start };
};

// ─── Phase 9: TESTS-UI ────────────────────────────────────────

export const runTestsUiPhase = async (
  _programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<TestResult> => {
  const outFile = path.join(config.targetDir, 'src', '__tests__', `${analysis.domainPascal}Page.test.tsx`);

  if (fs.existsSync(outFile)) {
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();

  const pageFile = path.join(config.targetDir, 'src', 'pages', `${analysis.domainPascal}Page.tsx`);
  const pageContent = readIfExists(pageFile) ?? '';

  const typesFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);
  const typesContent = readIfExists(typesFile) ?? '';

  const prompt = buildTestUiPrompt(analysis, pageContent, typesContent);
  const result = await callClaude({
    prompt,
    model: getModelForPhase(config, MP.TESTS_UI),
    cliBin: config.cliBin,
    timeoutMs: 180_000,
  });
  const content = parseFileResponse(result.output);

  writeFile(outFile, content, config.dryRun);
  return { file: outFile, skipped: false, duration: Date.now() - start };
};
