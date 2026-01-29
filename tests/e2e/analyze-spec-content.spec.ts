import { test, expect, Page } from '@playwright/test';

async function waitForContentLoaded(page: Page) {
  await page.waitForFunction(() => {
    const content = document.querySelector('.content');
    return content && !content.textContent?.includes('Chargement');
  }, { timeout: 10000 });
}

async function navigateToSpec(page: Page, ideNumber: string, folderName: string = 'Ventes') {
  const folder = page.locator(`.folder-header:has-text("${folderName}")`);
  if (await folder.count() > 0) {
    await folder.click();
    await page.waitForTimeout(500);
  }

  const specLink = page.locator(`.nav-item:has-text("IDE ${ideNumber}")`).first();
  if (await specLink.count() > 0) {
    await specLink.click();
    await waitForContentLoaded(page);
  }
}

test.describe('Analyse contenu spec ADH IDE 237', () => {
  const siteUrl = 'https://jira.lb2i.com/viewer.html';

  test('Extraire contenu onglet Fonctionnel', async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.folder-group', { timeout: 10000 });
    await navigateToSpec(page, '237', 'Ventes');

    // Click on Fonctionnel tab
    const fonctionnelTab = page.locator('.spec-tab:has-text("Fonctionnel")');
    if (await fonctionnelTab.count() > 0) {
      await fonctionnelTab.click();
      await page.waitForTimeout(500);
    }

    const content = await page.locator('.content').textContent();
    console.log('\n========== ONGLET FONCTIONNEL ==========\n');
    console.log(content);
    console.log('\n========== FIN FONCTIONNEL ==========\n');
  });

  test('Extraire contenu onglet Technique', async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.folder-group', { timeout: 10000 });
    await navigateToSpec(page, '237', 'Ventes');

    // Click on Technique tab
    const techniqueTab = page.locator('.spec-tab:has-text("Technique")');
    if (await techniqueTab.count() > 0) {
      await techniqueTab.click();
      await page.waitForTimeout(500);
    }

    const content = await page.locator('.content').textContent();
    console.log('\n========== ONGLET TECHNIQUE ==========\n');
    console.log(content);
    console.log('\n========== FIN TECHNIQUE ==========\n');
  });

  test('Extraire contenu onglet Cartographie', async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.folder-group', { timeout: 10000 });
    await navigateToSpec(page, '237', 'Ventes');

    // Click on Cartographie tab
    const cartoTab = page.locator('.spec-tab:has-text("Cartographie")');
    if (await cartoTab.count() > 0) {
      await cartoTab.click();
      await page.waitForTimeout(500);
    }

    const content = await page.locator('.content').textContent();
    console.log('\n========== ONGLET CARTOGRAPHIE ==========\n');
    console.log(content);
    console.log('\n========== FIN CARTOGRAPHIE ==========\n');
  });
});
