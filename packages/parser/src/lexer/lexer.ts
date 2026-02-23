/**
 * Magic Unipaas Expression Parser - Lexer
 *
 * Tokenizes Magic expression strings into a stream of tokens.
 */

import {
  Token,
  TokenType,
  TokenPosition,
  FieldRefToken,
  SpecialRefToken,
  SpecialRefType,
  NumberToken,
  StringToken,
  BooleanToken,
  KEYWORD_OPERATORS,
} from '../types/tokens';
import { LexError } from '../types/errors';
import { decodeXmlEntities } from './xml-decoder';

/**
 * Lexer configuration options
 */
export interface LexerOptions {
  /** Decode XML entities before tokenizing (default: true) */
  decodeXml?: boolean;
  /** Skip whitespace tokens (default: true) */
  skipWhitespace?: boolean;
}

/**
 * Magic Expression Lexer
 *
 * Converts a Magic expression string into tokens.
 *
 * @example
 * const lexer = new Lexer("IF({0,1} > 10, 'Yes', 'No')");
 * const tokens = lexer.tokenize();
 */
export class Lexer {
  private readonly source: string;
  private readonly originalSource: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private readonly options: Required<LexerOptions>;

  constructor(source: string, options: LexerOptions = {}) {
    this.originalSource = source;
    this.options = {
      decodeXml: options.decodeXml ?? true,
      skipWhitespace: options.skipWhitespace ?? true,
    };
    this.source = this.options.decodeXml ? decodeXmlEntities(source) : source;
  }

  /**
   * Get current position
   */
  private getPosition(): TokenPosition {
    return {
      line: this.line,
      column: this.column,
      offset: this.pos,
    };
  }

  /**
   * Check if at end of input
   */
  private isEOF(): boolean {
    return this.pos >= this.source.length;
  }

  /**
   * Get current character without advancing
   */
  private peek(offset: number = 0): string {
    return this.source[this.pos + offset] ?? '';
  }

  /**
   * Advance position and return current character
   */
  private advance(): string {
    const char = this.source[this.pos];
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  /**
   * Skip whitespace characters
   */
  private skipWhitespace(): void {
    while (!this.isEOF() && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  /**
   * Check if character is a digit
   */
  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  /**
   * Check if character can start an identifier
   */
  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  /**
   * Check if character can be part of an identifier
   */
  private isIdentifierPart(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  /**
   * Read a number token
   */
  private readNumber(): NumberToken {
    const startPos = this.getPosition();
    let value = '';

    // Integer part
    while (!this.isEOF() && this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Decimal part
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      value += this.advance(); // '.'
      while (!this.isEOF() && this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      throw LexError.invalidNumber(value, startPos, this.originalSource);
    }

    return {
      type: TokenType.NUMBER,
      value,
      position: startPos,
      numericValue,
    };
  }

  /**
   * Read a string token: 'text'
   * Also handles special typed literals like 'TRUE'LOG, 'value'PROG, etc.
   */
  private readString(): StringToken | BooleanToken | SpecialRefToken {
    const startPos = this.getPosition();
    this.advance(); // Skip opening quote

    let value = '';
    while (!this.isEOF() && this.peek() !== "'") {
      // Handle escaped quotes
      if (this.peek() === "'" && this.peek(1) === "'") {
        value += "'";
        this.advance();
        this.advance();
      } else {
        value += this.advance();
      }
    }

    if (this.isEOF()) {
      throw LexError.unterminatedString(startPos, this.originalSource);
    }

    this.advance(); // Skip closing quote

    // Check for type suffix
    const suffix = this.readTypeSuffix();

    if (suffix) {
      return this.createTypedToken(value, suffix, startPos);
    }

    return {
      type: TokenType.STRING,
      value: `'${value}'`,
      position: startPos,
      stringValue: value,
    };
  }

  /**
   * Read type suffix after string literal (PROG, DSOURCE, VAR, FORM, LOG)
   */
  private readTypeSuffix(): string | null {
    // Check for type suffix (PROG, DSOURCE, VAR, FORM, LOG)
    const suffixes = ['DSOURCE', 'PROG', 'FORM', 'VAR', 'LOG'];
    for (const suffix of suffixes) {
      if (this.matchAhead(suffix)) {
        // Consume the suffix
        for (let i = 0; i < suffix.length; i++) {
          this.advance();
        }
        return suffix;
      }
    }
    return null;
  }

  /**
   * Check if upcoming characters match given string (case-insensitive)
   */
  private matchAhead(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      const char = this.peek(i);
      if (char.toUpperCase() !== str[i].toUpperCase()) {
        return false;
      }
    }
    // Make sure it's not part of a longer identifier
    const nextChar = this.peek(str.length);
    return !this.isIdentifierPart(nextChar);
  }

  /**
   * Create typed token from string value and suffix
   */
  private createTypedToken(
    value: string,
    suffix: string,
    position: TokenPosition
  ): BooleanToken | SpecialRefToken {
    const upperSuffix = suffix.toUpperCase();

    // Boolean literal: 'TRUE'LOG or 'FALSE'LOG
    if (upperSuffix === 'LOG') {
      const upperValue = value.toUpperCase();
      if (upperValue === 'TRUE' || upperValue === 'FALSE') {
        return {
          type: TokenType.BOOLEAN,
          value: `'${value}'${suffix}`,
          position,
          booleanValue: upperValue === 'TRUE',
        };
      }
      throw LexError.invalidSpecialReference(value, position, this.originalSource);
    }

    // Special reference: '{id,comp}'TYPE
    const match = value.match(/^\{(-?\d+),(-?\d+)\}$/);
    if (!match) {
      throw LexError.invalidSpecialReference(value, position, this.originalSource);
    }

    const refType = this.parseSpecialRefType(upperSuffix, position);

    return {
      type: TokenType.SPECIAL_REF,
      value: `'${value}'${suffix}`,
      position,
      refType,
      id: parseInt(match[1], 10),
      comp: parseInt(match[2], 10),
    };
  }

  /**
   * Parse special reference type from suffix
   */
  private parseSpecialRefType(suffix: string, position: TokenPosition): SpecialRefType {
    switch (suffix) {
      case 'PROG':
        return SpecialRefType.PROG;
      case 'DSOURCE':
        return SpecialRefType.DSOURCE;
      case 'VAR':
        return SpecialRefType.VAR;
      case 'FORM':
        return SpecialRefType.FORM;
      default:
        throw LexError.unknownSpecialRefType(suffix, position, this.originalSource);
    }
  }

  /**
   * Read a field reference: {context,field}
   */
  private readFieldReference(): FieldRefToken {
    const startPos = this.getPosition();
    this.advance(); // Skip '{'

    // Read context number
    let context = '';
    while (!this.isEOF() && this.peek() !== ',') {
      context += this.advance();
    }

    if (this.peek() !== ',') {
      throw LexError.invalidFieldReference(`{${context}`, startPos, this.originalSource);
    }
    this.advance(); // Skip ','

    // Read field number
    let field = '';
    while (!this.isEOF() && this.peek() !== '}') {
      field += this.advance();
    }

    if (this.peek() !== '}') {
      throw LexError.invalidFieldReference(`{${context},${field}`, startPos, this.originalSource);
    }
    this.advance(); // Skip '}'

    const contextNum = parseInt(context.trim(), 10);
    const fieldNum = parseInt(field.trim(), 10);

    if (isNaN(contextNum) || isNaN(fieldNum)) {
      throw LexError.invalidFieldReference(
        `{${context},${field}}`,
        startPos,
        this.originalSource
      );
    }

    return {
      type: TokenType.FIELD_REF,
      value: `{${context},${field}}`,
      position: startPos,
      context: contextNum,
      field: fieldNum,
    };
  }

  /**
   * Read an identifier (function name, keyword, etc.)
   */
  private readIdentifier(): Token {
    const startPos = this.getPosition();
    let value = '';

    while (!this.isEOF() && this.isIdentifierPart(this.peek())) {
      value += this.advance();
    }

    // Check if it's a keyword operator
    const upperValue = value.toUpperCase();
    if (upperValue in KEYWORD_OPERATORS) {
      return {
        type: KEYWORD_OPERATORS[upperValue],
        value,
        position: startPos,
      };
    }

    return {
      type: TokenType.IDENTIFIER,
      value,
      position: startPos,
    };
  }

  /**
   * Read a two-character operator
   */
  private readOperator(): Token {
    const startPos = this.getPosition();
    const char = this.peek();
    const nextChar = this.peek(1);

    // Two-character operators
    const twoChar = char + nextChar;
    if (twoChar === '<>' || twoChar === '<=' || twoChar === '>=') {
      this.advance();
      this.advance();
      const type =
        twoChar === '<>'
          ? TokenType.NOT_EQUAL
          : twoChar === '<='
            ? TokenType.LESS_EQUAL
            : TokenType.GREATER_EQUAL;
      return { type, value: twoChar, position: startPos };
    }

    // Single-character operators
    this.advance();
    const operatorMap: Record<string, TokenType> = {
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '^': TokenType.POWER,
      '&': TokenType.CONCAT,
      '=': TokenType.EQUAL,
      '<': TokenType.LESS_THAN,
      '>': TokenType.GREATER_THAN,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      ',': TokenType.COMMA,
    };

    const type = operatorMap[char];
    if (type) {
      return { type, value: char, position: startPos };
    }

    throw LexError.unexpectedCharacter(char, startPos, this.originalSource);
  }

  /**
   * Read next token
   */
  private readToken(): Token {
    if (this.options.skipWhitespace) {
      this.skipWhitespace();
    }

    if (this.isEOF()) {
      return {
        type: TokenType.EOF,
        value: '',
        position: this.getPosition(),
      };
    }

    const char = this.peek();

    // Number
    if (this.isDigit(char)) {
      return this.readNumber();
    }

    // String literal (and potentially typed literals)
    if (char === "'") {
      return this.readString();
    }

    // Field reference
    if (char === '{') {
      return this.readFieldReference();
    }

    // Identifier or keyword
    if (this.isIdentifierStart(char)) {
      return this.readIdentifier();
    }

    // Operators and delimiters
    return this.readOperator();
  }

  /**
   * Tokenize the entire input
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (true) {
      const token = this.readToken();
      tokens.push(token);

      if (token.type === TokenType.EOF) {
        break;
      }
    }

    return tokens;
  }

  /**
   * Create a generator for lazy tokenization
   */
  *tokens(): Generator<Token> {
    while (true) {
      const token = this.readToken();
      yield token;

      if (token.type === TokenType.EOF) {
        break;
      }
    }
  }
}

/**
 * Convenience function to tokenize an expression
 */
export function tokenize(source: string, options?: LexerOptions): Token[] {
  const lexer = new Lexer(source, options);
  return lexer.tokenize();
}
