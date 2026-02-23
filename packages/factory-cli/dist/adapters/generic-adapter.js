/**
 * Generic adapter: imports program graphs from CSV or JSON files.
 * For legacy systems without an automatic parser (COBOL, VB6, Delphi, etc.)
 */
import fs from 'node:fs';
export const createGenericAdapter = (config) => ({
    name: 'generic',
    async extractProgramGraph() {
        const rows = loadRows(config);
        const programs = rows.map(row => ({
            id: row.id,
            name: row.name,
            complexity: normalizeComplexity(row.complexity),
            level: 0,
            callers: parseIdList(row.callers),
            callees: parseIdList(row.callees),
            source: config.seeds.includes(row.id) ? 'seed'
                : config.sharedPrograms.includes(row.id) ? 'ecf'
                    : 'manual',
            domain: row.domain ?? '',
        }));
        return {
            generated: new Date().toISOString().slice(0, 10),
            method: `Generic import from ${config.format}`,
            totalPrograms: programs.length,
            liveCount: programs.length,
            orphanCount: 0,
            seeds: config.seeds,
            sharedPrograms: config.sharedPrograms,
            programs,
            orphans: [],
        };
    },
    async extractSpec(_programId) {
        // Generic adapter has no spec extraction - contracts are created manually
        return null;
    },
    async getSharedPrograms() {
        return config.sharedPrograms;
    },
});
const loadRows = (config) => {
    const content = fs.readFileSync(config.programsFile, 'utf8');
    if (config.format === 'json') {
        return JSON.parse(content);
    }
    // CSV parsing (simple: comma-delimited, first row = headers)
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 2)
        return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
        return {
            id: row.id ?? '',
            name: row.name ?? '',
            complexity: row.complexity,
            callees: row.callees,
            callers: row.callers,
            domain: row.domain,
            shared: row.shared === 'true',
        };
    });
};
const parseIdList = (s) => {
    if (!s)
        return [];
    return s.split(/[,;|]/).map(v => v.trim()).filter(Boolean).map(v => {
        const n = Number(v);
        return isNaN(n) ? v : n;
    });
};
const normalizeComplexity = (raw) => {
    const upper = (raw ?? '').toUpperCase();
    if (upper === 'LOW' || upper === 'BASSE' || upper === 'L')
        return 'LOW';
    if (upper === 'HIGH' || upper === 'HAUTE' || upper === 'H')
        return 'HIGH';
    return 'MEDIUM';
};
//# sourceMappingURL=generic-adapter.js.map