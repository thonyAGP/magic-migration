/**
 * Magic Unipaas Expression Parser - Error Types
 *
 * Custom error classes for lexer and parser errors.
 */

import { TokenPosition, Token, TokenType } from './tokens';

/**
 * Base class for all parser-related errors
 */
export abstract class MagicParserError extends Error {
  readonly position?: TokenPosition;
  readonly source?: string;

  constructor(message: string, position?: TokenPosition, source?: string) {
    super(message);
    this.name = this.constructor.name;
    this.position = position;
    this.source = source;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Format error message with position context
   */
  format(): string {
    let result = `${this.name}: ${this.message}`;

    if (this.position) {
      result += `\n  at line ${this.position.line}, column ${this.position.column}`;
    }

    if (this.source && this.position) {
      const lines = this.source.split('\n');
      const line = lines[this.position.line - 1];
      if (line) {
        result += `\n\n  ${line}`;
        result += `\n  ${' '.repeat(this.position.column - 1)}^`;
      }
    }

    return result;
  }
}

/**
 * Error during lexical analysis (tokenization)
 */
export class LexError extends MagicParserError {
  constructor(message: string, position?: TokenPosition, source?: string) {
    super(message, position, source);
  }

  /**
   * Create error for unexpected character
   */
  static unexpectedCharacter(char: string, position: TokenPosition, source?: string): LexError {
    return new LexError(`Unexpected character '${char}'`, position, source);
  }

  /**
   * Create error for unterminated string
   */
  static unterminatedString(position: TokenPosition, source?: string): LexError {
    return new LexError('Unterminated string literal', position, source);
  }

  /**
   * Create error for invalid number format
   */
  static invalidNumber(value: string, position: TokenPosition, source?: string): LexError {
    return new LexError(`Invalid number format '${value}'`, position, source);
  }

  /**
   * Create error for invalid field reference
   */
  static invalidFieldReference(value: string, position: TokenPosition, source?: string): LexError {
    return new LexError(`Invalid field reference '${value}'`, position, source);
  }

  /**
   * Create error for invalid special reference
   */
  static invalidSpecialReference(value: string, position: TokenPosition, source?: string): LexError {
    return new LexError(`Invalid special reference '${value}'`, position, source);
  }

  /**
   * Create error for unknown special reference type
   */
  static unknownSpecialRefType(type: string, position: TokenPosition, source?: string): LexError {
    return new LexError(`Unknown special reference type '${type}'`, position, source);
  }
}

/**
 * Error during parsing
 */
export class ParseError extends MagicParserError {
  readonly token?: Token;

  constructor(message: string, token?: Token, source?: string) {
    super(message, token?.position, source);
    this.token = token;
  }

  /**
   * Create error for unexpected token
   */
  static unexpectedToken(token: Token, expected?: string, source?: string): ParseError {
    const expectedPart = expected ? `, expected ${expected}` : '';
    return new ParseError(
      `Unexpected token '${token.value}' (${token.type})${expectedPart}`,
      token,
      source
    );
  }

  /**
   * Create error for expected token type
   */
  static expectedToken(
    expected: TokenType | TokenType[],
    actual: Token,
    source?: string
  ): ParseError {
    const expectedStr = Array.isArray(expected) ? expected.join(' or ') : expected;
    return new ParseError(
      `Expected ${expectedStr}, got '${actual.value}' (${actual.type})`,
      actual,
      source
    );
  }

  /**
   * Create error for unexpected end of input
   */
  static unexpectedEOF(position?: TokenPosition, source?: string): ParseError {
    const error = new ParseError('Unexpected end of expression', undefined, source);
    if (position) {
      (error as { position: TokenPosition }).position = position;
    }
    return error;
  }

  /**
   * Create error for invalid expression
   */
  static invalidExpression(message: string, token?: Token, source?: string): ParseError {
    return new ParseError(`Invalid expression: ${message}`, token, source);
  }

  /**
   * Create error for unknown function
   */
  static unknownFunction(name: string, token?: Token, source?: string): ParseError {
    return new ParseError(`Unknown function '${name}'`, token, source);
  }

  /**
   * Create error for wrong argument count
   */
  static wrongArgumentCount(
    functionName: string,
    expected: string,
    actual: number,
    token?: Token,
    source?: string
  ): ParseError {
    return new ParseError(
      `Function '${functionName}' expects ${expected} arguments, got ${actual}`,
      token,
      source
    );
  }
}

/**
 * Error during code generation
 */
export class CodeGenError extends MagicParserError {
  constructor(message: string, position?: TokenPosition, source?: string) {
    super(message, position, source);
  }

  /**
   * Create error for unsupported node type
   */
  static unsupportedNode(nodeKind: string, position?: TokenPosition, source?: string): CodeGenError {
    return new CodeGenError(`Unsupported AST node type '${nodeKind}'`, position, source);
  }

  /**
   * Create error for unsupported operator
   */
  static unsupportedOperator(
    operator: string,
    position?: TokenPosition,
    source?: string
  ): CodeGenError {
    return new CodeGenError(`Unsupported operator '${operator}'`, position, source);
  }

  /**
   * Create error for unmapped function
   */
  static unmappedFunction(
    functionName: string,
    position?: TokenPosition,
    source?: string
  ): CodeGenError {
    return new CodeGenError(
      `No mapping defined for function '${functionName}'`,
      position,
      source
    );
  }
}
