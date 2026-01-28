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

test.describe('Validation specs V6.0 Pipeline - Timing', () => {
  const siteUrl = 'https://jira.lb2i.com/viewer.html';

  test.beforeEach(async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.folder-group', { timeout: 10000 });
  });

  test('ADH IDE 236 a les informations de timing', async ({ page }) => {
    await navigateToSpec(page, '236');
    const content = await page.locator('.content').textContent();

    expect(content).toContain('Debut');
    expect(content).toContain('Fin');
    expect(content).toContain('Duree pipeline');
    expect(content).toContain('17:45:05');
    expect(content).toContain('17:47:09');
    expect(content).toContain('23.3s');
    expect(content).toContain('V6.0');

    console.log('IDE 236 V6.0 timing: OK');
  });

  test('ADH IDE 237 a les informations de timing', async ({ page }) => {
    await navigateToSpec(page, '237');
    const content = await page.locator('.content').textContent();

    expect(content).toContain('Debut');
    expect(content).toContain('Fin');
    expect(content).toContain('Duree pipeline');
    expect(content).toContain('17:47:37');
    expect(content).toContain('17:48:11');
    expect(content).toContain('15.8s');
    expect(content).toContain('V6.0');

    console.log('IDE 237 V6.0 timing: OK');
  });

  test('ADH IDE 236 a les donnees V6.0 (tables, expressions)', async ({ page }) => {
    await navigateToSpec(page, '236');
    const content = await page.locator('.content').textContent();

    expect(content).toContain('Print ticket vente');
    expect(content).toContain('NON_ORPHELIN');
    expect(content).toContain('Tables');
    expect(content).toContain('READ');

    console.log('IDE 236 V6.0 data: OK');
  });

  test('ADH IDE 237 a les donnees V6.0 (tables, expressions, regles)', async ({ page }) => {
    await navigateToSpec(page, '237');
    const content = await page.locator('.content').textContent();

    expect(content).toContain('Transaction Nouv vente avec GP');
    expect(content).toContain('NON_ORPHELIN');
    expect(content).toContain('Tables');
    expect(content).toContain('WRITE');
    expect(content).toContain('READ');
    expect(content).toContain('LINK');

    console.log('IDE 237 V6.0 data: OK');
  });
});
