/**
 * Module Cost Tracker - Aggregate costs and metrics by functional module.
 */

import fs from 'node:fs';
import type { FunctionalModule } from '../core/types.js';

interface TokensData {
  global: {
    input: number;
    output: number;
    costUsd: number;
  };
  programs: Record<
    string,
    {
      input: number;
      output: number;
      costUsd: number;
    }
  >;
}

export interface ModuleCostSummary {
  moduleId: string;
  moduleName: string;
  totalPrograms: number;
  programsMigrated: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCostUsd: number;
  avgCostPerProgram: number;
}

/**
 * Get cost summary for a module by aggregating from tokens.json.
 */
export const getModuleCosts = (
  module: FunctionalModule,
  tokensFile: string,
): ModuleCostSummary => {
  if (!fs.existsSync(tokensFile)) {
    return {
      moduleId: module.id,
      moduleName: module.name,
      totalPrograms: module.programs.length,
      programsMigrated: 0,
      totalTokensInput: 0,
      totalTokensOutput: 0,
      totalCostUsd: 0,
      avgCostPerProgram: 0,
    };
  }

  const tokensData: TokensData = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
  let totalInput = 0;
  let totalOutput = 0;
  let totalCost = 0;
  let count = 0;

  for (const progId of module.programs) {
    const progData = tokensData.programs[String(progId)];
    if (progData) {
      totalInput += progData.input;
      totalOutput += progData.output;
      totalCost += progData.costUsd;
      count++;
    }
  }

  const avgCost = count > 0 ? totalCost / count : 0;

  return {
    moduleId: module.id,
    moduleName: module.name,
    totalPrograms: module.programs.length,
    programsMigrated: count,
    totalTokensInput: totalInput,
    totalTokensOutput: totalOutput,
    totalCostUsd: totalCost,
    avgCostPerProgram: avgCost,
  };
};

/**
 * Log module summary after migration.
 */
export const logModuleSummary = (
  module: FunctionalModule,
  trackerFile: string,
  tokensFile: string,
): void => {
  const costs = getModuleCosts(module, tokensFile);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`  MODULE SUMMARY - ${module.name}`);
  console.log('='.repeat(80));
  console.log(`  ID: ${module.id}`);
  console.log(`  Vague: ${module.wave}`);
  console.log(`  Programmes: ${costs.programsMigrated}/${costs.totalPrograms} migrés`);
  console.log(`  Tokens: ${costs.totalTokensInput.toLocaleString()} input + ${costs.totalTokensOutput.toLocaleString()} output`);
  console.log(`  Coût total: $${costs.totalCostUsd.toFixed(2)}`);
  console.log(`  Coût moyen/prog: $${costs.avgCostPerProgram.toFixed(2)}`);
  console.log('='.repeat(80));
  console.log('');
};
