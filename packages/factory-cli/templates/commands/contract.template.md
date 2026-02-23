# /contract - Generate Migration Contract

Generate a SPECMAP migration contract for a single program.

## Usage

```
/contract <program-id>
```

## Steps

1. **Load spec** from `{{SPEC_DIR}}/` for program `<program-id>`
2. **Extract** rules, variables, tables, callees
3. **Scan** code in `{{TARGET_DIR}}/` for existing implementations
4. **Classify** each element: IMPL / PARTIAL / MISSING / N/A
5. **Write** contract to `{{MIGRATION_DIR}}/{{CONTRACT_FILE_PATTERN}}`
6. **Update** tracker.json with new contracted count

## Output

- Contract YAML file
- Coverage percentage
- Gap summary (PARTIAL + MISSING items)
