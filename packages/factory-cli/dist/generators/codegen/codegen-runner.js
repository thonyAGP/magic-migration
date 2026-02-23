/**
 * Code generation runner: orchestrates model building + enrichment + 5 generators + file writing.
 * v8: sync runCodegen (no enrichment, backward compat)
 * v9: async runCodegenEnriched (heuristic or Claude enrichment)
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildCodegenModel } from './codegen-model.js';
import { applyHeuristicEnrichment } from './enrich-heuristics.js';
import { applyClaudeEnrichment } from './enrich-prompt.js';
import { applyClaudeCliEnrichment } from './enrich-cli.js';
import { generateTypes } from './type-generator.js';
import { generateStore } from './store-generator.js';
import { generatePage } from './page-generator.js';
import { generateApi } from './api-generator.js';
import { generateTests } from './test-generator.js';
const runFromModel = (model, contract, config) => {
    const files = [
        makeFile(`types/${model.domain}.ts`, generateTypes(model), config),
        makeFile(`stores/${model.domain}Store.ts`, generateStore(model), config),
        makeFile(`pages/${model.domainPascal}Page.tsx`, generatePage(model), config),
        makeFile(`services/api/${model.domain}Api.ts`, generateApi(model), config),
        makeFile(`__tests__/${model.domain}Store.test.ts`, generateTests(model), config),
    ];
    if (!config.dryRun) {
        for (const file of files) {
            if (file.skipped)
                continue;
            const fullPath = path.join(config.outputDir, file.relativePath);
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir))
                fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(fullPath, file.content, 'utf8');
        }
    }
    return {
        programId: contract.program.id,
        programName: contract.program.name,
        files,
        written: files.filter(f => !f.skipped).length,
        skipped: files.filter(f => f.skipped).length,
    };
};
/** v8 sync API (backward compat, no enrichment) */
export const runCodegen = (contract, config) => {
    const model = buildCodegenModel(contract);
    return runFromModel(model, contract, config);
};
/** v9 async API with enrichment */
export const runCodegenEnriched = async (contract, config, enrichConfig) => {
    let model = buildCodegenModel(contract);
    if (enrichConfig.mode !== 'none') {
        model = applyHeuristicEnrichment(model);
    }
    if (enrichConfig.mode === 'claude') {
        model = await applyClaudeEnrichment(model, enrichConfig);
    }
    else if (enrichConfig.mode === 'claude-cli') {
        model = await applyClaudeCliEnrichment(model, enrichConfig);
    }
    return runFromModel(model, contract, config);
};
const makeFile = (relativePath, content, config) => {
    const fullPath = path.join(config.outputDir, relativePath);
    const exists = fs.existsSync(fullPath);
    const skipped = exists && !config.overwrite;
    return { relativePath, content, skipped };
};
//# sourceMappingURL=codegen-runner.js.map