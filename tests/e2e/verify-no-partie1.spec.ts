import { test, expect } from '@playwright/test';

test('Verify PARTIE I placeholder removed', async ({ page }) => {
  await page.goto('https://jira.lb2i.com/viewer.html', { waitUntil: 'networkidle' });

  // Ouvrir Ventes et cliquer sur ADH IDE 237
  await page.waitForSelector('.folder-group', { timeout: 10000 });
  const ventesFolder = page.locator('.folder-header:has-text("Ventes")');
  if (await ventesFolder.count() > 0) {
    await ventesFolder.click();
    await page.waitForTimeout(500);
  }

  const spec237 = page.locator('.nav-item:has-text("ADH IDE 237")');
  if (await spec237.count() > 0) {
    await spec237.first().click();
    await page.waitForTimeout(2000);
  }

  // Verifier que PARTIE I placeholder n'est plus present
  const contentHtml = await page.locator('.content').innerHTML();
  const hasPartieI = contentHtml.includes('PARTIE I: SPECIFICATION FONCTIONNELLE (Annotations)');
  const hasACompleter = contentHtml.includes('A completer dans');

  console.log(`Contient PARTIE I placeholder: ${hasPartieI}`);
  console.log(`Contient "A completer dans": ${hasACompleter}`);

  expect(hasPartieI).toBe(false);
  expect(hasACompleter).toBe(false);
});
