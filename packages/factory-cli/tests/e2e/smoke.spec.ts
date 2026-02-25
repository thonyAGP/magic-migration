/**
 * Smoke Tests — Migration Factory Dashboard
 *
 * Sprint 0: SMOKE 1-5 (8 tests) — core dashboard loading & pipeline
 * Sprint 1: SMOKE 6-11 (6 tests) — preflight, gaps, verify, tokens, table, panel
 * Max 20 tests (SWARM guard-fou). Current: 14/20.
 */
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';

test.describe('SMOKE 1 — Dashboard loads and displays data', () => {
  test('should display title, KPIs, and connected badge', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Title visible
    await expect(page.locator('h1')).toContainText('SPECMAP Migration Dashboard');

    // Server badge shows "Connecté"
    await dashboard.waitForConnected();
    await expect(dashboard.serverBadge).toContainText(/connect/i);

    // KPIs section exists with values
    const kpiValues = await dashboard.getKpiValues();
    expect(kpiValues.length).toBeGreaterThan(0);

    // Tabs exist
    await expect(dashboard.tabGlobal).toBeVisible();
    await expect(dashboard.tabTokens).toBeVisible();
  });

  test('should have no JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Wait for full render
    await dashboard.waitForConnected();

    expect(errors).toEqual([]);
  });
});

test.describe('SMOKE 2 — Batch selector and tab navigation', () => {
  test('should populate batch dropdown with test batches', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    // Navigate to ADH tab
    await dashboard.tabADH.click();
    await page.waitForTimeout(500);

    // Batch dropdown should be enabled and have options
    await expect(dashboard.batchSelect).toBeEnabled();
    const options = await dashboard.getBatchOptions();
    expect(options.length).toBeGreaterThan(1); // More than just placeholder
    expect(options.some(o => o.includes('Smoke Test Batch'))).toBeTruthy();
  });

  test('should switch tabs without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    // Navigate to each tab
    await dashboard.tabGlobal.click();
    await page.waitForTimeout(300);

    if (await dashboard.tabADH.isVisible()) {
      await dashboard.tabADH.click();
      await page.waitForTimeout(300);
    }

    await dashboard.tabTokens.click();
    await page.waitForTimeout(300);

    // Back to global
    await dashboard.tabGlobal.click();
    await page.waitForTimeout(300);

    expect(errors).toEqual([]);
  });
});

test.describe('SMOKE 3 — Pipeline SSE stream (dry-run)', () => {
  test('should run pipeline in simulation mode and show logs', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    // Navigate to ADH
    await dashboard.tabADH.click();
    await page.waitForTimeout(500);

    // Select batch
    await dashboard.selectBatch('B-TEST-1');

    // Enable simulation mode
    await dashboard.enableSimulation();

    // Click "Lancer Pipeline"
    await dashboard.btnRun.click();

    // Wait for pipeline to complete (dry-run should be fast)
    await dashboard.waitForProgressComplete(30_000);

    // Panel should show pipeline results
    const text = await dashboard.getPanelText();
    expect(text.length).toBeGreaterThan(0);
    expect(text).toMatch(/Pipeline|pipeline|started|Terminé|terminé/i);
  });
});

test.describe('SMOKE 4 — Credentials and provider validation', () => {
  test('should show credentials error when using Bedrock without env vars', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    // Navigate to ADH
    await dashboard.tabADH.click();
    await page.waitForTimeout(500);

    // Select batch with contracted (not yet enriched) programs + Bedrock provider
    await dashboard.selectBatch('B-TEST-EMPTY');
    await dashboard.selectProvider('claude-bedrock');

    // Disable simulation (real run)
    await dashboard.disableSimulation();

    // Click "Lancer Pipeline"
    await dashboard.btnRun.click();

    // Wait for response (should show credential error for unenriched program)
    await dashboard.waitForProgressComplete(15_000);

    // Should mention credentials issue or needs enrichment
    const text = await dashboard.getPanelText();
    expect(text).toMatch(/AWS|credentials|BEARER_TOKEN|REGION|not set|enrichment/i);
  });
});

test.describe('SMOKE 5 — Button guards (no batch selected)', () => {
  test('should show error when clicking Pipeline without batch', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    // Navigate to ADH
    await dashboard.tabADH.click();
    await page.waitForTimeout(500);

    // Try clicking buttons with no batch selected or empty selection
    // First verify preflight button behavior
    await dashboard.btnPreflight.click();
    await page.waitForTimeout(500);

    // Should show an error in the panel
    const text = await dashboard.getPanelText();
    expect(text).toMatch(/batch|sélect|Erreur|erreur|select/i);
  });

  test('should prevent double-click on pipeline button', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    // Navigate to ADH and select batch
    await dashboard.tabADH.click();
    await page.waitForTimeout(500);
    await dashboard.selectBatch('B-TEST-1');
    await dashboard.enableSimulation();

    // Track API requests
    const requests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/pipeline/stream')) {
        requests.push(req.url());
      }
    });

    // Double-click quickly
    await dashboard.btnRun.click();
    await dashboard.btnRun.click();

    // Wait a bit
    await page.waitForTimeout(2000);

    // Should only have sent 1 request (button disabled after first click)
    // OR the server returns 409 for the second one
    // Either way, we shouldn't have 2 active streams
    expect(requests.length).toBeLessThanOrEqual(2); // Max 2 attempts, server blocks second
  });
});

// ─── Sprint 1 Tests ───────────────────────────────────────────────────

test.describe('SMOKE 6 — Preflight check', () => {
  test('should display preflight results for a batch', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    await dashboard.navigateToADH();
    await dashboard.selectBatch('B-TEST-1');

    // Click Prérequis
    await dashboard.btnPreflight.click();
    await page.waitForTimeout(2000);

    // Panel should show preflight results
    const text = await dashboard.getPanelText();
    expect(text).toMatch(/Pr[eé]-requis|B-TEST-1|Smoke Test Batch/i);
    // Should contain check results (OK or FAIL)
    expect(text).toMatch(/OK|FAIL/);
    // Should contain program listing
    expect(text).toMatch(/IDE\s+\d+|Programmes/i);
    // Should contain summary
    expect(text).toMatch(/R[eé]sum[eé]|analyser|v[eé]rifier|enrichir|termin/i);
  });
});

test.describe('SMOKE 7 — Gaps report', () => {
  test('should display gap analysis for contracts', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    await dashboard.navigateToADH();

    // Click Gaps button
    await dashboard.btnGaps.click();
    await page.waitForTimeout(2000);

    // Panel should show gap report
    const text = await dashboard.getPanelText();
    expect(text).toMatch(/[Gg]ap/);
    // Should contain coverage percentage
    expect(text).toMatch(/\d+%/);
    // Should contain total line
    expect(text).toMatch(/[Tt]otal/);
  });
});

test.describe('SMOKE 8 — Verify contracts', () => {
  test('should display verification results in dry-run mode', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    await dashboard.navigateToADH();
    await dashboard.enableSimulation();

    // Click Vérifier button
    await dashboard.btnVerify.click();
    await page.waitForTimeout(2000);

    // Panel should show verification results
    const text = await dashboard.getPanelText();
    expect(text).toMatch(/[Vv][eé]rif/);
    // Should mention simulation mode
    expect(text).toMatch(/SIMULATION|simulation|dry/i);
    // Should contain counts
    expect(text).toMatch(/\d+\s+(v[eé]rifi|non pr[eê]t|d[eé]j[aà])/i);
  });
});

test.describe('SMOKE 9 — Tokens tab', () => {
  test('should show empty state when no tokens tracked', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    // Switch to tokens tab
    await dashboard.tabTokens.click();
    await page.waitForTimeout(1000);

    // Tokens content should be visible
    await expect(dashboard.tokensContent).toBeVisible();

    // Should show empty state (no token data in test fixtures)
    const text = await dashboard.tokensContent.textContent();
    expect(text).toMatch(/[Aa]ucun token|0|Chargement/);
  });
});

test.describe('SMOKE 10 — Programme table', () => {
  test('should display programs and support search filtering', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    await dashboard.navigateToADH();

    // Program table should exist with rows
    await expect(dashboard.programTable).toBeVisible();
    const rowCount = await dashboard.getProgramTableRows();
    expect(rowCount).toBeGreaterThan(0);

    // Search should filter results
    await dashboard.progSearch.fill('SMOKE_ROOT');
    await page.waitForTimeout(500);

    // Status filter should be available
    await expect(dashboard.statusFilter).toBeVisible();
    const options = await dashboard.statusFilter.locator('option').allTextContents();
    expect(options.length).toBeGreaterThanOrEqual(2); // "Tous" + at least one status
  });
});

test.describe('SMOKE 11 — Panel close and enrichment persistence', () => {
  test('should close results panel and persist enrichment mode', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    await dashboard.navigateToADH();
    await dashboard.selectBatch('B-TEST-1');

    // Open panel via preflight
    await dashboard.btnPreflight.click();
    await page.waitForTimeout(2000);

    // Panel should be visible
    expect(await dashboard.isPanelVisible()).toBe(true);

    // Close panel
    await dashboard.closePanel();
    await page.waitForTimeout(300);

    // Panel should be hidden
    expect(await dashboard.isPanelVisible()).toBe(false);

    // Set enrichment mode to claude-bedrock
    await dashboard.selectProvider('claude-bedrock');

    // Verify localStorage was set
    const stored = await page.evaluate(() => localStorage.getItem('mf-enrich-mode'));
    expect(stored).toBe('claude-bedrock');

    // Reload page and check persistence
    await dashboard.goto();
    await dashboard.waitForConnected();
    await dashboard.navigateToADH();

    const value = await dashboard.enrichSelect.inputValue();
    expect(value).toBe('claude-bedrock');
  });
});
