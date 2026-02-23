/**
 * Phase 15: REVIEW - Quality review comparing generated code vs spec/contract.
 * Produces a coverage report for each program.
 */
import fs from 'node:fs';
import path from 'node:path';
import { callClaudeJson } from '../migrate-claude.js';
import { buildReviewPrompt } from '../migrate-prompts.js';
import { buildContext } from '../migrate-context.js';
import { getModelForPhase, MigratePhase as MP } from '../migrate-types.js';
export const runReviewPhase = async (programId, analysis, config) => {
    const start = Date.now();
    const ctx = buildContext(programId, config);
    // Collect generated files for this domain
    const generatedFiles = {};
    const filePaths = [
        [`types/${analysis.domain}.ts`, path.join(config.targetDir, 'src', 'types', `${analysis.domain}.ts`)],
        [`stores/${analysis.domain}Store.ts`, path.join(config.targetDir, 'src', 'stores', `${analysis.domain}Store.ts`)],
        [`services/api/endpoints-${analysis.domain}.ts`, path.join(config.targetDir, 'src', 'services', 'api', `endpoints-${analysis.domain}.ts`)],
        [`pages/${analysis.domainPascal}Page.tsx`, path.join(config.targetDir, 'src', 'pages', `${analysis.domainPascal}Page.tsx`)],
    ];
    for (const [label, absPath] of filePaths) {
        if (fs.existsSync(absPath)) {
            generatedFiles[label] = fs.readFileSync(absPath, 'utf8');
        }
    }
    // Also check component files
    const compDir = path.join(config.targetDir, 'src', 'components', 'caisse', analysis.domain);
    if (fs.existsSync(compDir)) {
        const compFiles = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx'));
        for (const f of compFiles) {
            generatedFiles[`components/caisse/${analysis.domain}/${f}`] = fs.readFileSync(path.join(compDir, f), 'utf8');
        }
    }
    if (Object.keys(generatedFiles).length === 0) {
        return {
            report: {
                programId,
                programName: analysis.domainPascal,
                coveragePct: 0,
                rulesImplemented: 0,
                rulesTotal: ctx.contract?.rules.length ?? 0,
                missingRules: ['No generated files found'],
                recommendations: ['Run generation phases first'],
            },
            duration: Date.now() - start,
        };
    }
    const prompt = buildReviewPrompt(ctx, generatedFiles);
    try {
        const report = await callClaudeJson({
            prompt,
            model: getModelForPhase(config, MP.REVIEW),
            cliBin: config.cliBin,
            timeoutMs: 180_000,
        });
        // Ensure required fields
        report.programId = programId;
        report.programName = analysis.domainPascal;
        return { report, duration: Date.now() - start };
    }
    catch {
        // Fallback: compute basic coverage from contract
        const rulesTotal = ctx.contract?.rules.length ?? 0;
        const filesCount = Object.keys(generatedFiles).length;
        const coveragePct = filesCount >= 4 ? 80 : Math.round((filesCount / 6) * 100);
        return {
            report: {
                programId,
                programName: analysis.domainPascal,
                coveragePct,
                rulesImplemented: Math.round(rulesTotal * coveragePct / 100),
                rulesTotal,
                missingRules: [],
                recommendations: ['Manual review recommended - Claude review failed'],
            },
            duration: Date.now() - start,
        };
    }
};
//# sourceMappingURL=phase-review.js.map