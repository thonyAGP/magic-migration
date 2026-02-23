/**
 * Magic Unipaas Expression Parser - AST Node Types
 *
 * Defines all AST node types for the parsed expression tree.
 */

import { SpecialRefType, TokenPosition } from './tokens';

/**
 * Base AST node interface
 */
export interface ASTNode {
  kind: ASTNodeKind;
  position?: TokenPosition;
}

/**
 * All possible AST node kinds
 */
export enum ASTNodeKind {
  // Literals
  NumberLiteral = 'NumberLiteral',
  StringLiteral = 'StringLiteral',
  BooleanLiteral = 'BooleanLiteral',

  // References
  FieldReference = 'FieldReference',
  SpecialReference = 'SpecialReference',

  // Expressions
  BinaryExpression = 'BinaryExpression',
  UnaryExpression = 'UnaryExpression',
  FunctionCall = 'FunctionCall',

  // Special
  Identifier = 'Identifier',
}

/**
 * Number literal: 123, 45.67
 */
export interface NumberLiteral extends ASTNode {
  kind: ASTNodeKind.NumberLiteral;
  value: number;
  raw: string;
}

/**
 * String literal: 'texte'
 */
export interface StringLiteral extends ASTNode {
  kind: ASTNodeKind.StringLiteral;
  value: string;
  raw: string;
}

/**
 * Boolean literal: 'TRUE'LOG, 'FALSE'LOG
 */
export interface BooleanLiteral extends ASTNode {
  kind: ASTNodeKind.BooleanLiteral;
  value: boolean;
}

/**
 * Field reference: {context,field}
 *
 * Common contexts:
 * - 0: Current task variables
 * - 32768: Main program variables
 * - 1: Parent task parameter 1
 */
export interface FieldReference extends ASTNode {
  kind: ASTNodeKind.FieldReference;
  context: number;
  field: number;
}

/**
 * Special reference types
 *
 * Examples:
 * - '{493,-1}'PROG   -> Program 493 in local component
 * - '{38,2}'DSOURCE  -> Table 38 in component 2
 * - '{0,8}'VAR       -> Variable 8 in current context
 * - '{0,3}'FORM      -> Form for variable 3
 */
export interface SpecialReference extends ASTNode {
  kind: ASTNodeKind.SpecialReference;
  refType: SpecialRefType;
  id: number;
  comp: number;
}

/**
 * Binary operators
 */
export enum BinaryOperator {
  // Arithmetic
  Add = '+',
  Subtract = '-',
  Multiply = '*',
  Divide = '/',
  Power = '^',
  Mod = 'MOD',

  // String
  Concat = '&',

  // Comparison
  Equal = '=',
  NotEqual = '<>',
  LessThan = '<',
  GreaterThan = '>',
  LessEqual = '<=',
  GreaterEqual = '>=',

  // Logical
  And = 'AND',
  Or = 'OR',
}

/**
 * Unary operators
 */
export enum UnaryOperator {
  Negate = '-',
  Not = 'NOT',
}

/**
 * Binary expression: left operator right
 */
export interface BinaryExpression extends ASTNode {
  kind: ASTNodeKind.BinaryExpression;
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

/**
 * Unary expression: operator operand
 */
export interface UnaryExpression extends ASTNode {
  kind: ASTNodeKind.UnaryExpression;
  operator: UnaryOperator;
  operand: Expression;
}

/**
 * Function call: FunctionName(arg1, arg2, ...)
 *
 * Magic has 200+ built-in functions like:
 * - IF(condition, trueValue, falseValue)
 * - Trim(string)
 * - DStr(date, format)
 * - GetParam(name)
 * - etc.
 */
export interface FunctionCall extends ASTNode {
  kind: ASTNodeKind.FunctionCall;
  name: string;
  arguments: Expression[];
}

/**
 * Identifier (for unresolved names)
 */
export interface Identifier extends ASTNode {
  kind: ASTNodeKind.Identifier;
  name: string;
}

/**
 * Union type for all expression nodes
 */
export type Expression =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | FieldReference
  | SpecialReference
  | BinaryExpression
  | UnaryExpression
  | FunctionCall
  | Identifier;

/**
 * Type guards for AST nodes
 */
export function isNumberLiteral(node: ASTNode): node is NumberLiteral {
  return node.kind === ASTNodeKind.NumberLiteral;
}

export function isStringLiteral(node: ASTNode): node is StringLiteral {
  return node.kind === ASTNodeKind.StringLiteral;
}

export function isBooleanLiteral(node: ASTNode): node is BooleanLiteral {
  return node.kind === ASTNodeKind.BooleanLiteral;
}

export function isFieldReference(node: ASTNode): node is FieldReference {
  return node.kind === ASTNodeKind.FieldReference;
}

export function isSpecialReference(node: ASTNode): node is SpecialReference {
  return node.kind === ASTNodeKind.SpecialReference;
}

export function isBinaryExpression(node: ASTNode): node is BinaryExpression {
  return node.kind === ASTNodeKind.BinaryExpression;
}

export function isUnaryExpression(node: ASTNode): node is UnaryExpression {
  return node.kind === ASTNodeKind.UnaryExpression;
}

export function isFunctionCall(node: ASTNode): node is FunctionCall {
  return node.kind === ASTNodeKind.FunctionCall;
}

export function isIdentifier(node: ASTNode): node is Identifier {
  return node.kind === ASTNodeKind.Identifier;
}

/**
 * AST factory functions
 */
export const AST = {
  numberLiteral(value: number, raw: string, position?: TokenPosition): NumberLiteral {
    return { kind: ASTNodeKind.NumberLiteral, value, raw, position };
  },

  stringLiteral(value: string, raw: string, position?: TokenPosition): StringLiteral {
    return { kind: ASTNodeKind.StringLiteral, value, raw, position };
  },

  booleanLiteral(value: boolean, position?: TokenPosition): BooleanLiteral {
    return { kind: ASTNodeKind.BooleanLiteral, value, position };
  },

  fieldReference(context: number, field: number, position?: TokenPosition): FieldReference {
    return { kind: ASTNodeKind.FieldReference, context, field, position };
  },

  specialReference(
    refType: SpecialRefType,
    id: number,
    comp: number,
    position?: TokenPosition
  ): SpecialReference {
    return { kind: ASTNodeKind.SpecialReference, refType, id, comp, position };
  },

  binaryExpression(
    operator: BinaryOperator,
    left: Expression,
    right: Expression,
    position?: TokenPosition
  ): BinaryExpression {
    return { kind: ASTNodeKind.BinaryExpression, operator, left, right, position };
  },

  unaryExpression(
    operator: UnaryOperator,
    operand: Expression,
    position?: TokenPosition
  ): UnaryExpression {
    return { kind: ASTNodeKind.UnaryExpression, operator, operand, position };
  },

  functionCall(
    name: string,
    args: Expression[],
    position?: TokenPosition
  ): FunctionCall {
    return { kind: ASTNodeKind.FunctionCall, name, arguments: args, position };
  },

  identifier(name: string, position?: TokenPosition): Identifier {
    return { kind: ASTNodeKind.Identifier, name, position };
  },
};
