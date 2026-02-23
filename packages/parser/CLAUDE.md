# Magic Parser - CLAUDE.md

## Package

- **Name**: `@magic-migration/parser`
- **Path**: `packages/parser/`
- **Role**: Complete parser for Magic Unipaas v12.03 expression syntax with AST manipulation and multi-target code generation

## Commands

```bash
# Test (from monorepo root)
pnpm --filter @magic-migration/parser test

# Typecheck
pnpm --filter @magic-migration/parser typecheck
```

## Architecture

```
src/
  index.ts          # Public API - all exports
  types/            # Token types, AST node types, special refs
  lexer/            # Tokenizer for Magic expressions
  parser/           # Recursive descent parser -> AST
  functions/        # Magic function implementations (300+ functions)
  visitor/          # AST visitors + code generators (TypeScript, C#, Python)
  __tests__/        # Unit tests
```

## Key Concepts

- **Magic Expressions**: `IF({0,1} > 10, 'Yes', 'No')` where `{0,1}` is a field reference
- **Field references**: `{group,index}` notation (e.g., `{0,3}` = variable D)
- **Special refs**: Variables globales (VG), task params, etc.
- **Code generation targets**: TypeScript, C#, Python

## Stack

- TypeScript (strict mode)
- Vitest for tests

## Rules

- Pure functional approach - no side effects in parser/lexer
- All Magic functions must be documented with their Magic signature
- Field reference to letter conversion: `FieldN -> Letter(N)` where N=1->A, N=27->AA, etc.
- No `any` types
