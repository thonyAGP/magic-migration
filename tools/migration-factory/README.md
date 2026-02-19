# Migration Factory

Reusable SPECMAP migration pipeline for extracting legacy systems into modern web applications, module by module.

## What It Does

Given a legacy application's program graph (call tree), the factory:

1. **Analyzes** dependencies: BFS traversal, Tarjan SCC detection, topological sort, level computation
2. **Contracts** each program: reads specs, scans target code, classifies gaps (IMPL/PARTIAL/MISSING/N/A)
3. **Enriches** target code based on contracts (via agent templates)
4. **Verifies** implementation fidelity against specs
5. **Identifies deliverable modules**: complete subtrees where 100% of programs are verified
6. **Suggests batches** from graph topology for team planning

## Quick Start

```bash
cd tools/migration-factory
npm install

# Initialize for your project
npx tsx src/cli.ts init --project /path/to/project --name "MyProject"

# Analyze the dependency graph
npx tsx src/cli.ts graph --project /path/to/project

# Auto-suggest migration batches
npx tsx src/cli.ts plan --project /path/to/project

# Show deliverable modules
npx tsx src/cli.ts modules --project /path/to/project

# Show progress dashboard
npx tsx src/cli.ts dashboard --project /path/to/project

# Generate HTML visual report
npx tsx src/cli.ts report --project /path/to/project --output report.html
```

## Architecture

```
src/
  core/           # Generic reusable logic
    types.ts      # All shared interfaces (Program, Contract, Module, Batch)
    graph.ts      # BFS, Tarjan SCC, topological sort, level computation
    coverage.ts   # Coverage formula: (impl + partial*0.5) / (total - na) * 100
    contract.ts   # YAML contract I/O and validation
    tracker.ts    # tracker.json read/write
    pipeline.ts   # Status lifecycle: pending -> contracted -> enriched -> verified

  calculators/    # The core engine
    dependency-resolver.ts       # Full dependency resolution pipeline
    module-calculator.ts         # Identifies deliverable subtrees
    readiness-checker.ts         # Score + blockers per module
    batch-planner.ts             # Auto-suggests batches from topology
    decommission-calculator.ts   # Identifies legacy programs safe to turn off

  adapters/       # Pluggable per legacy technology
    magic-adapter.ts    # Magic Unipaas (reads live-programs.json + contract YAML)
    generic-adapter.ts  # CSV/JSON import for any legacy system

  orchestrator/   # Pipeline automation
    orchestrator.ts     # Drives contract -> enrich -> verify
    swarm-planner.ts    # Plans agent teams with file ownership

  dashboard/      # Progress visualization
    dashboard.ts          # Global progress CLI view
    module-readiness.ts   # Deliverable modules + blockers CLI view
    report-builder.ts     # Assembles full report data
    html-report.ts        # Self-contained HTML dashboard generator

  cli.ts          # Entry point: npx migration-factory <command>
```

## Key Algorithm: Decommission Calculator

A program P can be **decommissioned** (turned off in legacy) when:

1. P is `verified` (modern replacement works) or `N/A`
2. ALL callers of P are also decommissionable (no legacy code depends on P)

Root programs (no callers) only need condition 1. SCC members are treated as atomic units - all external callers must be decommissionable.

This is stricter than "deliverable": a shared leaf called by modules A and B can only be decommissioned when BOTH A and B are fully delivered.

## Key Algorithm: Module Calculator

A **module** = a program + ALL its transitive callees (complete subtree).
A module is **deliverable** when 100% of its programs are verified.

Special cases:
- **SCC (cycles)**: treated as atomic unit - all must be verified together
- **N/A programs** (backend-only): count as verified
- **Shared programs** (ECF): verified once, counts everywhere
- **Maximal modules**: if A is subset of B and both deliverable, only B is reported

## Adapters

### Magic Unipaas (built-in)

Reads from `.openspec/migration/`:
- `live-programs.json` (program graph with callers/callees)
- `*.contract.yaml` (migration contracts)

```bash
npx tsx src/cli.ts graph --project /path/to/magic-project --adapter magic
```

### Generic (CSV/JSON)

For legacy systems without an automatic parser. Provide a programs file:

```json
[
  { "id": "MOD001", "name": "Main Module", "callees": "MOD002,MOD003" },
  { "id": "MOD002", "name": "Sub Module A", "callees": "" },
  { "id": "MOD003", "name": "Sub Module B", "callees": "MOD002" }
]
```

```bash
npx tsx src/cli.ts graph --adapter generic --programs programs.json
```

### Adding a New Adapter

Implement the `SpecExtractor` interface:

```typescript
interface SpecExtractor {
  name: string;
  extractProgramGraph(): Promise<ProgramGraph>;
  extractSpec(programId: string | number): Promise<MigrationContract | null>;
  getSharedPrograms(): Promise<(string | number)[]>;
}
```

## Agent Templates

The `templates/` directory contains technology-agnostic templates for:

| Template | Purpose |
|----------|---------|
| `agents/contract-builder.template.md` | Generate migration contracts |
| `agents/enricher.template.md` | Implement gaps in target code |
| `agents/verifier.template.md` | Verify implementation fidelity |
| `commands/contract.template.md` | `/contract` slash command |
| `commands/enrich.template.md` | `/enrich` slash command |
| `commands/verify.template.md` | `/verify` slash command |
| `commands/progress.template.md` | `/progress` slash command |
| `commands/modules.template.md` | `/modules` slash command |

Replace `{{PLACEHOLDERS}}` with your project-specific values.

## Tests

```bash
npm test          # Run all tests
npm run typecheck # TypeScript type checking
```

36 tests covering:
- Graph algorithms (BFS, Tarjan SCC, levels, transitive closure)
- Module calculator (deliverability, N/A handling, SCC, maximal filtering)
- Decommission calculator (caller chains, SCC cycles, shared programs, N/A)
- Coverage formula (all status combinations)

## Provenance

Extracted from the ADH Magic Unipaas migration (350 programs, 212 live, 8 levels, 7 SCCs).
Validated on batch B1 (18 programs, 49% coverage, 5 enrichment waves).
