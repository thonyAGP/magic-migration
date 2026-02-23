/**
 * Phase 14: INTEGRATE - Wire new pages into the application routing.
 * Updates App.tsx / routes to include newly generated pages.
 */

import fs from 'node:fs';
import path from 'node:path';
import { callClaude, parseFileResponse } from '../migrate-claude.js';
import { buildIntegratePrompt } from '../migrate-prompts.js';
import { getModelForPhase, MigratePhase as MP } from '../migrate-types.js';
import type { MigrateConfig, AnalysisDocument } from '../migrate-types.js';

export interface IntegrateResult {
  filesModified: string[];
  duration: number;
}

export const runIntegratePhase = async (
  analyses: AnalysisDocument[],
  config: MigrateConfig,
): Promise<IntegrateResult> => {
  const start = Date.now();
  const filesModified: string[] = [];

  // Find the routing file (App.tsx or routes.tsx)
  const routesCandidates = [
    path.join(config.targetDir, 'src', 'App.tsx'),
    path.join(config.targetDir, 'src', 'routes.tsx'),
    path.join(config.targetDir, 'src', 'router.tsx'),
  ];

  const routesFile = routesCandidates.find(f => fs.existsSync(f));
  if (!routesFile) {
    return { filesModified: [], duration: Date.now() - start };
  }

  const existingRoutes = fs.readFileSync(routesFile, 'utf8');

  // Filter out domains that are already integrated
  const newDomains = analyses
    .filter(a => !existingRoutes.includes(`${a.domainPascal}Page`))
    .map(a => ({
      domain: a.domain,
      domainPascal: a.domainPascal,
      pagePath: `@/pages/${a.domainPascal}Page`,
    }));

  if (newDomains.length === 0) {
    return { filesModified: [], duration: Date.now() - start };
  }

  const prompt = buildIntegratePrompt(existingRoutes, newDomains);
  const result = await callClaude({
    prompt,
    model: getModelForPhase(config, MP.INTEGRATE),
    cliBin: config.cliBin,
  });
  const updatedContent = parseFileResponse(result.output);

  if (!config.dryRun && updatedContent.length > 50) {
    fs.writeFileSync(routesFile, updatedContent, 'utf8');
    filesModified.push(routesFile);
  }

  // Generate barrel exports for new types and stores
  const indexFiles = [
    { dir: 'types', files: analyses.map(a => a.domain) },
    { dir: 'stores', files: analyses.map(a => `${a.domain}Store`) },
  ];

  for (const { dir, files } of indexFiles) {
    const indexFile = path.join(config.targetDir, 'src', dir, 'index.ts');
    if (!fs.existsSync(indexFile)) continue;

    const existing = fs.readFileSync(indexFile, 'utf8');
    const newExports = files
      .filter(f => !existing.includes(f))
      .map(f => `export * from './${f}.js';`);

    if (newExports.length > 0 && !config.dryRun) {
      fs.writeFileSync(indexFile, existing.trimEnd() + '\n' + newExports.join('\n') + '\n', 'utf8');
      filesModified.push(indexFile);
    }
  }

  return { filesModified, duration: Date.now() - start };
};
