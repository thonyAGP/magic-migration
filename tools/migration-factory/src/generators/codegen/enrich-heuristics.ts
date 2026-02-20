/**
 * Tier 1: Heuristic enrichment (free, deterministic).
 * Infers TS types + defaults from variable names and descriptions.
 */

import type { CodegenModel } from './codegen-model.js';
import { emptyEnrichment, type EnrichmentData } from './enrich-model.js';

const NUMBER_PATTERNS = [
  /^montant/i, /^solde/i, /^nbre/i, /^total/i, /^quantite/i, /^qte/i,
  /^prix/i, /^taux/i, /^nb/i, /^count/i, /^amount/i, /^sum/i,
  /^ecart/i, /^stock/i, /^index/i, /^rang/i, /^numero/i, /^num/i,
];

const BOOLEAN_PATTERNS = [
  /^est/i, /^is/i, /^has/i, /^existe/i, /^actif/i, /^active/i,
  /^valid/i, /^enabled/i, /^visible/i, /^checked/i, /^flag/i,
];

const DATE_PATTERNS = [
  /^date/i, /date$/i, /^dt/i, /comptable$/i, /^created/i, /^updated/i,
  /^debut/i, /^fin$/i, /^start/i, /^end$/i,
];

export const inferFieldType = (name: string, description?: string): string => {
  const combined = `${name} ${description ?? ''}`.toLowerCase();

  if (NUMBER_PATTERNS.some(p => p.test(name))) return 'number';
  if (BOOLEAN_PATTERNS.some(p => p.test(name))) return 'boolean';
  if (DATE_PATTERNS.some(p => p.test(name))) return 'string'; // ISO date string

  // Description-based fallback
  if (/montant|solde|quantit|nombre|total|prix|taux/i.test(combined)) return 'number';
  if (/oui.non|vrai.faux|true.false|flag|booleen/i.test(combined)) return 'boolean';

  return 'string';
};

export const inferDefaultValue = (type: string): string => {
  switch (type) {
    case 'number': return '0';
    case 'boolean': return 'false';
    case 'string': return "''";
    default: return 'null';
  }
};

export const applyHeuristicEnrichment = (model: CodegenModel): CodegenModel => {
  const enrichments: EnrichmentData = emptyEnrichment();

  // Infer state field types and defaults
  for (const field of model.stateFields) {
    if (field.source === 'prop') {
      enrichments.stateFieldTypes[field.name] = 'string';
      enrichments.stateFieldDefaults[field.name] = "''";
    } else {
      const type = inferFieldType(field.name, field.description);
      enrichments.stateFieldTypes[field.name] = type;
      enrichments.stateFieldDefaults[field.name] = inferDefaultValue(type);
    }
  }

  // Infer entity fields from entity name patterns
  for (const entity of model.entities) {
    enrichments.entityFields[entity.interfaceName] = [
      { name: 'id', type: 'number' },
    ];
  }

  // Simple action body: set({ isLoading: false }) pattern
  for (const action of model.actions) {
    const vars = action.variables
      .map(v => {
        const stateField = model.stateFields.find(f => f.localId === v || f.name === v);
        if (!stateField) return null;
        const def = enrichments.stateFieldDefaults[stateField.name] ?? 'null';
        return `${stateField.name}: ${def}`;
      })
      .filter(Boolean);

    if (vars.length > 0) {
      enrichments.actionBodies[action.id] = `set({ ${vars.join(', ')} });`;
    }
  }

  // Test assertions from defaults
  for (const field of model.stateFields) {
    const def = enrichments.stateFieldDefaults[field.name];
    if (def && def !== 'null') {
      enrichments.testAssertions[field.name] = `expect(state.${field.name}).toBe(${def});`;
    }
  }

  return { ...model, enrichments };
};
