/**
 * Tier 2b: Claude CLI enrichment for generated code.
 * Uses local `claude` CLI binary (Claude Code) instead of API.
 * No API key needed - uses the user's local Claude subscription.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { emptyEnrichment } from './enrich-model.js';
import { buildCodegenSystemPrompt, buildCodegenUserPrompt, parseClaudeEnrichmentResponse } from './enrich-prompt.js';
const execFileAsync = promisify(execFile);
export const applyClaudeCliEnrichment = async (model, config) => {
    const cliBin = config.cliBin ?? 'claude';
    const systemPrompt = buildCodegenSystemPrompt();
    const userPrompt = buildCodegenUserPrompt(model);
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;
    const modelFlag = config.model ? ['--model', config.model] : [];
    const { stdout } = await execFileAsync(cliBin, [
        '--print',
        ...modelFlag,
        fullPrompt,
    ], {
        timeout: 60_000,
        maxBuffer: 1024 * 1024,
        env: { ...process.env },
    });
    const base = model.enrichments ?? emptyEnrichment();
    let cliEnrichment;
    try {
        cliEnrichment = parseClaudeEnrichmentResponse(stdout);
    }
    catch {
        // Fallback: keep heuristic enrichments if CLI parse fails
        return model;
    }
    const merged = {
        stateFieldTypes: { ...base.stateFieldTypes, ...cliEnrichment.stateFieldTypes },
        stateFieldDefaults: { ...base.stateFieldDefaults, ...cliEnrichment.stateFieldDefaults },
        entityFields: { ...base.entityFields, ...cliEnrichment.entityFields },
        actionBodies: { ...base.actionBodies, ...cliEnrichment.actionBodies },
        testAssertions: { ...base.testAssertions, ...cliEnrichment.testAssertions },
    };
    return { ...model, enrichments: merged };
};
//# sourceMappingURL=enrich-cli.js.map