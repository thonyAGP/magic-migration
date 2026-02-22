/**
 * Context builder for migration prompts.
 * Loads spec, contract, DB metadata, analysis JSON, and pattern references
 * to compose the full context needed by each phase.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseContract } from '../core/contract.js';
// ─── Build Context ──────────────────────────────────────────────
export const buildContext = (programId, config) => {
    const project = config.contractSubDir;
    const ctx = {
        programId,
        project,
        spec: null,
        contract: null,
        analysis: null,
        dbMetadata: {},
        patternFiles: {},
    };
    // Load spec
    const specFile = path.join(config.specDir, `${project}-IDE-${programId}.md`);
    if (fs.existsSync(specFile)) {
        ctx.spec = fs.readFileSync(specFile, 'utf8');
    }
    // Load contract
    const contractDir = path.join(config.migrationDir, project);
    const contractFile = path.join(contractDir, `${project}-IDE-${programId}.contract.yaml`);
    if (fs.existsSync(contractFile)) {
        ctx.contract = parseContract(contractFile);
    }
    // Load analysis JSON (from phase 2 output)
    const analysisFile = path.join(contractDir, `${project}-IDE-${programId}.analysis.json`);
    if (fs.existsSync(analysisFile)) {
        ctx.analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
    }
    // Load DB metadata for tables used by this program
    if (config.dbMetadataFile && fs.existsSync(config.dbMetadataFile)) {
        ctx.dbMetadata = loadDbMetadata(config.dbMetadataFile, ctx.contract);
    }
    return ctx;
};
// ─── Load reference patterns ────────────────────────────────────
export const loadPatternFile = (targetDir, relativePath) => {
    const fullPath = path.join(targetDir, relativePath);
    if (!fs.existsSync(fullPath))
        return null;
    return fs.readFileSync(fullPath, 'utf8');
};
export const loadReferencePatterns = (targetDir) => {
    const patterns = {};
    const patternPaths = {
        store: 'src/stores/extraitStore.ts',
        page: 'src/pages/ExtraitPage.tsx',
        api: 'src/services/api/endpoints-lot3.ts',
        types: 'src/types/change.ts',
        testStore: 'src/stores/__tests__/transactionStore.test.ts',
    };
    for (const [key, relPath] of Object.entries(patternPaths)) {
        const content = loadPatternFile(targetDir, relPath);
        if (content)
            patterns[key] = content;
    }
    return patterns;
};
// ─── Extract spec sections ──────────────────────────────────────
export const extractSpecSection = (spec, sectionName) => {
    const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^##\\s+.*${escaped}.*$`, 'mi');
    const match = spec.match(regex);
    if (!match)
        return null;
    const startIdx = match.index;
    // Find next ## heading or end of string
    const nextHeading = spec.indexOf('\n## ', startIdx + match[0].length);
    const endIdx = nextHeading >= 0 ? nextHeading : spec.length;
    return spec.slice(startIdx, endIdx).trim();
};
export const extractSpecForPhase = (spec, phase) => {
    const sections = [];
    if (phase === 'analyze' || phase === 'review') {
        return spec; // Full spec for analysis and review
    }
    // Always include header (first ~30 lines)
    const lines = spec.split('\n');
    sections.push(lines.slice(0, 30).join('\n'));
    // Phase-specific sections
    const sectionNames = {
        store: ['Regles', 'Expressions', 'Variables', 'Tables'],
        page: ['Ecran', 'Form', 'Layout', 'Controls'],
        components: ['Ecran', 'Form', 'Controls', 'Boutons'],
    };
    const names = sectionNames[phase] ?? [];
    for (const name of names) {
        const section = extractSpecSection(spec, name);
        if (section)
            sections.push(section);
    }
    return sections.join('\n\n---\n\n');
};
const loadDbMetadata = (metadataFile, contract) => {
    if (!contract)
        return {};
    const tableNames = contract.tables.map(t => String(t.name).toLowerCase());
    if (tableNames.length === 0)
        return {};
    try {
        const raw = fs.readFileSync(metadataFile, 'utf8');
        const allTables = JSON.parse(raw);
        const result = {};
        for (const table of allTables) {
            const normalizedName = table.tableName.toLowerCase();
            if (tableNames.some(tn => normalizedName.includes(tn) || tn.includes(normalizedName))) {
                result[table.tableName] = formatTableMetadata(table);
            }
        }
        return result;
    }
    catch {
        return {};
    }
};
const formatTableMetadata = (table) => {
    const lines = [`## Table: ${table.tableName}`, ''];
    lines.push('| Column | Type | Nullable | Samples |');
    lines.push('|--------|------|----------|---------|');
    for (const col of table.columns) {
        const type = col.maxLength ? `${col.type}(${col.maxLength})` : col.type;
        const samples = col.sampleValues?.slice(0, 3).join(', ') ?? '';
        lines.push(`| ${col.name} | ${type} | ${col.nullable ? 'YES' : 'NO'} | ${samples} |`);
    }
    return lines.join('\n');
};
// ─── Name utilities (reexport from codegen-model) ───────────────
export const sanitizeDomain = (name) => name
    .replace(/^(ADH|PBP|PVE|PBG|REF|VIL)[-_\s]+/i, '')
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[-_\s]+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
export const toCamelCase = (name) => {
    const sanitized = sanitizeDomain(name);
    if (sanitized.length === 0)
        return 'unknown';
    return sanitized[0].toLowerCase() + sanitized.slice(1);
};
export const toPascalCase = (name) => {
    const sanitized = sanitizeDomain(name);
    if (sanitized.length === 0)
        return 'Unknown';
    return sanitized[0].toUpperCase() + sanitized.slice(1);
};
//# sourceMappingURL=migrate-context.js.map