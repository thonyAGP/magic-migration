import { test, expect } from '@playwright/test';

test('PROOF: Migration modal displays 3 new columns', async ({ page }) => {
  test.setTimeout(300000); // 5min

  // Capture console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ JS Error:', msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('❌ Page Error:', err.message);
  });

  console.log('🔍 Step 1: Navigate to dashboard');
  await page.goto('http://localhost:3070');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/proof-01-homepage.png', fullPage: true });

  console.log('🔍 Step 2: Navigate to ADH project');
  await page.click('.project-card[data-goto="ADH"]');
  await page.waitForSelector('#batch-select', { timeout: 10000 });
  await page.screenshot({ path: 'test-results/proof-02-adh-loaded.png', fullPage: true });

  console.log('🔍 Step 3: Select batch B8');
  await page.selectOption('#batch-select', 'B8');

  console.log('🔍 Step 4: Wait for btn-migrate to be enabled');
  await page.waitForFunction(
    () => {
      const btn = document.querySelector('#btn-migrate') as HTMLButtonElement;
      return btn && !btn.disabled;
    },
    { timeout: 60000 }
  );
  await page.screenshot({ path: 'test-results/proof-03-batch-selected.png', fullPage: true });

  console.log('🔍 Step 5: Click Migrer Module');
  await page.click('#btn-migrate');

  // Wait for modal to appear (without .show class check)
  await page.waitForSelector('#migrate-confirm-modal', { state: 'visible', timeout: 10000 });
  await page.screenshot({ path: 'test-results/proof-04-modal-opened.png', fullPage: true });

  console.log('🔍 Step 6: Launch migration');

  // Inject error handler before clicking
  await page.evaluate(() => {
    window.addEventListener('error', (e) => {
      console.error('GLOBAL ERROR:', e.message, e.filename, e.lineno, e.colno);
    });
  });

  const launchBtn = page.locator('#migrate-confirm-modal button').filter({ hasText: 'Lancer' });
  await launchBtn.click();

  // Wait a bit to let any errors surface
  await page.waitForTimeout(2000);

  console.log('🔍 Step 7: Wait for migration overlay');
  // Wait for overlay to have 'visible' class (CSS may keep it hidden for other reasons)
  await page.waitForFunction(
    () => {
      const overlay = document.querySelector('#migrate-overlay');
      return overlay && overlay.classList.contains('visible');
    },
    { timeout: 10000 }
  );
  await page.screenshot({ path: 'test-results/proof-05-overlay-opened.png', fullPage: true });

  console.log('🔍 Step 8: Wait for table with headers');
  await page.waitForSelector('.mp-grid thead', { timeout: 10000 });

  // Verify table headers
  const headers = await page.locator('.mp-grid thead th').allTextContents();
  console.log('📋 Table headers:', JSON.stringify(headers));

  // CRITICAL ASSERTIONS
  expect(headers.length).toBeGreaterThanOrEqual(9);
  expect(headers).toContain('Phase');
  expect(headers).toContain('En cours');
  expect(headers).toContain('Tokens');

  await page.screenshot({ path: 'test-results/proof-06-table-headers.png', fullPage: true });

  console.log('🔍 Step 9: Wait for first program row');
  await page.waitForSelector('.mp-grid tbody tr', { timeout: 30000 });

  const firstRow = page.locator('.mp-grid tbody tr').first();
  const cells = await firstRow.locator('td').allTextContents();
  console.log('📋 First row cells:', JSON.stringify(cells));

  // Count columns in first row
  const cellCount = cells.length;
  console.log('📊 Column count:', cellCount);
  expect(cellCount).toBeGreaterThanOrEqual(9);

  await page.screenshot({ path: 'test-results/proof-07-first-row.png', fullPage: true });

  console.log('🔍 Step 10: Wait for En cours column to populate');
  const programId = cells[0]; // First cell is IDE

  // Wait up to 2 minutes for "En cours" to show a phase
  let enCoursValue = '';
  for (let i = 0; i < 120; i++) {
    const currentCell = page.locator(`#mp-current-${programId}`);
    enCoursValue = await currentCell.textContent() || '';
    if (enCoursValue && enCoursValue !== '-' && enCoursValue.trim() !== '') {
      console.log(`✅ "En cours" populated after ${i}s:`, enCoursValue);
      break;
    }
    await page.waitForTimeout(1000);
  }

  expect(enCoursValue).not.toBe('-');
  expect(enCoursValue.trim()).not.toBe('');

  await page.screenshot({ path: 'test-results/proof-08-en-cours-filled.png', fullPage: true });

  console.log('🔍 Step 11: Wait for Phase column to populate');
  let phaseValue = '';
  for (let i = 0; i < 120; i++) {
    const phaseCell = page.locator(`#mp-phase-${programId}`);
    phaseValue = await phaseCell.textContent() || '';
    if (phaseValue && phaseValue !== '-' && phaseValue.trim() !== '') {
      console.log(`✅ "Phase" populated after ${i}s:`, phaseValue);
      break;
    }
    await page.waitForTimeout(1000);
  }

  expect(phaseValue).not.toBe('-');
  expect(phaseValue.trim()).not.toBe('');

  await page.screenshot({ path: 'test-results/proof-09-phase-filled.png', fullPage: true });

  console.log('✅ ALL VERIFICATIONS PASSED');
  console.log('📸 Screenshots saved in test-results/proof-*.png');
});
