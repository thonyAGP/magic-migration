import { describe, it, expect } from 'vitest';
import { generatePrismaSchema } from '../src/schema-generator.js';
import type { Table, Relation } from '../src/types.js';

describe('Schema Generator', () => {
  const mockTables: Table[] = [
    {
      id: 40,
      name: 'operation',
      columns: [
        { id: 1, name: 'id', type: 'NUMERIC', nullable: false, isPrimaryKey: true, isForeignKey: false },
        { id: 2, name: 'amount', type: 'NUMERIC', nullable: false, isPrimaryKey: false, isForeignKey: false },
      ],
      confidence: 0.95,
    },
  ];

  it('should generate valid Prisma schema', () => {
    const schema = generatePrismaSchema(mockTables, []);
    
    expect(schema).toContain('datasource db');
    expect(schema).toContain('generator client');
    expect(schema).toContain('model operation');
    expect(schema).toContain('id');
    expect(schema).toContain('@id');
  });

  it('should map Magic types to Prisma types', () => {
    const schema = generatePrismaSchema(mockTables, []);
    expect(schema).toContain('Int');
  });
});
