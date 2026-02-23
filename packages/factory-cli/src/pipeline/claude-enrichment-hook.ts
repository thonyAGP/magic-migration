/**
 * Claude API enrichment hook: auto-classify gap items via Claude API.
 * v4: replaces manual enrichment for contracted programs with gaps.
 */

import fs from 'node:fs';
import type { EnrichmentHook, EnrichmentContext, EnrichmentResult } from './enrichment-hook.js';
import { createClaudeClient, type ClaudeClientConfig } from './claude-client.js';
import {
  buildSystemPrompt,
  buildUserPrompt,
  extractGapItems,
  findRelevantCodeFiles,
  applyEnrichmentResult,
} from './claude-prompt.js';

const countContractGaps = (contract: EnrichmentContext['contract']): number => {
  const allItems = [
    ...contract.rules,
    ...contract.variables,
    ...contract.tables,
    ...contract.callees,
  ];
  return allItems.filter(i => i.status !== 'IMPL' && i.status !== 'N/A').length;
};

export const createClaudeEnrichmentHook = (clientConfig?: ClaudeClientConfig): EnrichmentHook => ({
  name: 'claude-api',

  canEnrich(context: EnrichmentContext): boolean {
    const hasKey = !!(process.env.ANTHROPIC_API_KEY || clientConfig?.apiKey);
    const hasSpec = fs.existsSync(context.specFile);
    return hasKey && hasSpec;
  },

  async enrich(context: EnrichmentContext): Promise<EnrichmentResult> {
    const gapItems = extractGapItems(context.contract);

    if (gapItems.length === 0) {
      return {
        enriched: true,
        updatedContract: context.contract,
        message: 'No gaps to enrich',
        gapsResolved: 0,
        gapsRemaining: 0,
      };
    }

    try {
      const client = createClaudeClient(clientConfig);
      const specContent = fs.readFileSync(context.specFile, 'utf8');
      const snippets = findRelevantCodeFiles(context.codebaseDir, context.contract);

      const systemPrompt = buildSystemPrompt();
      const userPrompt = buildUserPrompt(specContent, gapItems, snippets);

      const result = await client.classify(systemPrompt, userPrompt);
      const updatedContract = applyEnrichmentResult(context.contract, result.items);
      const newGaps = countContractGaps(updatedContract);

      return {
        enriched: newGaps < gapItems.length,
        updatedContract,
        message: `Claude resolved ${gapItems.length - newGaps}/${gapItems.length} gaps (${result.inputTokens}+${result.outputTokens} tokens, model: ${clientConfig?.model ?? 'haiku'})`,
        gapsResolved: gapItems.length - newGaps,
        gapsRemaining: newGaps,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        enriched: false,
        message: `Claude enrichment failed: ${msg}`,
        gapsResolved: 0,
        gapsRemaining: gapItems.length,
      };
    }
  },
});
