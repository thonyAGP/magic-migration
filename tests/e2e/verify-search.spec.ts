import { test, expect, Page } from '@playwright/test';

test.describe('Verification recherche viewer', () => {
  const siteUrl = 'https://jira.lb2i.com/viewer.html';

  test.beforeEach(async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.sidebar-header', { timeout: 10000 });
  });

  test('La recherche par numero IDE trouve ADH-IDE-237', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('237');
    await page.waitForTimeout(500);

    const searchResults = page.locator('#searchResults');
    await expect(searchResults).toBeVisible();

    const resultText = await searchResults.textContent();
    expect(resultText).toContain('ADH IDE 237');
    expect(resultText).toContain('Transaction Nouv vente');

    console.log('Search by IDE number 237: OK');
  });

  test('La recherche par numero IDE trouve ADH-IDE-121', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('121');
    await page.waitForTimeout(500);

    const searchResults = page.locator('#searchResults');
    await expect(searchResults).toBeVisible();

    const resultText = await searchResults.textContent();
    expect(resultText).toContain('ADH IDE 121');

    console.log('Search by IDE number 121: OK');
  });

  test('La recherche par nom partiel trouve des resultats', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('vente');
    await page.waitForTimeout(500);

    const searchResults = page.locator('#searchResults');
    await expect(searchResults).toBeVisible();

    const resultText = await searchResults.textContent();
    expect(resultText).toContain('vente');
    expect(resultText).not.toContain('Aucun resultat');

    console.log('Search by partial name: OK');
  });

  test('Cliquer sur un resultat de recherche charge la spec', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('237');
    await page.waitForTimeout(500);

    const searchResult = page.locator('.search-result-item').first();
    await searchResult.click();

    await page.waitForTimeout(1000);

    const content = await page.locator('.content').textContent();
    expect(content).toContain('ADH IDE 237');
    expect(content).toContain('Transaction Nouv vente');

    console.log('Click on search result loads spec: OK');
  });

  test('ADH-IDE-237 affiche la version V4.0 avec APEX 4-Phase Workflow', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('237');
    await page.waitForTimeout(500);

    const searchResult = page.locator('.search-result-item').first();
    await searchResult.click();

    await page.waitForTimeout(1000);

    const content = await page.locator('.content').textContent();
    expect(content).toContain('Version spec');
    expect(content).toContain('4.0');
    expect(content).toContain('APEX 4-Phase Workflow');

    console.log('ADH IDE 237 shows V4.0 APEX 4-Phase: OK');
  });

  test('La recherche sans resultats affiche un message', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('xyz999nonexistent');
    await page.waitForTimeout(500);

    const searchResults = page.locator('#searchResults');
    await expect(searchResults).toBeVisible();

    const resultText = await searchResults.textContent();
    expect(resultText).toContain('Aucun resultat');

    console.log('No results message: OK');
  });
});
