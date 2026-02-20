/**
 * Tier 2: Claude API enrichment for generated code.
 * One API call per program: sends contract + heuristic base → refined enrichment.
 */
import { emptyEnrichment } from './enrich-model.js';
import { createClaudeClient } from '../../pipeline/claude-client.js';
export const buildCodegenSystemPrompt = () => `You are a code generation assistant for migrating Magic Unipaas programs to React/TypeScript.
Given a migration contract and pre-inferred types, return refined enrichment data as JSON.

Rules:
- Override heuristic types only when clearly wrong
- Entity fields should match the table schema (common fields: id, code, nom, libelle, montant, date*, statut)
- Action bodies should use Zustand set() pattern
- Test assertions should use expect().toBe() or expect().toEqual()
- Keep all values as valid TypeScript literals

Return ONLY a JSON object with this structure:
{
  "stateFieldTypes": { "fieldName": "tsType" },
  "stateFieldDefaults": { "fieldName": "defaultLiteral" },
  "entityFields": { "InterfaceName": [{ "name": "fieldName", "type": "tsType" }] },
  "actionBodies": { "RM-001": "set({ field: value });" },
  "testAssertions": { "fieldName": "expect(state.fieldName).toBe(default);" }
}`;
export const buildCodegenUserPrompt = (model) => {
    const data = {
        program: { id: model.programId, name: model.programName, domain: model.domain },
        stateFields: model.stateFields.map(f => ({
            name: f.name, source: f.source, description: f.description,
            heuristicType: model.enrichments?.stateFieldTypes[f.name] ?? 'unknown',
        })),
        entities: model.entities.map(e => ({
            interfaceName: e.interfaceName, tableName: e.name, mode: e.mode,
        })),
        actions: model.actions.map(a => ({
            id: a.id, handler: a.handlerName, description: a.description,
            condition: a.condition, variables: a.variables,
        })),
    };
    return JSON.stringify(data, null, 2);
};
export const parseClaudeEnrichmentResponse = (raw) => {
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch?.[1]?.trim() ?? raw.trim();
    const parsed = JSON.parse(jsonStr);
    return {
        stateFieldTypes: parsed.stateFieldTypes ?? {},
        stateFieldDefaults: parsed.stateFieldDefaults ?? {},
        entityFields: parsed.entityFields ?? {},
        actionBodies: parsed.actionBodies ?? {},
        testAssertions: parsed.testAssertions ?? {},
    };
};
export const applyClaudeEnrichment = async (model, config) => {
    const client = createClaudeClient({
        apiKey: config.apiKey,
        model: config.model ?? 'claude-sonnet-4-5-20250929',
        maxTokens: 2048,
    });
    const systemPrompt = buildCodegenSystemPrompt();
    const userPrompt = buildCodegenUserPrompt(model);
    const response = await client.classify(systemPrompt, userPrompt);
    // Parse the enrichment from Claude's response
    const base = model.enrichments ?? emptyEnrichment();
    // Extract enrichment from Claude's structured response
    let claudeEnrichment;
    try {
        claudeEnrichment = parseClaudeEnrichmentResponse(response.reasoning || JSON.stringify({ items: response.items }));
    }
    catch {
        // Fallback: keep heuristic enrichments if Claude parse fails
        return model;
    }
    // Merge: Claude overrides heuristic
    const merged = {
        stateFieldTypes: { ...base.stateFieldTypes, ...claudeEnrichment.stateFieldTypes },
        stateFieldDefaults: { ...base.stateFieldDefaults, ...claudeEnrichment.stateFieldDefaults },
        entityFields: { ...base.entityFields, ...claudeEnrichment.entityFields },
        actionBodies: { ...base.actionBodies, ...claudeEnrichment.actionBodies },
        testAssertions: { ...base.testAssertions, ...claudeEnrichment.testAssertions },
    };
    return { ...model, enrichments: merged };
};
//# sourceMappingURL=enrich-prompt.js.map