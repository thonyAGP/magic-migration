import { test } from '@playwright/test';

test('Debug - capture ecran spec 237', async ({ page }) => {
  await page.goto('https://jira.lb2i.com/viewer.html', { waitUntil: 'networkidle' });

  // Attendre le chargement
  await page.waitForSelector('.folder-group', { timeout: 10000 });

  // Capture avant clic
  await page.screenshot({ path: 'debug-1-avant-clic.png', fullPage: true });

  // Ouvrir le dossier Ventes
  const ventesFolder = page.locator('.folder-header:has-text("Ventes")');
  if (await ventesFolder.count() > 0) {
    await ventesFolder.click();
    await page.waitForTimeout(500);
  }

  // Capture apres ouverture dossier
  await page.screenshot({ path: 'debug-2-dossier-ouvert.png', fullPage: true });

  // Cliquer sur ADH IDE 237
  const spec237 = page.locator('.nav-item:has-text("ADH IDE 237")');
  if (await spec237.count() > 0) {
    await spec237.first().click();
    await page.waitForTimeout(3000); // Attendre le chargement
  }

  // Capture finale
  await page.screenshot({ path: 'debug-3-spec-chargee.png', fullPage: true });

  // Afficher le HTML du content
  const contentHtml = await page.locator('.content').innerHTML();
  console.log('=== CONTENU HTML (500 premiers chars) ===');
  console.log(contentHtml.substring(0, 500));
  console.log('...');

  // Vérifier si spec-tabs existe
  const specTabsCount = await page.locator('.spec-tabs').count();
  console.log(`Nombre de .spec-tabs: ${specTabsCount}`);

  // Vérifier le contenu brut
  const hasTabMarker = contentHtml.includes('TAB:');
  console.log(`Contient TAB marker: ${hasTabMarker}`);
});
