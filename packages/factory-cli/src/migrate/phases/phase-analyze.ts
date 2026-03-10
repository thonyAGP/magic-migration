/**
 * Phase 2: ANALYZE - Generate design document JSON via Claude CLI.
 * Produces the architectural blueprint used by all subsequent phases.
 */

import fs from 'node:fs';
import path from 'node:path';
import { callClaudeJson } from '../migrate-claude.js';
import { buildAnalyzePrompt } from '../migrate-prompts.js';
import { buildContext } from '../migrate-context.js';
import { getModelForPhase, MigratePhase } from '../migrate-types.js';
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';

export interface AnalyzeResult {
  analysisFile: string;
  analysis: AnalysisDocument;
  skipped: boolean;
  duration: number;
  tokens?: { input: number; output: number };
}

export const runAnalyzePhase = async (
  programId: string | number,
  config: MigrateConfig,
): Promise<AnalyzeResult> => {
  const project = config.contractSubDir;
  const analysisDir = path.join(config.migrationDir, project);
  const analysisFile = path.join(analysisDir, `${project}-IDE-${programId}.analysis.json`);

  // Skip if analysis already exists
  if (fs.existsSync(analysisFile)) {
    const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8')) as AnalysisDocument;
    return { analysisFile, analysis, skipped: true, duration: 0 };
  }

  const start = Date.now();
  const ctx = buildContext(programId, config);

  if (!ctx.spec && !ctx.contract) {
    throw new Error(`No spec or contract found for IDE ${programId}`);
  }

  const prompt = buildAnalyzePrompt(ctx);

  // Retry configuration
  const MAX_ATTEMPTS = 2;
  const TIMEOUT_MS = [180_000, 270_000];  // 3min, then 4min30

  let lastError: Error | null = null;
  let analysis: AnalysisDocument | null = null;
  let tokens: { input: number; output: number } | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const response = await callClaudeJson<AnalysisDocument>({
        prompt,
        model: getModelForPhase(config, MigratePhase.ANALYZE),
        cliBin: config.cliBin,
        timeoutMs: TIMEOUT_MS[attempt],
      });

      analysis = response.data;
      tokens = response.tokens;

      // Validate minimal structure
      if (!analysis.domain || !analysis.entities || !analysis.actions) {
        throw new Error(`Invalid analysis document for IDE ${programId}: missing required fields`);
      }

      // Success - break retry loop
      break;

    } catch (err) {
      lastError = err as Error;

      if (attempt < MAX_ATTEMPTS - 1) {
        // Retry with increased timeout
        console.warn(`⚠️  Analyze timeout (attempt ${attempt + 1}/${MAX_ATTEMPTS}), retrying with longer timeout...`);
        continue;
      }
    }
  }

  // If all attempts failed
  if (!analysis) {
    throw new Error(`Analyze failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`);
  }

  if (!config.dryRun) {
    if (!fs.existsSync(analysisDir)) fs.mkdirSync(analysisDir, { recursive: true });
    fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2), 'utf8');
  }

  return { analysisFile, analysis, skipped: false, duration: Date.now() - start, tokens };
};
