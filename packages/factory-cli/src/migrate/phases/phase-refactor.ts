/**
 * Phase 17: REFACTOR - Code quality improvement for generated files.
 * Single pass per file, no loops. Preserves all behavior.
 */

import fs from 'node:fs';
import path from 'node:path';
import { callClaude, parseFileResponse } from '../migrate-claude.js';
import { buildRefactorPrompt } from '../migrate-prompts.js';
import { getModelForPhase, MigratePhase as MP } from '../migrate-types.js';
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';

export interface RefactorResult {
  programId: string | number;
  filesRefactored: number;
  totalFiles: number;
  duration: number;
  warnings: string[];
  tokens?: { input: number; output: number };
}

export const runRefactorPhase = async (
  programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<RefactorResult> => {
  const start = Date.now();
  const warnings: string[] = [];
  const totalTokens = { input: 0, output: 0 };
  let filesRefactored = 0;

  // Collect generated files for this domain (same pattern as phase-review.ts)
  const allFiles: Record<string, string> = {};
  const filePaths: [string, string][] = [
    [`types/${analysis.domain}.ts`, path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`)],
    [`stores/${analysis.domain}Store.ts`, path.join(config.targetDir, 'src', 'stores', `${analysis.domain}Store.ts`)],
    [`services/api/endpoints-${analysis.domain}.ts`, path.join(config.targetDir, 'src', 'services', 'api', `endpoints-${analysis.domain}.ts`)],
    [`pages/${analysis.domainPascal}Page.tsx`, path.join(config.targetDir, 'src', 'pages', `${analysis.domainPascal}Page.tsx`)],
  ];

  // Also check component files
  const compDir = path.join(config.targetDir, 'src', 'components', 'caisse', analysis.domain);
  if (fs.existsSync(compDir)) {
    const compFiles = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));
    for (const f of compFiles) {
      filePaths.push([
        `components/caisse/${analysis.domain}/${f}`,
        path.join(compDir, f),
      ]);
    }
  }

  // Load all existing files
  const absPathMap = new Map<string, string>();
  for (const [label, absPath] of filePaths) {
    if (fs.existsSync(absPath)) {
      allFiles[label] = fs.readFileSync(absPath, 'utf8');
      absPathMap.set(label, absPath);
    }
  }

  const totalFiles = Object.keys(allFiles).length;
  if (totalFiles === 0) {
    return { programId, filesRefactored: 0, totalFiles: 0, duration: Date.now() - start, warnings: ['No generated files found'] };
  }

  // Refactor each source file (skip tests)
  const sourceFiles = Object.keys(allFiles).filter(f => !f.includes('__tests__'));

  for (const targetFile of sourceFiles) {
    if (config.abortSignal?.aborted) break;

    try {
      const prompt = buildRefactorPrompt(allFiles, analysis, targetFile);
      const result = await callClaude({
        prompt,
        model: getModelForPhase(config, MP.REFACTOR),
        cliBin: config.cliBin,
        timeoutMs: 180_000,
        logDir: config.logDir,
        logLabel: `refactor-${analysis.domain}-${path.basename(targetFile, path.extname(targetFile))}`,
      });

      const refactored = parseFileResponse(result.output);

      // Safety guard: reject suspiciously small output
      if (refactored.length < 50) {
        warnings.push(`${targetFile}: refactored content too small (${refactored.length} chars), skipping`);
        continue;
      }

      // Write the refactored file
      const absPath = absPathMap.get(targetFile);
      if (absPath) {
        fs.writeFileSync(absPath, refactored, 'utf8');
        filesRefactored++;

        // Update allFiles map so subsequent files see the refactored version
        allFiles[targetFile] = refactored;
      }

      if (result.tokens) {
        totalTokens.input += result.tokens.input;
        totalTokens.output += result.tokens.output;
      }
    } catch (err) {
      warnings.push(`${targetFile}: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  }

  const hasTokens = totalTokens.input > 0 || totalTokens.output > 0;
  return {
    programId,
    filesRefactored,
    totalFiles,
    duration: Date.now() - start,
    warnings,
    tokens: hasTokens ? totalTokens : undefined,
  };
};
