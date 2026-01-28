import { test } from '@playwright/test';

test('Capture spec améliorée - OBJECTIF METIER complet', async ({ page }) => {
  await page.goto('http://jira.lb2i.com/viewer.html#specs/ADH-IDE-237.md');
  await page.waitForTimeout(4000);

  // Screenshot section OBJECTIF METIER
  await page.screenshot({ path: 'test-results/improved-objectif-metier.png' });

  // Scroll vers les règles métier
  await page.evaluate(() => {
    const h3 = Array.from(document.querySelectorAll('h3'))
      .find(el => el.textContent?.includes('Regles metier'));
    if (h3) h3.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/improved-regles-metier.png' });

  // Scroll vers les tables
  await page.evaluate(() => {
    const h4 = Array.from(document.querySelectorAll('h4'))
      .find(el => el.textContent?.includes('WRITE'));
    if (h4) h4.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/improved-tables-write.png' });

  console.log('Screenshots saved to test-results/');
});
