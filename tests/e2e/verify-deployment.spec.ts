import { test, expect } from '@playwright/test';

const VIEWER_URL = '/viewer.html#specs/ADH-IDE-237.md';

test.describe('Deployment Verification - Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(VIEWER_URL);
    await page.waitForSelector('.spec-tab', { timeout: 10000 });
  });

  test('spec loads with tabs', async ({ page }) => {
    const tabs = page.locator('.spec-tab');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const firstTab = tabs.first();
    await expect(firstTab).toHaveClass(/active/);
  });

  test('spec contains ADH IDE 237 identification', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toContain('237');
    expect(body).toContain('ADH');
    expect(body).toContain('Transaction');
  });

  test('tab navigation works', async ({ page }) => {
    // Click Technique tab
    const techTab = page.locator('.spec-tab.technique');
    if (await techTab.count() > 0) {
      await techTab.click();
      await expect(techTab).toHaveClass(/active/);
      const techSection = page.locator('.spec-section[data-tab="Technique"]');
      await expect(techSection).toHaveClass(/active/);
    }

    // Click Donnees tab
    const donneesTab = page.locator('.spec-tab.donnees');
    if (await donneesTab.count() > 0) {
      await donneesTab.click();
      await expect(donneesTab).toHaveClass(/active/);
    }
  });

  test('algorigramme section exists', async ({ page }) => {
    // Switch to Technique tab where algorigramme lives
    const techTab = page.locator('.spec-tab.technique');
    if (await techTab.count() > 0) {
      await techTab.click();
      await page.waitForTimeout(500);
    }

    const body = await page.textContent('body');
    expect(body).toContain('Algorigramme');
    expect(body).toContain('START');
  });

  test('spec search works', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    if (await searchInput.count() > 0) {
      await searchInput.fill('237');
      await page.waitForTimeout(500);
      const results = page.locator('.search-results .result-item, .nav-item');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
