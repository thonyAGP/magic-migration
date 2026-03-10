/**
 * Passe 1: Schema Extraction (95% deterministic)
 * Extract tables and columns from IR data views
 */

import type { ProgramIR, DataView } from '@magic-migration/parser';
import type { Table, Column } from './types.js';

export const extractSchema = (programs: ProgramIR[]): Table[] => {
  const tablesMap = new Map<number, Table>();

  for (const program of programs) {
    for (const dataView of program.dataViews) {
      if (!tablesMap.has(dataView.tableId)) {
        tablesMap.set(dataView.tableId, {
          id: dataView.tableId,
          name: dataView.tableName,
          columns: [],
          confidence: 0.95,
        });
      }

      const table = tablesMap.get(dataView.tableId)!;
      
      for (const col of dataView.columns) {
        const existing = table.columns.find(c => c.id === col.columnId);
        if (!existing) {
          table.columns.push({
            id: col.columnId,
            name: col.columnName,
            type: 'unknown',
            nullable: true,
            isPrimaryKey: isPrimaryKeyPattern(col.columnName),
            isForeignKey: isForeignKeyPattern(col.columnName),
          });
        }
      }
    }
  }

  return Array.from(tablesMap.values());
};

const isPrimaryKeyPattern = (name: string): boolean => {
  return name.endsWith('_ID') || name === 'ID' || name.startsWith('NO_');
};

const isForeignKeyPattern = (name: string): boolean => {
  return name.endsWith('_REF') || name.endsWith('_ID') && !isPrimaryKeyPattern(name);
};
