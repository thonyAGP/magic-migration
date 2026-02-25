import { test, expect } from '@playwright/test';

/**
 * E2E Test: Validate 4 modal migration bug fixes
 *
 * Bug 1: ETA displayed ONCE (not twice)
 * Bug 2/3: Abort stops dots and clears "En cours"
 * Bug 4: Program count correct (3/3, not 9/3)
 */

test('Modal Migration - 4 bugs validation', async ({ page }) => {
  test.setTimeout(180000); // 3min

  console.log('🔍 Step 1: Navigate to dashboard');
  await page.goto('/'); // Uses baseURL from playwright.config.ts (port 3099)
  await page.waitForLoadState('networkidle');

  console.log('🔍 Step 2: Navigate to ADH');
  await page.click('.project-card[data-goto="ADH"]');
  await page.waitForSelector('#batch-select', { timeout: 10000 });

  console.log('🔍 Step 3: Select B-TEST-1 and open migration modal');
  await page.selectOption('#batch-select', 'B-TEST-1');
  await page.waitForFunction(() => {
    const btn = document.querySelector('#btn-migrate') as HTMLButtonElement;
    return btn && !btn.disabled;
  }, { timeout: 30000 });
  await page.click('#btn-migrate');

  console.log('🔍 Step 4: Wait for modal visible');
  await page.waitForFunction(() => {
    const modal = document.querySelector('#migrate-confirm-modal');
    return modal && modal.classList.contains('visible');
  }, { timeout: 10000 });

  console.log('🔍 Step 5: Launch migration');
  await page.click('#migrate-confirm-modal button:has-text("Lancer")');

  console.log('🔍 Step 6: Wait for overlay visible');
  await page.waitForFunction(() => {
    const overlay = document.querySelector('#migrate-overlay');
    return overlay && overlay.classList.contains('visible');
  }, { timeout: 10000 });

  console.log('🔍 Step 7: Wait for program to start');
  await page.waitForSelector('.mp-grid tbody tr', { timeout: 30000 });

  // Wait a bit for migration to progress
  await page.waitForTimeout(10000);

  console.log('🔍 Step 8: Screenshot initial state');
  await page.screenshot({ path: 'test-results/modal-state-running.png', fullPage: true });

  console.log('🔍 Step 9: Verify ETA displayed ONCE (Bug 1)');
  const elapsedText = await page.locator('#mp-elapsed').textContent();
  console.log('📊 Elapsed text:', elapsedText);
  expect(elapsedText).toContain('ETA:'); // Should appear in elapsed

  const progressLabel = await page.locator('#mp-module-label').textContent();
  console.log('📊 Progress label:', progressLabel);
  expect(progressLabel).toMatch(/\d+\/\d+ programmes \(\d+%\)/); // Should NOT contain ETA
  expect(progressLabel).not.toContain('ETA:'); // ✅ Bug 1 fixed

  console.log('🔍 Step 10: Verify program count correct (Bug 4)');
  const progressMatch = progressLabel?.match(/(\d+)\/(\d+) programmes/);
  if (progressMatch) {
    const [, done, total] = progressMatch;
    console.log(`📊 Progress: ${done}/${total}`);
    expect(parseInt(done, 10)).toBeLessThanOrEqual(parseInt(total, 10)); // ✅ Bug 4 fixed (no 9/3)
  }

  console.log('🔍 Step 11: Click Annuler');
  const abortBtn = page.locator('#mp-abort-btn');
  await abortBtn.click();

  // Confirm dialog
  page.on('dialog', dialog => dialog.accept());
  await page.waitForTimeout(1000); // Wait for abort to take effect

  console.log('🔍 Step 12: Screenshot after abort');
  await page.screenshot({ path: 'test-results/modal-state-aborted.png', fullPage: true });

  console.log('🔍 Step 13: Verify dots stopped pulsing (Bug 2)');
  const activeDots = await page.locator('.mp-dot.active').count();
  console.log('📊 Active dots:', activeDots);
  expect(activeDots).toBe(0); // ✅ Bug 2 fixed (no pulsing dots after abort)

  console.log('🔍 Step 14: Verify "En cours" columns cleared (Bug 3)');
  const currentCells = page.locator('[id^="mp-current-"]');
  const currentCount = await currentCells.count();
  console.log('📊 "En cours" cells found:', currentCount);

  for (let i = 0; i < currentCount; i++) {
    const text = await currentCells.nth(i).textContent();
    expect(text).toBe(''); // ✅ Bug 3 fixed (all "En cours" cells empty)
  }

  console.log('✅ ALL 4 BUGS VALIDATED!');
  console.log('📸 Screenshots saved:');
  console.log('  - modal-state-running.png');
  console.log('  - modal-state-aborted.png');
});
