import { test, expect } from '@playwright/test';

const BASE = 'http://jira.lb2i.com/viewer.html';

test('screenshot mockup T1 - Saisie transaction', async ({ page }) => {
  await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
  await page.waitForTimeout(3000);

  // Switch to Ecrans tab
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.spec-tab');
    for (const t of tabs) {
      if (t.textContent?.includes('Ecrans')) (t as HTMLElement).click();
    }
  });
  await page.waitForTimeout(1000);

  // Find first mockup and screenshot it
  const mockup = page.locator('.magic-mockup').first();
  await mockup.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await mockup.screenshot({ path: 'test-results/mockup-v76-t1.png' });

  // Also full page screenshot of Ecrans tab
  await page.screenshot({ path: 'test-results/mockup-v76-ecrans-full.png', fullPage: false });
});

test('screenshot mockup T2 - Reglements (table with columns)', async ({ page }) => {
  await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
  await page.waitForTimeout(3000);

  // Switch to Ecrans tab
  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.spec-tab');
    for (const t of tabs) {
      if (t.textContent?.includes('Ecrans')) (t as HTMLElement).click();
    }
  });
  await page.waitForTimeout(1000);

  // Find second mockup (T2) and screenshot it
  const mockup = page.locator('.magic-mockup').nth(1);
  await mockup.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await mockup.screenshot({ path: 'test-results/mockup-v76-t2-table.png' });
});

test('screenshot mockup T7 - Saisie Bilaterale (proportions check)', async ({ page }) => {
  await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    const tabs = document.querySelectorAll('.spec-tab');
    for (const t of tabs) {
      if (t.textContent?.includes('Ecrans')) (t as HTMLElement).click();
    }
  });
  await page.waitForTimeout(1000);

  // Find T7 mockup (Saisie Bilaterale) - 3rd mockup (T1, T2, T7)
  const mockup = page.locator('.magic-mockup').nth(2);
  await mockup.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await mockup.screenshot({ path: 'test-results/mockup-v76-t7-bilaterale.png' });
});
