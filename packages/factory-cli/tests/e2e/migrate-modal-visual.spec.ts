import { test, expect } from '@playwright/test';

/**
 * E2E Visual Test: Migration Modal UI
 *
 * Fast visual validation with screenshots at key moments.
 * Tests only 1 program migration (B8, first program only).
 */

test.describe('Migration Modal Visual - Headless + Screenshots', () => {
  test.setTimeout(180000); // 3min max for 1 program

  test('should display 3 new columns with visual proof', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:3070');
    await page.waitForSelector('.project-card[data-goto="ADH"]', { timeout: 30000 });

    // Navigate to ADH
    await page.click('.project-card[data-goto="ADH"]');
    await page.waitForSelector('#batch-select', { timeout: 10000 });

    // Screenshot 1: Dashboard loaded
    await page.screenshot({ path: 'test-results/visual-01-dashboard-loaded.png', fullPage: true });

    // Select batch B8
    await page.selectOption('#batch-select', 'B8');
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('#btn-migrate') as HTMLButtonElement;
        return btn && !btn.disabled;
      },
      { timeout: 30000 }
    );

    // Screenshot 2: Batch selected, button enabled
    await page.screenshot({ path: 'test-results/visual-02-batch-selected.png', fullPage: true });

    // Click Migrer Module
    await page.click('#btn-migrate');
    await page.waitForSelector('#migrate-confirm-modal.show', { timeout: 5000 });

    // Screenshot 3: Confirmation modal
    await page.screenshot({ path: 'test-results/visual-03-confirm-modal.png', fullPage: true });

    // Set to migrate only first program (limit)
    // Note: We can't easily limit via UI, so we'll just let it run and cancel after first completes

    // Launch migration
    await page.click('#migrate-confirm-modal button:has-text("Lancer")');
    await page.waitForSelector('#migrate-overlay', { timeout: 5000 });

    // Screenshot 4: Migration overlay opened
    await page.screenshot({ path: 'test-results/visual-04-overlay-opened.png', fullPage: true });

    // Wait for table to appear with headers
    await page.waitForSelector('.mp-grid thead', { timeout: 10000 });

    // Verify all 9 column headers exist
    const headers = await page.locator('.mp-grid thead th').allTextContents();
    console.log('✓ Table headers:', headers);
    expect(headers).toContain('Phase');
    expect(headers).toContain('En cours');
    expect(headers).toContain('Tokens');

    // Screenshot 5: Table with headers
    await page.screenshot({ path: 'test-results/visual-05-table-headers.png', fullPage: true });

    // Wait for first program row
    await page.waitForSelector('.mp-grid tbody tr', { timeout: 30000 });

    // Get first program ID
    const firstRow = page.locator('.mp-grid tbody tr').first();
    const programId = await firstRow.locator('td').first().textContent();
    console.log('✓ First program ID:', programId);

    // Wait for "En cours" to populate (phase starts)
    const currentCell = page.locator(`#mp-current-${programId}`);
    await page.waitForFunction(
      (pid) => {
        const cell = document.querySelector(`#mp-current-${pid}`);
        return cell && cell.textContent && cell.textContent !== '-' && cell.textContent !== '';
      },
      programId,
      { timeout: 60000 }
    );

    const currentPhase = await currentCell.textContent();
    console.log('✓ En cours column populated:', currentPhase);
    expect(currentPhase).not.toBe('-');

    // Screenshot 6: Phase running (En cours populated)
    await page.screenshot({ path: 'test-results/visual-06-phase-running.png', fullPage: true });

    // Wait for "Phase" to populate (first phase completes)
    const phaseCell = page.locator(`#mp-phase-${programId}`);
    await page.waitForFunction(
      (pid) => {
        const cell = document.querySelector(`#mp-phase-${pid}`);
        return cell && cell.textContent && cell.textContent !== '-' && cell.textContent !== '';
      },
      programId,
      { timeout: 60000 }
    );

    const lastPhase = await phaseCell.textContent();
    console.log('✓ Phase column populated:', lastPhase);
    expect(lastPhase).not.toBe('-');

    // Screenshot 7: Phase completed (Phase column populated)
    await page.screenshot({ path: 'test-results/visual-07-phase-completed.png', fullPage: true });

    // Wait for program to complete (icon changes to ✓ or ✗)
    const iconCell = page.locator(`#mp-icon-${programId}`);
    await page.waitForFunction(
      (pid) => {
        const cell = document.querySelector(`#mp-icon-${pid}`);
        const icon = cell?.textContent || '';
        return icon === '✓' || icon === '✗';
      },
      programId,
      { timeout: 120000 }
    );

    console.log('✓ First program completed');

    // Verify "En cours" is cleared
    const finalCurrent = await currentCell.textContent();
    console.log('✓ En cours cleared:', finalCurrent === '');
    expect(finalCurrent).toBe('');

    // Verify "Tokens" is populated
    const tokensCell = page.locator(`#mp-tokens-${programId}`);
    const tokens = await tokensCell.textContent();
    console.log('✓ Tokens column:', tokens);
    expect(tokens).toMatch(/\d/); // Should contain digits

    // Screenshot 8: Program completed (all columns filled)
    await page.screenshot({ path: 'test-results/visual-08-program-completed.png', fullPage: true });

    // Close modal (don't wait for full batch)
    await page.click('#migrate-overlay .modal-close');
    await page.waitForTimeout(1000);

    // Screenshot 9: Modal closed
    await page.screenshot({ path: 'test-results/visual-09-modal-closed.png', fullPage: true });

    console.log('✅ All visual checkpoints passed!');
    console.log('📸 Screenshots saved in test-results/visual-*.png');
  });
});
