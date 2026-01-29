import { test, expect } from '@playwright/test';

const BASE = 'http://jira.lb2i.com/viewer.html';

test.describe('Verification deploiement Pipeline V7.1', () => {

  test('ADH IDE 237 - Version V7.1 et 4 onglets', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/v71-237-full.png', fullPage: true });

    const content = await page.textContent('body');
    expect(content).toContain('V7.1');
    expect(content).toContain('Transaction Nouv vente avec GP');
  });

  test('ADH IDE 237 - Pas de "1 taches" (plural fix)', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    const content = await page.textContent('body');
    expect(content).not.toContain('1 taches');
    expect(content).toContain('1 tache');
  });

  test('ADH IDE 121 - Version V7.1 et callees sans [Phase 2]', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-121.md`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/v71-121-full.png', fullPage: true });

    const content = await page.textContent('body');
    expect(content).toContain('V7.1');
    expect(content).toContain('Gestion caisse');
    expect(content).not.toContain('[Phase 2]');
  });

  test('ADH IDE 236 - Version V7.1 et (sans nom)', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-236.md`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/v71-236-full.png', fullPage: true });

    const content = await page.textContent('body');
    expect(content).toContain('V7.1');
    expect(content).toContain('(sans nom)');
    expect(content).not.toContain('**** (T');
  });
});
