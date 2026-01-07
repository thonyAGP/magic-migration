/**
 * Magic Unipaas Expression Parser - TypeScript Code Generator
 *
 * Generates TypeScript code from Magic expression AST.
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
 * Options for TypeScript code generation
 */
export interface TypeScriptGeneratorOptions {
  /** Prefix for field references (default: 'fields') */
  fieldPrefix?: string;
  /** Prefix for main program variables (default: 'mainProgram') */
  mainProgramPrefix?: string;
  /** Whether to use optional chaining for field access (default: true) */
  useOptionalChaining?: boolean;
  /** Whether to generate type annotations (default: false) */
  includeTypes?: boolean;
}

/**
 * Magic function to TypeScript mapping
 */
const FUNCTION_MAPPINGS: Record<string, string | ((args: string[]) => string)> = {
  // String functions
  Trim: (args) => `${args[0]}.trim()`,
  LTrim: (args) => `${args[0]}.trimStart()`,
  RTrim: (args) => `${args[0]}.trimEnd()`,
  Upper: (args) => `${args[0]}.toUpperCase()`,
  Lower: (args) => `${args[0]}.toLowerCase()`,
  Len: (args) => `${args[0]}.length`,
  Left: (args) => `${args[0]}.substring(0, ${args[1]})`,
  Right: (args) => `${args[0]}.slice(-${args[1]})`,
  Mid: (args) => `${args[0]}.substring(${args[1]} - 1, ${args[1]} - 1 + ${args[2]})`,
  SubStr: (args) => `${args[0]}.substring(${args[1]} - 1, ${args[1]} - 1 + ${args[2]})`,
  InStr: (args) => `(${args[0]}.indexOf(${args[1]}) + 1)`,
  Rep: (args) => `${args[0]}.repeat(${args[1]})`,
  Fill: (args) => `${args[0]}.repeat(${args[1]})`,
  Chr: (args) => `String.fromCharCode(${args[0]})`,
  Asc: (args) => `${args[0]}.charCodeAt(0)`,
  StrToken: (args) => `${args[0]}.split(${args[2]})[${args[1]} - 1] ?? ''`,
  StrTokenCnt: (args) => `${args[0]}.split(${args[1]}).length`,

  // Numeric functions
  Abs: (args) => `Math.abs(${args[0]})`,
  Round: (args) => `Number(${args[0]}.toFixed(${args[1]}))`,
  Trunc: (args) => `Math.trunc(${args[0]} * Math.pow(10, ${args[1]})) / Math.pow(10, ${args[1]})`,
  Int: (args) => `Math.floor(${args[0]})`,
  Mod: (args) => `(${args[0]} % ${args[1]})`,
  Min: (args) => `Math.min(${args.join(', ')})`,
  Max: (args) => `Math.max(${args.join(', ')})`,
  Pow: (args) => `Math.pow(${args[0]}, ${args[1]})`,
  Sqrt: (args) => `Math.sqrt(${args[0]})`,
  Exp: (args) => `Math.exp(${args[0]})`,
  Log: (args) => `Math.log(${args[0]})`,
  Log10: (args) => `Math.log10(${args[0]})`,
  Sin: (args) => `Math.sin(${args[0]})`,
  Cos: (args) => `Math.cos(${args[0]})`,
  Tan: (args) => `Math.tan(${args[0]})`,
  ASin: (args) => `Math.asin(${args[0]})`,
  ACos: (args) => `Math.acos(${args[0]})`,
  ATan: (args) => `Math.atan(${args[0]})`,
  Rand: (args) => `Math.floor(Math.random() * ${args[0]})`,

  // Date functions
  Date: () => 'new Date()',
  Day: (args) => `${args[0]}.getDate()`,
  Month: (args) => `(${args[0]}.getMonth() + 1)`,
  Year: (args) => `${args[0]}.getFullYear()`,
  DOW: (args) => `${args[0]}.getDay()`,
  DStr: (args) => `formatDate(${args[0]}, ${args[1]})`,
  DVal: (args) => `parseDate(${args[0]}, ${args[1]})`,

  // Time functions
  Time: () => 'new Date()',
  Hour: (args) => `${args[0]}.getHours()`,
  Minute: (args) => `${args[0]}.getMinutes()`,
  Second: (args) => `${args[0]}.getSeconds()`,
  TStr: (args) => `formatTime(${args[0]}, ${args[1]})`,
  TVal: (args) => `parseTime(${args[0]}, ${args[1]})`,

  // Flow control
  IF: (args) => `(${args[0]} ? ${args[1]} : ${args[2]})`,
  IIF: (args) => `(${args[0]} ? ${args[1]} : ${args[2]})`,
  CASE: (args) => generateCaseExpression(args),
  Choose: (args) => `[${args.slice(1).join(', ')}][${args[0]} - 1]`,
  IsNull: (args) => `(${args[0]} == null)`,
  IsDefault: (args) => `(${args[0]} === undefined)`,
  NullIf: (args) => `(${args[0]} === ${args[1]} ? null : ${args[0]})`,

  // Conversion
  Val: (args) => `Number(${args[0]})`,
  Str: (args) => `formatNumber(${args[0]}, ${args[1]})`,
  Fix: (args) => `formatNumber(${args[0]}, ${args[1]}, ${args[2]})`,
  Hex: (args) => `${args[0]}.toString(16).toUpperCase()`,
  HVal: (args) => `parseInt(${args[0]}, 16)`,

  // Variable/Parameter
  GetParam: (args) => `getParam(${args[0]})`,
  SetParam: (args) => `setParam(${args[0]}, ${args[1]})`,
  Translate: (args) => `translate(${args[0]})`,

  // Database
  DbName: (args) => `getTableName(${args[0]})`,
  Counter: (args) => `counter(${args[0]})`,

  // System
  User: () => 'getCurrentUser()',
  Delay: (args) => `await delay(${args[0]} * 1000)`,
  OSEnv: (args) => `process.env[${args[0]}] ?? ''`,
  RunMode: () => 'getRunMode()',
  IsComponent: () => 'isComponent()',

  // UI
  SetCrsr: (args) => `setCursor(${args[0]})`,
  MsgBox: (args) => `await showMessageBox(${args.join(', ')})`,

  // File
  FileExist: (args) => `await fileExists(${args[0]})`,
  FileDelete: (args) => `await deleteFile(${args[0]})`,
  FileCopy: (args) => `await copyFile(${args[0]}, ${args[1]})`,
  FileRename: (args) => `await renameFile(${args[0]}, ${args[1]})`,
  FileSize: (args) => `await getFileSize(${args[0]})`,
  File2Blb: (args) => `await readFile(${args[0]})`,
  Blb2File: (args) => `await writeFile(${args[1]}, ${args[0]})`,

  // Misc
  Empty: () => "''",
  NOT: (args) => `!(${args[0]})`,
  MlsTrans: (args) => `translate(${args[0]})`,
};

/**
 * Generate CASE expression in TypeScript
 */
function generateCaseExpression(args: string[]): string {
  if (args.length < 4) {
    return `/* Invalid CASE */ null`;
  }

  const expr = args[0];
  const pairs: string[] = [];

  for (let i = 1; i < args.length - 1; i += 2) {
    if (i + 1 < args.length) {
      pairs.push(`${expr} === ${args[i]} ? ${args[i + 1]}`);
    }
  }

  // Default value (last arg if odd count, else undefined)
  const defaultValue = args.length % 2 === 0 ? args[args.length - 1] : 'undefined';

  return `(${pairs.join(' : ')} : ${defaultValue})`;
}

/**
 * TypeScript code generator visitor
 */
export class TypeScriptGenerator implements ASTVisitor<string> {
  private readonly options: Required<TypeScriptGeneratorOptions>;

  constructor(options: TypeScriptGeneratorOptions = {}) {
    this.options = {
      fieldPrefix: options.fieldPrefix ?? 'fields',
      mainProgramPrefix: options.mainProgramPrefix ?? 'mainProgram',
      useOptionalChaining: options.useOptionalChaining ?? true,
      includeTypes: options.includeTypes ?? false,
    };
  }

  visitNumberLiteral(node: NumberLiteral): string {
    return node.raw;
  }

  visitStringLiteral(node: StringLiteral): string {
    // Convert Magic strings to JS template literals or regular strings
    const escaped = node.value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n');
    return `'${escaped}'`;
  }

  visitBooleanLiteral(node: BooleanLiteral): string {
    return node.value ? 'true' : 'false';
  }

  visitFieldReference(node: FieldReference): string {
    const { context, field } = node;
    const accessor = this.options.useOptionalChaining ? '?.' : '.';

    // Context 0: Current task variables
    if (context === 0) {
      return `${this.options.fieldPrefix}${accessor}v${field}`;
    }

    // Context 32768: Main program variables
    if (context === 32768) {
      return `${this.options.mainProgramPrefix}${accessor}v${field}`;
    }

    // Context 1-N: Parent task parameters
    if (context >= 1 && context < 32768) {
      return `parent${context}${accessor}p${field}`;
    }

    // Generic fallback
    return `getField(${context}, ${field})`;
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
        return `getVariable(${comp}, ${id})`;

      case SpecialRefType.FORM:
        return `forms[${id}]`;

      default:
        return `/* Unknown ref type: ${refType} */ null`;
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
      [BinaryOperator.Equal]: '===',
      [BinaryOperator.NotEqual]: '!==',
      [BinaryOperator.LessThan]: '<',
      [BinaryOperator.GreaterThan]: '>',
      [BinaryOperator.LessEqual]: '<=',
      [BinaryOperator.GreaterEqual]: '>=',
      [BinaryOperator.And]: '&&',
      [BinaryOperator.Or]: '||',
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
        return `(!${operand})`;
      default:
        return `/* Unknown unary operator */ ${operand}`;
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

    // Default: keep as function call
    return `${funcName}(${args.join(', ')})`;
  }

  visitIdentifier(node: Identifier): string {
    return node.name;
  }
}

/**
 * Generate TypeScript code from AST
 */
export function generateTypeScript(
  ast: Expression,
  options?: TypeScriptGeneratorOptions
): string {
  const generator = new TypeScriptGenerator(options);
  return visit(ast, generator);
}
