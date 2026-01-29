import { test } from '@playwright/test';

test('Capture finale ADH IDE 237 V6.0', async ({ page }) => {
  await page.goto('http://jira.lb2i.com/viewer.html#specs/ADH-IDE-237.md');
  await page.waitForTimeout(3000);
  
  // Screenshot page complète
  await page.screenshot({ path: 'test-results/final-v60-full.png', fullPage: true });
  
  // Screenshot section OBJECTIF METIER
  await page.screenshot({ path: 'test-results/final-v60-objectif.png' });
  
  console.log('Screenshots saved to test-results/');
});
