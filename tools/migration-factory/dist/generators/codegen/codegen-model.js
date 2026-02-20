/**
 * Codegen intermediate model: decouples contract shape from code generation.
 * Contract YAML → parseContract() → MigrationContract → buildCodegenModel() → CodegenModel → generators
 */
// ─── Name utilities ─────────────────────────────────────────────
const sanitizeName = (name) => name
    .replace(/^(ADH|PBP|PVE|PBG|REF|VIL)[-_\s]+/i, '')
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/[-_\s]+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
const toCamelCase = (name) => {
    const sanitized = sanitizeName(name);
    if (sanitized.length === 0)
        return 'unknown';
    return sanitized[0].toLowerCase() + sanitized.slice(1);
};
const toPascalCase = (name) => {
    const sanitized = sanitizeName(name);
    if (sanitized.length === 0)
        return 'Unknown';
    return sanitized[0].toUpperCase() + sanitized.slice(1);
};
const toInterfaceName = (tableName) => {
    const clean = tableName
        .replace(/[_-]+(.)/g, (_, c) => c.toUpperCase())
        .replace(/[^a-zA-Z0-9]/g, '');
    if (clean.length === 0)
        return 'UnknownEntity';
    return clean[0].toUpperCase() + clean.slice(1);
};
const ruleToHandlerName = (description) => {
    const words = description
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .split(/\s+/)
        .slice(0, 4)
        .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase());
    return words.join('') || 'handleAction';
};
const calleeToEndpointName = (name) => {
    // Convert UPPER_CASE or mixed_case to PascalCase
    const parts = name.split(/[_\-\s]+/).filter(Boolean);
    const pascal = parts
        .map(p => p[0].toUpperCase() + p.slice(1).toLowerCase())
        .join('');
    if (pascal.length === 0)
        return 'callUnknown';
    return 'call' + pascal;
};
const toPropertyName = (name) => {
    const clean = name.replace(/[?!]/g, '').trim();
    // Already a valid camelCase identifier → return as-is
    if (/^[a-z][a-zA-Z0-9]*$/.test(clean))
        return clean;
    // Has word boundaries → split, camelCase, sanitize
    const parts = clean.split(/[\s._/]+/).filter(Boolean);
    if (parts.length === 0)
        return 'unknown';
    const camel = parts
        .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join('')
        .replace(/[^a-zA-Z0-9]/g, '');
    if (camel.length === 0)
        return 'unknown';
    return /^\d/.test(camel) ? '_' + camel : camel;
};
const calleeToPath = (name, domain) => {
    const slug = name
        .toLowerCase()
        .replace(/[_\s]+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    return `/api/${domain}/${slug}`;
};
// ─── Build Codegen Model ────────────────────────────────────────
export const buildCodegenModel = (contract) => {
    const domain = toCamelCase(contract.program.name);
    const domainPascal = toPascalCase(contract.program.name);
    const entities = contract.tables.map(t => ({
        name: toPropertyName(t.name),
        interfaceName: toInterfaceName(t.name),
        fields: [],
        mode: t.mode,
    }));
    const actions = contract.rules.map(r => ({
        id: r.id,
        handlerName: ruleToHandlerName(r.description),
        description: r.description,
        condition: r.condition,
        variables: r.variables,
    }));
    const apiCalls = contract.callees.map(c => ({
        name: calleeToEndpointName(c.name),
        method: guessHttpMethod(c.context),
        path: calleeToPath(c.name, domain),
        calleeId: c.id,
        calleeName: c.name,
    }));
    const stateFields = contract.variables.map(v => ({
        name: toPropertyName(v.name || v.localId),
        type: 'unknown',
        source: variableTypeToSource(v.type),
        description: v.gapNotes || v.name,
        localId: v.localId,
    }));
    return {
        programId: contract.program.id,
        programName: contract.program.name,
        domain,
        domainPascal,
        entities,
        actions,
        apiCalls,
        stateFields,
    };
};
// ─── Helpers ────────────────────────────────────────────────────
const variableTypeToSource = (type) => {
    switch (type) {
        case 'Parameter': return 'prop';
        case 'Virtual': return 'state';
        case 'Real': return 'computed';
    }
};
const guessHttpMethod = (context) => {
    const lower = context.toLowerCase();
    if (lower.includes('write') || lower.includes('create') || lower.includes('insert'))
        return 'POST';
    if (lower.includes('update') || lower.includes('modify'))
        return 'PUT';
    if (lower.includes('delete') || lower.includes('remove'))
        return 'DELETE';
    return 'GET';
};
//# sourceMappingURL=codegen-model.js.map