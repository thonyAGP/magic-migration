/**
 * Magic Unipaas Expression Parser - Python Code Generator
 *
 * Generates Python code from Magic expression AST.
 */

import {
  Expression,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  FieldReference,
  SpecialReference,
  BinaryExpression,
  UnaryExpression,
  FunctionCall,
  Identifier,
  BinaryOperator,
  UnaryOperator,
} from '../types/ast';
import { SpecialRefType } from '../types/tokens';
import { ASTVisitor, visit } from './visitor';

/**
 * Options for Python code generation
 */
export interface PythonGeneratorOptions {
  /** Prefix for field references (default: 'fields') */
  fieldPrefix?: string;
  /** Prefix for main program variables (default: 'main_program') */
  mainProgramPrefix?: string;
  /** Whether to use type hints (default: false) */
  includeTypeHints?: boolean;
  /** Use Decimal for numeric (default: true) */
  useDecimal?: boolean;
}

/**
 * Magic function to Python mapping
 */
const FUNCTION_MAPPINGS: Record<string, string | ((args: string[]) => string)> = {
  // String functions
  Trim: (args) => `${args[0]}.strip()`,
  LTrim: (args) => `${args[0]}.lstrip()`,
  RTrim: (args) => `${args[0]}.rstrip()`,
  Upper: (args) => `${args[0]}.upper()`,
  Lower: (args) => `${args[0]}.lower()`,
  Len: (args) => `len(${args[0]})`,
  Left: (args) => `${args[0]}[:${args[1]}]`,
  Right: (args) => `${args[0]}[-${args[1]}:]`,
  Mid: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+${args[2]}]`,
  SubStr: (args) => `${args[0]}[${args[1]}-1:${args[1]}-1+${args[2]}]`,
  InStr: (args) => `(${args[0]}.find(${args[1]}) + 1)`,
  Rep: (args) => `${args[0]} * ${args[1]}`,
  Fill: (args) => `${args[0]} * ${args[1]}`,
  Chr: (args) => `chr(${args[0]})`,
  Asc: (args) => `ord(${args[0]})`,
  StrToken: (args) => `${args[0]}.split(${args[2]})[${args[1]} - 1]`,
  StrTokenCnt: (args) => `len(${args[0]}.split(${args[1]}))`,

  // Numeric functions
  Abs: (args) => `abs(${args[0]})`,
  Round: (args) => `round(${args[0]}, ${args[1]})`,
  Trunc: (args) => `int(${args[0]} * 10**${args[1]}) / 10**${args[1]}`,
  Int: (args) => `int(${args[0]})`,
  Mod: (args) => `(${args[0]} % ${args[1]})`,
  Min: (args) => `min(${args.join(', ')})`,
  Max: (args) => `max(${args.join(', ')})`,
  Pow: (args) => `${args[0]} ** ${args[1]}`,
  Sqrt: (args) => `math.sqrt(${args[0]})`,
  Exp: (args) => `math.exp(${args[0]})`,
  Log: (args) => `math.log(${args[0]})`,
  Log10: (args) => `math.log10(${args[0]})`,
  Sin: (args) => `math.sin(${args[0]})`,
  Cos: (args) => `math.cos(${args[0]})`,
  Tan: (args) => `math.tan(${args[0]})`,
  ASin: (args) => `math.asin(${args[0]})`,
  ACos: (args) => `math.acos(${args[0]})`,
  ATan: (args) => `math.atan(${args[0]})`,
  Rand: (args) => `random.randint(0, ${args[0]} - 1)`,

  // Date functions
  Date: () => 'date.today()',
  Day: (args) => `${args[0]}.day`,
  Month: (args) => `${args[0]}.month`,
  Year: (args) => `${args[0]}.year`,
  DOW: (args) => `${args[0]}.weekday()`,
  DStr: (args) => `${args[0]}.strftime(${args[1]})`,
  DVal: (args) => `datetime.strptime(${args[0]}, ${args[1]}).date()`,
  BOM: (args) => `${args[0]}.replace(day=1)`,
  EOM: (args) => `(${args[0]}.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)`,
  BOY: (args) => `${args[0]}.replace(month=1, day=1)`,
  EOY: (args) => `${args[0]}.replace(month=12, day=31)`,

  // Time functions
  Time: () => 'datetime.now().time()',
  Hour: (args) => `${args[0]}.hour`,
  Minute: (args) => `${args[0]}.minute`,
  Second: (args) => `${args[0]}.second`,
  TStr: (args) => `${args[0]}.strftime(${args[1]})`,
  TVal: (args) => `datetime.strptime(${args[0]}, ${args[1]}).time()`,

  // Flow control
  IF: (args) => `(${args[1]} if ${args[0]} else ${args[2]})`,
  IIF: (args) => `(${args[1]} if ${args[0]} else ${args[2]})`,
  CASE: (args) => generateCaseExpression(args),
  Choose: (args) => `[${args.slice(1).join(', ')}][${args[0]} - 1]`,
  IsNull: (args) => `(${args[0]} is None)`,
  IsDefault: (args) => `(${args[0]} is None)`,
  NullIf: (args) => `(None if ${args[0]} == ${args[1]} else ${args[0]})`,

  // Conversion
  Val: (args) => `Decimal(${args[0]})`,
  Str: (args) => `format_number(${args[0]}, ${args[1]})`,
  Fix: (args) => `format_number(${args[0]}, ${args[1]}, ${args[2]})`,
  Hex: (args) => `hex(${args[0]})[2:].upper()`,
  HVal: (args) => `int(${args[0]}, 16)`,

  // Variable/Parameter
  GetParam: (args) => `get_param(${args[0]})`,
  SetParam: (args) => `set_param(${args[0]}, ${args[1]})`,
  Translate: (args) => `translate(${args[0]})`,

  // Database
  DbName: (args) => `get_table_name(${args[0]})`,
  Counter: (args) => `counter(${args[0]})`,

  // System
  User: () => 'os.getlogin()',
  Delay: (args) => `await asyncio.sleep(${args[0]})`,
  OSEnv: (args) => `os.environ.get(${args[0]}, "")`,
  RunMode: () => 'get_run_mode()',
  IsComponent: () => 'is_component()',

  // File
  FileExist: (args) => `os.path.exists(${args[0]})`,
  FileDelete: (args) => `os.remove(${args[0]})`,
  FileCopy: (args) => `shutil.copy(${args[0]}, ${args[1]})`,
  FileRename: (args) => `os.rename(${args[0]}, ${args[1]})`,
  FileSize: (args) => `os.path.getsize(${args[0]})`,
  File2Blb: (args) => `open(${args[0]}, 'rb').read()`,
  Blb2File: (args) => `open(${args[1]}, 'wb').write(${args[0]})`,

  // Misc
  Empty: () => "''",
  NOT: (args) => `not (${args[0]})`,
  MlsTrans: (args) => `translate(${args[0]})`,
};

/**
 * Generate CASE expression in Python
 */
function generateCaseExpression(args: string[]): string {
  if (args.length < 4) {
    return `# Invalid CASE\nNone`;
  }

  const expr = args[0];
  const cases: string[] = [];

  for (let i = 1; i < args.length - 1; i += 2) {
    if (i + 1 < args.length) {
      cases.push(`${args[i + 1]} if ${expr} == ${args[i]}`);
    }
  }

  // Default value
  const defaultValue = args.length % 2 === 0 ? args[args.length - 1] : 'None';

  // Use nested ternary for Python
  return `(${cases.join(' else ')} else ${defaultValue})`;
}

/**
 * Python code generator visitor
 */
export class PythonGenerator implements ASTVisitor<string> {
  private readonly options: Required<PythonGeneratorOptions>;

  constructor(options: PythonGeneratorOptions = {}) {
    this.options = {
      fieldPrefix: options.fieldPrefix ?? 'fields',
      mainProgramPrefix: options.mainProgramPrefix ?? 'main_program',
      includeTypeHints: options.includeTypeHints ?? false,
      useDecimal: options.useDecimal ?? true,
    };
  }

  visitNumberLiteral(node: NumberLiteral): string {
    if (this.options.useDecimal && node.raw.includes('.')) {
      return `Decimal('${node.raw}')`;
    }
    return node.raw;
  }

  visitStringLiteral(node: StringLiteral): string {
    const escaped = node.value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n');
    return `'${escaped}'`;
  }

  visitBooleanLiteral(node: BooleanLiteral): string {
    return node.value ? 'True' : 'False';
  }

  visitFieldReference(node: FieldReference): string {
    const { context, field } = node;

    // Context 0: Current task variables
    if (context === 0) {
      return `${this.options.fieldPrefix}.v${field}`;
    }

    // Context 32768: Main program variables
    if (context === 32768) {
      return `${this.options.mainProgramPrefix}.v${field}`;
    }

    // Context 1-N: Parent task parameters
    if (context >= 1 && context < 32768) {
      return `parent${context}.p${field}`;
    }

    // Generic fallback
    return `get_field(${context}, ${field})`;
  }

  visitSpecialReference(node: SpecialReference): string {
    const { refType, id, comp } = node;

    switch (refType) {
      case SpecialRefType.PROG:
        return `programs[${id}]`;

      case SpecialRefType.DSOURCE:
        return `tables[${comp}][${id}]`;

      case SpecialRefType.VAR:
        if (comp === 0) {
          return `${this.options.fieldPrefix}.v${id}`;
        }
        return `get_variable(${comp}, ${id})`;

      case SpecialRefType.FORM:
        return `forms[${id}]`;

      default:
        return `# Unknown ref type: ${refType}\nNone`;
    }
  }

  visitBinaryExpression(node: BinaryExpression): string {
    const left = visit(node.left, this);
    const right = visit(node.right, this);

    const operatorMap: Record<BinaryOperator, string> = {
      [BinaryOperator.Add]: '+',
      [BinaryOperator.Subtract]: '-',
      [BinaryOperator.Multiply]: '*',
      [BinaryOperator.Divide]: '/',
      [BinaryOperator.Power]: '**',
      [BinaryOperator.Mod]: '%',
      [BinaryOperator.Concat]: '+',
      [BinaryOperator.Equal]: '==',
      [BinaryOperator.NotEqual]: '!=',
      [BinaryOperator.LessThan]: '<',
      [BinaryOperator.GreaterThan]: '>',
      [BinaryOperator.LessEqual]: '<=',
      [BinaryOperator.GreaterEqual]: '>=',
      [BinaryOperator.And]: 'and',
      [BinaryOperator.Or]: 'or',
    };

    const op = operatorMap[node.operator] ?? node.operator;
    return `(${left} ${op} ${right})`;
  }

  visitUnaryExpression(node: UnaryExpression): string {
    const operand = visit(node.operand, this);

    switch (node.operator) {
      case UnaryOperator.Negate:
        return `(-${operand})`;
      case UnaryOperator.Not:
        return `(not ${operand})`;
      default:
        return `# Unknown unary operator\n${operand}`;
    }
  }

  visitFunctionCall(node: FunctionCall): string {
    const args = node.arguments.map((arg) => visit(arg, this));
    const funcName = node.name;

    // Check for mapped function
    const mapping = FUNCTION_MAPPINGS[funcName];
    if (mapping) {
      if (typeof mapping === 'function') {
        return mapping(args);
      }
      return mapping;
    }

    // Default: keep as function call (snake_case)
    const snakeName = funcName.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    return `${snakeName}(${args.join(', ')})`;
  }

  visitIdentifier(node: Identifier): string {
    // snake_case for Python
    return node.name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
}

/**
 * Generate Python code from AST
 */
export function generatePython(
  ast: Expression,
  options?: PythonGeneratorOptions
): string {
  const generator = new PythonGenerator(options);
  return visit(ast, generator);
}

/**
 * Generate Python imports needed for the generated code
 */
export function getPythonImports(): string {
  return `from decimal import Decimal
from datetime import date, datetime, time, timedelta
import math
import random
import os
import shutil
import asyncio
`;
}
