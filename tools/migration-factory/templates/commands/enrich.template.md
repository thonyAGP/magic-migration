# /enrich - Enrich Code from Contract

Enrich the target codebase based on a SPECMAP migration contract.

## Usage

```
/enrich <program-id> [--wave E1|E2|E3|E4|E5]
```

## Waves

| Wave | Scope | Dependencies |
|------|-------|-------------|
| E1 | Types/Interfaces | None |
| E2 | Services/API | E1 |
| E3 | Business logic | E1, E2 |
| E4 | UI components | E1, E2, E3 |
| E5 | Orchestrator/Wiring | All |

## Steps

1. **Load** contract from `{{MIGRATION_DIR}}/{{CONTRACT_FILE_PATTERN}}`
2. **Filter** to PARTIAL + MISSING items for the specified wave
3. **Implement** each gap following project conventions
4. **Update** contract status for each item
5. **Run** build + tests
6. **Update** tracker if all items enriched
