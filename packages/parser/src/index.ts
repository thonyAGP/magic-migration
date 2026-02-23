/**
 * Magic Unipaas Expression Parser
 *
 * A complete parser for Magic Unipaas v12.03 expression syntax.
 * Supports parsing, AST manipulation, and code generation to TypeScript, C#, and Python.
 *
 * @example
 * ```typescript
 * import { parse, generateTypeScript } from './parser';
 *
 * const ast = parse("IF({0,1} > 10, 'Yes', 'No')");
 * const code = generateTypeScript(ast);
 * console.log(code); // (fields?.v1 > 10 ? 'Yes' : 'No')
 * ```
 *
 * @module magic-parser
 */

// ===== Types =====
export {
  // Token types
  TokenType,
  SpecialRefType,
  Token,
  TokenPosition,
  NumberToken,
  StringToken,
  BooleanToken,
  FieldRefToken,
  SpecialRefToken,
  isNumberToken,
  isStringToken,
  isBooleanToken,
  isFieldRefToken,
  isSpecialRefToken,
  isKeywordOperator,
  getKeywordOperatorType,
} from './types/tokens';

export {
  // AST types
  ASTNode,
  ASTNodeKind,
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
  AST,
  // Type guards
  isNumberLiteral,
  isStringLiteral,
  isBooleanLiteral,
  isFieldReference,
  isSpecialReference,
  isBinaryExpression,
  isUnaryExpression,
  isFunctionCall,
  isIdentifier,
} from './types/ast';

export {
  // Error types
  MagicParserError,
  LexError,
  ParseError,
  CodeGenError,
} from './types/errors';

// ===== Lexer =====
export { Lexer, tokenize, LexerOptions } from './lexer/lexer';
export { decodeXmlEntities, encodeXmlEntities, hasXmlEntities } from './lexer/xml-decoder';

// ===== Parser =====
export { Parser, parse, tryParse, ParserOptions } from './parser/parser';
export {
  Precedence,
  Associativity,
  BinaryOperatorInfo,
  UnaryOperatorInfo,
  getBinaryOperatorInfo,
  getPrefixOperatorInfo,
  isBinaryOperator,
  isPrefixOperator,
  getOperatorPrecedence,
} from './parser/operator-precedence';

// ===== Functions =====
export {
  MagicFunction,
  ParamType,
  FunctionCategory,
  functionRegistry,
  getFunction,
  functionExists,
  getAllFunctions,
} from './functions/function-registry';

// ===== Visitors =====
export { ASTVisitor, BaseVisitor, visit, PrettyPrinter, printAST } from './visitor/visitor';

export {
  TypeScriptGenerator,
  TypeScriptGeneratorOptions,
  generateTypeScript,
} from './visitor/typescript-generator';

export {
  CSharpGenerator,
  CSharpGeneratorOptions,
  generateCSharp,
} from './visitor/csharp-generator';

export {
  PythonGenerator,
  PythonGeneratorOptions,
  generatePython,
  getPythonImports,
} from './visitor/python-generator';

// ===== Convenience API =====

/**
 * Parse a Magic expression and generate code for the specified target language.
 *
 * @param source - The Magic expression to parse
 * @param target - Target language: 'typescript', 'csharp', or 'python'
 * @param options - Generator options
 * @returns Generated code string
 *
 * @example
 * ```typescript
 * const tsCode = convert("IF({0,1} > 10, 'Yes', 'No')", 'typescript');
 * const csCode = convert("Trim({0,5})", 'csharp');
 * const pyCode = convert("Upper({32768,10})", 'python');
 * ```
 */
export function convert(
  source: string,
  target: 'typescript' | 'csharp' | 'python',
  options?: TypeScriptGeneratorOptions | CSharpGeneratorOptions | PythonGeneratorOptions
): string {
  const ast = parse(source);

  switch (target) {
    case 'typescript':
      return generateTypeScript(ast, options as TypeScriptGeneratorOptions);
    case 'csharp':
      return generateCSharp(ast, options as CSharpGeneratorOptions);
    case 'python':
      return generatePython(ast, options as PythonGeneratorOptions);
    default:
      throw new Error(`Unknown target language: ${target}`);
  }
}

/**
 * Parse and analyze a Magic expression.
 *
 * @param source - The Magic expression to analyze
 * @returns Analysis result with AST and metadata
 *
 * @example
 * ```typescript
 * const result = analyze("IF({0,1} > 10, Trim({0,2}), '')");
 * console.log(result.functions); // ['IF', 'Trim']
 * console.log(result.fieldRefs); // [{context: 0, field: 1}, {context: 0, field: 2}]
 * ```
 */
export function analyze(source: string): {
  ast: Expression;
  functions: string[];
  fieldRefs: Array<{ context: number; field: number }>;
  specialRefs: Array<{ type: string; id: number; comp: number }>;
  hasMainProgramRefs: boolean;
} {
  const ast = parse(source);

  const functions: string[] = [];
  const fieldRefs: Array<{ context: number; field: number }> = [];
  const specialRefs: Array<{ type: string; id: number; comp: number }> = [];
  let hasMainProgramRefs = false;

  // Traverse AST to collect information
  function traverse(node: Expression): void {
    if (isFunctionCall(node)) {
      functions.push(node.name);
      node.arguments.forEach(traverse);
    } else if (isFieldReference(node)) {
      fieldRefs.push({ context: node.context, field: node.field });
      if (node.context === 32768) {
        hasMainProgramRefs = true;
      }
    } else if (isSpecialReference(node)) {
      specialRefs.push({ type: node.refType, id: node.id, comp: node.comp });
    } else if (isBinaryExpression(node)) {
      traverse(node.left);
      traverse(node.right);
    } else if (isUnaryExpression(node)) {
      traverse(node.operand);
    }
  }

  traverse(ast);

  return {
    ast,
    functions: [...new Set(functions)],
    fieldRefs,
    specialRefs,
    hasMainProgramRefs,
  };
}

// Local imports for convenience API functions
import { parse } from './parser/parser';
import { generateTypeScript } from './visitor/typescript-generator';
import { generateCSharp } from './visitor/csharp-generator';
import { generatePython } from './visitor/python-generator';
import {
  isFunctionCall,
  isFieldReference,
  isSpecialReference,
  isBinaryExpression,
  isUnaryExpression,
} from './types/ast';
import type { TypeScriptGeneratorOptions } from './visitor/typescript-generator';
import type { CSharpGeneratorOptions } from './visitor/csharp-generator';
import type { PythonGeneratorOptions } from './visitor/python-generator';
