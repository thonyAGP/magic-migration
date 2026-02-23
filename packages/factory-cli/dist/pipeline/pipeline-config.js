/**
 * Pipeline configuration: resolve defaults + user overrides.
 */
import path from 'node:path';
import { EnrichmentMode } from '../core/types.js';
import { readProjectRegistry, resolveCodebaseDir } from '../dashboard/project-discovery.js';
export const resolvePipelineConfig = (input) => {
    const { projectDir, dir = 'ADH' } = input;
    const migrationDir = path.join(projectDir, '.openspec', 'migration');
    const registry = readProjectRegistry(migrationDir);
    return {
        projectDir,
        migrationDir,
        specDir: path.join(projectDir, '.openspec', 'specs'),
        codebaseDir: resolveCodebaseDir(projectDir, dir, registry),
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
//# sourceMappingURL=pipeline-config.js.map