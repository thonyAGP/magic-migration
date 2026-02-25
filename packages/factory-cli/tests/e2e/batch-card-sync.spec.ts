import { test, expect } from '@playwright/test';

test('PROOF: Batch card B8 shows 1 vérifié after API load', async ({ page }) => {
  test.setTimeout(60000);

  console.log('🔍 Step 1: Navigate to dashboard');
  await page.goto('http://localhost:3070');
  await page.waitForLoadState('networkidle');

  console.log('🔍 Step 2: Wait for API /api/status to load');
  await page.waitForTimeout(3000); // Wait for fetch to complete

  console.log('🔍 Step 3: Navigate to ADH');
  await page.click('.project-card[data-goto="ADH"]');
  await page.waitForSelector('#batch-select', { timeout: 10000 });

  console.log('🔍 Step 4: Wait for modules to load');
  await page.waitForSelector('.module-row', { timeout: 10000 });

  console.log('🔍 Step 5: Screenshot full page');
  await page.screenshot({ path: 'test-results/card-b8-full-page.png', fullPage: true });

  console.log('🔍 Step 6: Find B8 module row');
  const b8Module = page.locator('.module-row').filter({ hasText: 'B8' }).first();
  await b8Module.waitFor({ state: 'visible', timeout: 10000 });

  console.log('🔍 Step 7: Read module breakdown stats');
  const breakdownEl = b8Module.locator('.module-breakdown');
  const statsText = await breakdownEl.textContent();
  console.log('📊 B8 Module Stats:', statsText);

  console.log('🔍 Step 8: Screenshot B8 module only');
  await b8Module.screenshot({ path: 'test-results/module-b8-only.png' });

  console.log('🔍 Step 8: Verify dropdown text');
  await page.selectOption('#batch-select', 'B8');
  const dropdownText = await page.locator('#batch-select option[value="B8"]').textContent();
  console.log('📋 Dropdown B8:', dropdownText);

  // ASSERTIONS
  expect(statsText).toContain('1 vérifié'); // Should show 1, not 0
  expect(dropdownText).toContain('1/3 vérifiés'); // Should match card

  console.log('✅ PROOF: Carte et dropdown synchronisés!');
  console.log('📸 Screenshots: card-b8-*.png');
});
