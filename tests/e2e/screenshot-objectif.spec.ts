import { test } from '@playwright/test';

test('Capture section OBJECTIF METIER', async ({ page }) => {
  await page.goto('http://jira.lb2i.com/viewer.html#specs/ADH-IDE-237.md');
  await page.waitForTimeout(3000);
  
  // Scroll vers la section OBJECTIF METIER
  await page.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll('h2')).find(el => el.textContent?.includes('OBJECTIF'));
    if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: 'test-results/objectif-metier-detail.png' });
  console.log('Screenshot saved');
});
