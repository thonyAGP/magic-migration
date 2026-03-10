import { describe, it, expect } from 'vitest';
import { extractSchema } from '../src/schema-extractor.js';
import type { ProgramIR } from '@magic-migration/parser';

describe('Schema Extractor - Passe 1', () => {
  it('should extract tables from IR data views', () => {
    const mockIR: ProgramIR = {
      id: 100,
      name: 'Test',
      tasks: [],
      variables: { local: [], global: [] },
      dataViews: [
        {
          id: 1,
          tableId: 40,
          tableName: 'operations',
          columns: [
            { id: 1, columnId: 1, columnName: 'NO_OPERATION', direction: 'OUTPUT' },
            { id: 2, columnId: 2, columnName: 'MONTANT', direction: 'OUTPUT' },
          ],
        },
      ],
      expressions: [],
      callGraph: { callers: [], callees: [], depth: 0 },
      metadata: {
        complexity: 'LOW',
        orphan: false,
        estimatedLOC: 10,
        taskCount: 1,
        variableCount: 0,
      },
    };

    const tables = extractSchema([mockIR]);

    expect(tables.length).toBe(1);
    expect(tables[0].id).toBe(40);
    expect(tables[0].name).toBe('operations');
    expect(tables[0].columns.length).toBe(2);
    expect(tables[0].confidence).toBe(0.95);
  });

  it('should detect primary key patterns', () => {
    const mockIR: ProgramIR = {
      id: 100,
      name: 'Test',
      tasks: [],
      variables: { local: [], global: [] },
      dataViews: [
        {
          id: 1,
          tableId: 50,
          tableName: 'accounts',
          columns: [
            { id: 1, columnId: 1, columnName: 'NO_COMPTE', direction: 'OUTPUT' },
          ],
        },
      ],
      expressions: [],
      callGraph: { callers: [], callees: [], depth: 0 },
      metadata: {
        complexity: 'LOW',
        orphan: false,
        estimatedLOC: 10,
        taskCount: 1,
        variableCount: 0,
      },
    };

    const tables = extractSchema([mockIR]);
    const pkColumn = tables[0].columns.find(c => c.name === 'NO_COMPTE');

    expect(pkColumn?.isPrimaryKey).toBe(true);
  });
});
