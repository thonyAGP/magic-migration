/**
 * Magic Unipaas Expression Parser - C# Code Generator
 *
 * Generates C# code from Magic expression AST.
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
 * Options for C# code generation
 */
export interface CSharpGeneratorOptions {
  /** Prefix for field references (default: 'Fields') */
  fieldPrefix?: string;
  /** Prefix for main program variables (default: 'MainProgram') */
  mainProgramPrefix?: string;
  /** Whether to use nullable reference types (default: true) */
  useNullable?: boolean;
  /** Whether to use DateOnly/TimeOnly (.NET 6+) (default: true) */
  useDateOnly?: boolean;
}

/**
 * Magic function to C# mapping
 */
const FUNCTION_MAPPINGS: Record<string, string | ((args: string[]) => string)> = {
  // String functions
  Trim: (args) => `${args[0]}.Trim()`,
  LTrim: (args) => `${args[0]}.TrimStart()`,
  RTrim: (args) => `${args[0]}.TrimEnd()`,
  Upper: (args) => `${args[0]}.ToUpper()`,
  Lower: (args) => `${args[0]}.ToLower()`,
  Len: (args) => `${args[0]}.Length`,
  Left: (args) => `${args[0]}.Substring(0, Math.Min(${args[1]}, ${args[0]}.Length))`,
  Right: (args) => `${args[0]}.Substring(Math.Max(0, ${args[0]}.Length - ${args[1]}))`,
  Mid: (args) => `${args[0]}.Substring(${args[1]} - 1, ${args[2]})`,
  SubStr: (args) => `${args[0]}.Substring(${args[1]} - 1, ${args[2]})`,
  InStr: (args) => `(${args[0]}.IndexOf(${args[1]}) + 1)`,
  Rep: (args) => `string.Concat(Enumerable.Repeat(${args[0]}, ${args[1]}))`,
  Fill: (args) => `new string(${args[0]}[0], ${args[1]})`,
  Chr: (args) => `((char)${args[0]}).ToString()`,
  Asc: (args) => `(int)${args[0]}[0]`,
  StrToken: (args) => `${args[0]}.Split(${args[2]})[${args[1]} - 1]`,
  StrTokenCnt: (args) => `${args[0]}.Split(${args[1]}).Length`,

  // Numeric functions
  Abs: (args) => `Math.Abs(${args[0]})`,
  Round: (args) => `Math.Round(${args[0]}, ${args[1]})`,
  Trunc: (args) => `Math.Truncate(${args[0]} * Math.Pow(10, ${args[1]})) / Math.Pow(10, ${args[1]})`,
  Int: (args) => `Math.Floor(${args[0]})`,
  Mod: (args) => `(${args[0]} % ${args[1]})`,
  Min: (args) => `Math.Min(${args.join(', ')})`,
  Max: (args) => `Math.Max(${args.join(', ')})`,
  Pow: (args) => `Math.Pow(${args[0]}, ${args[1]})`,
  Sqrt: (args) => `Math.Sqrt(${args[0]})`,
  Exp: (args) => `Math.Exp(${args[0]})`,
  Log: (args) => `Math.Log(${args[0]})`,
  Log10: (args) => `Math.Log10(${args[0]})`,
  Sin: (args) => `Math.Sin(${args[0]})`,
  Cos: (args) => `Math.Cos(${args[0]})`,
  Tan: (args) => `Math.Tan(${args[0]})`,
  ASin: (args) => `Math.Asin(${args[0]})`,
  ACos: (args) => `Math.Acos(${args[0]})`,
  ATan: (args) => `Math.Atan(${args[0]})`,
  Rand: (args) => `new Random().Next(${args[0]})`,

  // Date functions
  Date: () => 'DateOnly.FromDateTime(DateTime.Now)',
  Day: (args) => `${args[0]}.Day`,
  Month: (args) => `${args[0]}.Month`,
  Year: (args) => `${args[0]}.Year`,
  DOW: (args) => `(int)${args[0]}.DayOfWeek`,
  DStr: (args) => `${args[0]}.ToString(${args[1]})`,
  DVal: (args) => `DateOnly.ParseExact(${args[0]}, ${args[1]})`,
  BOM: (args) => `new DateOnly(${args[0]}.Year, ${args[0]}.Month, 1)`,
  EOM: (args) => `new DateOnly(${args[0]}.Year, ${args[0]}.Month, DateTime.DaysInMonth(${args[0]}.Year, ${args[0]}.Month))`,
  BOY: (args) => `new DateOnly(${args[0]}.Year, 1, 1)`,
  EOY: (args) => `new DateOnly(${args[0]}.Year, 12, 31)`,

  // Time functions
  Time: () => 'TimeOnly.FromDateTime(DateTime.Now)',
  Hour: (args) => `${args[0]}.Hour`,
  Minute: (args) => `${args[0]}.Minute`,
  Second: (args) => `${args[0]}.Second`,
  TStr: (args) => `${args[0]}.ToString(${args[1]})`,
  TVal: (args) => `TimeOnly.ParseExact(${args[0]}, ${args[1]})`,

  // Flow control
  IF: (args) => `(${args[0]} ? ${args[1]} : ${args[2]})`,
  IIF: (args) => `(${args[0]} ? ${args[1]} : ${args[2]})`,
  CASE: (args) => generateCaseExpression(args),
  Choose: (args) => `new[] { ${args.slice(1).join(', ')} }[${args[0]} - 1]`,
  IsNull: (args) => `(${args[0]} == null)`,
  IsDefault: (args) => `(${args[0]} == default)`,
  NullIf: (args) => `(${args[0]} == ${args[1]} ? null : ${args[0]})`,

  // Conversion
  Val: (args) => `decimal.Parse(${args[0]})`,
  Str: (args) => `FormatNumber(${args[0]}, ${args[1]})`,
  Fix: (args) => `FormatNumber(${args[0]}, ${args[1]}, ${args[2]})`,
  Hex: (args) => `${args[0]}.ToString("X")`,
  HVal: (args) => `Convert.ToInt32(${args[0]}, 16)`,

  // Variable/Parameter
  GetParam: (args) => `GetParam(${args[0]})`,
  SetParam: (args) => `SetParam(${args[0]}, ${args[1]})`,
  Translate: (args) => `Translate(${args[0]})`,

  // Database
  DbName: (args) => `GetTableName(${args[0]})`,
  Counter: (args) => `Counter(${args[0]})`,

  // System
  User: () => 'Environment.UserName',
  Delay: (args) => `await Task.Delay(${args[0]} * 1000)`,
  OSEnv: (args) => `Environment.GetEnvironmentVariable(${args[0]}) ?? ""`,
  RunMode: () => 'GetRunMode()',
  IsComponent: () => 'IsComponent()',

  // UI
  SetCrsr: (args) => `SetCursor(${args[0]})`,
  MsgBox: (args) => `MessageBox.Show(${args.slice(0, 2).join(', ')})`,

  // File
  FileExist: (args) => `File.Exists(${args[0]})`,
  FileDelete: (args) => `File.Delete(${args[0]})`,
  FileCopy: (args) => `File.Copy(${args[0]}, ${args[1]})`,
  FileRename: (args) => `File.Move(${args[0]}, ${args[1]})`,
  FileSize: (args) => `new FileInfo(${args[0]}).Length`,
  File2Blb: (args) => `File.ReadAllBytes(${args[0]})`,
  Blb2File: (args) => `File.WriteAllBytes(${args[1]}, ${args[0]})`,

  // Misc
  Empty: () => 'string.Empty',
  NOT: (args) => `!(${args[0]})`,
  MlsTrans: (args) => `Translate(${args[0]})`,
};

/**
 * Generate CASE expression in C#
 */
function generateCaseExpression(args: string[]): string {
  if (args.length < 4) {
    return `/* Invalid CASE */ null`;
  }

  const expr = args[0];
  const cases: string[] = [];

  for (let i = 1; i < args.length - 1; i += 2) {
    if (i + 1 < args.length) {
      cases.push(`${expr} == ${args[i]} ? ${args[i + 1]}`);
    }
  }

  // Default value
  const defaultValue = args.length % 2 === 0 ? args[args.length - 1] : 'default';

  return `(${cases.join(' : ')} : ${defaultValue})`;
}

/**
 * C# code generator visitor
 */
export class CSharpGenerator implements ASTVisitor<string> {
  private readonly options: Required<CSharpGeneratorOptions>;

  constructor(options: CSharpGeneratorOptions = {}) {
    this.options = {
      fieldPrefix: options.fieldPrefix ?? 'Fields',
      mainProgramPrefix: options.mainProgramPrefix ?? 'MainProgram',
      useNullable: options.useNullable ?? true,
      useDateOnly: options.useDateOnly ?? true,
    };
  }

  visitNumberLiteral(node: NumberLiteral): string {
    // Use decimal suffix for precision
    if (node.raw.includes('.')) {
      return `${node.raw}m`;
    }
    return node.raw;
  }

  visitStringLiteral(node: StringLiteral): string {
    const escaped = node.value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }

  visitBooleanLiteral(node: BooleanLiteral): string {
    return node.value ? 'true' : 'false';
  }

  visitFieldReference(node: FieldReference): string {
    const { context, field } = node;
    const nullCheck = this.options.useNullable ? '?' : '';

    // Context 0: Current task variables
    if (context === 0) {
      return `${this.options.fieldPrefix}${nullCheck}.V${field}`;
    }

    // Context 32768: Main program variables
    if (context === 32768) {
      return `${this.options.mainProgramPrefix}${nullCheck}.V${field}`;
    }

    // Context 1-N: Parent task parameters
    if (context >= 1 && context < 32768) {
      return `Parent${context}${nullCheck}.P${field}`;
    }

    // Generic fallback
    return `GetField(${context}, ${field})`;
  }

  visitSpecialReference(node: SpecialReference): string {
    const { refType, id, comp } = node;

    switch (refType) {
      case SpecialRefType.PROG:
        return `Programs[${id}]`;

      case SpecialRefType.DSOURCE:
        return `Tables[${comp}][${id}]`;

      case SpecialRefType.VAR:
        if (comp === 0) {
          return `${this.options.fieldPrefix}.V${id}`;
        }
        return `GetVariable(${comp}, ${id})`;

      case SpecialRefType.FORM:
        return `Forms[${id}]`;

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
      [BinaryOperator.Power]: '/* ^ */ Math.Pow',
      [BinaryOperator.Mod]: '%',
      [BinaryOperator.Concat]: '+',
      [BinaryOperator.Equal]: '==',
      [BinaryOperator.NotEqual]: '!=',
      [BinaryOperator.LessThan]: '<',
      [BinaryOperator.GreaterThan]: '>',
      [BinaryOperator.LessEqual]: '<=',
      [BinaryOperator.GreaterEqual]: '>=',
      [BinaryOperator.And]: '&&',
      [BinaryOperator.Or]: '||',
    };

    // Special case for power operator
    if (node.operator === BinaryOperator.Power) {
      return `Math.Pow(${left}, ${right})`;
    }

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

    // Default: keep as method call (PascalCase)
    const pascalName = funcName.charAt(0).toUpperCase() + funcName.slice(1);
    return `${pascalName}(${args.join(', ')})`;
  }

  visitIdentifier(node: Identifier): string {
    // PascalCase for C#
    return node.name.charAt(0).toUpperCase() + node.name.slice(1);
  }
}

/**
 * Generate C# code from AST
 */
export function generateCSharp(
  ast: Expression,
  options?: CSharpGeneratorOptions
): string {
  const generator = new CSharpGenerator(options);
  return visit(ast, generator);
}
