# Migration Knowledge System

> Complete guide to the automated learning and knowledge capture system

**Created**: 2026-02-24
**Version**: 1.0
**Status**: Production Ready ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Workflows](#workflows)
4. [Commands](#commands)
5. [Integration](#integration)
6. [Best Practices](#best-practices)

---

## Overview

The Migration Knowledge System automatically captures, analyzes, and visualizes learnings from each migration:

- **Patterns** - Recurring Magic→Modern patterns
- **Decisions** - Technical decisions with trade-offs
- **Failures** - Errors with resolutions and lessons
- **Progress** - Migration stats and coverage tracking

**Goal**: Learn from each migration to improve the next one.

---

## Components

### 1. Pattern Recognition

**Location**: `.migration-history/patterns/`

**What it does**:
- Identifies recurring Magic formula patterns
- Documents modern equivalent implementations
- Tracks occurrences across programs
- Provides migration strategies

**Files**:
```
patterns/
├── README.md                      # Documentation
├── TEMPLATE.yaml                  # Pattern template
├── operation-type-check.yaml      # P. O/T/F [A]='X'
├── task-end-flag-check.yaml       # W0 fin tache [X]='F'
└── printer-number-check.yaml      # GetParam('CURRENTPRINTERNUM')=N
```

**Commands**:
```bash
# Generate pattern dashboard (HTML)
pnpm dashboard:patterns

# View patterns
ls .migration-history/patterns/*.yaml
```

**Pattern Structure**:
```yaml
pattern: "Magic formula pattern"
description: "What it does"
category: "conditional | validation | computation"
occurrences: 10
complexity: "LOW | MEDIUM | HIGH"

modern_equivalent:
  typescript: |
    // Modern TypeScript code

examples:
  - program_id: 48
    formula: "P. O/T/F [A]='O'"
    mapped_to: "src/stores/store.ts:45"
    test_file: "tests/store.test.ts:28"
```

---

### 2. Decision Records

**Location**: `.migration-history/decisions/`

**What it does**:
- Documents technical choices
- Explains trade-offs and alternatives
- Links to related code and patterns

**Files**:
```
decisions/
├── README.md                                      # Documentation
├── TEMPLATE.md                                    # Decision template
└── 2026-02-24-operation-type-representation.md   # Enum vs Union type
```

**When to create**:
- ✅ Choice between multiple approaches (Zustand vs Redux)
- ✅ Pattern selection for Magic code type
- ✅ Architecture decisions affecting multiple programs
- ❌ Minor changes (typos, simple refactors)

**Command**:
```bash
# Create new decision
cp .migration-history/decisions/TEMPLATE.md \
   .migration-history/decisions/$(date +%Y-%m-%d)-my-decision.md

# Edit and fill template sections:
# - Context
# - Options Considered
# - Decision
# - Why This Way
# - Test Coverage
# - Applied To
```

**Decision Structure**:
```markdown
# Decision: [Title]

> **Date**: 2026-02-24
> **Status**: ACCEPTED

## Context
[Problem description, constraints]

## Options Considered
### Option 1: [Name]
**Pros**: ✅ ...
**Cons**: ❌ ...

### Option 2: [Name]
**Pros**: ✅ ...
**Cons**: ❌ ...

## Decision
[Chosen option with implementation]

## Why This Way
[Rationale, trade-offs accepted, alternatives rejected]

## Test Coverage
[Tests added, coverage metrics]

## Applied To
[Programs migrated, files affected]
```

---

### 3. Failure Capture

**Location**: `.migration-history/failures/`

**What it does**:
- Automatically captures migration failures
- Tracks resolution time and actions
- Provides analytics (by phase, by error code)
- Generates failure reports

**Files**:
```
failures/
├── README.md                           # Documentation
├── EXAMPLE.json                        # Complete example
└── Prg_XXX-failed-YYYY-MM-DD-HHMM.json # Failure records
```

**Automatic Capture**:
```typescript
import { captureFailure } from './core/failure-capture.js';

try {
  await runMigrationPhase();
} catch (error) {
  await captureFailure({
    programId: 237,
    programName: 'Vente GP',
    phase: 'VERIFY',
    error,
    context: { contractFile, outputDir },
    missingExpressions: [...],
    expectedCoverage: 100,
    actualCoverage: 85,
  });
  throw error;
}
```

**Manual Resolution**:
```typescript
import { resolveFailure } from './core/failure-capture.js';

await resolveFailure(
  '.migration-history/failures/Prg_237-failed-2026-02-24-1530.json',
  {
    action: 'Added missing tests for 2 expressions',
    test_files_added: ['vente.test.ts:42'],
    resolved_by: 'John Doe',
    commit: 'abc123',
    verification_passed: true,
  },
  ['Always check coverage before verify']
);
```

**Commands**:
```bash
# Generate failure report (Markdown)
pnpm dashboard:failures

# Generate HTML report
pnpm dashboard:failures --format html --output failures.html

# List unresolved failures
tsx scripts/list-unresolved-failures.ts  # (to be created)
```

**Failure Record Structure**:
```json
{
  "program_id": 237,
  "phase": "VERIFY",
  "error_code": "ERR_COVERAGE_LOW",
  "error": "Coverage below threshold: expected 100%, got 85%",
  "details": {
    "missing_expressions": [...],
    "context": {...}
  },
  "resolution": {
    "action": "Added missing tests",
    "resolved_at": "2026-02-24T16:00:00Z",
    "resolution_time_minutes": 30
  },
  "lessons_learned": [...]
}
```

---

### 4. Post-Migration Hook

**Location**: `scripts/post-migration-hook.ts`

**What it does**:
- Runs automatically after successful migration
- Detects recurring patterns (min 2 occurrences)
- Suggests decision records for complex code
- Logs migration statistics
- Updates pattern statistics

**Usage**:
```bash
# Run after migrating a program
pnpm hook:post-migration \
  --contract .openspec/migration/ADH/ADH-IDE-48.contract.yaml \
  --output ../adh-web/src
```

**Output**:
```
📊 Post-Migration Summary

Program: Saisie Contenu Caisse (ID 48)
Contract: .openspec/migration/ADH/ADH-IDE-48.contract.yaml

Coverage:
  Total expressions: 17
  Mapped: 15
  Tested: 12
  Verified: 10
  Coverage: 59%

🔍 Patterns detected: 3
  1. P. O/T/F [X]='X' (3x across 1 program(s))
  2. W0 fin tache [X]='F' (2x across 1 program(s))
  3. GetParam('X')=N (2x across 1 program(s))

💡 Decision records suggested: 1
  1. Nested IF expression handling strategy (4 found)

✅ Post-migration hook complete
```

**Files Created**:
- `.migration-history/migration-stats.jsonl` - JSONL log (one line per migration)
- `.migration-history/patterns/stats.json` - Cumulative pattern statistics

---

### 5. Unified Dashboard

**Location**: `scripts/generate-migration-dashboard.ts`

**What it does**:
- Combines patterns, failures, and progress
- Shows overall migration health
- Provides quick links to detailed reports

**Usage**:
```bash
# Generate HTML dashboard
pnpm dashboard --format html --output migration-dashboard.html

# Generate Markdown
pnpm dashboard --format markdown
```

**Dashboard Sections**:
- **Summary**: Total migrations, avg coverage, patterns learned, unresolved failures
- **Top Patterns**: Most frequent patterns with occurrences
- **Recent Migrations**: Latest migrations with coverage
- **Failures Overview**: Total, unresolved, avg resolution time
- **Quick Links**: Links to detailed dashboards

---

## Workflows

### Workflow 1: Migrating a Program

```bash
# 1. Run migration pipeline
pnpm pipeline run --batch B2 --project ../../ --dir ADH

# 2. If successful, run post-migration hook
pnpm hook:post-migration \
  --contract ../../.openspec/migration/ADH/ADH-IDE-48.contract.yaml \
  --output ../adh-web/src

# 3. Review suggested patterns/decisions
# Create decision record if needed:
cp .migration-history/decisions/TEMPLATE.md \
   .migration-history/decisions/2026-02-24-my-decision.md

# 4. Generate dashboards
pnpm dashboard                  # Unified view
pnpm dashboard:patterns         # Detailed patterns
pnpm dashboard:failures         # Detailed failures
```

### Workflow 2: Handling a Failure

```bash
# 1. Failure is automatically captured by pipeline
# File created: .migration-history/failures/Prg_237-failed-2026-02-24-1530.json

# 2. Read failure details
cat .migration-history/failures/Prg_237-failed-2026-02-24-1530.json | jq .

# 3. Investigate and fix the issue
# (add missing tests, fix code, etc.)

# 4. Mark as resolved
tsx scripts/resolve-failure.ts \
  --file .migration-history/failures/Prg_237-failed-2026-02-24-1530.json \
  --action "Added missing tests" \
  --commit abc123

# 5. Document lessons learned
# (added automatically or edit file manually)

# 6. Generate updated dashboard
pnpm dashboard:failures
```

### Workflow 3: Documenting a Pattern

```bash
# 1. Identify recurring pattern during migrations
# (e.g., "IF({X,Y}='Z',Msg(...),Update(...))")

# 2. Create pattern file
cp .migration-history/patterns/TEMPLATE.yaml \
   .migration-history/patterns/if-error-then-update.yaml

# 3. Fill pattern details:
# - pattern: Generic formula
# - description: What it does
# - modern_equivalent: TypeScript/React code
# - examples: Occurrences with mapping

# 4. Generate pattern dashboard
pnpm dashboard:patterns

# 5. Commit pattern file
git add .migration-history/patterns/if-error-then-update.yaml
git commit -m "docs(patterns): add if-error-then-update pattern"
```

---

## Commands

### Dashboard Commands

| Command | Description | Output |
|---------|-------------|--------|
| `pnpm dashboard` | Unified migration dashboard | HTML (default) or Markdown |
| `pnpm dashboard:patterns` | Detailed patterns view | HTML with pattern cards |
| `pnpm dashboard:failures` | Detailed failures report | HTML or Markdown |

**Examples**:
```bash
# HTML dashboards (default)
pnpm dashboard --output migration-dashboard.html
pnpm dashboard:patterns  # → patterns-dashboard.html
pnpm dashboard:failures --format html --output failures.html

# Markdown reports (stdout)
pnpm dashboard --format markdown
pnpm dashboard:failures --format markdown
```

### Hook Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `pnpm hook:post-migration` | Capture learnings after migration | After successful migration |

**Example**:
```bash
pnpm hook:post-migration \
  --contract .openspec/migration/ADH/ADH-IDE-48.contract.yaml \
  --output ../adh-web/src
```

### Analysis Commands

| Command | Description | Output |
|---------|-------------|--------|
| `pnpm test:expression-coverage` | Verify expression coverage | Coverage report |
| `pnpm badge:expression-coverage` | Update coverage badge | Badge JSON |

---

## Integration

### CI/CD Integration

**GitHub Actions** (`.github/workflows/expression-coverage.yml`):
```yaml
name: Expression Coverage

on:
  pull_request:
    paths:
      - '.openspec/migration/**/*.contract.yaml'
      - 'packages/adh-web/src/**'

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: pnpm install

      - name: Check expression coverage
        run: pnpm test:expression-coverage --threshold 70

      - name: Comment on PR
        if: always()
        uses: actions/github-script@v7
        # (adds coverage report as comment)
```

**Pre-commit Hook** (`.husky/pre-commit-expression-coverage`):
```bash
#!/bin/sh
# Check expression coverage for modified contracts

MODIFIED_CONTRACTS=$(git diff --cached --name-only --diff-filter=ACMR | grep '\.openspec/migration/.*\.contract\.yaml' || true)

if [ -n "$MODIFIED_CONTRACTS" ]; then
  echo "🔍 Checking expression coverage for modified contracts..."

  PROGRAM_IDS=$(echo "$MODIFIED_CONTRACTS" | grep -oP 'ADH-IDE-\K\d+' | tr '\n' ',' | sed 's/,$//')

  cd packages/factory-cli
  pnpm test:expression-coverage --programs "$PROGRAM_IDS" --threshold 70
fi
```

### Pipeline Integration

**In pipeline stages** (e.g., `pipeline/stages/verify.ts`):
```typescript
import { captureFailure } from '../core/failure-capture.js';

export async function runVerifyPhase(program: Program): Promise<void> {
  try {
    // Run verification logic
    const result = await verifyExpressionCoverage(program);

    if (result.coveragePct < 100) {
      throw new Error(`Coverage ${result.coveragePct}% below threshold`);
    }
  } catch (error) {
    // Automatically capture failure
    await captureFailure({
      programId: program.id,
      programName: program.name,
      phase: 'VERIFY',
      error,
      context: {
        contract_file: program.contractPath,
        output_dir: program.outputDir,
      },
      expectedCoverage: 100,
      actualCoverage: result.coveragePct,
      missingExpressions: result.gaps,
    });

    throw error; // Re-throw to fail pipeline
  }
}
```

---

## Best Practices

### Pattern Documentation

✅ **DO**:
- Create pattern when seen 2+ times across programs
- Use generic formula (P. O/T/F [X]='X' vs specific values)
- Provide both TypeScript and React examples
- Document migration strategy step-by-step
- Include test pattern

❌ **DON'T**:
- Create pattern for one-off occurrences
- Use program-specific variable names
- Skip modern equivalent code
- Forget to update pattern stats

### Decision Records

✅ **DO**:
- Document major architectural choices
- Explain trade-offs and alternatives
- Link to related patterns and code
- Include test coverage metrics
- Update when decision changes

❌ **DON'T**:
- Create for trivial changes
- Skip "Why This Way" section
- Forget to list alternatives rejected
- Leave resolution empty

### Failure Capture

✅ **DO**:
- Capture all pipeline failures automatically
- Document resolution actions clearly
- Extract lessons learned
- Update failure record after fix
- Generate reports regularly

❌ **DON'T**:
- Ignore recurring failures
- Skip lessons learned
- Delete failure records
- Forget to mark as resolved

### Post-Migration Hook

✅ **DO**:
- Run after every successful migration
- Review suggested patterns
- Create decision records when suggested
- Check coverage statistics
- Commit learnings with code

❌ **DON'T**:
- Skip running the hook
- Ignore pattern suggestions
- Forget to update pattern files
- Leave patterns undocumented

---

## File Locations

```
.migration-history/
├── README.md                          # Overview
├── migration-stats.jsonl              # Migration logs (gitignored)
├── decisions/
│   ├── README.md
│   ├── TEMPLATE.md
│   └── YYYY-MM-DD-title.md
├── patterns/
│   ├── README.md
│   ├── TEMPLATE.yaml
│   ├── stats.json                     # Pattern stats (gitignored)
│   └── pattern-name.yaml
└── failures/
    ├── README.md
    ├── EXAMPLE.json
    └── Prg_XXX-failed-YYYY-MM-DD-HHMM.json

packages/factory-cli/
├── scripts/
│   ├── generate-migration-dashboard.ts   # Unified dashboard
│   ├── generate-patterns-dashboard.ts    # Pattern dashboard
│   ├── generate-failure-report.ts        # Failure report
│   └── post-migration-hook.ts            # Post-migration automation
├── src/core/
│   └── failure-capture.ts                # Failure capture module
└── docs/
    └── migration-knowledge-system.md     # This file
```

---

## Metrics

### Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| Expression Coverage (Pilot) | 100% | ✅ 100% (3 contracts, 17 expr) |
| Pattern Documentation | 10+ patterns | ⚠️ 3 patterns |
| Decision Records | 5+ decisions | ⚠️ 1 decision |
| Failure Resolution Rate | 90%+ | ✅ 100% (0 unresolved) |
| Avg Resolution Time | < 60 min | ✅ 0 min (no failures yet) |

### Quality Gates

- **Pre-commit**: Expression coverage >= 70% for modified contracts
- **PR**: Expression coverage >= 70% with report comment
- **Master**: Badge auto-updated on merge

---

## Troubleshooting

### Issue: Pattern not detected by hook

**Cause**: Pattern occurs only once or formula is too specific

**Solution**:
1. Check if pattern appears in multiple programs
2. Generalize formula (replace literals with placeholders)
3. Run hook on multiple contracts to accumulate stats

### Issue: Failure not captured

**Cause**: Pipeline doesn't use failure-capture module

**Solution**:
1. Add `import { captureFailure }` to pipeline stage
2. Wrap phase execution in try/catch
3. Call `captureFailure()` in catch block

### Issue: Dashboard shows no data

**Cause**: No migrations run yet or history dir not found

**Solution**:
1. Run at least one migration with post-hook
2. Check `.migration-history/migration-stats.jsonl` exists
3. Verify history dir path in dashboard script

---

## Future Enhancements

- [ ] Automatic pattern extraction from contracts (ML-based)
- [ ] Pattern similarity detection
- [ ] Failure prediction based on past patterns
- [ ] Real-time dashboard with live updates
- [ ] Integration with Slack/Teams notifications
- [ ] Pattern reusability scoring
- [ ] Decision impact analysis

---

## Support

- **Documentation**: `docs/migration-knowledge-system.md` (this file)
- **Templates**: `.migration-history/{patterns,decisions,failures}/TEMPLATE.*`
- **Examples**: `.migration-history/failures/EXAMPLE.json`

**Created**: 2026-02-24
**Last Updated**: 2026-02-24
**Version**: 1.0
