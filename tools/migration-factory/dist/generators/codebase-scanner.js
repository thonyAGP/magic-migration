/**
 * Codebase Scanner: scan web codebase to find existing implementations.
 * Matches spec items (rules, tables, callees) to source files.
 */
import fs from 'node:fs';
import path from 'node:path';
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// ─── Known N/A patterns (learned from B1) ─────────────────────────
const NA_CALLEE_PATTERNS = [
    /raz\s*current\s*printer/i,
    /set\s*listing\s*number/i,
    /get\s*printer/i,
    /printer\s*choice/i,
    /print\s*ticket/i,
    /caracteres?\s*interdit/i,
];
const NA_TABLE_PATTERNS = [
    /tempo_ecran/i,
    /Table_\d+$/, // Memory tables
];
const isNaCallee = (name) => NA_CALLEE_PATTERNS.some(p => p.test(name));
const isNaTable = (name, mode) => (mode === 'R' && false) || // Read-only not auto-NA
    NA_TABLE_PATTERNS.some(p => p.test(name));
const buildFileIndex = (codebaseDir) => {
    const files = [];
    const contentCache = new Map();
    if (!fs.existsSync(codebaseDir))
        return { files, contentCache };
    const walk = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist')
                    continue;
                walk(fullPath);
            }
            else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
                files.push(fullPath);
            }
        }
    };
    walk(codebaseDir);
    return { files, contentCache };
};
const readCached = (filePath, index) => {
    let content = index.contentCache.get(filePath);
    if (content === undefined) {
        content = fs.readFileSync(filePath, 'utf8');
        index.contentCache.set(filePath, content);
    }
    return content;
};
const findFileContaining = (pattern, index) => {
    for (const file of index.files) {
        const content = readCached(file, index);
        if (pattern.test(content))
            return file;
    }
    return undefined;
};
export const scanCodebase = (rules, tables, callees, variables, options) => {
    const index = buildFileIndex(options.codebaseDir);
    const relBase = options.projectDir ?? options.codebaseDir;
    const relPath = (absPath) => {
        const rel = path.relative(relBase, absPath);
        return rel.replace(/\\/g, '/');
    };
    // Scan rules: search for RM-XXX id references
    const scannedRules = rules.map(rule => {
        const pattern = new RegExp(rule.id.replace('-', '[-_]?'), 'i');
        const file = findFileContaining(pattern, index);
        if (file) {
            return { ...rule, status: 'IMPL', targetFile: relPath(file) };
        }
        return { ...rule };
    });
    // Scan tables: search for table name references
    const scannedTables = tables.map(table => {
        if (isNaTable(table.name, table.mode)) {
            return { ...table, status: 'N/A', gapNotes: 'Legacy-only (memory/temp table)' };
        }
        // Search for table name (without suffix like ___rec)
        const cleanName = table.name.replace(/_+\w{3}$/, '');
        const pattern = new RegExp(escapeRegex(cleanName).replace(/[_-]+/g, '[_\\-\\s]*'), 'i');
        const file = findFileContaining(pattern, index);
        if (file) {
            return { ...table, status: 'IMPL', targetFile: relPath(file) };
        }
        return { ...table };
    });
    // Scan callees: search for program references
    const scannedCallees = callees.map(callee => {
        if (isNaCallee(callee.name)) {
            return { ...callee, status: 'N/A', gapNotes: 'Legacy print/utility (N/A for web)' };
        }
        // Search for callee name or IDE reference
        const namePattern = new RegExp(escapeRegex(callee.name).replace(/[^a-zA-Z0-9\\]/g, '\\s*').substring(0, 30), 'i');
        const idePattern = new RegExp(`IDE[_\\s-]*${callee.id}`, 'i');
        const file = findFileContaining(namePattern, index) ?? findFileContaining(idePattern, index);
        if (file) {
            return { ...callee, status: 'IMPL', target: relPath(file) };
        }
        return { ...callee };
    });
    // Scan variables: search for variable names
    const scannedVariables = variables.map(v => {
        const pattern = new RegExp(escapeRegex(v.name).replace(/[^a-zA-Z0-9\\]/g, '\\s*').substring(0, 25), 'i');
        const file = findFileContaining(pattern, index);
        if (file) {
            return { ...v, status: 'IMPL', targetFile: relPath(file) };
        }
        return { ...v };
    });
    return {
        rules: scannedRules,
        tables: scannedTables,
        callees: scannedCallees,
        variables: scannedVariables,
    };
};
//# sourceMappingURL=codebase-scanner.js.map