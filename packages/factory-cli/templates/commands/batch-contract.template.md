# /batch-contract - Generate Contracts for a Batch

Generate migration contracts for all programs in a batch.

## Usage

```
/batch-contract <batch-id>
```

## Steps

1. **Load** tracker to find batch definition
2. **Identify** all programs in the batch (root + subtree)
3. **For each** program without a contract:
   - Load spec
   - Scan target code
   - Generate contract YAML
4. **Update** tracker with batch contracted date
5. **Display** summary: programs contracted, average coverage, gaps

## Output

- N contract YAML files
- Batch summary with coverage stats
- Priority order for enrichment
