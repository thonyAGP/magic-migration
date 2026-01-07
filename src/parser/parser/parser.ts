/**
 * Magic Unipaas Expression Parser - Pratt Parser
 *
 * Implements a Pratt parser (top-down operator precedence parser)
 * for Magic expression syntax.
 */

import {
  Token,
  TokenType,
  isNumberToken,
  isStringToken,
  isBooleanToken,
  isFieldRefToken,
  isSpecialRefToken,
} from '../types/tokens';
import {
  Expression,
  AST,
  ASTNodeKind,
} from '../types/ast';
import { ParseError } from '../types/errors';
import { Lexer, LexerOptions } from '../lexer/lexer';
import {
  Precedence,
  Associativity,
  getBinaryOperatorInfo,
  getPrefixOperatorInfo,
  getOperatorPrecedence,
} from './operator-precedence';

/**
 * Parser configuration options
 */
export interface ParserOptions extends LexerOptions {
  /** Allow unknown functions (default: true) */
  allowUnknownFunctions?: boolean;
}

/**
 * Magic Expression Parser
 *
 * Uses Pratt parsing technique for operator precedence.
 *
 * @example
 * const parser = new Parser("IF({0,1} > 10, 'Yes', 'No')");
 * const ast = parser.parse();
 */
export class Parser {
  private tokens: Token[];
  private pos: number = 0;
  private readonly source: string;
  private readonly options: Required<ParserOptions>;

  constructor(source: string, options: ParserOptions = {}) {
    this.source = source;
    this.options = {
      decodeXml: options.decodeXml ?? true,
      skipWhitespace: options.skipWhitespace ?? true,
      allowUnknownFunctions: options.allowUnknownFunctions ?? true,
    };

    const lexer = new Lexer(source, this.options);
    this.tokens = lexer.tokenize();
  }

  /**
   * Get current token
   */
  private current(): Token {
    return this.tokens[this.pos] ?? this.tokens[this.tokens.length - 1];
  }

  /**
   * Look ahead at future tokens
   */
  private peek(offset: number = 1): Token {
    const index = this.pos + offset;
    return this.tokens[index] ?? this.tokens[this.tokens.length - 1];
  }

  /**
   * Check if current token matches type
   */
  private check(type: TokenType): boolean {
    return this.current().type === type;
  }

  /**
   * Check if at end of tokens
   */
  private isAtEnd(): boolean {
    return this.current().type === TokenType.EOF;
  }

  /**
   * Advance to next token and return previous
   */
  private advance(): Token {
    if (!this.isAtEnd()) {
      this.pos++;
    }
    return this.tokens[this.pos - 1];
  }

  /**
   * Expect current token to be of given type
   */
  private expect(type: TokenType, message?: string): Token {
    if (!this.check(type)) {
      throw ParseError.expectedToken(type, this.current(), this.source);
    }
    return this.advance();
  }

  /**
   * Match and consume token if it matches type
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  /**
   * Parse the entire expression
   */
  parse(): Expression {
    const expr = this.parseExpression();

    if (!this.isAtEnd()) {
      throw ParseError.unexpectedToken(this.current(), 'end of expression', this.source);
    }

    return expr;
  }

  /**
   * Parse expression with given minimum precedence
   */
  private parseExpression(minPrecedence: Precedence = Precedence.None): Expression {
    let left = this.parsePrefixExpression();

    while (!this.isAtEnd()) {
      const operatorInfo = getBinaryOperatorInfo(this.current().type);
      if (!operatorInfo) {
        break;
      }

      // Check precedence
      if (operatorInfo.precedence < minPrecedence) {
        break;
      }

      // For left-associative operators, use higher precedence for right side
      // For right-associative, use same precedence
      const nextMinPrecedence =
        operatorInfo.associativity === Associativity.Left
          ? operatorInfo.precedence + 1
          : operatorInfo.precedence;

      const operatorToken = this.advance();
      const right = this.parseExpression(nextMinPrecedence);

      left = AST.binaryExpression(
        operatorInfo.operator,
        left,
        right,
        operatorToken.position
      );
    }

    return left;
  }

  /**
   * Parse prefix expression (unary or primary)
   */
  private parsePrefixExpression(): Expression {
    const prefixInfo = getPrefixOperatorInfo(this.current().type);

    if (prefixInfo) {
      const operatorToken = this.advance();
      const operand = this.parseExpression(prefixInfo.precedence);
      return AST.unaryExpression(prefixInfo.operator, operand, operatorToken.position);
    }

    return this.parsePrimaryExpression();
  }

  /**
   * Parse primary expression (literals, references, function calls, grouped)
   */
  private parsePrimaryExpression(): Expression {
    const token = this.current();

    // Number literal
    if (isNumberToken(token)) {
      this.advance();
      return AST.numberLiteral(token.numericValue, token.value, token.position);
    }

    // String literal
    if (isStringToken(token)) {
      this.advance();
      return AST.stringLiteral(token.stringValue, token.value, token.position);
    }

    // Boolean literal
    if (isBooleanToken(token)) {
      this.advance();
      return AST.booleanLiteral(token.booleanValue, token.position);
    }

    // Field reference
    if (isFieldRefToken(token)) {
      this.advance();
      return AST.fieldReference(token.context, token.field, token.position);
    }

    // Special reference
    if (isSpecialRefToken(token)) {
      this.advance();
      return AST.specialReference(token.refType, token.id, token.comp, token.position);
    }

    // Identifier (function call or just identifier)
    if (this.check(TokenType.IDENTIFIER)) {
      return this.parseIdentifierOrCall();
    }

    // Grouped expression
    if (this.check(TokenType.LPAREN)) {
      return this.parseGroupedExpression();
    }

    throw ParseError.unexpectedToken(token, 'expression', this.source);
  }

  /**
   * Parse identifier or function call
   */
  private parseIdentifierOrCall(): Expression {
    const nameToken = this.advance();
    const name = nameToken.value;

    // Check if it's a function call
    if (this.check(TokenType.LPAREN)) {
      return this.parseFunctionCall(name, nameToken);
    }

    // Just an identifier
    return AST.identifier(name, nameToken.position);
  }

  /**
   * Parse function call: FunctionName(arg1, arg2, ...)
   */
  private parseFunctionCall(name: string, nameToken: Token): Expression {
    this.expect(TokenType.LPAREN);

    const args: Expression[] = [];

    // Parse arguments
    if (!this.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    this.expect(TokenType.RPAREN);

    return AST.functionCall(name, args, nameToken.position);
  }

  /**
   * Parse grouped expression: (expression)
   */
  private parseGroupedExpression(): Expression {
    this.expect(TokenType.LPAREN);
    const expr = this.parseExpression();
    this.expect(TokenType.RPAREN);
    return expr;
  }
}

/**
 * Convenience function to parse an expression
 */
export function parse(source: string, options?: ParserOptions): Expression {
  const parser = new Parser(source, options);
  return parser.parse();
}

/**
 * Parse expression and return result or error
 */
export function tryParse(source: string, options?: ParserOptions): {
  success: true;
  ast: Expression;
} | {
  success: false;
  error: ParseError;
} {
  try {
    const ast = parse(source, options);
    return { success: true, ast };
  } catch (error) {
    if (error instanceof ParseError) {
      return { success: false, error };
    }
    throw error;
  }
}
