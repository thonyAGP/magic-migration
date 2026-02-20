/**
 * Phase 0: SPEC - Auto-generate specification from KB data.
 * Uses KbIndexRunner CLI to extract data, then Claude CLI to format as Markdown.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { callClaude, parseFileResponse } from '../migrate-claude.js';
import { buildSpecPrompt } from '../migrate-prompts.js';
import { getModelForPhase, MigratePhase as MP } from '../migrate-types.js';
const execFileAsync = promisify(execFile);
/**
 * Extract KB data via KbIndexRunner CLI then generate spec with Claude.
 */
export const runSpecPhase = async (programId, config) => {
    const project = config.contractSubDir;
    const specFile = path.join(config.specDir, `${project}-IDE-${programId}.md`);
    // Skip if spec already exists
    if (fs.existsSync(specFile)) {
        return { specFile, skipped: true, duration: 0 };
    }
    const start = Date.now();
    // Extract KB data using KbIndexRunner CLI
    const kbData = await extractKbData(programId, project, config);
    // Generate spec with Claude CLI
    const prompt = buildSpecPrompt(kbData, programId, project);
    const result = await callClaude({
        prompt,
        model: getModelForPhase(config, MP.SPEC),
        cliBin: config.cliBin,
        timeoutMs: 180_000,
    });
    const specContent = parseFileResponse(result.output);
    if (!config.dryRun) {
        const dir = path.dirname(specFile);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(specFile, specContent, 'utf8');
    }
    return { specFile, skipped: false, duration: Date.now() - start };
};
/**
 * Extract KB data using the KbIndexRunner CLI `spec-data` command.
 * Falls back to a minimal description if CLI is not available.
 */
const extractKbData = async (programId, project, config) => {
    const kbRunnerPath = path.join(config.projectDir, 'tools', 'MagicMcp', 'KbIndexRunner');
    try {
        const { stdout } = await execFileAsync('dotnet', [
            'run',
            '--project', kbRunnerPath,
            '--', 'spec-data', project, String(programId),
        ], {
            timeout: 30_000,
            maxBuffer: 1024 * 1024,
            cwd: config.projectDir,
        });
        return stdout;
    }
    catch {
        // Fallback: return minimal info
        return `Program: ${project} IDE ${programId}\nNo KB data available - generate from contract and existing spec files.`;
    }
};
//# sourceMappingURL=phase-spec.js.map