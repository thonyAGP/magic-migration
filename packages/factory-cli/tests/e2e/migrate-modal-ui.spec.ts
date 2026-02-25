import { test, expect } from '@playwright/test';

/**
 * E2E Test: Migration Modal UI - Real B8 Bedrock Migration
 *
 * Tests that the modal correctly displays:
 * - 3 new columns: Phase, En cours, Tokens
 * - Stable decreasing ETA (not increasing)
 * - Tokens in header and per-program
 * - Badge reopenable after completion
 */

test.describe('Migration Modal UI - Real B8 Bedrock', () => {
  test.setTimeout(600000); // 10min max for real migration

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assumes server is already running)
    await page.goto('http://localhost:3070');

    // Wait for dashboard to load
    await page.waitForSelector('.project-card[data-goto="ADH"]', { timeout: 30000 });

    // Navigate to ADH project
    await page.click('.project-card[data-goto="ADH"]');
    await page.waitForSelector('#batch-select', { timeout: 10000 });
  });

  test('should display all 3 new columns during real B8 migration', async ({ page }) => {
    // Select batch B8
    await page.selectOption('#batch-select', 'B8');

    // Verify batch is selected
    const selectedBatch = await page.inputValue('#batch-select');
    expect(selectedBatch).toBe('B8');

    // Wait for contracts to load and button to be enabled
    const migrateBtn = page.locator('button#btn-migrate');
    await migrateBtn.waitFor({ state: 'visible', timeout: 30000 });

    // Wait until button is enabled (contracts loaded)
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('#btn-migrate') as HTMLButtonElement;
        return btn && !btn.disabled;
      },
      { timeout: 30000 }
    );

    // Click "Migrer Module" button (opens confirmation modal)
    await migrateBtn.click();

    // Wait for confirmation modal
    await page.waitForSelector('#migrate-confirm-modal.show', { timeout: 5000 });
    await expect(page.locator('#migrate-confirm-modal.show')).toBeVisible();

    // Launch migration
    const launchBtn = page.locator('#migrate-confirm-modal button:has-text("Lancer")');
    await launchBtn.click();

    // Wait for migration overlay
    await page.waitForSelector('#migrate-overlay', { timeout: 5000 });
    await expect(page.locator('#migrate-overlay')).toBeVisible();

    // Wait for table to appear
    await page.waitForSelector('.mp-grid thead', { timeout: 10000 });

    // Verify table headers include new columns
    const headers = await page.locator('.mp-grid thead th').allTextContents();
    console.log('Table headers:', headers);

    expect(headers).toContain('IDE');
    expect(headers).toContain('Programme');
    expect(headers).toContain('Durée');
    expect(headers).toContain('Phase');      // NEW COLUMN
    expect(headers).toContain('Phases');     // Dots
    expect(headers).toContain('En cours');   // NEW COLUMN
    expect(headers).toContain('ETA');
    expect(headers).toContain('Tokens');     // NEW COLUMN

    // Wait for first program to start
    await page.waitForSelector('.mp-grid tbody tr', { timeout: 30000 });

    // Get first program row
    const firstRow = page.locator('.mp-grid tbody tr').first();
    const programId = await firstRow.locator('td').first().textContent();
    console.log('First program ID:', programId);

    // Wait for "En cours" column to be populated (phase running)
    const currentCell = page.locator(`#mp-current-${programId}`);

    // Retry until "En cours" shows a phase name (not "-")
    let currentPhase = '';
    for (let i = 0; i < 60; i++) {
      currentPhase = await currentCell.textContent() || '';
      if (currentPhase && currentPhase !== '-' && currentPhase !== '') {
        console.log('✓ En cours column populated:', currentPhase);
        break;
      }
      await page.waitForTimeout(1000);
    }

    expect(currentPhase).not.toBe('-');
    expect(currentPhase).not.toBe('');

    // Verify "Phase" column exists and is initially "-" or empty
    const phaseCell = page.locator(`#mp-phase-${programId}`);
    const initialPhase = await phaseCell.textContent();
    console.log('Initial "Phase" column:', initialPhase);

    // Wait for first phase to complete and "Phase" column to update
    let lastCompletedPhase = '';
    for (let i = 0; i < 120; i++) {
      lastCompletedPhase = await phaseCell.textContent() || '';
      if (lastCompletedPhase && lastCompletedPhase !== '-' && lastCompletedPhase !== initialPhase) {
        console.log('✓ Phase column updated with completed phase:', lastCompletedPhase);
        break;
      }
      await page.waitForTimeout(1000);
    }

    expect(lastCompletedPhase).not.toBe('-');

    // Capture ETA at T+30s and T+60s to verify it's decreasing
    await page.waitForTimeout(30000);
    const eta1Text = await page.locator('#mp-elapsed').textContent() || '';
    const eta1Match = eta1Text.match(/ETA: ~(\d+)m (\d+)s/);
    const eta1Seconds = eta1Match ? parseInt(eta1Match[1]) * 60 + parseInt(eta1Match[2]) : 0;
    console.log('ETA at T+30s:', eta1Text, '→', eta1Seconds, 'seconds');

    await page.waitForTimeout(30000);
    const eta2Text = await page.locator('#mp-elapsed').textContent() || '';
    const eta2Match = eta2Text.match(/ETA: ~(\d+)m (\d+)s/);
    const eta2Seconds = eta2Match ? parseInt(eta2Match[1]) * 60 + parseInt(eta2Match[2]) : 0;
    console.log('ETA at T+60s:', eta2Text, '→', eta2Seconds, 'seconds');

    // ETA should decrease (or stay stable if recalculated, but NOT increase significantly)
    expect(eta2Seconds).toBeLessThanOrEqual(eta1Seconds + 30); // Allow 30s margin for recalculation

    // Wait for first program to complete
    const iconCell = page.locator(`#mp-icon-${programId}`);
    for (let i = 0; i < 600; i++) {
      const icon = await iconCell.textContent();
      if (icon === '✓' || icon === '✗') {
        console.log('✓ First program completed with icon:', icon);
        break;
      }
      await page.waitForTimeout(1000);
    }

    // Verify "En cours" column is cleared (program completed)
    const finalCurrent = await currentCell.textContent();
    console.log('Final "En cours" column:', finalCurrent);
    expect(finalCurrent).toBe('');

    // Verify "Tokens" column is populated
    const tokensCell = page.locator(`#mp-tokens-${programId}`);
    const tokensText = await tokensCell.textContent() || '';
    console.log('Tokens column:', tokensText);
    expect(tokensText).toMatch(/\d+(\.\d+)?[KM]?\/\d+(\.\d+)?[KM]?/); // Format: "1.5K/800" or "2K/1K"

    // Verify header tokens display
    const headerTokens = page.locator('#mp-tokens');
    await expect(headerTokens).toBeVisible();
    const headerTokensText = await headerTokens.textContent() || '';
    console.log('Header tokens:', headerTokensText);
    expect(headerTokensText).toContain('Tokens:');
    expect(headerTokensText).toMatch(/\d+(\.\d+)?[KM]? in/);
    expect(headerTokensText).toMatch(/\d+(\.\d+)?[KM]? out/);
    expect(headerTokensText).toContain('$');

    // Wait for migration to complete
    await page.waitForSelector('#mp-module-label:has-text("Terminé")', { timeout: 300000 });
    console.log('✓ Migration completed');

    // Verify badge is visible and shows "Done"
    const badge = page.locator('#migrate-badge');
    await expect(badge).toBeVisible();
    const badgeText = await badge.textContent();
    console.log('Badge text:', badgeText);
    expect(badgeText).toContain('/');

    // Close modal
    const closeBtn = page.locator('#migrate-overlay .modal-close');
    await closeBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#migrate-overlay')).toBeHidden();

    // Click badge to reopen
    await badge.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#migrate-overlay')).toBeVisible();

    // Verify table is still there with data
    await expect(page.locator('.mp-grid tbody tr').first()).toBeVisible();

    // Verify "Phase" column still shows last completed phase
    const reopenedPhase = await phaseCell.textContent();
    console.log('✓ Reopened modal - Phase column:', reopenedPhase);
    expect(reopenedPhase).not.toBe('-');

    // Verify "En cours" is still empty (migration completed)
    const reopenedCurrent = await currentCell.textContent();
    console.log('✓ Reopened modal - En cours column:', reopenedCurrent);
    expect(reopenedCurrent).toBe('');

    // Verify tokens are still visible
    const reopenedTokens = await tokensCell.textContent() || '';
    console.log('✓ Reopened modal - Tokens column:', reopenedTokens);
    expect(reopenedTokens).toMatch(/\d+/);

    console.log('✅ All UI elements verified successfully!');
  });
});
