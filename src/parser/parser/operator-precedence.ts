/**
 * Magic Unipaas Expression Parser - Operator Precedence
 *
 * Defines operator precedence and associativity for the Pratt parser.
 *
 * Magic operator precedence (lowest to highest):
 * 1. OR          (logical or)
 * 2. AND         (logical and)
 * 3. =, <>, <, >, <=, >=  (comparison)
 * 4. &           (string concatenation)
 * 5. +, -        (addition, subtraction)
 * 6. *, /, MOD   (multiplication, division, modulo)
 * 7. ^           (power)
 * 8. NOT, -      (unary)
 */

import { TokenType } from '../types/tokens';
import { BinaryOperator, UnaryOperator } from '../types/ast';

/**
 * Operator associativity
 */
export enum Associativity {
  Left = 'Left',
  Right = 'Right',
}

/**
 * Precedence levels (higher = binds tighter)
 */
export enum Precedence {
  None = 0,
  Or = 1,
  And = 2,
  Comparison = 3,
  Concat = 4,
  Term = 5,        // + -
  Factor = 6,      // * / MOD
  Power = 7,       // ^
  Unary = 8,       // NOT -
  Call = 9,        // function()
  Primary = 10,    // literals, identifiers
}

/**
 * Binary operator info
 */
export interface BinaryOperatorInfo {
  precedence: Precedence;
  associativity: Associativity;
  operator: BinaryOperator;
}

/**
 * Map of token types to binary operator info
 */
export const BINARY_OPERATORS: Partial<Record<TokenType, BinaryOperatorInfo>> = {
  // Logical
  [TokenType.OR]: {
    precedence: Precedence.Or,
    associativity: Associativity.Left,
    operator: BinaryOperator.Or,
  },
  [TokenType.AND]: {
    precedence: Precedence.And,
    associativity: Associativity.Left,
    operator: BinaryOperator.And,
  },

  // Comparison
  [TokenType.EQUAL]: {
    precedence: Precedence.Comparison,
    associativity: Associativity.Left,
    operator: BinaryOperator.Equal,
  },
  [TokenType.NOT_EQUAL]: {
    precedence: Precedence.Comparison,
    associativity: Associativity.Left,
    operator: BinaryOperator.NotEqual,
  },
  [TokenType.LESS_THAN]: {
    precedence: Precedence.Comparison,
    associativity: Associativity.Left,
    operator: BinaryOperator.LessThan,
  },
  [TokenType.GREATER_THAN]: {
    precedence: Precedence.Comparison,
    associativity: Associativity.Left,
    operator: BinaryOperator.GreaterThan,
  },
  [TokenType.LESS_EQUAL]: {
    precedence: Precedence.Comparison,
    associativity: Associativity.Left,
    operator: BinaryOperator.LessEqual,
  },
  [TokenType.GREATER_EQUAL]: {
    precedence: Precedence.Comparison,
    associativity: Associativity.Left,
    operator: BinaryOperator.GreaterEqual,
  },

  // String
  [TokenType.CONCAT]: {
    precedence: Precedence.Concat,
    associativity: Associativity.Left,
    operator: BinaryOperator.Concat,
  },

  // Arithmetic
  [TokenType.PLUS]: {
    precedence: Precedence.Term,
    associativity: Associativity.Left,
    operator: BinaryOperator.Add,
  },
  [TokenType.MINUS]: {
    precedence: Precedence.Term,
    associativity: Associativity.Left,
    operator: BinaryOperator.Subtract,
  },
  [TokenType.MULTIPLY]: {
    precedence: Precedence.Factor,
    associativity: Associativity.Left,
    operator: BinaryOperator.Multiply,
  },
  [TokenType.DIVIDE]: {
    precedence: Precedence.Factor,
    associativity: Associativity.Left,
    operator: BinaryOperator.Divide,
  },
  [TokenType.MOD]: {
    precedence: Precedence.Factor,
    associativity: Associativity.Left,
    operator: BinaryOperator.Mod,
  },

  // Power (right associative: 2^3^4 = 2^(3^4))
  [TokenType.POWER]: {
    precedence: Precedence.Power,
    associativity: Associativity.Right,
    operator: BinaryOperator.Power,
  },
};

/**
 * Unary operator info
 */
export interface UnaryOperatorInfo {
  precedence: Precedence;
  operator: UnaryOperator;
}

/**
 * Map of token types to unary operator info (prefix)
 */
export const PREFIX_OPERATORS: Partial<Record<TokenType, UnaryOperatorInfo>> = {
  [TokenType.NOT]: {
    precedence: Precedence.Unary,
    operator: UnaryOperator.Not,
  },
  [TokenType.MINUS]: {
    precedence: Precedence.Unary,
    operator: UnaryOperator.Negate,
  },
};

/**
 * Get binary operator info for a token type
 */
export function getBinaryOperatorInfo(tokenType: TokenType): BinaryOperatorInfo | undefined {
  return BINARY_OPERATORS[tokenType];
}

/**
 * Get prefix operator info for a token type
 */
export function getPrefixOperatorInfo(tokenType: TokenType): UnaryOperatorInfo | undefined {
  return PREFIX_OPERATORS[tokenType];
}

/**
 * Check if token type is a binary operator
 */
export function isBinaryOperator(tokenType: TokenType): boolean {
  return tokenType in BINARY_OPERATORS;
}

/**
 * Check if token type is a prefix operator
 */
export function isPrefixOperator(tokenType: TokenType): boolean {
  return tokenType in PREFIX_OPERATORS;
}

/**
 * Get precedence for a binary operator token
 */
export function getOperatorPrecedence(tokenType: TokenType): Precedence {
  return BINARY_OPERATORS[tokenType]?.precedence ?? Precedence.None;
}
