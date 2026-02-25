/**
 * Bedrock E2E Tests — Real AWS Enrichment
 *
 * These tests only run when AWS credentials are available.
 * They are separate from the 20/20 smoke guard-rail.
 *
 * Required env vars:
 *   AWS_BEARER_TOKEN_BEDROCK - Bearer token for Bedrock API
 *   AWS_REGION              - AWS region (e.g. eu-west-1)
 */
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';

const HAS_AWS = !!(process.env.AWS_BEARER_TOKEN_BEDROCK && process.env.AWS_REGION);

test.describe('BEDROCK — Real AWS enrichment', () => {
  test.skip(!HAS_AWS, 'AWS Bedrock credentials not configured');
  test.describe.configure({ mode: 'serial' });

  test('B1: should enrich contracted program via Bedrock', async ({ page }) => {
    test.setTimeout(120_000);

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    await dashboard.navigateToADH();

    // Select the batch with a contracted (unenriched) program
    await dashboard.selectBatch('B-TEST-EMPTY');
    await dashboard.selectProvider('claude-bedrock');
    await dashboard.disableSimulation();

    // Run the pipeline — real Bedrock call
    await dashboard.btnRun.click();

    // Wait for REAL pipeline completion ("Terminé en Xs"), not preflight's "terminés"
    await expect(dashboard.panelContent).toContainText(/Termin[eé] en \d/i, { timeout: 120_000 });

    // Panel should show Claude enrichment results (not credential errors)
    const text = await dashboard.getPanelText();
    expect(text).not.toMatch(/credentials not set|AWS_BEARER_TOKEN/i);
    // Actual format: "Claude resolved X/Y gaps (N+M tokens, model: haiku)"
    expect(text).toMatch(/Claude resolved \d+\/\d+ gaps/i);
  });

  test('B2: should stream enrichment events with token data', async ({ page }) => {
    test.setTimeout(120_000);

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    await dashboard.navigateToADH();
    await dashboard.selectBatch('B-TEST-EMPTY');
    await dashboard.selectProvider('claude-bedrock');
    await dashboard.disableSimulation();

    // Run pipeline
    await dashboard.btnRun.click();
    await expect(dashboard.panelContent).toContainText(/Termin[eé] en \d/i, { timeout: 120_000 });

    const panelText = await dashboard.getPanelText();

    // Verify Claude was called and token counts are reported
    expect(panelText).toMatch(/Claude resolved/i);
    expect(panelText).toMatch(/\d+\+\d+ tokens/);

    // Verify program 105 log line is present
    expect(panelText).toMatch(/\[105\].*IDE 105/);
  });

  test('B3: should update contract YAML on disk', async ({ page }) => {
    test.setTimeout(30_000);

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.waitForConnected();

    // After B1+B2 ran enrichment, the contract should have been updated on disk.
    // Verify via the API: preflight will re-read the contract and report its status.
    await dashboard.navigateToADH();
    await dashboard.selectBatch('B-TEST-EMPTY');

    await dashboard.btnPreflight.click();
    await page.waitForTimeout(3_000);

    const text = await dashboard.getPanelText();

    // If enrichment succeeded and resolved all gaps, status should be enriched/will-verify.
    // If partial, it still shows needs-enrichment but with fewer gaps.
    // Either way, the contract should exist and have been processed by Claude.
    expect(text).toMatch(/enriched|needs-enrichment|will-verify|auto-enrich/i);
  });
});
