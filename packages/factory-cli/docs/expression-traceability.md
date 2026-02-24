# Expression Traceability

> Guarantee 100% coverage of legacy expressions in modern code + tests

---

## Problem Statement

**Without expression-level traceability:**
- ❌ No guarantee that ALL legacy expressions are implemented
- ❌ Expressions can be forgotten/skipped
- ❌ No automated verification
- ❌ Manual review required (error-prone)

**With expression-level traceability:**
- ✅ Every legacy expression mapped to modern code
- ✅ Every expression has a test
- ✅ Automated verification in CI/CD
- ✅ 100% confidence in migration

---

## Architecture

### Extended Contract Format

Contracts must include `legacyExpressions` field in each rule:

```yaml
rules:
  - id: RM-001
    description: "Display error message when validation fails"
    status: IMPL
    target_file: "validation.ts"

    # NEW: Expression-level traceability
    legacy_expressions:
      - expr_id: "Prg_237:Task_5:Line_12:Expr_30"
        formula: "IF({0,3}='E',Msg('Error'))"
        mapped_to: "validation.ts:42"
        test_file: "validation.test.ts:15"
        verified: true

      - expr_id: "Prg_237:Task_5:Line_18:Expr_45"
        formula: "Update(operation,A,{1,3})"
        mapped_to: "api/operations.ts:88"
        test_file: "operations.test.ts:22"
        verified: true
```

### Verification Pipeline

```
1. Extract Expressions
   ├─ Parse all .contract.yaml files
   ├─ Extract legacyExpressions from each rule
   └─ Build ExpressionTrace list

2. Verify Coverage
   ├─ Check modern file exists (mapped_to)
   ├─ Check test file exists (test_file)
   └─ (Optional) Run test to verify it passes

3. Generate Report
   ├─ Calculate coverage % (covered / total)
   ├─ List gaps (expressions missing implementation/test)
   └─ Fail build if coverage < threshold
```

---

## Usage

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Extend Contracts with Expressions

Add `legacy_expressions` to your contract rules:

```yaml
# ADH-IDE-237.contract.yaml
rules:
  - id: RM-001
    description: "Validation logic"
    legacy_expressions:
      - expr_id: "Prg_237:Task_5:Line_12:Expr_30"
        formula: "IF({0,3}='E',Msg('Error'))"
        mapped_to: "validation.ts:42"
        test_file: "validation.test.ts:15"
        verified: true
```

### 3. Run Verification

```bash
# Verify all contracts
pnpm test:expression-coverage

# Verify specific programs
tsx scripts/verify-expression-coverage.ts \
  --contract-dir .openspec/migration/ADH/contracts \
  --output-dir ../adh-web/src \
  --programs 237,184

# Run with test execution (slow but thorough)
tsx scripts/verify-expression-coverage.ts \
  --contract-dir .openspec/migration/ADH/contracts \
  --output-dir ../adh-web/src \
  --run-tests

# Set custom threshold
tsx scripts/verify-expression-coverage.ts \
  --contract-dir .openspec/migration/ADH/contracts \
  --output-dir ../adh-web/src \
  --threshold 95

# Output as JSON
tsx scripts/verify-expression-coverage.ts \
  --contract-dir .openspec/migration/ADH/contracts \
  --output-dir ../adh-web/src \
  --json
```

### 4. Interpret Results

#### ✅ Success (100% coverage)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 EXPRESSION COVERAGE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Overall Coverage: 100% (threshold: 100%)
   Total expressions: 45
   Covered: 45
   Gaps: 0

Per-Contract Details:

✅ Program 237 - Vente Gift Pass
   Coverage: 100% (15/15)

✅ Program 184 - Encaissement
   Coverage: 100% (12/12)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### ❌ Failure (gaps detected)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 EXPRESSION COVERAGE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Overall Coverage: 87% (threshold: 100%)
   Total expressions: 45
   Covered: 39
   Gaps: 6

Per-Contract Details:

✅ Program 237 - Vente Gift Pass
   Coverage: 100% (15/15)

❌ Program 184 - Encaissement
   Coverage: 75% (9/12)
   Gaps: 3
   Gaps:
     📄 Prg_184:Task_3:Line_8:Expr_20 (RM-002)
        Formula: IF(montant>100,ApplyDiscount())
        Reason: Modern file not found: discount.ts
     🧪 Prg_184:Task_3:Line_12:Expr_25 (RM-002)
        Formula: Update(payment,status,'PAID')
        Reason: Test file not found: payment.test.ts
     ❌ Prg_184:Task_5:Line_5:Expr_30 (RM-003)
        Formula: ValidateIBAN({0,2})
        Reason: Test failed: iban.test.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Exit code**: 0 if coverage >= threshold, 1 otherwise

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/verify-expression-coverage.yml
name: Expression Coverage

on:
  pull_request:
    paths:
      - 'packages/factory-cli/.openspec/migration/**/*.contract.yaml'
      - 'packages/adh-web/src/**'

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - name: Verify Expression Coverage
        working-directory: packages/factory-cli
        run: |
          pnpm test:expression-coverage \
            --threshold 100 \
            --run-tests

      - name: Upload Coverage Report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: expression-coverage-report
          path: packages/factory-cli/expression-coverage-report.json
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh

cd packages/factory-cli

# Run expression coverage verification
pnpm test:expression-coverage --threshold 100

if [ $? -ne 0 ]; then
  echo "❌ Expression coverage failed. Commit blocked."
  exit 1
fi
```

---

## Gap Reasons

| Icon | Reason | Fix |
|------|--------|-----|
| 📄 | `MISSING_MODERN_FILE` | Create the modern file or update `mapped_to` |
| 🧪 | `MISSING_TEST_FILE` | Create the test file or update `test_file` |
| ❌ | `TEST_FAILED` | Fix the failing test |
| ⚠️ | `NO_MAPPING` | Add `mapped_to` and `test_file` to contract |

---

## Best Practices

### 1. **Expression ID Format**

Use consistent format: `Prg_<id>:Task_<task>:Line_<line>:Expr_<expr>`

```yaml
expr_id: "Prg_237:Task_5:Line_12:Expr_30"
```

### 2. **Granular Mapping**

Map expressions to specific lines, not just files:

```yaml
# GOOD
mapped_to: "validation.ts:42"

# BAD (too vague)
mapped_to: "validation.ts"
```

### 3. **Test Coverage**

Each expression should have a dedicated test:

```typescript
// validation.test.ts:15
it('should show error when status is E (Expr_30)', () => {
  const result = validateStatus('E');
  expect(result.error).toBe('Error');
});
```

### 4. **Incremental Migration**

Start with critical expressions:

```bash
# Verify only high-priority programs
tsx scripts/verify-expression-coverage.ts \
  --programs 237,184 \
  --threshold 100
```

### 5. **Documentation**

Document complex expression mappings:

```yaml
legacy_expressions:
  - expr_id: "Prg_237:Task_5:Line_12:Expr_30"
    formula: "IF({0,3}='E',Msg('Error'))"
    mapped_to: "validation.ts:42"
    test_file: "validation.test.ts:15"
    verified: true
    notes: "Variable {0,3} = status field (A/B/C/E)"
```

---

## Troubleshooting

### No contracts found

```
❌ No contracts found with expression traceability

Contracts must be extended with legacyExpressions field.
See: docs/expression-traceability.md
```

**Fix**: Add `legacy_expressions` to your contract rules.

### Modern file not found

```
📄 Prg_237:Task_5:Line_12:Expr_30 (RM-001)
   Formula: IF({0,3}='E',Msg('Error'))
   Reason: Modern file not found: validation.ts
```

**Fix**:
1. Create `validation.ts` in output directory
2. Or update `mapped_to` in contract to correct path

### Test file not found

```
🧪 Prg_237:Task_5:Line_12:Expr_30 (RM-001)
   Formula: IF({0,3}='E',Msg('Error'))
   Reason: Test file not found: validation.test.ts
```

**Fix**:
1. Create `validation.test.ts` with test for this expression
2. Or update `test_file` in contract

### Test failed

```
❌ Prg_237:Task_5:Line_12:Expr_30 (RM-001)
   Formula: IF({0,3}='E',Msg('Error'))
   Reason: Test failed: validation.test.ts
```

**Fix**: Debug and fix the failing test. Run `pnpm test validation.test.ts` for details.

---

## API Reference

See `src/verifiers/expression-coverage-types.ts` for TypeScript types.

### ExpressionTrace

```typescript
interface ExpressionTrace {
  exprId: string;
  legacyFormula: string;
  modernFile: string;
  modernLine: number;
  testFile: string;
  testLine: number;
  ruleId: string;
  verified: boolean;
  lastVerified?: string;
  failureReason?: string;
}
```

### ExpressionCoverageReport

```typescript
interface ExpressionCoverageReport {
  total: number;
  covered: number;
  gaps: number;
  coveragePct: number;
  gapDetails: ExpressionGap[];
  generatedAt: string;
  contractFile: string;
  programId: string | number;
  programName: string;
}
```

---

## Roadmap

### Current (v1.0)
- [x] Basic expression extraction
- [x] File existence verification
- [x] Test file verification
- [x] CLI tool
- [x] Coverage reporting

### Future (v1.1)
- [ ] AST-based verification (verify line numbers match)
- [ ] Auto-generate expression traces from Magic XML
- [ ] Visual coverage dashboard
- [ ] Mutation testing integration
- [ ] Expression complexity scoring

---

## FAQ

**Q: Do I need to add expressions for every rule?**
A: Yes, for 100% confidence. Start with critical rules first.

**Q: Can I set threshold < 100%?**
A: Yes, use `--threshold 95` for gradual adoption. Aim for 100% eventually.

**Q: How long does verification take?**
A: Without `--run-tests`: ~1s per 100 expressions
   With `--run-tests`: ~30s per 100 expressions

**Q: Can I skip test execution in CI?**
A: Yes, for fast feedback. Run full verification (with `--run-tests`) nightly.

**Q: What if expression mapping changes?**
A: Update `mapped_to` in contract and re-verify.

---

## Support

- **Issues**: https://github.com/your-org/factory-cli/issues
- **Docs**: `docs/expression-traceability.md`
- **Examples**: `examples/contracts/ADH-IDE-237.contract.yaml`
