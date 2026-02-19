/**
 * Pipeline configuration: resolve defaults + user overrides.
 */

import path from 'node:path';
import type { PipelineConfig } from '../core/types.js';
import { EnrichmentMode } from '../core/types.js';

export interface PipelineConfigInput {
  projectDir: string;
  dir?: string;
  dryRun?: boolean;
  noContract?: boolean;
  noVerify?: boolean;
  report?: boolean;
  enrich?: string;
  model?: string;
}

export const resolvePipelineConfig = (input: PipelineConfigInput): PipelineConfig => {
  const { projectDir, dir = 'ADH' } = input;
  const migrationDir = path.join(projectDir, '.openspec', 'migration');

  return {
    projectDir,
    migrationDir,
    specDir: path.join(projectDir, '.openspec', 'specs'),
    codebaseDir: path.join(projectDir, 'adh-web', 'src'),
    contractSubDir: dir,
    trackerFile: path.join(migrationDir, dir, 'tracker.json'),
    autoContract: !input.noContract,
    autoVerify: !input.noVerify,
    dryRun: input.dryRun ?? false,
    generateReport: input.report ?? false,
    enrichmentMode: input.enrich === 'claude' ? EnrichmentMode.CLAUDE : EnrichmentMode.MANUAL,
    claudeModel: input.model,
  };
};
