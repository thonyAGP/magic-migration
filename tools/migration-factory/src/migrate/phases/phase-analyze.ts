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
  const analysis = await callClaudeJson<AnalysisDocument>({
    prompt,
    model: getModelForPhase(config, MigratePhase.ANALYZE),
    cliBin: config.cliBin,
    timeoutMs: 180_000,
  });

  // Validate minimal structure
  if (!analysis.domain || !analysis.entities || !analysis.actions) {
    throw new Error(`Invalid analysis document for IDE ${programId}: missing required fields`);
  }

  if (!config.dryRun) {
    if (!fs.existsSync(analysisDir)) fs.mkdirSync(analysisDir, { recursive: true });
    fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2), 'utf8');
  }

  return { analysisFile, analysis, skipped: false, duration: Date.now() - start };
};
