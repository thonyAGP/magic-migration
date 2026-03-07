/**
 * IR Builder - Construct ProgramIR from parsed XML
 * Assembles tasks tree, resolves variables, builds call-graph
 */

import type { 
  ProgramIR, 
  TaskNode, 
  LocalVariable, 
  DataView,
  CallGraph,
  Complexity,
  ParseResult
} from './ir-types.js';
import type { ParsedProgram, TaskXML, DataViewXML } from './xml-parser.js';
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
      name: parsed.Program['@_Name'] || `Program_${programId}`,
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

/**
 * Build tasks tree from parsed XML
 */
const buildTasksTree = (parsed: ParsedProgram): TaskNode[] => {
  const tasksXML = toArray(parsed.Program.TasksTree?.Task);
  return tasksXML.map(buildTaskNode);
};

/**
 * Build single task node recursively
 */
const buildTaskNode = (taskXML: TaskXML, level = 0): TaskNode => {
  const children = toArray(taskXML.Task).map(child => buildTaskNode(child, level + 1));
  
  return {
    id: parseInt(taskXML['@_ISN'], 10),
    taskId: taskXML['@_TaskID'],
    level,
    children,
    handlers: [],
    logic: [],
    disabled: isDisabled(taskXML),
    metadata: {
      lineCount: 0,
      complexity: 'LOW',
    },
  };
};

/**
 * Extract local variables and convert to letters
 */
const extractVariables = (parsed: ParsedProgram): LocalVariable[] => {
  const varsXML = toArray(parsed.Program.Variables?.Variable);
  
  return varsXML.map(v => {
    const fieldId = parseInt(v['@_ID'], 10);
    return {
      fieldId,
      letter: fieldToLetter(fieldId),
      name: v['@_Name'],
      type: v['@_Type'] as LocalVariable['type'],
      scope: (v['@_Scope'] as LocalVariable['scope']) || 'TASK',
    };
  });
};

/**
 * Extract data views (tables)
 */
const extractDataViews = (parsed: ParsedProgram): DataView[] => {
  const viewsXML = toArray(parsed.Program.DataView);
  
  return viewsXML.map(v => ({
    id: parseInt(v['@_ISN'], 10),
    tableId: parseInt(v['@_TableISN'], 10),
    tableName: `Table_${v['@_TableISN']}`,
    columns: [],
  }));
};

/**
 * Build call-graph (stub - to be enhanced)
 */
const buildCallGraph = (tasks: TaskNode[]): CallGraph => {
  return {
    callers: [],
    callees: [],
    depth: 0,
  };
};

/**
 * Compute program complexity
 */
const computeComplexity = (tasks: TaskNode[], dataViews: DataView[]): Complexity => {
  if (tasks.length > 50 || dataViews.length > 20) return 'HIGH';
  if (tasks.length > 20 || dataViews.length > 10) return 'MEDIUM';
  return 'LOW';
};
