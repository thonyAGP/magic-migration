import { test, expect, Page } from '@playwright/test';

// Helper function to wait for content to load
async function waitForContentLoaded(page: Page) {
  await page.waitForFunction(() => {
    const content = document.querySelector('.content');
    return content && !content.textContent?.includes('Chargement');
  }, { timeout: 10000 });
}

// Helper function to navigate to a spec
async function navigateToSpec(page: Page, specName: string) {
  // Ouvrir le dossier Ventes
  const ventesFolder = page.locator('.folder-header:has-text("Ventes")');
  if (await ventesFolder.count() > 0) {
    await ventesFolder.click();
    await page.waitForTimeout(500);
  }

  // Cliquer sur la spec
  const spec = page.locator(`.nav-item:has-text("${specName}")`);
  if (await spec.count() > 0) {
    await spec.first().click();
    await waitForContentLoaded(page);
  }
}

test.describe('Verification specs V3.6 APEX (ADH IDE 236 et 237)', () => {
  const siteUrl = 'https://jira.lb2i.com/viewer.html';

  test.beforeEach(async ({ page }) => {
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.folder-group', { timeout: 10000 });
  });

  test('ADH IDE 236 a le vrai nom de fichier source (Prg_232.xml)', async ({ page }) => {
    await navigateToSpec(page, 'ADH IDE 236');

    const content = await page.locator('.content').textContent();

    // Verifier le vrai nom de fichier source
    expect(content).toContain('Prg_232.xml');
    expect(content).not.toContain('Prg_XXX.xml');

    console.log('IDE 236 source file: OK (Prg_232.xml)');
  });

  test('ADH IDE 237 a le vrai nom de fichier source (Prg_233.xml)', async ({ page }) => {
    await navigateToSpec(page, 'ADH IDE 237');

    const content = await page.locator('.content').textContent();

    // Verifier le vrai nom de fichier source
    expect(content).toContain('Prg_233.xml');
    expect(content).not.toContain('Prg_XXX.xml');

    console.log('IDE 237 source file: OK (Prg_233.xml)');
  });

  test('ADH IDE 237 a des regles metier documentees', async ({ page }) => {
    await navigateToSpec(page, 'ADH IDE 237');

    // Aller sur l'onglet Fonctionnel
    const fonctionnelTab = page.locator('.spec-tab:has-text("Fonctionnel")');
    if (await fonctionnelTab.count() > 0) {
      await fonctionnelTab.click();
      await page.waitForTimeout(500);
    }

    const content = await page.locator('.content').textContent();

    // Verifier les regles metier (pas "A documenter")
    expect(content).toContain('RM-001');
    expect(content).toContain('Verification cloture');
    expect(content).toContain('UNI');
    expect(content).toContain('BI');
    expect(content).not.toMatch(/RM-001.*A documenter/);

    console.log('IDE 237 business rules: OK');
  });

  test('ADH IDE 237 a des expressions en format IDE (Variable X)', async ({ page }) => {
    await navigateToSpec(page, 'ADH IDE 237');

    // Aller sur l'onglet Technique
    const techniqueTab = page.locator('.spec-tab:has-text("Technique")');
    await techniqueTab.click();
    await page.waitForTimeout(500);

    const content = await page.locator('.content').textContent();

    // Verifier le format IDE des expressions
    expect(content).toContain('Variable A');
    expect(content).toContain('Variable G');
    expect(content).toContain('VG38');
    expect(content).toContain('VG2');

    console.log('IDE 237 expressions in IDE format: OK');
  });

  test('ADH IDE 237 a une section Notes Migration', async ({ page }) => {
    await navigateToSpec(page, 'ADH IDE 237');

    const content = await page.locator('.content').textContent();

    // Verifier la section Notes Migration
    expect(content).toContain('NOTES MIGRATION');
    expect(content).toContain('Complexite');
    expect(content).toContain('ELEVE');
    expect(content).toContain('Strategie recommandee');
    expect(content).toContain('CQRS');

    console.log('IDE 237 migration notes: OK');
  });

  test('ADH IDE 236 a un algorigramme avec les imprimantes', async ({ page }) => {
    await navigateToSpec(page, 'ADH IDE 236');

    // Aller sur l'onglet Technique
    const techniqueTab = page.locator('.spec-tab:has-text("Technique")');
    await techniqueTab.click();
    await page.waitForTimeout(500);

    const content = await page.locator('.content').textContent();

    // Verifier l'algorigramme reflete la logique reelle (imprimantes)
    expect(content).toContain('Printer');
    expect(content).toContain('CURRENTPRINTERNUM');
    expect(content).toContain('A4');
    expect(content).toContain('A5');
    expect(content).toContain('TMT88');

    console.log('IDE 236 flowchart with printers: OK');
  });
});
