# /progress - Migration Progress Dashboard

Display the global migration progress.

## Usage

```
/progress [--batch B1] [--modules]
```

## Output

### Global Stats
- Total programs: X live, Y orphans
- Pipeline: Z contracted, W enriched, V verified
- Coverage: overall percentage

### Per Batch (if --batch)
- Batch status and dates
- Programs breakdown
- Coverage average

### Modules (if --modules)
- Deliverable modules (100% verified subtrees)
- Close modules (>80%)
- In progress (20-80%)
- Critical blockers
