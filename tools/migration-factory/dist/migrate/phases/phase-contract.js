/**
 * Phase 1: CONTRACT - Generate migration contract from spec.
 * Wraps the existing generateAutoContract() function.
 */
import fs from 'node:fs';
import path from 'node:path';
import { generateAutoContract } from '../../generators/auto-contract.js';
import { writeContract } from '../../core/contract.js';
import { resolveCodebaseDir, readProjectRegistry } from '../../dashboard/project-discovery.js';
export const runContractPhase = (programId, config) => {
    const project = config.contractSubDir;
    const contractDir = path.join(config.migrationDir, project);
    const contractFile = path.join(contractDir, `${project}-IDE-${programId}.contract.yaml`);
    // Skip if contract already exists and is valid
    if (fs.existsSync(contractFile)) {
        return { contractFile, skipped: true, duration: 0 };
    }
    const start = Date.now();
    const specFile = path.join(config.specDir, `${project}-IDE-${programId}.md`);
    if (!fs.existsSync(specFile)) {
        throw new Error(`Spec file not found: ${specFile}`);
    }
    const registry = readProjectRegistry(config.migrationDir);
    const codebaseDir = resolveCodebaseDir(config.projectDir, project, registry);
    const contract = generateAutoContract({
        specFile,
        codebaseDir,
        projectDir: config.projectDir,
        programId,
    });
    if (!contract) {
        throw new Error(`Failed to generate contract for IDE ${programId}`);
    }
    if (!config.dryRun) {
        if (!fs.existsSync(contractDir))
            fs.mkdirSync(contractDir, { recursive: true });
        writeContract(contract, contractFile);
    }
    return { contractFile, skipped: false, duration: Date.now() - start };
};
//# sourceMappingURL=phase-contract.js.map