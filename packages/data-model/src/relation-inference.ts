/**
 * Passe 2: Relation Inference (80% deterministic)
 * Infer foreign key relationships between tables
 */

import type { Table, Relation } from './types.js';

export const inferRelations = (tables: Table[]): Relation[] => {
  const relations: Relation[] = [];
  let relationId = 1;

  for (const table of tables) {
    for (const column of table.columns) {
      if (column.isForeignKey) {
        const targetTable = findTargetTable(tables, column.name);
        
        if (targetTable) {
          relations.push({
            id: `R${relationId++}`,
            fromTable: table.id,
            toTable: targetTable.id,
            fromColumn: column.id,
            toColumn: targetTable.primaryKey?.id || 1,
            type: 'MANY_TO_ONE',
            confidence: 0.8,
            source: 'FK_PATTERN',
          });
        }
      }
    }
  }

  return relations;
};

const findTargetTable = (tables: Table[], columnName: string): Table | undefined => {
  const match = columnName.match(/^(.+?)_(ID|REF)$/);
  if (!match) return undefined;

  const tableName = match[1].toLowerCase();
  return tables.find(t => t.name.toLowerCase().includes(tableName));
};
