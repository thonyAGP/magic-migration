import { test } from '@playwright/test';

test('Capture algorigramme', async ({ page }) => {
  await page.goto('http://jira.lb2i.com/viewer.html#specs/ADH-IDE-237.md');
  await page.waitForTimeout(3000);
  
  // Cliquer sur onglet Technique
  await page.click('text=Technique');
  await page.waitForTimeout(1000);
  
  // Scroll vers Algorigramme
  await page.evaluate(() => {
    const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.textContent?.includes('Algorigramme'));
    if (h3) h3.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'test-results/algorigramme.png' });
  console.log('Screenshot saved');
});
