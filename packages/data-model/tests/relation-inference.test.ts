import { describe, it, expect } from 'vitest';
import { inferRelations } from '../src/relation-inference.js';
import type { Table } from '../src/types.js';

describe('Relation Inference - Passe 2', () => {
  const mockTables: Table[] = [
    {
      id: 40,
      name: 'operations',
      columns: [
        { id: 1, name: 'NO_OPERATION', type: 'NUMERIC', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { id: 2, name: 'COMPTE_ID', type: 'NUMERIC', nullable: false, isPrimaryKey: false, isForeignKey: true },
      ],
      confidence: 0.95,
    },
    {
      id: 50,
      name: 'comptes',
      columns: [
        { id: 1, name: 'NO_COMPTE', type: 'NUMERIC', nullable: false, isPrimaryKey: true, isForeignKey: false },
      ],
      confidence: 0.95,
    },
  ];

  it('should detect FK from _ID suffix', () => {
    const relations = inferRelations(mockTables);
    
    expect(relations.length).toBeGreaterThan(0);
    const rel = relations.find(r => r.fromColumn === 2);
    expect(rel).toBeDefined();
    expect(rel?.fromTable).toBe(40);
    expect(rel?.toTable).toBe(50);
    expect(rel?.type).toBe('MANY_TO_ONE');
    expect(rel?.confidence).toBe(0.8);
  });

  it('should set correct source FK_PATTERN', () => {
    const relations = inferRelations(mockTables);
    expect(relations[0]?.source).toBe('FK_PATTERN');
  });
});
