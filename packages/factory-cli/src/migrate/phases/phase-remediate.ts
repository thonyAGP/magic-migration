/**
 * Phase REMEDIATE: Coverage convergence loop.
 * Detects coverage gaps via programmatic checker, routes gaps to target files,
 * calls Claude to patch each file, then re-checks until target coverage or plateau.
 */

import fs from 'node:fs';
import path from 'node:path';
import { checkCoverageForProgram } from './phase-coverage.js';
import { buildRemediatePrompt, buildSpecGuidedRemediatePrompt, buildRegenerateStorePrompt } from '../migrate-prompts.js';
import type { RemediateGap } from '../migrate-prompts.js';
import { callClaude, parseFileResponse } from '../migrate-claude.js';
import { buildContext } from '../migrate-context.js';
import { getModelForPhase, MigratePhase as MP } from '../migrate-types.js';
import type { MigrateConfig, AnalysisDocument, CoverageItem } from '../migrate-types.js';

// ─── Result Type ─────────────────────────────────────────────

export interface RemediateResult {
  programId: string | number;
  initialCoverage: number;
  finalCoverage: number;
  iterations: number;
  filesRemediated: number;
  totalDuration: number;
  plateaued: boolean;
  warnings: string[];
}

// ─── Gap Routing ─────────────────────────────────────────────

interface RoutedGap {
  filePath: string;
  gaps: RemediateGap[];
}

const coverageItemToGap = (item: CoverageItem, category: RemediateGap['category']): RemediateGap => ({
  category,
  id: item.id,
  name: item.name,
  description: `${category} "${item.name}" (${item.id}) not found in generated code`,
});

const routeGapsToFiles = (
  missingRules: CoverageItem[],
  missingTables: CoverageItem[],
  missingVariables: CoverageItem[],
  missingCallees: CoverageItem[],
  targetDir: string,
  domain: string,
  domainPascal: string,
): RoutedGap[] => {
  const fileGaps = new Map<string, RemediateGap[]>();

  const addGap = (relPath: string, gap: RemediateGap) => {
    const fullPath = path.join(targetDir, relPath);
    const existing = fileGaps.get(fullPath) ?? [];
    existing.push(gap);
    fileGaps.set(fullPath, existing);
  };

  // Rules: business logic → store, UI-related → page
  const uiPattern = /ecran|affich|bouton|champ|saisie|formulaire|dialog|message|alerte|erreur/i;
  for (const item of missingRules) {
    const gap = coverageItemToGap(item, 'rule');
    if (uiPattern.test(item.name)) {
      addGap(`src/pages/${domainPascal}Page.tsx`, gap);
    } else {
      addGap(`src/stores/${domain}Store.ts`, gap);
    }
  }

  // Tables → types file
  for (const item of missingTables) {
    addGap(`src/types/${domain}.ts`, coverageItemToGap(item, 'table'));
  }

  // Variables → store
  for (const item of missingVariables) {
    addGap(`src/stores/${domain}Store.ts`, coverageItemToGap(item, 'variable'));
  }

  // Callees → API endpoints
  for (const item of missingCallees) {
    addGap(`src/services/api/endpoints-${domain}.ts`, coverageItemToGap(item, 'callee'));
  }

  const result: RoutedGap[] = [];
  for (const [filePath, gaps] of fileGaps) {
    if (fs.existsSync(filePath)) {
      result.push({ filePath, gaps });
    }
  }

  return result;
};

// ─── Main Loop ───────────────────────────────────────────────

export const runRemediateLoop = async (
  programId: string | number,
  analysis: AnalysisDocument,
  config: MigrateConfig,
): Promise<RemediateResult> => {
  const start = Date.now();
  const maxPasses = config.maxRemediationPasses ?? 5;
  const coverageTarget = config.coverageTarget ?? 100;
  const warnings: string[] = [];
  let filesRemediated = 0;
  let plateaued = false;

  // Initial coverage check
  const initialReport = checkCoverageForProgram(programId, config, analysis);
  if (!initialReport) {
    return {
      programId,
      initialCoverage: 0,
      finalCoverage: 0,
      iterations: 0,
      filesRemediated: 0,
      totalDuration: Date.now() - start,
      plateaued: false,
      warnings: ['No contract found for coverage check'],
    };
  }

  const initialCoverage = initialReport.coveragePct;
  let previousCoverage = initialCoverage;
  let twoPassesPrevious = initialCoverage;
  let currentCoverage = initialCoverage;
  let iterations = 0;

  const ctx = buildContext(programId, config);
  const isSparseContract = (ctx.contract?.rules.length ?? 0) === 0
    && (initialReport.rules.length + initialReport.tables.length + initialReport.variables.length + initialReport.callees.length) <= 2;

  // Sparse contract: run ONE spec-guided pass — but SKIP on re-runs when files already have
  // substantial content (previous generation was successful, re-running corrupts working code)
  const sparseStorePath = path.join(config.targetDir, 'src', 'stores', `${analysis.domain}Store.ts`);
  const storeAlreadyGenerated = fs.existsSync(sparseStorePath) && fs.readFileSync(sparseStorePath, 'utf8').length > 500;

  if (isSparseContract && ctx.spec && !config.dryRun && !storeAlreadyGenerated) {
    warnings.push('Sparse contract — running spec-guided quality pass');
    const mainFiles = [
      path.join(config.targetDir, 'src', 'stores', `${analysis.domain}Store.ts`),
      path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`),
    ].filter(f => fs.existsSync(f));

    for (const filePath of mainFiles) {
      if (config.abortSignal?.aborted) break;
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const prompt = buildSpecGuidedRemediatePrompt(fileContent, filePath, ctx.spec);
      try {
        const result = await callClaude({
          prompt,
          model: getModelForPhase(config, MP.REMEDIATE),
          cliBin: config.cliBin,
          timeoutMs: 120_000,
          logLabel: `remediate-spec-${path.basename(filePath)}`,
        });
        const fixedContent = parseFileResponse(result.output);
        if (fixedContent.length > 50) {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          filesRemediated++;
        }
      } catch (err) {
        warnings.push(`Spec-guided fix failed ${path.basename(filePath)}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    iterations = 1;

    return {
      programId,
      initialCoverage,
      finalCoverage: initialCoverage,
      iterations,
      filesRemediated,
      totalDuration: Date.now() - start,
      plateaued: false,
      warnings,
    };
  }

  // Already at target
  if (currentCoverage >= coverageTarget) {
    return {
      programId,
      initialCoverage,
      finalCoverage: currentCoverage,
      iterations: 0,
      filesRemediated: 0,
      totalDuration: Date.now() - start,
      plateaued: false,
      warnings: [],
    };
  }
  const contractRules = ctx.contract?.rules ?? [];

  for (let pass = 0; pass < maxPasses; pass++) {
    if (config.abortSignal?.aborted) break;
    iterations++;

    // Get current gaps
    const report = checkCoverageForProgram(programId, config, analysis);
    if (!report) break;

    currentCoverage = report.coveragePct;

    // Target reached
    if (currentCoverage >= coverageTarget) break;

    // Plateau detection: stop after 2 consecutive passes without improvement
    if (pass > 1 && currentCoverage <= previousCoverage && currentCoverage <= twoPassesPrevious) {
      plateaued = true;
      warnings.push(`Plateau detected at ${currentCoverage}% (pass ${pass + 1})`);
      break;
    }
    twoPassesPrevious = previousCoverage;
    previousCoverage = currentCoverage;

    // Collect missing items
    const missingRules = report.rules.filter(r => !r.found);
    const missingTables = report.tables.filter(t => !t.found);
    const missingVars = report.variables.filter(v => !v.found);
    const missingCallees = report.callees.filter(c => !c.found);

    const routed = routeGapsToFiles(
      missingRules, missingTables, missingVars, missingCallees,
      config.targetDir, analysis.domain, analysis.domainPascal,
    );

    if (routed.length === 0) {
      warnings.push(`No routable gaps found (pass ${pass + 1})`);
      break;
    }

    // Remediate each file (max 5 files per pass)
    for (const { filePath, gaps } of routed.slice(0, 5)) {
      if (config.abortSignal?.aborted) break;

      const fileContent = fs.readFileSync(filePath, 'utf8');
      // Limit gaps per file per call
      const limitedGaps = gaps.slice(0, 10);

      const prompt = buildRemediatePrompt(fileContent, filePath, limitedGaps, contractRules, ctx.spec ?? undefined);

      try {
        const result = await callClaude({
          prompt,
          model: getModelForPhase(config, MP.REMEDIATE),
          cliBin: config.cliBin,
          timeoutMs: 120_000,
          logLabel: `remediate-${path.basename(filePath)}-pass${pass + 1}`,
        });

        const fixedContent = parseFileResponse(result.output);

        // Safety guard: patched file must be substantial
        if (!config.dryRun && fixedContent.length > 50) {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          filesRemediated++;
        }
      } catch (err) {
        warnings.push(`Failed to remediate ${path.basename(filePath)}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  // Final coverage check
  let finalReport = checkCoverageForProgram(programId, config, analysis);
  let finalCoverage = finalReport?.coveragePct ?? currentCoverage;

  // REGENERATION: if plateaued below 90% and program has rules, regenerate store
  const allRules = ctx.contract?.rules ?? [];
  if (plateaued && finalCoverage < 90 && allRules.length > 0 && ctx.spec && !config.dryRun) {
    const missingRuleIds = (finalReport?.rules ?? []).filter(r => !r.found).map(r => r.id);
    if (missingRuleIds.length > 0) {
      warnings.push(`Plateaued at ${finalCoverage}% — regenerating store with all ${allRules.length} rules`);

      const storePath = path.join(config.targetDir, 'src', 'stores', `${analysis.domain}Store.ts`);
      if (fs.existsSync(storePath)) {
        const storeContent = fs.readFileSync(storePath, 'utf8');

        // B12: Include test file so regeneration is compatible with existing tests
        let testContent: string | undefined;
        const testCandidates = [
          path.join(config.targetDir, 'src', 'stores', '__tests__', `${analysis.domain}Store.test.ts`),
          path.join(config.targetDir, 'src', '__tests__', `${analysis.domain}Store.test.ts`),
          path.join(config.targetDir, 'src', '__tests__', `${analysis.domainPascal}Page.test.tsx`),
        ];
        for (const candidate of testCandidates) {
          if (fs.existsSync(candidate)) {
            testContent = fs.readFileSync(candidate, 'utf8');
            break;
          }
        }

        const regenPrompt = buildRegenerateStorePrompt(storeContent, storePath, ctx.spec, allRules, missingRuleIds, testContent);

        try {
          const result = await callClaude({
            prompt: regenPrompt,
            model: getModelForPhase(config, MP.REMEDIATE),
            cliBin: config.cliBin,
            timeoutMs: 180_000,
            logLabel: `remediate-regen-store-${programId}`,
          });
          const regenContent = parseFileResponse(result.output);
          if (regenContent.length > 200) {
            fs.writeFileSync(storePath, regenContent, 'utf8');
            filesRemediated++;
            iterations++;

            // Re-check coverage after regeneration
            finalReport = checkCoverageForProgram(programId, config, analysis);
            finalCoverage = finalReport?.coveragePct ?? finalCoverage;
            plateaued = false;
            warnings.push(`Post-regeneration coverage: ${finalCoverage}%`);
          }
        } catch (err) {
          warnings.push(`Store regeneration failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  }

  return {
    programId,
    initialCoverage,
    finalCoverage,
    iterations,
    filesRemediated,
    totalDuration: Date.now() - start,
    plateaued,
    warnings,
  };
};
