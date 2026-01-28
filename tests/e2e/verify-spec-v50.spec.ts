import { test, expect, Page } from '@playwright/test';

// Helper function to wait for content to load
async function waitForContentLoaded(page: Page) {
  await page.waitForFunction(() => {
    const content = document.querySelector('.content');
    return content && !content.textContent?.includes('Chargement');
  }, { timeout: 10000 });
}

// Helper function to navigate to a spec by IDE number
async function navigateToSpec(page: Page, ideNumber: string, folderName: string = 'Ventes') {
  // Open the folder first
  const folder = page.locator(`.folder-header:has-text("${folderName}")`);
  if (await folder.count() > 0) {
    await folder.click();
    await page.waitForTimeout(500);
  }

  // Click on the spec
  const specLink = page.locator(`.nav-item:has-text("IDE ${ideNumber}")`).first();
  if (await specLink.count() > 0) {
    await specLink.click();
    await waitForContentLoaded(page);
  }
}

test.describe('Validation specs V5.0 Pipeline', () => {
  const siteUrl = 'https://jira.lb2i.com/viewer.html';

  test.beforeEach(async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.folder-group', { timeout: 10000 });
  });

  test('ADH IDE 237 a le format V5.0', async ({ page }) => {
    await navigateToSpec(page, '237');
    const content = await page.locator('.content').textContent();

    // V5.0 format markers
    expect(content).toContain('Version spec');
    expect(content).toContain('5.0');
    expect(content).toContain('Pipeline 4-Phase');

    console.log('IDE 237 V5.0 format: OK');
  });

  test('ADH IDE 237 a les 3 onglets (Fonctionnel, Technique, Cartographie)', async ({ page }) => {
    await navigateToSpec(page, '237');

    // Check tabs exist
    const fonctionnelTab = page.locator('.spec-tab:has-text("Fonctionnel")');
    const techniqueTab = page.locator('.spec-tab:has-text("Technique")');
    const cartoTab = page.locator('.spec-tab:has-text("Cartographie")');

    expect(await fonctionnelTab.count()).toBeGreaterThan(0);
    expect(await techniqueTab.count()).toBeGreaterThan(0);
    expect(await cartoTab.count()).toBeGreaterThan(0);

    console.log('IDE 237 V5.0 3 tabs: OK');
  });

  test('ADH IDE 237 section Technique a les tables et parametres', async ({ page }) => {
    await navigateToSpec(page, '237');

    // Go to Technique tab
    const techniqueTab = page.locator('.spec-tab:has-text("Technique")');
    if (await techniqueTab.count() > 0) {
      await techniqueTab.click();
      await page.waitForTimeout(500);
    }

    const content = await page.locator('.content').textContent();

    // V5.0 must have tables section
    expect(content).toContain('Tables');
    expect(content).toContain('Table_268');
    expect(content).toContain('READ');

    // V5.0 must have parameters section
    expect(content).toContain('Parametres');
    expect(content).toContain('p.Societe');
    expect(content).toContain('p.Compte');
    expect(content).toContain('INOUT');

    console.log('IDE 237 V5.0 tables and params: OK');
  });

  test('ADH IDE 237 a les parametres en format lettre IDE', async ({ page }) => {
    await navigateToSpec(page, '237');

    // Go to Technique tab
    const techniqueTab = page.locator('.spec-tab:has-text("Technique")');
    if (await techniqueTab.count() > 0) {
      await techniqueTab.click();
      await page.waitForTimeout(500);
    }

    const content = await page.locator('.content').textContent();

    // V5.0 must have letter format (A, B, C, D)
    expect(content).toMatch(/\| A \|.*p\.Societe/);
    expect(content).toMatch(/\| B \|.*p\.Compte/);
    expect(content).toMatch(/\| C \|.*p\.Filiation/);
    expect(content).toMatch(/\| D \|/);

    // Must NOT have raw XML format
    expect(content).not.toContain('Field1');
    expect(content).not.toContain('FieldID');

    console.log('IDE 237 V5.0 IDE letter format: OK');
  });

  test('ADH IDE 237 section Cartographie a le statut orphelin', async ({ page }) => {
    await navigateToSpec(page, '237');

    // Go to Cartographie tab
    const cartoTab = page.locator('.spec-tab:has-text("Cartographie")');
    if (await cartoTab.count() > 0) {
      await cartoTab.click();
      await page.waitForTimeout(500);
    }

    const content = await page.locator('.content').textContent();

    // V5.0 must have orphan verification section
    expect(content).toContain('Verification orphelin');
    expect(content).toContain('Callers actifs');
    expect(content).toContain('PublicName');
    expect(content).toContain('ECF partage');
    expect(content).toContain('Conclusion');

    // For IDE 237, it should be ORPHELIN CONFIRME
    expect(content).toContain('ORPHELIN CONFIRME');

    console.log('IDE 237 V5.0 orphan status: OK');
  });

  test('ADH IDE 237 a la section Notes Migration avec score complexite', async ({ page }) => {
    await navigateToSpec(page, '237');

    const content = await page.locator('.content').textContent();

    // V5.0 must have migration notes
    expect(content).toContain('NOTES MIGRATION');
    expect(content).toContain('Complexite');
    expect(content).toContain('Score');
    expect(content).toContain('FAIBLE');

    // V5.0 must have migration guidance
    expect(content).toContain('Points d\'attention migration');
    expect(content).toContain('Variables globales');
    expect(content).toContain('Entity Framework');

    console.log('IDE 237 V5.0 migration notes: OK');
  });

  test('ADH IDE 237 a un algorigramme Mermaid', async ({ page }) => {
    await navigateToSpec(page, '237');

    // Go to Technique tab
    const techniqueTab = page.locator('.spec-tab:has-text("Technique")');
    if (await techniqueTab.count() > 0) {
      await techniqueTab.click();
      await page.waitForTimeout(500);
    }

    const content = await page.locator('.content').textContent();

    // V5.0 must have algorigramme section
    expect(content).toContain('Algorigramme');
    expect(content).toContain('START');
    expect(content).toContain('END');

    console.log('IDE 237 V5.0 flowchart: OK');
  });

  test('ADH IDE 237 ne contient pas de format XML brut', async ({ page }) => {
    await navigateToSpec(page, '237');

    const content = await page.locator('.content').textContent();

    // V5.0 must NOT have raw XML formats
    expect(content).not.toContain('ISN_2');
    expect(content).not.toContain('ISN2=');
    expect(content).not.toContain('{0,');
    expect(content).not.toContain('LogicLine');
    expect(content).not.toContain('DataObject');

    console.log('IDE 237 V5.0 no raw XML: OK');
  });
});
