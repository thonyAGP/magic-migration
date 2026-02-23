# /verify - Verify Migration Contract

Verify that a SPECMAP migration contract is fully implemented.

## Usage

```
/verify <program-id>
```

## Steps

1. **Load** contract from `{{MIGRATION_DIR}}/{{CONTRACT_FILE_PATTERN}}`
2. **Check** each non-N/A element against the target code
3. **Run** `{{BUILD_COMMAND}}` and `{{TEST_COMMAND}}`
4. **Classify** each element: OK / WARN / FAIL
5. **Verdict**: VERIFIED (100% OK/WARN) or FAILED
6. **Update** contract status and tracker
