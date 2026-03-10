/**
 * Magic Expression Parser - Unit Tests
 */

import {
  parse,
  tryParse,
  tokenize,
  generateTypeScript,
  generateCSharp,
  generatePython,
  analyze,
  convert,
  printAST,
  ASTNodeKind,
  TokenType,
  BinaryOperator,
  UnaryOperator,
  SpecialRefType,
  decodeXmlEntities,
  functionExists,
  getFunction,
} from '../index';

describe('XML Decoder', () => {
  test('should decode basic XML entities', () => {
    expect(decodeXmlEntities('A &lt; B')).toBe('A < B');
    expect(decodeXmlEntities('A &gt; B')).toBe('A > B');
    expect(decodeXmlEntities('A &amp; B')).toBe('A & B');
    expect(decodeXmlEntities('&quot;text&quot;')).toBe('"text"');
    expect(decodeXmlEntities('&apos;text&apos;')).toBe("'text'");
  });

  test('should decode multiple entities', () => {
    expect(decodeXmlEntities('A &lt;&gt; B')).toBe('A <> B');
    expect(decodeXmlEntities('{0,1} &lt;= {0,2}')).toBe('{0,1} <= {0,2}');
  });
});

describe('Lexer', () => {
  test('should tokenize numbers', () => {
    const tokens = tokenize('123');
    expect(tokens[0]!.type).toBe(TokenType.NUMBER);
    expect(tokens[0]!.value).toBe('123');
  });

  test('should tokenize decimal numbers', () => {
    const tokens = tokenize('45.67');
    expect(tokens[0]!.type).toBe(TokenType.NUMBER);
    expect(tokens[0]!.value).toBe('45.67');
  });

  test('should tokenize strings', () => {
    const tokens = tokenize("'hello'");
    expect(tokens[0]!.type).toBe(TokenType.STRING);
  });

  test('should tokenize field references', () => {
    const tokens = tokenize('{0,5}');
    expect(tokens[0]!.type).toBe(TokenType.FIELD_REF);
  });

  test('should tokenize main program references', () => {
    const tokens = tokenize('{32768,138}');
    expect(tokens[0]!.type).toBe(TokenType.FIELD_REF);
  });

  test('should tokenize boolean literals', () => {
    const tokens = tokenize("'TRUE'LOG");
    expect(tokens[0]!.type).toBe(TokenType.BOOLEAN);
  });

  test('should tokenize special references', () => {
    const tokens = tokenize("'{493,-1}'PROG");
    expect(tokens[0]!.type).toBe(TokenType.SPECIAL_REF);
  });

  test('should tokenize operators', () => {
    const tokens = tokenize('+ - * / ^ & = <> < > <= >=');
    expect(tokens[0]!.type).toBe(TokenType.PLUS);
    expect(tokens[1]!.type).toBe(TokenType.MINUS);
    expect(tokens[2]!.type).toBe(TokenType.MULTIPLY);
    expect(tokens[3]!.type).toBe(TokenType.DIVIDE);
    expect(tokens[4]!.type).toBe(TokenType.POWER);
    expect(tokens[5]!.type).toBe(TokenType.CONCAT);
    expect(tokens[6]!.type).toBe(TokenType.EQUAL);
    expect(tokens[7]!.type).toBe(TokenType.NOT_EQUAL);
    expect(tokens[8]!.type).toBe(TokenType.LESS_THAN);
    expect(tokens[9]!.type).toBe(TokenType.GREATER_THAN);
    expect(tokens[10]!.type).toBe(TokenType.LESS_EQUAL);
    expect(tokens[11]!.type).toBe(TokenType.GREATER_EQUAL);
  });

  test('should tokenize keyword operators', () => {
    const tokens = tokenize('AND OR NOT MOD');
    expect(tokens[0]!.type).toBe(TokenType.AND);
    expect(tokens[1]!.type).toBe(TokenType.OR);
    expect(tokens[2]!.type).toBe(TokenType.NOT);
    expect(tokens[3]!.type).toBe(TokenType.MOD);
  });

  test('should tokenize function calls', () => {
    const tokens = tokenize('IF(1, 2, 3)');
    expect(tokens[0]!.type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0]!.value).toBe('IF');
    expect(tokens[1]!.type).toBe(TokenType.LPAREN);
  });
});

describe('Parser', () => {
  test('should parse number literals', () => {
    const ast = parse('42');
    expect(ast.kind).toBe(ASTNodeKind.NumberLiteral);
    if (ast.kind === ASTNodeKind.NumberLiteral) {
      expect(ast.value).toBe(42);
    }
  });

  test('should parse string literals', () => {
    const ast = parse("'hello'");
    expect(ast.kind).toBe(ASTNodeKind.StringLiteral);
    if (ast.kind === ASTNodeKind.StringLiteral) {
      expect(ast.value).toBe('hello');
    }
  });

  test('should parse boolean literals', () => {
    const ast = parse("'TRUE'LOG");
    expect(ast.kind).toBe(ASTNodeKind.BooleanLiteral);
    if (ast.kind === ASTNodeKind.BooleanLiteral) {
      expect(ast.value).toBe(true);
    }
  });

  test('should parse field references', () => {
    const ast = parse('{0,5}');
    expect(ast.kind).toBe(ASTNodeKind.FieldReference);
    if (ast.kind === ASTNodeKind.FieldReference) {
      expect(ast.context).toBe(0);
      expect(ast.field).toBe(5);
    }
  });

  test('should parse special references', () => {
    const ast = parse("'{493,-1}'PROG");
    expect(ast.kind).toBe(ASTNodeKind.SpecialReference);
    if (ast.kind === ASTNodeKind.SpecialReference) {
      expect(ast.refType).toBe(SpecialRefType.PROG);
      expect(ast.id).toBe(493);
      expect(ast.comp).toBe(-1);
    }
  });

  test('should parse binary expressions', () => {
    const ast = parse('1 + 2');
    expect(ast.kind).toBe(ASTNodeKind.BinaryExpression);
    if (ast.kind === ASTNodeKind.BinaryExpression) {
      expect(ast.operator).toBe(BinaryOperator.Add);
    }
  });

  test('should parse unary expressions', () => {
    const ast = parse('-5');
    expect(ast.kind).toBe(ASTNodeKind.UnaryExpression);
    if (ast.kind === ASTNodeKind.UnaryExpression) {
      expect(ast.operator).toBe(UnaryOperator.Negate);
    }
  });

  test('should parse function calls', () => {
    const ast = parse('Trim({0,1})');
    expect(ast.kind).toBe(ASTNodeKind.FunctionCall);
    if (ast.kind === ASTNodeKind.FunctionCall) {
      expect(ast.name).toBe('Trim');
      expect(ast.arguments.length).toBe(1);
    }
  });

  test('should handle operator precedence', () => {
    // 2 + 3 * 4 should be parsed as 2 + (3 * 4)
    const ast = parse('2 + 3 * 4');
    expect(ast.kind).toBe(ASTNodeKind.BinaryExpression);
    if (ast.kind === ASTNodeKind.BinaryExpression) {
      expect(ast.operator).toBe(BinaryOperator.Add);
      expect(ast.right.kind).toBe(ASTNodeKind.BinaryExpression);
    }
  });

  test('should handle parentheses', () => {
    const ast = parse('(2 + 3) * 4');
    expect(ast.kind).toBe(ASTNodeKind.BinaryExpression);
    if (ast.kind === ASTNodeKind.BinaryExpression) {
      expect(ast.operator).toBe(BinaryOperator.Multiply);
      expect(ast.left.kind).toBe(ASTNodeKind.BinaryExpression);
    }
  });

  test('should parse complex IF expressions', () => {
    const ast = parse("IF({0,1} > 10, 'Yes', 'No')");
    expect(ast.kind).toBe(ASTNodeKind.FunctionCall);
    if (ast.kind === ASTNodeKind.FunctionCall) {
      expect(ast.name).toBe('IF');
      expect(ast.arguments.length).toBe(3);
    }
  });

  test('should parse nested function calls', () => {
    const ast = parse('Upper(Trim({0,1}))');
    expect(ast.kind).toBe(ASTNodeKind.FunctionCall);
    if (ast.kind === ASTNodeKind.FunctionCall) {
      expect(ast.name).toBe('Upper');
      expect(ast.arguments[0]!.kind).toBe(ASTNodeKind.FunctionCall);
    }
  });

  test('should handle XML entities', () => {
    const ast = parse('{0,1} &lt; 10');
    expect(ast.kind).toBe(ASTNodeKind.BinaryExpression);
    if (ast.kind === ASTNodeKind.BinaryExpression) {
      expect(ast.operator).toBe(BinaryOperator.LessThan);
    }
  });
});

describe('tryParse', () => {
  test('should return success for valid expressions', () => {
    const result = tryParse('1 + 2');
    expect(result.success).toBe(true);
  });

  test('should return error for invalid expressions', () => {
    const result = tryParse('1 + + 2');
    expect(result.success).toBe(false);
  });
});

describe('TypeScript Generator', () => {
  test('should generate field reference', () => {
    const code = generateTypeScript(parse('{0,5}'));
    expect(code).toBe('fields?.v5');
  });

  test('should generate main program reference', () => {
    const code = generateTypeScript(parse('{32768,138}'));
    expect(code).toBe('mainProgram?.v138');
  });

  test('should generate binary expression', () => {
    const code = generateTypeScript(parse('1 + 2'));
    expect(code).toBe('(1 + 2)');
  });

  test('should generate IF function', () => {
    const code = generateTypeScript(parse("IF({0,1} > 10, 'Yes', 'No')"));
    expect(code).toContain('?');
    expect(code).toContain(':');
  });

  test('should generate Trim function', () => {
    const code = generateTypeScript(parse('Trim({0,1})'));
    expect(code).toContain('.trim()');
  });

  test('should generate comparison operators', () => {
    expect(generateTypeScript(parse('1 = 2'))).toBe('(1 === 2)');
    expect(generateTypeScript(parse('1 <> 2'))).toBe('(1 !== 2)');
  });
});

describe('C# Generator', () => {
  test('should generate field reference', () => {
    const code = generateCSharp(parse('{0,5}'));
    expect(code).toBe('Fields?.V5');
  });

  test('should generate decimal suffix for numbers', () => {
    const code = generateCSharp(parse('45.67'));
    expect(code).toBe('45.67m');
  });

  test('should generate Math.Pow for power operator', () => {
    const code = generateCSharp(parse('2 ^ 3'));
    expect(code).toBe('Math.Pow(2, 3)');
  });

  test('should generate Trim function', () => {
    const code = generateCSharp(parse('Trim({0,1})'));
    expect(code).toContain('.Trim()');
  });
});

describe('Python Generator', () => {
  test('should generate field reference', () => {
    const code = generatePython(parse('{0,5}'));
    expect(code).toBe('fields.v5');
  });

  test('should generate boolean literals', () => {
    expect(generatePython(parse("'TRUE'LOG"))).toBe('True');
    expect(generatePython(parse("'FALSE'LOG"))).toBe('False');
  });

  test('should generate power operator', () => {
    const code = generatePython(parse('2 ^ 3'));
    expect(code).toBe('(2 ** 3)');
  });

  test('should generate logical operators', () => {
    expect(generatePython(parse("'TRUE'LOG AND 'FALSE'LOG"))).toContain('and');
    expect(generatePython(parse("'TRUE'LOG OR 'FALSE'LOG"))).toContain('or');
  });

  test('should generate Trim function', () => {
    const code = generatePython(parse('Trim({0,1})'));
    expect(code).toContain('.strip()');
  });
});

describe('convert function', () => {
  test('should convert to TypeScript', () => {
    const code = convert('Trim({0,1})', 'typescript');
    expect(code).toContain('.trim()');
  });

  test('should convert to C#', () => {
    const code = convert('Trim({0,1})', 'csharp');
    expect(code).toContain('.Trim()');
  });

  test('should convert to Python', () => {
    const code = convert('Trim({0,1})', 'python');
    expect(code).toContain('.strip()');
  });
});

describe('analyze function', () => {
  test('should extract functions', () => {
    const result = analyze("IF({0,1} > 10, Trim({0,2}), '')");
    expect(result.functions).toContain('IF');
    expect(result.functions).toContain('Trim');
  });

  test('should extract field references', () => {
    const result = analyze('{0,1} + {0,2}');
    expect(result.fieldRefs).toHaveLength(2);
    expect(result.fieldRefs[0]!).toEqual({ context: 0, field: 1 });
    expect(result.fieldRefs[1]!).toEqual({ context: 0, field: 2 });
  });

  test('should detect main program references', () => {
    const result = analyze('{32768,138}');
    expect(result.hasMainProgramRefs).toBe(true);
  });
});

describe('Function Registry', () => {
  test('should have common functions', () => {
    expect(functionExists('Trim')).toBe(true);
    expect(functionExists('IF')).toBe(true);
    expect(functionExists('GetParam')).toBe(true);
    expect(functionExists('Date')).toBe(true);
  });

  test('should be case insensitive', () => {
    expect(functionExists('TRIM')).toBe(true);
    expect(functionExists('trim')).toBe(true);
    expect(functionExists('TrIm')).toBe(true);
  });

  test('should return function info', () => {
    const func = getFunction('IF');
    expect(func).toBeDefined();
    expect(func?.minArgs).toBe(3);
    expect(func?.maxArgs).toBe(3);
  });
});

describe('printAST', () => {
  test('should print AST for debugging', () => {
    const output = printAST(parse('1 + 2'));
    expect(output).toContain('BinaryExpr');
    expect(output).toContain('NumberLiteral');
  });
});

describe('Real World Expressions', () => {
  const realExpressions = [
    // Simple expressions
    "{0,1} = ''",
    "Trim({0,5}) <> ''",
    '{0,10} > 0',

    // Date expressions
    "DStr({0,1},'YYYYMMDD')",
    "DStr(Date(),'DD/MM/YYYY')",

    // String concatenation
    "Trim({0,1}) & ' ' & Trim({0,2})",

    // Complex conditions
    "{0,1} = 'A' OR {0,1} = 'B'",
    "{0,1} > 0 AND {0,2} <> ''",

    // Nested functions
    'Upper(Trim({0,1}))',
    "IF({0,1} > 0, Str({0,1}, '8'), '')",

    // Main program references
    '{32768,138}',
    "IF({32768,42}, 'Yes', 'No')",

    // Special references
    "'{493,-1}'PROG",
    "'{38,2}'DSOURCE",
  ];

  realExpressions.forEach((expr) => {
    test(`should parse: ${expr}`, () => {
      expect(() => parse(expr)).not.toThrow();
    });
  });
});
