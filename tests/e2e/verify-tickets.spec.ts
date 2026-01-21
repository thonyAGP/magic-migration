import { test, expect } from '@playwright/test';

/**
 * Test de verification du deploiement des tickets sur jira.lb2i.com
 * Execute apres chaque analyse de ticket pour valider l'affichage
 */

const SITE_URL = 'https://jira.lb2i.com';

test.describe('Verification deploiement tickets', () => {

  test('Le site jira.lb2i.com est accessible', async ({ page }) => {
    const response = await page.goto(SITE_URL);
    expect(response?.status()).toBe(200);
  });

  test('Les tickets actifs sont affiches', async ({ page }) => {
    await page.goto(SITE_URL);

    // Attendre que la page charge
    await page.waitForLoadState('networkidle');

    // Verifier qu'il y a une section tickets
    const ticketsSection = page.locator('text=Tickets').or(page.locator('text=Active'));
    await expect(ticketsSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('PMS-1412 est visible', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const ticket = page.locator('text=PMS-1412');
    await expect(ticket).toBeVisible({ timeout: 10000 });
  });

  test('PMS-1400 est visible', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const ticket = page.locator('text=PMS-1400');
    await expect(ticket).toBeVisible({ timeout: 10000 });
  });

  test('PMS-1359 est visible', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');

    const ticket = page.locator('text=PMS-1359');
    await expect(ticket).toBeVisible({ timeout: 10000 });
  });
});
