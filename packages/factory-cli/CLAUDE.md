# Factory CLI - CLAUDE.md

## Package

- **Name**: `@magic-migration/factory`
- **Path**: `packages/factory-cli/`
- **Role**: Reusable migration factory CLI - extract legacy systems into modern web apps module by module

## Commands

```bash
# Build
pnpm build          # tsc

# Test
pnpm test           # vitest run
pnpm test:watch     # vitest (watch mode)

# Typecheck
pnpm typecheck      # tsc --noEmit
```

## Architecture

```
src/
  cli.ts              # CLI entry point (15 commands)
  core/               # Contract, status, types
  adapters/           # Magic adapter, generic adapter
  calculators/        # Batch planner, effort estimator, module calculator, etc.
  coherence/          # Coherence checks
  dashboard/          # Console dashboard
  generators/         # Code generation (contracts -> React/TS scaffolds)
  migrate/            # 15-phase migration pipeline
  orchestrator/       # Pipeline orchestrator (run/status/preflight)
  pipeline/           # Pipeline stages (extract, map, gap, contract, enrich, verify)
  server/             # Dashboard HTTP server + SSE streaming + REST API
tests/                # Vitest tests (458 tests)
templates/            # Code generation templates
```

## Key Concepts

- **SPECMAP Pipeline**: `pending -> contracted -> enriched -> verified`
- **6 stages per program**: EXTRACT -> MAP -> GAP -> CONTRACT -> ENRICH -> VERIFY
- **Batches**: Groups of programs processed together (maxBatchSize=25)
- **Contracts**: Specification files (YAML) describing program behavior for migration

## Stack

- TypeScript 5.9+ (erasableSyntaxOnly)
- Node 22+ (ES2022 target, Node16 module resolution)
- Vitest for tests
- Chalk for CLI output
- YAML for contract format

## Rules

- Tests in `tests/` directory (not co-located)
- No `any` - use `unknown` or precise types
- `erasableSyntaxOnly`: use `as const` objects instead of TS enums
- All CLI commands must be testable without side effects (dry-run support)
- Product-oriented: every improvement must be generic, scriptable, documented
