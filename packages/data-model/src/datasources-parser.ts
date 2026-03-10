/**
 * DataSources Parser - Parse Magic DataSources.xml → tables.json
 * Extracts 957 tables with full schema (columns, types, nullability)
 */

import fs from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

export interface ColumnSchema {
  isn: number;
  name: string;
  dbColumnName: string;
  type: 'ALPHA' | 'NUMERIC' | 'DATE' | 'TIME' | 'LOGICAL' | 'UNICODE' | 'BLOB' | 'MEMO';
  length: number;
  decimals: number;
  nullable: boolean;
}

export interface TableSchema {
  isn: number;
  name: string;
  physicalName: string;
  type: 'FILE' | 'VIEW' | 'MEMORY';
  columns: ColumnSchema[];
}

export interface DataSourceRegistry {
  generated: string;
  source: string;
  totalTables: number;
  tables: TableSchema[];
}

export const parseDataSources = (xmlPath: string): DataSourceRegistry => {
  const xml = fs.readFileSync(xmlPath, 'utf-8');
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml) as any;

  // Structure: Application > DataSourceRepository > DataObjects > DataObject
  const dataObjects = Array.isArray(parsed.Application.DataSourceRepository.DataObjects.DataObject)
    ? parsed.Application.DataSourceRepository.DataObjects.DataObject
    : [parsed.Application.DataSourceRepository.DataObjects.DataObject];

  const tables: TableSchema[] = dataObjects.map((obj: any) => {
    const columns = obj.Columns?.Column ?? [];
    const columnArray = Array.isArray(columns) ? columns : [columns];

    const tableId = parseInt(obj['@_id'], 10);
    const tableName = obj['@_name'] ?? `Table_${tableId}`;

    return {
      isn: tableId,
      name: tableName,
      physicalName: obj['@_PhysicalName'] ?? '',
      type: classifyTableType(tableName, obj['@_PhysicalName']),
      columns: columnArray
        .filter(col => col && col['@_id']) // Filter out undefined/null columns
        .map(col => {
          const props = col.PropertyList;
          const modelAttr = props?.Model?.['@_attr_obj'] ?? '';
          const fieldPhysical = props?._FieldPhysical ?? {};

          return {
            isn: parseInt(col['@_id'], 10),
            name: col['@_name'] ?? `Col_${col['@_id']}`,
            dbColumnName: props?.DbColumnName?.['@_val'] ?? col['@_name'] ?? '',
            type: parseModelAttrToType(modelAttr),
            length: parseInt(props?.Size?.['@_val'] ?? '0', 10),
            decimals: parseInt(props?._Dec?.['@_val'] ?? '0', 10),
            nullable: fieldPhysical['@_allowed_null'] !== 'N',
          };
        }),
    };
  });

  return {
    generated: new Date().toISOString(),
    source: xmlPath,
    totalTables: tables.length,
    tables,
  };
};

const classifyTableType = (name: string, physicalName: string): 'FILE' | 'VIEW' | 'MEMORY' => {
  if (physicalName.startsWith('tmp_') || name.includes('tempo')) return 'MEMORY';
  if (name.startsWith('Table_')) return 'MEMORY';
  return 'FILE';
};

const parseColumnType = (attr: string): ColumnSchema['type'] => {
  const typeMap: Record<string, ColumnSchema['type']> = {
    'A': 'ALPHA',
    'N': 'NUMERIC',
    'D': 'DATE',
    'T': 'TIME',
    'L': 'LOGICAL',
    'U': 'UNICODE',
    'B': 'BLOB',
    'M': 'MEMO',
  };
  return typeMap[attr] ?? 'ALPHA';
};

const parseModelAttrToType = (modelAttr: string): ColumnSchema['type'] => {
  if (modelAttr.includes('UNICODE')) return 'UNICODE';
  if (modelAttr.includes('NUMERIC')) return 'NUMERIC';
  if (modelAttr.includes('DATE')) return 'DATE';
  if (modelAttr.includes('TIME')) return 'TIME';
  if (modelAttr.includes('LOGICAL')) return 'LOGICAL';
  if (modelAttr.includes('BLOB')) return 'BLOB';
  if (modelAttr.includes('MEMO')) return 'MEMO';
  if (modelAttr.includes('ALPHA')) return 'ALPHA';
  return 'ALPHA'; // Default
};
