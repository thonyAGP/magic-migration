/**
 * Magic Unipaas adapter: wraps existing build-graph.mjs and spec files.
 * Reads live-programs.json and contract YAML files from .openspec/migration/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseContract } from '../core/contract.js';
const defaultConfig = (projectRoot) => ({
    openspecDir: path.join(projectRoot, '.openspec'),
    migrationDir: path.join(projectRoot, '.openspec', 'migration'),
    liveProgramsFile: path.join(projectRoot, '.openspec', 'migration', 'live-programs.json'),
    contractPattern: /\.contract\.yaml$/,
});
export const createMagicAdapter = (projectRoot, overrides) => {
    const config = { ...defaultConfig(projectRoot), ...overrides };
    return {
        name: 'magic-unipaas',
        async extractProgramGraph() {
            if (!fs.existsSync(config.liveProgramsFile)) {
                throw new Error(`Live programs file not found: ${config.liveProgramsFile}. Run build-graph.mjs first.`);
            }
            const raw = JSON.parse(fs.readFileSync(config.liveProgramsFile, 'utf8'));
            const programs = (raw.programs ?? []).map((p) => ({
                id: p.ide,
                name: String(p.name ?? ''),
                complexity: mapComplexity(String(p.complexity ?? 'MOYENNE')),
                level: Number(p.level ?? 0),
                callers: p.callers ?? [],
                callees: p.callees ?? [],
                source: p.source ?? 'bfs',
                domain: String(p.domain ?? ''),
            }));
            return {
                generated: String(raw.generated ?? ''),
                method: String(raw.method ?? 'BFS from seeds + ECF'),
                totalPrograms: Number(raw.total_adh ?? raw.totalPrograms ?? 0),
                liveCount: Number(raw.live_count ?? raw.liveCount ?? programs.length),
                orphanCount: Number(raw.orphan_count ?? raw.orphanCount ?? 0),
                seeds: raw.seeds ?? [],
                sharedPrograms: raw.ecf_programs ?? [],
                programs,
                orphans: (raw.orphans ?? []).map((o) => ({
                    id: o.ide,
                    name: String(o.name ?? ''),
                    reason: String(o.reason ?? ''),
                })),
            };
        },
        async extractSpec(programId) {
            const pattern = new RegExp(`IDE-${programId}\\.contract\\.yaml$`);
            const files = fs.existsSync(config.migrationDir)
                ? fs.readdirSync(config.migrationDir).filter(f => pattern.test(f) || config.contractPattern.test(f))
                : [];
            if (files.length === 0)
                return null;
            return parseContract(path.join(config.migrationDir, files[0]));
        },
        async getSharedPrograms() {
            if (!fs.existsSync(config.liveProgramsFile))
                return [];
            const raw = JSON.parse(fs.readFileSync(config.liveProgramsFile, 'utf8'));
            return raw.ecf_programs ?? [];
        },
    };
};
const mapComplexity = (raw) => {
    const upper = raw.toUpperCase();
    if (upper === 'BASSE' || upper === 'LOW')
        return 'LOW';
    if (upper === 'HAUTE' || upper === 'HIGH')
        return 'HIGH';
    return 'MEDIUM';
};
//# sourceMappingURL=magic-adapter.js.map