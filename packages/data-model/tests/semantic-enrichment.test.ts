import { describe, it, expect } from 'vitest';
import { enrichTableNames } from '../src/semantic-enrichment.js';
import type { Table } from '../src/types.js';

describe('Semantic Enrichment - Passe 3', () => {
  it('should singularize and classify table names', () => {
    const tables: Table[] = [
      { id: 1, name: 'operations', columns: [], confidence: 0.95 },
    ];

    const enriched = enrichTableNames(tables);
    expect(enriched[0].name).toBe('Operation');
  });

  it('should convert to camelCase', () => {
    const tables: Table[] = [
      { id: 1, name: 'user_accounts', columns: [], confidence: 0.95 },
    ];
    
    const enriched = enrichTableNames(tables);
    expect(enriched[0].name).toMatch(/[a-z][A-Z]/);
  });
});
