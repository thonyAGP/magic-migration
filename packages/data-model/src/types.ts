/**
 * Data Model Types
 */

export interface Table {
  id: number;
  name: string;
  columns: Column[];
  primaryKey?: Column;
  confidence: number;
}

export interface Column {
  id: number;
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface Relation {
  id: string;
  fromTable: number;
  toTable: number;
  fromColumn: number;
  toColumn: number;
  type: 'ONE_TO_MANY' | 'MANY_TO_ONE' | 'ONE_TO_ONE';
  confidence: number;
  source: 'FK_PATTERN' | 'CALL_GRAPH' | 'INFERRED';
}

export interface DataModelResult {
  tables: Table[];
  relations: Relation[];
  globalVars: GlobalVarMapping[];
  schema: string;
  duration: number;
}

export interface GlobalVarMapping {
  vgId: number;
  name: string;
  type: string;
  description?: string;
  usedInPrograms: number[];
}

/**
 * VG Registry - Full scan of all VG variables across programs
 */
export interface VgRegistryEntry {
  vgId: number;
  name: string;
  type: string;
  category: 'SESSION' | 'RIGHTS' | 'CONFIG' | 'BUSINESS' | 'UNKNOWN';
  definedIn: number[];  // program IDs where VG is defined/written
  usedIn: number[];     // program IDs where VG is read/referenced
}

export interface VgRegistry {
  generated: string;
  totalVars: number;
  variables: VgRegistryEntry[];
}
