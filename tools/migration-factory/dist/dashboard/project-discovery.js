/**
 * Project discovery utilities: find active migration projects and read registry.
 * Extracted from cli.ts for reuse by both CLI and action server.
 */
import fs from 'node:fs';
import path from 'node:path';
/**
 * Resolve the codebase directory for a project.
 * Priority: registry.codebaseDir → convention {name}-web/src → projectDir fallback.
 */
export const resolveCodebaseDir = (projectDir, projectName, registry) => {
    const entry = registry.find(r => r.name === projectName);
    if (entry?.codebaseDir)
        return path.join(projectDir, entry.codebaseDir);
    const convention = path.join(projectDir, `${projectName.toLowerCase()}-web`, 'src');
    if (fs.existsSync(convention))
        return convention;
    return projectDir;
};
export const discoverProjects = (migrationDir) => {
    if (!fs.existsSync(migrationDir))
        return [];
    return fs.readdirSync(migrationDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && fs.existsSync(path.join(migrationDir, d.name, 'live-programs.json')))
        .map(d => d.name)
        .sort();
};
export const readProjectRegistry = (migrationDir) => {
    const registryFile = path.join(migrationDir, 'projects-registry.json');
    if (!fs.existsSync(registryFile))
        return [];
    const raw = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
    return (raw.projects ?? []);
};
//# sourceMappingURL=project-discovery.js.map