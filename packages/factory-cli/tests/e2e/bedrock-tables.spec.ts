/**
 * Bedrock E2E Tests — Table Classification
 *
 * Verifies that tables in contracts are classified as IMPL (existing SQL tables)
 * instead of MISSING when enriched via Bedrock.
 */
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';

const HAS_AWS = !!(process.env.AWS_BEARER_TOKEN_BEDROCK && process.env.AWS_REGION);

test.describe('BEDROCK — Table Classification', () => {
  test.skip(!HAS_AWS, 'AWS Bedrock credentials not configured');

  test('should classify all tables as IMPL after enrichment', async ({ page }) => {
    test.setTimeout(120_000);

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    await dashboard.navigateToADH();

    // B-TEST-1 has program 101 with 3 tables (all MISSING initially)
    await dashboard.selectBatch('B-TEST-1');
    await dashboard.selectProvider('claude-bedrock');
    await dashboard.disableSimulation();

    // Run enrichment
    await dashboard.btnRun.click();
    await expect(dashboard.panelContent).toContainText(/Termin[eé] en \d/i, { timeout: 120_000 });

    const text = await dashboard.getPanelText();

    // Should show "Claude resolved 3/3 gaps" for program 101 (all 3 tables classified as IMPL)
    expect(text).toMatch(/\[101\].*Claude resolved 3\/3 gaps/i);
    expect(text).toMatch(/\d+\+\d+ tokens/); // Token usage shown
  });
});
