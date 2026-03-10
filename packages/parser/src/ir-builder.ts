/**
 * IR Builder - Construct ProgramIR from parsed XML
 * Assembles tasks tree, resolves variables, builds call-graph
 */

import type {
  ProgramIR,
  TaskNode,
  Handler,
  LogicLine,
  LocalVariable,
  DataView,
  CallGraph,
  Complexity,
  ParseResult
} from './ir-types.js';
import type { ParsedProgram, TaskXML, EventHandlerXML, LogicLineXML, DataViewXML } from './xml-parser.js';
import { parseProgramXML, toArray, isDisabled } from './xml-parser.js';
import { fieldToLetter } from './variable-resolver.js';

/**
 * Build complete ProgramIR from XML file
 */
export const buildProgramIR = (
  programId: number,
  xmlPath: string,
  publicName?: string
): ParseResult => {
  const start = Date.now();
  const errors: ParseResult['errors'] = [];
  const warnings: ParseResult['warnings'] = [];

  try {
    const parsed = parseProgramXML(xmlPath);

    const tasks = buildTasksTree(parsed);
    const variables = extractVariables(parsed);
    const dataViews = extractDataViews(parsed);
    const callGraph = buildCallGraph(tasks);
    const complexity = computeComplexity(tasks, dataViews);

    const ir: ProgramIR = {
      id: programId,
      name: parsed.Program?.['@_Name'] || `Program_${programId}`,
      publicName,
      tasks,
      variables: {
        local: variables,
        global: [],
      },
      dataViews,
      expressions: [],
      callGraph,
      metadata: {
        complexity,
        orphan: !publicName && callGraph.callers.length === 0,
        estimatedLOC: tasks.reduce((sum, t) => sum + t.metadata.lineCount, 0),
        taskCount: tasks.length,
        variableCount: variables.length,
      },
    };

    return {
      ir,
      duration: Date.now() - start,
      errors,
      warnings,
    };
  } catch (err) {
    errors.push({
      type: 'XML_PARSE',
      message: err instanceof Error ? err.message : String(err),
    });

    throw err;
  }
};

// ─── Tasks ───────────────────────────────────────────────────────────────────

const buildTasksTree = (parsed: ParsedProgram): TaskNode[] => {
  const tasksXML = toArray(parsed.Program?.TasksTree?.Task);
  return tasksXML.map(t => buildTaskNode(t));
};

const buildTaskNode = (taskXML: TaskXML, level = 0): TaskNode => {
  const children = toArray(taskXML.Task).map(child => buildTaskNode(child, level + 1));
  const handlers = buildHandlers(taskXML);
  const totalLines = handlers.reduce((s, h) => s + h.lines.length, 0);

  return {
    id: parseInt(String(taskXML['@_ISN']), 10) || 0,
    taskId: String(taskXML['@_TaskID'] || ''),
    level,
    children,
    handlers,
    logic: [],
    disabled: isDisabled(taskXML),
    metadata: {
      lineCount: totalLines,
      complexity: 'LOW',
    },
  };
};

// ─── Handlers ────────────────────────────────────────────────────────────────

const buildHandlers = (taskXML: TaskXML): Handler[] => {
  const handlersXML = toArray(taskXML.EventHandlers?.EventHandler);
  return handlersXML
    .filter(h => !isDisabled(h))
    .map((h, i) => ({
      id: i + 1,
      event: String(h['@_Event'] || ''),
      lines: buildLogicLines(toArray(h.LogicLines?.LogicLine)),
      disabled: isDisabled(h),
    }));
};

const buildLogicLines = (linesXML: LogicLineXML[]): LogicLine[] => {
  return linesXML
    .filter(l => !isDisabled(l))
    .map((l, i) => {
      const idStr = String(l['@_ID'] || i + 1);
      const id = parseInt(idStr, 10) || i + 1;
      const callTargetStr = l['@_CallTask'];
      const callTarget = callTargetStr !== undefined
        ? parseInt(String(callTargetStr), 10)
        : undefined;
      const expression = l['@_Expression'];

      let type: LogicLine['type'] = 'OTHER';
      if (callTarget !== undefined && !isNaN(callTarget)) {
        type = 'CALL';
      } else if (expression?.startsWith('Update:')) {
        type = 'ASSIGNMENT';
      } else if (expression?.startsWith('Select:')) {
        type = 'SELECT';
      } else if (expression?.startsWith('DataViewSrc:')) {
        type = 'UPDATE';
      } else if (expression) {
        type = 'ASSIGNMENT';
      }

      return {
        id,
        lineNumber: i + 1,
        type,
        expression,
        callTarget: type === 'CALL' ? callTarget : undefined,
        disabled: isDisabled(l),
        rawXml: '',
      };
    });
};

// ─── Variables ───────────────────────────────────────────────────────────────

const extractVariables = (parsed: ParsedProgram): LocalVariable[] => {
  const varsXML = toArray(parsed.Program?.Variables?.Variable);

  return varsXML.map(v => {
    const fieldId = parseInt(String(v['@_ID']), 10) || 0;
    return {
      fieldId,
      letter: fieldId > 0 ? fieldToLetter(fieldId) : '?',
      name: v['@_Name'],
      type: v['@_Type'] as LocalVariable['type'],
      scope: (v['@_Scope'] as LocalVariable['scope']) || 'TASK',
    };
  });
};

// ─── DataViews ───────────────────────────────────────────────────────────────

const extractDataViews = (parsed: ParsedProgram): DataView[] => {
  const viewsXML = toArray(parsed.Program?.DataView);

  return viewsXML.map(v => ({
    id: parseInt(String(v['@_ISN']), 10) || 0,
    tableId: parseInt(String(v['@_TableISN']), 10) || 0,
    tableName: `Table_${v['@_TableISN']}`,
    columns: [],
  }));
};

// ─── Call Graph ───────────────────────────────────────────────────────────────

const buildCallGraph = (tasks: TaskNode[]): CallGraph => {
  const callees = new Set<number>();

  const walkTasks = (nodes: TaskNode[]) => {
    for (const task of nodes) {
      for (const handler of task.handlers) {
        for (const line of handler.lines) {
          if (line.type === 'CALL' && line.callTarget !== undefined) {
            callees.add(line.callTarget);
          }
        }
      }
      walkTasks(task.children);
    }
  };

  walkTasks(tasks);

  return {
    callers: [],
    callees: Array.from(callees),
    depth: 0,
  };
};

// ─── Complexity ───────────────────────────────────────────────────────────────

const computeComplexity = (tasks: TaskNode[], dataViews: DataView[]): Complexity => {
  if (tasks.length > 50 || dataViews.length > 20) return 'HIGH';
  if (tasks.length > 20 || dataViews.length > 10) return 'MEDIUM';
  return 'LOW';
};
