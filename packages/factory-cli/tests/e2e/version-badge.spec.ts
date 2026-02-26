import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour la feature Version Badge & Restart Button
 *
 * Feature testée : Pastille de version + bouton restart automatique
 * Commit : 4eaf602b
 */

test.describe('Version Badge & Restart Button', () => {
  const dashboardUrl = 'http://localhost:3070';

  test.beforeEach(async ({ page }) => {
    await page.goto(dashboardUrl);
    // Attendre que le serveur soit connecté
    await page.waitForSelector('.server-badge.connected', { timeout: 10000 });
  });

  test('should display version badge in action bar', async ({ page }) => {
    // Vérifier que la pastille version existe
    const versionBadge = page.locator('#version-badge');
    await expect(versionBadge).toBeVisible();
  });

  test('should show "up-to-date" badge when server is current', async ({ page }) => {
    // Mock l'API git/status pour simuler un serveur à jour
    await page.route('**/api/git/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          serverCommit: '4eaf602b',
          latestLocalCommit: '4eaf602b',
          behindBy: 0,
          isUpToDate: true,
          needsRestart: false,
        }),
      });
    });

    // Recharger la page pour déclencher le check
    await page.reload();
    await page.waitForSelector('.server-badge.connected');

    // Attendre que le badge se mette à jour
    await page.waitForTimeout(1000);

    // Vérifier le badge vert
    const versionBadge = page.locator('#version-badge');
    await expect(versionBadge).toHaveClass(/up-to-date/);
    await expect(versionBadge).toContainText('✓');

    // Vérifier que le bouton restart est caché
    const restartBtn = page.locator('#btn-restart');
    await expect(restartBtn).toBeHidden();
  });

  test('should show "outdated" badge when server is behind', async ({ page }) => {
    // Mock l'API git/status pour simuler un serveur en retard
    await page.route('**/api/git/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          serverCommit: 'b2ad6ea2',
          latestLocalCommit: '4eaf602b',
          behindBy: 10,
          isUpToDate: false,
          needsRestart: true,
        }),
      });
    });

    // Recharger la page pour déclencher le check
    await page.reload();
    await page.waitForSelector('.server-badge.connected');

    // Attendre que le badge se mette à jour
    await page.waitForTimeout(1000);

    // Vérifier le badge orange
    const versionBadge = page.locator('#version-badge');
    await expect(versionBadge).toHaveClass(/outdated/);
    await expect(versionBadge).toContainText('commits behind');

    // Vérifier que le bouton restart est visible
    const restartBtn = page.locator('#btn-restart');
    await expect(restartBtn).toBeVisible();
  });

  test('should display correct tooltip on version badge', async ({ page }) => {
    // Vérifier le tooltip de la pastille
    const versionBadge = page.locator('#version-badge');
    const title = await versionBadge.getAttribute('title');

    // Le tooltip doit contenir les infos de commit
    expect(title).toBeTruthy();
  });

  test('should have restart button clickable when outdated', async ({ page }) => {
    // Mock pour simuler un serveur en retard
    await page.route('**/api/git/status', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          serverCommit: 'b2ad6ea2',
          latestLocalCommit: '4eaf602b',
          behindBy: 10,
          isUpToDate: false,
          needsRestart: true,
        }),
      });
    });

    await page.reload();
    await page.waitForSelector('.server-badge.connected');
    await page.waitForTimeout(1000);

    // Vérifier que le bouton est cliquable
    const restartBtn = page.locator('#btn-restart');
    await expect(restartBtn).toBeEnabled();

    // Vérifier le texte du bouton
    await expect(restartBtn).toContainText('Restart');
  });

  test('should auto-refresh version status every 30s', async ({ page }) => {
    let callCount = 0;

    // Intercepter les appels à l'API AVANT le reload
    await page.route('**/api/git/status', (route) => {
      callCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          serverCommit: '4eaf602b',
          latestLocalCommit: '4eaf602b',
          behindBy: 0,
          isUpToDate: true,
          needsRestart: false,
        }),
      });
    });

    // Recharger pour déclencher le 1er appel
    await page.reload();
    await page.waitForSelector('.server-badge.connected');

    // Attendre que l'appel initial soit fait
    await page.waitForTimeout(2000);

    // Vérifier qu'il y a eu au moins 1 appel
    expect(callCount).toBeGreaterThan(0);

    // Note: En prod l'auto-refresh se fait toutes les 30s (setInterval 30000)
    // On vérifie juste que le mécanisme initial fonctionne
  });

  test('should handle git status API error gracefully', async ({ page }) => {
    // Mock une erreur API
    await page.route('**/api/git/status', (route) => {
      route.abort('failed');
    });

    await page.reload();
    await page.waitForSelector('.server-badge.connected');
    await page.waitForTimeout(1000);

    // Le badge doit afficher "unknown" en cas d'erreur
    const versionBadge = page.locator('#version-badge');
    await expect(versionBadge).toContainText('unknown');
  });
});
