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
import { getModelForPhase, MigratePhase as MP } from '../migrate-types.js';
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';

export interface GenerateResult {
  file: string;
  skipped: boolean;
  duration: number;
}

/** Write file with retry logic for Windows file locking (UNKNOWN errors). */
const writeFile = (filePath: string, content: string, dryRun: boolean): void => {
  if (dryRun) return;
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code ?? 'UNKNOWN';
      if (attempt < maxRetries && (code === 'UNKNOWN' || code === 'EBUSY' || code === 'EPERM')) {
        const delayMs = attempt * 200;
        console.warn(`[phase-generate] writeFile retry ${attempt}/${maxRetries} for ${path.basename(filePath)} (${code}), waiting ${delayMs}ms`);
        const start = Date.now();
        while (Date.now() - start < delayMs) { /* busy wait for sync retry */ }
        continue;
      }
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to write ${filePath} after ${attempt} attempt(s): ${errMsg}`);
    }
  }
};

/** Read file if it exists, with retry for Windows transient locks. */
const readIfExists = (filePath: string): string | null => {
  if (!fs.existsSync(filePath)) return null;
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code ?? 'UNKNOWN';
      if (attempt < maxRetries && (code === 'UNKNOWN' || code === 'EBUSY' || code === 'EPERM')) {
        const delayMs = attempt * 200;
        console.warn(`[phase-generate] readIfExists retry ${attempt}/${maxRetries} for ${path.basename(filePath)} (${code}), waiting ${delayMs}ms`);
        const start = Date.now();
        while (Date.now() - start < delayMs) { /* busy wait for sync retry */ }
        continue;
      }
      throw err;
    }
  }
  return null;
};

// ─── Phase 3: TYPES ────────────────────────────────────────────

export const runTypesPhase = async (
  programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<GenerateResult> => {
  const outFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);

  if (fs.existsSync(outFile)) {
    console.log(`[phase-generate] TYPES: skip ${path.basename(outFile)} (exists)`);
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const ctx = buildContext(programId, config);
  const patterns = loadReferencePatterns(config.targetDir);

  const prompt = buildTypesPrompt(ctx, analysis, patterns.types);
  console.log(`[phase-generate] TYPES: calling Claude (prompt: ${prompt.length} chars)`);
  const result = await callClaude({ prompt, model: getModelForPhase(config, MP.TYPES), cliBin: config.cliBin });
  const content = parseFileResponse(result.output);
  console.log(`[phase-generate] TYPES: response ${result.output.length} chars → ${content.length} chars in ${result.durationMs}ms`);

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
    console.log(`[phase-generate] STORE: skip ${path.basename(outFile)} (exists)`);
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const ctx = buildContext(programId, config);
  const patterns = loadReferencePatterns(config.targetDir);

  // Read the types file generated in phase 3
  const typesFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);
  const typesContent = readIfExists(typesFile) ?? '';

  const prompt = buildStorePrompt(ctx, analysis, typesContent, patterns.store);
  console.log(`[phase-generate] STORE: calling Claude (prompt: ${prompt.length} chars)`);
  const result = await callClaude({
    prompt,
    model: getModelForPhase(config, MP.STORE),
    cliBin: config.cliBin,
    timeoutMs: 180_000,
  });
  const content = parseFileResponse(result.output);
  console.log(`[phase-generate] STORE: response ${result.output.length} chars → ${content.length} chars in ${result.durationMs}ms`);

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
    console.log(`[phase-generate] API: skip ${path.basename(outFile)} (exists)`);
    return { file: outFile, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const patterns = loadReferencePatterns(config.targetDir);

  const typesFile = path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`);
  const typesContent = readIfExists(typesFile) ?? '';

  const prompt = buildApiPrompt(analysis, typesContent, patterns.api);
  console.log(`[phase-generate] API: calling Claude (prompt: ${prompt.length} chars)`);
  const result = await callClaude({ prompt, model: getModelForPhase(config, MP.API), cliBin: config.cliBin });
  const content = parseFileResponse(result.output);
  console.log(`[phase-generate] API: response ${result.output.length} chars → ${content.length} chars in ${result.durationMs}ms`);

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
    console.log(`[phase-generate] PAGE: skip ${path.basename(outFile)} (exists)`);
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
  console.log(`[phase-generate] PAGE: calling Claude (prompt: ${prompt.length} chars)`);
  const result = await callClaude({
    prompt,
    model: getModelForPhase(config, MP.PAGE),
    cliBin: config.cliBin,
    timeoutMs: 180_000,
  });
  const content = parseFileResponse(result.output);
  console.log(`[phase-generate] PAGE: response ${result.output.length} chars → ${content.length} chars in ${result.durationMs}ms`);

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
      console.log(`[phase-generate] COMPONENT: skip ${compName} (exists)`);
      results.push({ file: outFile, skipped: true, duration: 0 });
      continue;
    }

    const sectionStart = Date.now();
    const prompt = buildComponentPrompt(compName, analysis, section, typesContent, pageContent);
    console.log(`[phase-generate] COMPONENT ${compName}: calling Claude (prompt: ${prompt.length} chars)`);
    const result = await callClaude({ prompt, model: getModelForPhase(config, MP.COMPONENTS), cliBin: config.cliBin });
    const content = parseFileResponse(result.output);
    console.log(`[phase-generate] COMPONENT ${compName}: response ${result.output.length} chars → ${content.length} chars in ${result.durationMs}ms`);

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
