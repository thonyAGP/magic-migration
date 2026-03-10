/**
 * Passe 3: Semantic Enrichment (30% AI, 70% deterministic)
 * Enrich table/column names with semantic meaning
 */

import type { Table } from './types.js';

export const enrichTableNames = (tables: Table[]): Table[] => {
  return tables.map(table => ({
    ...table,
    name: enrichSingleTableName(table.name),
  }));
};

const enrichSingleTableName = (name: string): string => {
  let enriched = name;
  
  enriched = singularize(enriched);
  enriched = toCamelCase(enriched);
  enriched = classifyTier(enriched);
  
  return enriched;
};

const singularize = (name: string): string => {
  if (name.endsWith('s')) return name.slice(0, -1);
  return name;
};

const toCamelCase = (name: string): string => {
  return name
    .split('_')
    .map((word, i) => i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

const classifyTier = (name: string): string => {
  const tiers: Record<string, string> = {
    'account': 'Account',
    'customer': 'Customer',
    'transaction': 'Transaction',
    'operation': 'Operation',
  };
  
  return tiers[name.toLowerCase()] || name;
};
