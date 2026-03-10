/**
 * XML Parser - Low-level Magic Unipaas XML parsing
 * Uses fast-xml-parser to convert Magic XML to JavaScript objects
 *
 * Supports two XML formats:
 * 1. Simple format (tests): <Program ISN="X" Name="Y"><TasksTree><Task ...
 * 2. Real ADH format: <Application><ProgramsRepository><Programs><Task ...
 *    where tasks use LogicUnit/TaskLogic instead of EventHandlers/TasksTree
 */

import { XMLParser } from 'fast-xml-parser';
import * as fs from 'node:fs';

export interface ParsedProgram {
  Program: {
    '@_ISN'?: string;
    '@_Name'?: string;
    TasksTree?: {
      Task?: TaskXML | TaskXML[];
    };
    DataView?: DataViewXML | DataViewXML[];
    Variables?: {
      Variable?: VariableXML | VariableXML[];
    };
  };
}

export interface ParsedHeaders {
  MagicGeneral?: {
    Program?: {
      '@_ISN': string;
      '@_Name': string;
      '@_PublicName'?: string;
    }[];
  };
}

export interface TaskXML {
  '@_ISN': string;
  '@_TaskID': string;
  '@_Level': string;
  '@_Disabled'?: '0' | '1';
  Task?: TaskXML | TaskXML[];
  EventHandlers?: {
    EventHandler?: EventHandlerXML | EventHandlerXML[];
  };
  LogicLines?: {
    LogicLine?: LogicLineXML | LogicLineXML[];
  };
}

export interface EventHandlerXML {
  '@_Event': string;
  '@_Disabled'?: '0' | '1';
  LogicLines?: {
    LogicLine?: LogicLineXML | LogicLineXML[];
  };
}

export interface LogicLineXML {
  '@_ID': string;
  '@_Disabled'?: '0' | '1';
  '@_Expression'?: string;
  '@_CallTask'?: string;
  '@_CallSubForm'?: string;
}

export interface DataViewXML {
  '@_ISN': string;
  '@_TableISN': string;
  '@_Link'?: string;
  Columns?: {
    Column?: ColumnXML | ColumnXML[];
  };
}

export interface ColumnXML {
  '@_ISN': string;
  '@_FieldISN': string;
  '@_Direction'?: string;
}

export interface VariableXML {
  '@_ID': string;
  '@_Name'?: string;
  '@_Type': string;
  '@_Scope'?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const toArray = <T>(item: T | T[] | undefined): T[] => {
  if (item === undefined || item === null) return [];
  return Array.isArray(item) ? item : [item];
};

export const isDisabled = (element: { '@_Disabled'?: '0' | '1' }): boolean => {
  return element['@_Disabled'] === '1';
};

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v));

// ─── ADH Format Normalization ─────────────────────────────────────────────────

/**
 * Detect if the parsed XML is in real ADH format (Application root)
 * vs. simplified test format (Program root).
 */
const isADHFormat = (parsed: unknown): boolean => {
  return (
    typeof parsed === 'object' &&
    parsed !== null &&
    'Application' in (parsed as object) &&
    !('Program' in (parsed as object))
  );
};

/**
 * Derive a human-readable event name from LogicUnit metadata.
 * Level: R=Record, T=Task/Transaction, P=Program
 * Type:  M=Main, P=Prefix, S=Suffix
 */
const buildEventName = (level: string, type: string): string => {
  const L = (level || '').toUpperCase();
  const T = (type || '').toUpperCase();
  if (L === 'R' && T === 'P') return 'RECORD_PREFIX';
  if (L === 'R' && T === 'S') return 'RECORD_SUFFIX';
  if (L === 'R' && T === 'M') return 'RECORD_MAIN';
  if (L === 'T' && T === 'P') return 'TASK_PREFIX';
  if (L === 'T' && T === 'S') return 'TASK_SUFFIX';
  if (L === 'T' && T === 'M') return 'TASK_MAIN';
  if (L === 'P' && T === 'P') return 'PROG_START';
  if (L === 'P' && T === 'S') return 'PROG_END';
  return `EVENT_${L}_${T}`;
};

/**
 * Normalize a single ADH LogicLine child element → LogicLineXML.
 * Each LogicLine in ADH XML uses child elements (CallTask, Update, Select, etc.)
 * instead of attributes.
 * Returns null for non-executable lines (Remark, etc.).
 */
const normalizeADHLogicLine = (line: Record<string, unknown>): LogicLineXML | null => {
  const callTask = line.CallTask as Record<string, unknown> | undefined;
  const update = line.Update as Record<string, unknown> | undefined;
  const select = line.Select as Record<string, unknown> | undefined;
  const dvSrc = line.DATAVIEW_SRC as Record<string, unknown> | undefined;

  if (callTask) {
    const flowIsn = str(callTask['@_FlowIsn'] ?? callTask.FlowIsn ?? '0');
    const taskId = callTask.TaskID as Record<string, unknown> | undefined;
    const taskObj = str(taskId?.['@_obj'] ?? taskId?.obj ?? '0');
    return { '@_ID': flowIsn, '@_CallTask': taskObj };
  }

  if (update) {
    const flowIsn = str(update['@_FlowIsn'] ?? update.FlowIsn ?? '0');
    const withVal = (update.WithValue as Record<string, unknown> | undefined);
    const exprId = str(withVal?.['@_val'] ?? withVal?.val ?? '');
    return { '@_ID': flowIsn, '@_Expression': `Update:${exprId}` };
  }

  if (select) {
    const flowIsn = str(select['@_FlowIsn'] ?? select.FlowIsn ?? '0');
    const fieldId = str(select['@_FieldID'] ?? select.FieldID ?? '');
    return { '@_ID': flowIsn, '@_Expression': `Select:${fieldId}` };
  }

  if (dvSrc) {
    const flowIsn = str(dvSrc['@_FlowIsn'] ?? dvSrc.FlowIsn ?? '0');
    return { '@_ID': flowIsn, '@_Expression': `DataViewSrc:${flowIsn}` };
  }

  return null; // Remark, other non-executable lines
};

/**
 * Normalize a LogicUnit (ADH) → EventHandlerXML (simplified format).
 */
const normalizeADHLogicUnit = (lu: Record<string, unknown>, idx: number): EventHandlerXML => {
  const level = ((lu.Level as Record<string, unknown> | undefined)?.['@_val'] ?? (lu.Level as Record<string, unknown> | undefined)?.val ?? '') as string;
  const type = ((lu.Type as Record<string, unknown> | undefined)?.['@_val'] ?? (lu.Type as Record<string, unknown> | undefined)?.val ?? '') as string;
  const event = buildEventName(level, type);

  const llContainer = lu.LogicLines as Record<string, unknown> | undefined;
  const rawLines = toArray(llContainer?.LogicLine as unknown[]);

  const lines: LogicLineXML[] = rawLines
    .map(l => normalizeADHLogicLine(l as Record<string, unknown>))
    .filter((l): l is LogicLineXML => l !== null);

  return {
    '@_Event': event,
    '@_Disabled': '0',
    LogicLines: { LogicLine: lines },
  };
};

/**
 * Normalize a real ADH Task element → TaskXML (simplified format).
 * Handles both root task and sub-tasks recursively.
 */
const normalizeADHTask = (task: Record<string, unknown>, taskCounter: { n: number }): TaskXML => {
  const header = task.Header as Record<string, unknown> | undefined;
  const isn = str(header?.['@_ISN_2'] ?? header?.ISN_2 ?? header?.['@_id'] ?? header?.id ?? taskCounter.n++);
  const taskId = isn;

  // Sub-tasks are direct Task children
  const subTasks = toArray(task.Task as unknown[]).map(t =>
    normalizeADHTask(t as Record<string, unknown>, taskCounter)
  );

  // LogicUnits → EventHandlers
  const tl = task.TaskLogic as Record<string, unknown> | undefined;
  const logicUnits = toArray(tl?.LogicUnit as unknown[]);
  const handlers = logicUnits
    .filter(lu => {
      const disabled = (lu as Record<string, unknown>).Disabled;
      return !disabled;
    })
    .map((lu, i) => normalizeADHLogicUnit(lu as Record<string, unknown>, i));

  return {
    '@_ISN': isn,
    '@_TaskID': taskId,
    '@_Level': '0',
    '@_Disabled': '0',
    Task: subTasks.length > 0 ? subTasks : undefined,
    EventHandlers: handlers.length > 0 ? { EventHandler: handlers } : undefined,
  };
};

/**
 * Normalize a real ADH XML parsed object → ParsedProgram.
 */
const normalizeADHToParsedProgram = (parsed: Record<string, unknown>): ParsedProgram => {
  const app = parsed.Application as Record<string, unknown>;
  const repo = app.ProgramsRepository as Record<string, unknown>;
  const programs = repo?.Programs as Record<string, unknown>;
  const rootTask = programs?.Task as Record<string, unknown>;

  if (!rootTask) {
    // Fallback: empty program
    return { Program: { '@_ISN': '0', '@_Name': 'Unknown' } };
  }

  const header = rootTask.Header as Record<string, unknown> | undefined;
  const isn = str(header?.['@_id'] ?? header?.id ?? '0');
  const name = str(header?.['@_Description'] ?? header?.Description ?? `Program_${isn}`);

  const taskCounter = { n: 1 };
  const normalizedRoot = normalizeADHTask(rootTask, taskCounter);
  const subTasks = toArray(normalizedRoot.Task);

  return {
    Program: {
      '@_ISN': isn,
      '@_Name': name,
      TasksTree: subTasks.length > 0 ? { Task: subTasks } : undefined,
      // DataView and Variables are not available in ADH Prg files — extracted from DataSources.xml separately
    },
  };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse Magic program XML file.
 * Supports both simplified test format and real ADH program format.
 */
export const parseProgramXML = (xmlPath: string): ParsedProgram => {
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    trimValues: true,
  });

  const parsed = parser.parse(xmlContent) as Record<string, unknown>;

  // Detect real ADH format and normalize
  if (isADHFormat(parsed)) {
    return normalizeADHToParsedProgram(parsed);
  }

  // Simple test format — return as-is
  return parsed as unknown as ParsedProgram;
};

/**
 * Parse ProgramHeaders.xml file
 */
export const parseProgramHeaders = (xmlPath: string): ParsedHeaders => {
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
    isArray: (tagName) => tagName === 'Program',
  });

  const parsed = parser.parse(xmlContent);
  return parsed as ParsedHeaders;
};
