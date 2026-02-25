# E2E Tests — Factory CLI Dashboard

Playwright smoke tests for the SPECMAP migration dashboard.

## Quick Start

```bash
# Run all E2E tests
pnpm test:e2e

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug with Playwright inspector
pnpm test:e2e:debug

# Open HTML report
pnpm test:e2e:report
```

## Architecture

```
tests/e2e/
  fixtures/           # Self-contained test project (tracked in git)
    .openspec/
      migration/
        projects-registry.json
        ADH/
          live-programs.json
          tracker.json          # Reset by global-setup before each run
          ADH-IDE-100.contract.yaml  # Enriched contract (75% coverage)
          ADH-IDE-105.contract.yaml  # Contracted contract (0% - has gaps)
  pages/
    dashboard.page.ts   # Page Object Model (POM)
  global-setup.ts       # Resets fixtures for idempotent runs
  smoke.spec.ts         # 14 smoke tests across 11 groups
```

## Test Inventory (max 20 — SWARM guard-fou)

| # | Group | Test | What it validates |
|---|-------|------|-------------------|
| 1 | SMOKE 1 | Title + KPIs + badge | Dashboard loads, SSE connects, data renders |
| 2 | SMOKE 1 | No JS errors | Console.error check on load |
| 3 | SMOKE 2 | Batch dropdown | Batches from tracker.json populate select |
| 4 | SMOKE 2 | Tab navigation | 3 tabs switch without errors |
| 5 | SMOKE 3 | Dry-run pipeline | SSE stream, logs appear, progress completes |
| 6 | SMOKE 4 | Credentials error | Bedrock without AWS env shows error message |
| 7 | SMOKE 5 | No-batch guard | Pipeline button shows error if no batch selected |
| 8 | SMOKE 5 | Double-click guard | Pipeline lock prevents concurrent runs |
| 9 | SMOKE 6 | Preflight results | Batch preflight shows checks, programs, summary |
| 10 | SMOKE 7 | Gaps report | Gap analysis with coverage %, totals |
| 11 | SMOKE 8 | Verify dry-run | Contract verification in simulation mode |
| 12 | SMOKE 9 | Tokens empty state | Tokens tab lazy-loads, shows empty state |
| 13 | SMOKE 10 | Programme table | Table renders, search filters, status dropdown |
| 14 | SMOKE 11 | Panel close + persistence | Close panel, enrichment mode persists in localStorage |

**Current: 14/20** — Room for 6 more tests.

## Guard-Fous (SWARM Decision)

1. **Max 20 tests** — If over 20, archive the least valuable
2. **POM mandatory** — All selectors in `pages/dashboard.page.ts`
3. **Pre-push hook** — E2E runs automatically before `git push` (if factory-cli changed)
4. **CI GitHub Actions** — `.github/workflows/e2e-tests.yml`
5. **Monthly ROI audit** — If flaky rate > 10%, refactor or delete

## Fixtures

Test fixtures are self-contained in `tests/e2e/fixtures/`. The `global-setup.ts` resets `tracker.json` to its initial state before each run (pipeline operations mutate it).

**3 test batches:**
- `B-TEST-1` (enriched) — 3 programs, 75% coverage
- `B-TEST-2` (verified) — 2 programs, 100% coverage
- `B-TEST-EMPTY` (pending) — 1 program, 0% coverage, has gaps

## Adding a New Test

1. Add test in `smoke.spec.ts` (or create a new `.spec.ts`)
2. Use `DashboardPage` POM for all selectors
3. If new selectors needed, add them to `pages/dashboard.page.ts`
4. Verify: `pnpm test:e2e` passes, `pnpm test` still passes
5. Check test count stays <= 20

## Troubleshooting

- **Port 3099 in use**: Kill existing process or set `reuseExistingServer: false`
- **Fixture drift**: If server fails to load fixtures, check `global-setup.ts` TRACKER_INITIAL
- **Flaky test**: Add `test.slow()` or increase `actionTimeout` — never `test.skip`
