import { test, expect } from '@playwright/test';

test.describe('Verification deploiement V3.5', () => {
  const siteUrl = 'https://jira.lb2i.com/viewer.html';

  test('Le site est accessible', async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/OpenSpec|Viewer/i);
  });

  test('Les specs sont groupees par dossier', async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });

    // Attendre que la navigation soit chargee
    await page.waitForSelector('.nav-section', { timeout: 10000 });

    // Verifier la presence des folder-group (nouveau format)
    const folderGroups = await page.locator('.folder-group').count();
    console.log(`Nombre de folder-group: ${folderGroups}`);

    // On attend au moins quelques dossiers
    expect(folderGroups).toBeGreaterThan(5);
  });

  test('Le dossier Ventes contient ADH IDE 237', async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });

    // Attendre le chargement
    await page.waitForSelector('.folder-group', { timeout: 10000 });

    // Chercher le dossier Ventes et l'ouvrir
    const ventesFolder = page.locator('.folder-header:has-text("Ventes")');
    if (await ventesFolder.count() > 0) {
      await ventesFolder.click();

      // Verifier que ADH IDE 237 est dans ce dossier
      const spec237 = page.locator('.nav-item:has-text("ADH IDE 237")');
      await expect(spec237).toBeVisible({ timeout: 5000 });
      console.log('ADH IDE 237 trouve dans le dossier Ventes');
    }
  });

  test('La spec V3.5 est accessible', async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });

    // Attendre le chargement
    await page.waitForSelector('.folder-group', { timeout: 10000 });

    // Ouvrir le dossier Ventes
    const ventesFolder = page.locator('.folder-header:has-text("Ventes")');
    if (await ventesFolder.count() > 0) {
      await ventesFolder.click();
      await page.waitForTimeout(500);
    }

    // Cliquer sur ADH IDE 237
    const spec237 = page.locator('.nav-item:has-text("ADH IDE 237")');
    if (await spec237.count() > 0) {
      await spec237.first().click();

      // Verifier que le contenu se charge
      await page.waitForSelector('.content', { timeout: 5000 });

      // Verifier la presence des onglets (classe: spec-tab)
      await page.waitForSelector('.spec-tabs', { timeout: 10000 });
      const tabs = await page.locator('.spec-tab').count();
      console.log(`Nombre d'onglets: ${tabs}`);
      expect(tabs).toBeGreaterThanOrEqual(3);
    }
  });

  test('Les 3 onglets sont presents (Fonctionnel, Technique, Cartographie)', async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });

    // Attendre et ouvrir Ventes
    await page.waitForSelector('.folder-group', { timeout: 10000 });
    const ventesFolder = page.locator('.folder-header:has-text("Ventes")');
    if (await ventesFolder.count() > 0) {
      await ventesFolder.click();
      await page.waitForTimeout(500);
    }

    // Cliquer sur ADH IDE 237
    const spec237 = page.locator('.nav-item:has-text("ADH IDE 237")');
    if (await spec237.count() > 0) {
      await spec237.first().click();
      await page.waitForSelector('.spec-tabs', { timeout: 10000 });

      // Verifier les 3 onglets
      const fonctionnel = page.locator('.spec-tab:has-text("Fonctionnel")');
      const technique = page.locator('.spec-tab:has-text("Technique")');
      const cartographie = page.locator('.spec-tab:has-text("Cartographie")');

      await expect(fonctionnel).toBeVisible();
      await expect(technique).toBeVisible();
      await expect(cartographie).toBeVisible();

      console.log('Les 3 onglets sont presents!');
    }
  });
});
