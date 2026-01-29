import { test, expect } from '@playwright/test';

const SITE_URL = 'https://jira.lb2i.com';

test.describe('PMS-1427 et PMS-1419 sur jira.lb2i.com', () => {

  test('Le fichier tickets/index.json contient PMS-1427 et PMS-1419', async ({ request }) => {
    const response = await request.get(`${SITE_URL}/tickets/index.json`);
    expect(response.ok()).toBeTruthy();

    const json = await response.json();
    const tickets = json.localTickets || [];
    const keys = tickets.map((t: any) => t.key);

    expect(keys).toContain('PMS-1427');
    expect(keys).toContain('PMS-1419');
  });

  test('PMS-1427 analysis.md est accessible', async ({ request }) => {
    const response = await request.get(`${SITE_URL}/tickets/PMS-1427/analysis.md`);
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(text).toContain('PMS-1427');
    expect(text).toContain('POS Edition Income');
    expect(text).toContain('PVE IDE 379');
  });

  test('PMS-1419 analysis.md est accessible', async ({ request }) => {
    const response = await request.get(`${SITE_URL}/tickets/PMS-1419/analysis.md`);
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(text).toContain('PMS-1419');
    expect(text).toContain('Validation qualites GO');
    expect(text).toContain('PBG IDE 56');
  });

  test('Le viewer affiche les 2 tickets dans la sidebar', async ({ page }) => {
    await page.goto(`${SITE_URL}/viewer.html`, { waitUntil: 'networkidle' });

    // Attendre le chargement du contenu
    await page.waitForTimeout(2000);

    // Chercher PMS-1427 dans le DOM
    const pms1427 = page.locator('text=PMS-1427');
    const pms1419 = page.locator('text=PMS-1419');

    expect(await pms1427.count()).toBeGreaterThan(0);
    expect(await pms1419.count()).toBeGreaterThan(0);
  });
});
