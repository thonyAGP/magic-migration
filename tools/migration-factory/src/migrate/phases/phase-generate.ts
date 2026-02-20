/**
 * Phases 3-7: Generate code files (Types, Store, API, Page, Components).
 * Each phase calls Claude CLI with the appropriate prompt and writes the output file.
 */

import fs from 'node:fs';
import path from 'node:path';
import { callClaude, parseFileResponse } from '../migrate-claude.js';
import {
  buildTypesPrompt, buildStorePrompt, buildApiPrompt,
  buildPagePrompt, buildComponentPrompt,
} from '../migrate-prompts.js';
import { buildContext, loadReferencePatterns, toPascalCase } from '../migrate-context.js';
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';

export interface GenerateResult {
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

// ─── Phase 3: TYPES ────────────────────────────────────────────

export const runTypesPhase = async (
  programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<GenerateResult> => {
  const outFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);

  if (fs.existsSync(outFile)) {
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const ctx = buildContext(programId, config);
  const patterns = loadReferencePatterns(config.targetDir);

  const prompt = buildTypesPrompt(ctx, analysis, patterns.types);
  const result = await callClaude({ prompt, model: config.model, cliBin: config.cliBin });
  const content = parseFileResponse(result.output);

  writeFile(outFile, content, config.dryRun);
  return { file: outFile, skipped: false, duration: Date.now() - start };
};

// ─── Phase 4: STORE ────────────────────────────────────────────

export const runStorePhase = async (
  programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<GenerateResult> => {
  const outFile = path.join(config.targetDir, 'src', 'stores', `${analysis.domain}Store.ts`);

  if (fs.existsSync(outFile)) {
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const ctx = buildContext(programId, config);
  const patterns = loadReferencePatterns(config.targetDir);

  // Read the types file generated in phase 3
  const typesFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);
  const typesContent = readIfExists(typesFile) ?? '';

  const prompt = buildStorePrompt(ctx, analysis, typesContent, patterns.store);
  const result = await callClaude({
    prompt,
    model: config.model,
    cliBin: config.cliBin,
    timeoutMs: 180_000,
  });
  const content = parseFileResponse(result.output);

  writeFile(outFile, content, config.dryRun);
  return { file: outFile, skipped: false, duration: Date.now() - start };
};

// ─── Phase 5: API ──────────────────────────────────────────────

export const runApiPhase = async (
  _programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<GenerateResult> => {
  const outFile = path.join(config.targetDir, 'src', 'services', 'api', `endpoints-${analysis.domain}.ts`);

  if (fs.existsSync(outFile)) {
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const patterns = loadReferencePatterns(config.targetDir);

  const typesFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);
  const typesContent = readIfExists(typesFile) ?? '';

  const prompt = buildApiPrompt(analysis, typesContent, patterns.api);
  const result = await callClaude({ prompt, model: config.model, cliBin: config.cliBin });
  const content = parseFileResponse(result.output);

  writeFile(outFile, content, config.dryRun);
  return { file: outFile, skipped: false, duration: Date.now() - start };
};

// ─── Phase 6: PAGE ─────────────────────────────────────────────

export const runPagePhase = async (
  programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<GenerateResult> => {
  const outFile = path.join(config.targetDir, 'src', 'pages', `${analysis.domainPascal}Page.tsx`);

  if (fs.existsSync(outFile)) {
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const ctx = buildContext(programId, config);
  const patterns = loadReferencePatterns(config.targetDir);

  const typesFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);
  const typesContent = readIfExists(typesFile) ?? '';

  const storeFile = path.join(config.targetDir, 'src', 'stores', `${analysis.domain}Store.ts`);
  const storeContent = readIfExists(storeFile) ?? '';

  const prompt = buildPagePrompt(ctx, analysis, storeContent, typesContent, patterns.page);
  const result = await callClaude({
    prompt,
    model: config.model,
    cliBin: config.cliBin,
    timeoutMs: 180_000,
  });
  const content = parseFileResponse(result.output);

  writeFile(outFile, content, config.dryRun);
  return { file: outFile, skipped: false, duration: Date.now() - start };
};

// ─── Phase 7: COMPONENTS ───────────────────────────────────────

export interface ComponentsResult {
  files: GenerateResult[];
  totalDuration: number;
}

export const runComponentsPhase = async (
  _programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<ComponentsResult> => {
  const compDir = path.join(config.targetDir, 'src', 'components', 'caisse', analysis.domain);
  const start = Date.now();
  const results: GenerateResult[] = [];

  const typesFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);
  const typesContent = readIfExists(typesFile) ?? '';

  const pageFile = path.join(config.targetDir, 'src', 'pages', `${analysis.domainPascal}Page.tsx`);
  const pageContent = readIfExists(pageFile) ?? '';

  // Generate a component for each UI section that needs one
  const sections = analysis.uiLayout.sections.filter(s =>
    s.name !== 'summary' && (s.controls?.length || s.columns?.length || s.fields?.length),
  );

  for (const section of sections) {
    const compName = `${toPascalCase(section.name)}Panel`;
    const outFile = path.join(compDir, `${compName}.tsx`);

    if (fs.existsSync(outFile)) {
      results.push({ file: outFile, skipped: true, duration: 0 });
      continue;
    }

    const sectionStart = Date.now();
    const prompt = buildComponentPrompt(compName, analysis, section, typesContent, pageContent);
    const result = await callClaude({ prompt, model: config.model, cliBin: config.cliBin });
    const content = parseFileResponse(result.output);

    writeFile(outFile, content, config.dryRun);
    results.push({ file: outFile, skipped: false, duration: Date.now() - sectionStart });
  }

  // Generate barrel export
  if (sections.length > 0 && !config.dryRun) {
    const indexContent = sections
      .map(s => `export { ${toPascalCase(s.name)}Panel } from './${toPascalCase(s.name)}Panel.js';`)
      .join('\n') + '\n';
    writeFile(path.join(compDir, 'index.ts'), indexContent, config.dryRun);
  }

  return { files: results, totalDuration: Date.now() - start };
};
