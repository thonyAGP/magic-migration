/**
 * Business Rules Extractor - Pass 4 (XFIT-S)
 * Extracts business rules from ProgramIR deterministically.
 * Zero AI calls — 100% structural extraction from parsed Magic XML.
 *
 * Output: rules.json consumed by store/page/api/tests templates.
 */

import type { ProgramIR, TaskNode, Handler, LogicLine, DataView } from '@magic-migration/parser';

// ─── Output Types ────────────────────────────────────────────────────────────

export type RuleType = 'validation' | 'calculation' | 'navigation' | 'data-read' | 'data-write';

export interface BusinessRule {
  /** Auto-generated ID: RM-001, RM-002, ... */
  id: string;
  type: RuleType;
  /** Human-readable summary derived from IR structure */
  description: string;
  /** Source location: "Task 69.3 > Handler RECORD_PREFIX > line 5" */
  source: string;
  /** Magic expression as-is from IR (may be partially decoded) */
  expression?: string;
  /** Program called (for navigation rules) */
  callTarget?: number;
  /** Variable letters involved (A, B, C... AA...) */
  variables: string[];
  /** Table names involved */
  tables: string[];
  /** Magic handler event (RECORD_PREFIX, CLICK, etc.) */
  event?: string;
}

export interface BusinessRulesResult {
  programId: number;
  programName: string;
  generatedAt: string;
  /** Rules grouped by type for easy template consumption */
  rules: BusinessRule[];
  summary: {
    total: number;
    byType: Record<RuleType, number>;
    tablesRead: string[];
    tablesWritten: string[];
    calleesReferenced: number[];
  };
}

// ─── Main Extractor ──────────────────────────────────────────────────────────

export const extractBusinessRules = (ir: ProgramIR): BusinessRulesResult => {
  const rules: BusinessRule[] = [];
  let counter = 1;

  const nextId = () => `RM-${String(counter++).padStart(3, '0')}`;

  // Pass A: Data access rules from DataViews
  for (const dv of ir.dataViews) {
    const readCols = dv.columns.filter(c => c.direction === 'INPUT' || c.direction === 'BOTH');
    const writeCols = dv.columns.filter(c => c.direction === 'OUTPUT' || c.direction === 'BOTH');

    if (readCols.length > 0) {
      rules.push({
        id: nextId(),
        type: 'data-read',
        description: `Read ${dv.tableName} (${readCols.length} columns)`,
        source: `DataView ${dv.id}`,
        variables: [],
        tables: [dv.tableName],
      });
    }

    if (writeCols.length > 0) {
      rules.push({
        id: nextId(),
        type: 'data-write',
        description: `Write ${dv.tableName} (${writeCols.length} columns: ${writeCols.map(c => c.columnName).slice(0, 3).join(', ')}${writeCols.length > 3 ? '...' : ''})`,
        source: `DataView ${dv.id}`,
        variables: [],
        tables: [dv.tableName],
      });
    }
  }

  // Pass B: Logic rules from task handlers
  const walkTasks = (tasks: TaskNode[]) => {
    for (const task of tasks) {
      if (task.disabled) continue;

      for (const handler of task.handlers) {
        if (handler.disabled) continue;

        const taskLabel = `Task ${ir.id}.${task.taskId}`;
        const handlerLabel = `${taskLabel} > Handler ${handler.event}`;

        for (const line of handler.lines) {
          if (line.disabled) continue;

          const lineLabel = `${handlerLabel} > line ${line.lineNumber}`;
          const vars = extractVariablesFromExpression(line.expression ?? '');
          const tables = getTablesForLine(line, ir.dataViews);

          switch (line.type) {
            case 'CONDITION':
              if (line.expression) {
                rules.push({
                  id: nextId(),
                  type: 'validation',
                  description: buildConditionDescription(line.expression, handler.event),
                  source: lineLabel,
                  expression: line.expression,
                  variables: vars,
                  tables,
                  event: handler.event,
                });
              }
              break;

            case 'ASSIGNMENT':
              if (line.expression) {
                rules.push({
                  id: nextId(),
                  type: 'calculation',
                  description: buildAssignmentDescription(line.expression, handler.event),
                  source: lineLabel,
                  expression: line.expression,
                  variables: vars,
                  tables,
                  event: handler.event,
                });
              }
              break;

            case 'CALL':
              if (line.callTarget !== undefined) {
                rules.push({
                  id: nextId(),
                  type: 'navigation',
                  description: `Call program IDE ${line.callTarget} from ${handler.event}`,
                  source: lineLabel,
                  callTarget: line.callTarget,
                  variables: vars,
                  tables,
                  event: handler.event,
                });
              }
              break;

            case 'UPDATE':
              rules.push({
                id: nextId(),
                type: 'data-write',
                description: buildUpdateDescription(line.expression ?? '', tables),
                source: lineLabel,
                expression: line.expression,
                variables: vars,
                tables,
                event: handler.event,
              });
              break;

            default:
              break;
          }
        }
      }

      // Recurse into children
      walkTasks(task.children);
    }
  };

  walkTasks(ir.tasks);

  // Build summary
  const byType = rules.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {} as Record<RuleType, number>);

  const tablesRead = [...new Set(
    rules.filter(r => r.type === 'data-read').flatMap(r => r.tables)
  )];
  const tablesWritten = [...new Set(
    rules.filter(r => r.type === 'data-write').flatMap(r => r.tables)
  )];
  const calleesReferenced = [...new Set(
    rules.filter(r => r.callTarget !== undefined).map(r => r.callTarget!)
  )];

  return {
    programId: ir.id,
    programName: ir.name,
    generatedAt: new Date().toISOString(),
    rules,
    summary: {
      total: rules.length,
      byType: {
        validation: byType.validation ?? 0,
        calculation: byType.calculation ?? 0,
        navigation: byType.navigation ?? 0,
        'data-read': byType['data-read'] ?? 0,
        'data-write': byType['data-write'] ?? 0,
      },
      tablesRead,
      tablesWritten,
      calleesReferenced,
    },
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract variable letters from a Magic expression string.
 * Variables appear as single/double uppercase letters (A, B, AA, AB...).
 */
const extractVariablesFromExpression = (expr: string): string[] => {
  if (!expr) return [];
  // Match standalone uppercase variable letters (not inside words)
  const matches = expr.match(/\b([A-Z]{1,2})\b/g) ?? [];
  return [...new Set(matches)];
};

/**
 * Find table names referenced in a logic line (via DataView column patterns).
 */
const getTablesForLine = (line: LogicLine, dataViews: DataView[]): string[] => {
  if (!line.expression) return [];
  // Tables are referenced by their column names in expressions
  const tables = new Set<string>();
  for (const dv of dataViews) {
    for (const col of dv.columns) {
      if (line.expression.includes(col.columnName)) {
        tables.add(dv.tableName);
      }
    }
  }
  return [...tables];
};

const buildConditionDescription = (expr: string, event: string): string => {
  const shortened = expr.length > 60 ? expr.slice(0, 57) + '...' : expr;
  const ctx = event ? ` [${event}]` : '';
  return `Condition${ctx}: ${shortened}`;
};

const buildAssignmentDescription = (expr: string, event: string): string => {
  const shortened = expr.length > 60 ? expr.slice(0, 57) + '...' : expr;
  const ctx = event ? ` [${event}]` : '';
  return `Calculation${ctx}: ${shortened}`;
};

const buildUpdateDescription = (expr: string, tables: string[]): string => {
  if (tables.length > 0) {
    return `Update ${tables.join(', ')}${expr ? ': ' + expr.slice(0, 40) : ''}`;
  }
  return `Update${expr ? ': ' + expr.slice(0, 50) : ''}`;
};
