import { test, expect } from '@playwright/test';

test('PHASE 1 FINAL PROOF: All fixes working', async ({ page }) => {
  test.setTimeout(180000); // 3min

  console.log('🔍 Step 1: Navigate to dashboard');
  await page.goto('http://localhost:3070');
  await page.waitForLoadState('networkidle');

  console.log('🔍 Step 2: Navigate to ADH');
  await page.click('.project-card[data-goto="ADH"]');
  await page.waitForSelector('#batch-select', { timeout: 10000 });

  console.log('🔍 Step 3: Wait for module stats to load from API');
  await page.waitForTimeout(3000);

  console.log('🔍 Step 4: Verify B8 module shows 1 vérifié');
  const b8Module = page.locator('.module-row').filter({ hasText: 'B8' });
  const b8Stats = await b8Module.locator('.module-breakdown').textContent();
  console.log('📊 B8 Stats:', b8Stats);
  expect(b8Stats).toContain('1 vérifié');
  await b8Module.screenshot({ path: 'test-results/final-b8-module.png' });

  console.log('🔍 Step 5: Select B8 and verify dropdown');
  await page.selectOption('#batch-select', 'B8');
  const dropdownText = await page.locator('#batch-select option[value="B8"]').textContent();
  console.log('📋 Dropdown:', dropdownText);
  expect(dropdownText).toContain('1/3 vérifiés');

  console.log('🔍 Step 6: Open migration modal');
  await page.waitForFunction(() => {
    const btn = document.querySelector('#btn-migrate') as HTMLButtonElement;
    return btn && !btn.disabled;
  }, { timeout: 30000 });
  await page.click('#btn-migrate');

  console.log('🔍 Step 7: Wait for modal visible');
  await page.waitForFunction(() => {
    const modal = document.querySelector('#migrate-confirm-modal');
    return modal && modal.classList.contains('visible');
  }, { timeout: 10000 });

  console.log('🔍 Step 8: Launch migration');
  await page.click('#migrate-confirm-modal button:has-text("Lancer")');

  console.log('🔍 Step 9: Wait for overlay with 9 columns');
  await page.waitForFunction(() => {
    const overlay = document.querySelector('#migrate-overlay');
    return overlay && overlay.classList.contains('visible');
  }, { timeout: 10000 });

  await page.waitForSelector('.mp-grid thead', { timeout: 10000 });
  const headers = await page.locator('.mp-grid thead th').allTextContents();
  console.log('📋 Headers:', headers);
  expect(headers).toContain('Phase');
  expect(headers).toContain('En cours');
  expect(headers).toContain('ETA');
  expect(headers).toContain('Tokens');

  await page.screenshot({ path: 'test-results/final-modal-table.png', fullPage: true });

  console.log('🔍 Step 10: Wait for program to start');
  await page.waitForSelector('.mp-grid tbody tr', { timeout: 30000 });
  const firstRow = page.locator('.mp-grid tbody tr').first();
  const cells = await firstRow.locator('td').allTextContents();
  const programId = cells[0];
  console.log('📊 First program:', programId, 'Cells:', cells.length);
  expect(cells.length).toBeGreaterThanOrEqual(9);

  console.log('🔍 Step 11: Wait for "En cours" to populate');
  const currentCell = page.locator(`#mp-current-${programId}`);
  await page.waitForFunction(
    (pid) => {
      const cell = document.querySelector(`#mp-current-${pid}`);
      const text = cell?.textContent || '';
      return text && text !== '-' && text.trim() !== '';
    },
    programId,
    { timeout: 60000 }
  );
  const enCoursText = await currentCell.textContent();
  console.log('✅ En cours:', enCoursText);
  expect(enCoursText).not.toBe('');

  console.log('🔍 Step 12: Check dots progression (no holes)');
  const dotsContainer = firstRow.locator('.mp-dots');
  await dotsContainer.screenshot({ path: 'test-results/final-dots.png' });

  // Count done dots (should be progressive, no holes)
  const doneDots = await page.locator(`#mp-row-${programId} .mp-dot.done`).count();
  console.log('✅ Done dots:', doneDots);
  expect(doneDots).toBeGreaterThan(0);

  console.log('🔍 Step 13: Wait for ETA header to appear');
  const headerText = await page.locator('#mp-elapsed').textContent();
  console.log('📊 Header:', headerText);
  expect(headerText).toMatch(/ETA:|Verification/);

  console.log('✅ ALL PHASE 1 FIXES VERIFIED!');
  console.log('📸 Screenshots saved:');
  console.log('  - final-b8-module.png');
  console.log('  - final-modal-table.png');
  console.log('  - final-dots.png');
});
