/**
 * Intermediate Representation (IR) Types
 * Magic Unipaas Program → Structured IR (100% deterministic)
 */

export interface ProgramIR {
  id: number;
  name: string;
  publicName?: string;
  description?: string;
  tasks: TaskNode[];
  variables: {
    local: LocalVariable[];
    global: GlobalVariable[];
  };
  dataViews: DataView[];
  expressions: Expression[];
  callGraph: CallGraph;
  metadata: ProgramMetadata;
}

export interface TaskNode {
  id: number;
  taskId: string;
  name?: string;
  level: number;
  parentId?: number;
  children: TaskNode[];
  handlers: Handler[];
  logic: LogicLine[];
  disabled: boolean;
  metadata: {
    lineCount: number;
    complexity: Complexity;
  };
}

export interface Handler {
  id: number;
  event: string;
  lines: LogicLine[];
  disabled: boolean;
}

export interface LogicLine {
  id: number;
  lineNumber: number;
  type: 'ASSIGNMENT' | 'CONDITION' | 'CALL' | 'UPDATE' | 'SELECT' | 'OTHER';
  expression?: string;
  callTarget?: number;
  disabled: boolean;
  rawXml: string;
}

export interface LocalVariable {
  fieldId: number;
  letter: string;
  name?: string;
  type: MagicType;
  scope: 'TASK' | 'PROGRAM';
}

export interface GlobalVariable {
  vgId: number;
  name: string;
  type: MagicType;
  shared: boolean;
}

export interface DataView {
  id: number;
  tableId: number;
  tableName: string;
  link?: {
    type: 'INNER' | 'OUTER' | 'QUERY';
    parentView?: number;
    condition?: string;
  };
  columns: DataViewColumn[];
}

export interface DataViewColumn {
  id: number;
  columnId: number;
  columnName: string;
  direction: 'INPUT' | 'OUTPUT' | 'BOTH';
}

export interface Expression {
  id: number;
  raw: string;
  resolved?: string;
  variables: number[];
  complexity: Complexity;
}

export interface CallGraph {
  callers: number[];
  callees: number[];
  depth: number;
  mainChain?: number[];
}

export interface ProgramMetadata {
  complexity: Complexity;
  orphan: boolean;
  ecfComponent?: 'REF' | 'ADH' | 'UTILS';
  estimatedLOC: number;
  taskCount: number;
  variableCount: number;
}

export type Complexity = 'LOW' | 'MEDIUM' | 'HIGH';
export type MagicType = 
  | 'ALPHA' 
  | 'NUMERIC' 
  | 'DATE' 
  | 'TIME' 
  | 'LOGICAL' 
  | 'BLOB' 
  | 'MEMO';

/**
 * Parser result with metadata
 */
export interface ParseResult {
  ir: ProgramIR;
  duration: number;
  errors: ParseError[];
  warnings: ParseWarning[];
}

export interface ParseError {
  type: 'XML_PARSE' | 'SCHEMA_VALIDATION' | 'MISSING_DATA';
  message: string;
  location?: string;
}

export interface ParseWarning {
  type: 'UNRESOLVED_VARIABLE' | 'DEAD_CODE' | 'COMPLEX_EXPRESSION';
  message: string;
  location?: string;
}
