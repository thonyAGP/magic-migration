/**
 * Magic Unipaas Expression Parser - Token Types
 *
 * Defines all token types recognized by the lexer for Magic expressions.
 */

export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',

  // References
  FIELD_REF = 'FIELD_REF',           // {context,field}
  SPECIAL_REF = 'SPECIAL_REF',       // '{id,comp}'TYPE

  // Identifiers
  IDENTIFIER = 'IDENTIFIER',         // Function names, etc.

  // Arithmetic operators
  PLUS = 'PLUS',                     // +
  MINUS = 'MINUS',                   // -
  MULTIPLY = 'MULTIPLY',             // *
  DIVIDE = 'DIVIDE',                 // /
  POWER = 'POWER',                   // ^
  MOD = 'MOD',                       // MOD

  // String operators
  CONCAT = 'CONCAT',                 // &

  // Comparison operators
  EQUAL = 'EQUAL',                   // =
  NOT_EQUAL = 'NOT_EQUAL',           // <>
  LESS_THAN = 'LESS_THAN',           // <
  GREATER_THAN = 'GREATER_THAN',     // >
  LESS_EQUAL = 'LESS_EQUAL',         // <=
  GREATER_EQUAL = 'GREATER_EQUAL',   // >=

  // Logical operators
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',

  // Delimiters
  LPAREN = 'LPAREN',                 // (
  RPAREN = 'RPAREN',                 // )
  LBRACE = 'LBRACE',                 // {
  RBRACE = 'RBRACE',                 // }
  COMMA = 'COMMA',                   // ,

  // Special
  EOF = 'EOF',
}

/**
 * Special reference types in Magic expressions
 */
export enum SpecialRefType {
  PROG = 'PROG',           // Program reference
  DSOURCE = 'DSOURCE',     // Data source (table) reference
  VAR = 'VAR',             // Variable reference
  FORM = 'FORM',           // Form reference
  LOG = 'LOG',             // Boolean literal suffix
}

/**
 * Token position in source
 */
export interface TokenPosition {
  line: number;
  column: number;
  offset: number;
}

/**
 * Base token interface
 */
export interface Token {
  type: TokenType;
  value: string;
  position: TokenPosition;
}

/**
 * Number token with parsed numeric value
 */
export interface NumberToken extends Token {
  type: TokenType.NUMBER;
  numericValue: number;
}

/**
 * String token with unquoted value
 */
export interface StringToken extends Token {
  type: TokenType.STRING;
  stringValue: string;
}

/**
 * Boolean token
 */
export interface BooleanToken extends Token {
  type: TokenType.BOOLEAN;
  booleanValue: boolean;
}

/**
 * Field reference token {context,field}
 */
export interface FieldRefToken extends Token {
  type: TokenType.FIELD_REF;
  context: number;
  field: number;
}

/**
 * Special reference token '{id,comp}'TYPE
 */
export interface SpecialRefToken extends Token {
  type: TokenType.SPECIAL_REF;
  refType: SpecialRefType;
  id: number;
  comp: number;
}

/**
 * Type guard for NumberToken
 */
export function isNumberToken(token: Token): token is NumberToken {
  return token.type === TokenType.NUMBER;
}

/**
 * Type guard for StringToken
 */
export function isStringToken(token: Token): token is StringToken {
  return token.type === TokenType.STRING;
}

/**
 * Type guard for BooleanToken
 */
export function isBooleanToken(token: Token): token is BooleanToken {
  return token.type === TokenType.BOOLEAN;
}

/**
 * Type guard for FieldRefToken
 */
export function isFieldRefToken(token: Token): token is FieldRefToken {
  return token.type === TokenType.FIELD_REF;
}

/**
 * Type guard for SpecialRefToken
 */
export function isSpecialRefToken(token: Token): token is SpecialRefToken {
  return token.type === TokenType.SPECIAL_REF;
}

/**
 * Operator tokens that are keywords
 */
export const KEYWORD_OPERATORS: Record<string, TokenType> = {
  AND: TokenType.AND,
  OR: TokenType.OR,
  NOT: TokenType.NOT,
  MOD: TokenType.MOD,
};

/**
 * Check if identifier is a keyword operator
 */
export function isKeywordOperator(identifier: string): boolean {
  return identifier.toUpperCase() in KEYWORD_OPERATORS;
}

/**
 * Get token type for keyword operator
 */
export function getKeywordOperatorType(identifier: string): TokenType | undefined {
  return KEYWORD_OPERATORS[identifier.toUpperCase()];
}
