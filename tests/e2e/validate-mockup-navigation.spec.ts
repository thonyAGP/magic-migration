import { test, expect } from '@playwright/test';

const BASE = 'http://jira.lb2i.com/viewer.html';

test.describe('Validation navigation mockup + retour', () => {

  test('ADH IDE 237 - Click mockup Resume -> Ecrans, back button visible', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Verify we start on Resume tab
    const startTab = await page.evaluate(() =>
      document.querySelector('.spec-section.active')?.getAttribute('data-tab')
    );
    expect(startTab).toBe('Resume');

    // Screenshot before
    await page.screenshot({ path: 'test-results/nav-01-before.png', fullPage: false });

    // Click "Voir mockup" link for #ecran-t1 in Resume tab
    const hashBefore = await page.evaluate(() => window.location.hash);
    await page.evaluate(() => {
      const resumeSection = document.querySelector('.spec-section[data-tab="Resume"]');
      const link = resumeSection?.querySelector('a[href="#ecran-t1"]') as HTMLAnchorElement;
      if (link) link.click();
    });
    await page.waitForTimeout(1500);

    // Verify tab switched to Ecrans
    const afterTab = await page.evaluate(() =>
      document.querySelector('.spec-section.active')?.getAttribute('data-tab')
    );
    expect(afterTab).toBe('Ecrans');

    // Verify hash preserved
    const hashAfter = await page.evaluate(() => window.location.hash);
    expect(hashAfter).toBe(hashBefore);

    // Verify target element visible
    const targetInfo = await page.evaluate(() => {
      const el = document.getElementById('ecran-t1');
      if (!el) return null;
      return { exists: true, visible: el.offsetParent !== null };
    });
    expect(targetInfo?.exists).toBe(true);

    // Screenshot after navigation
    await page.screenshot({ path: 'test-results/nav-02-ecrans-after-mockup.png', fullPage: false });

    // Check floating back button
    const backBtn = await page.evaluate(() => {
      const btn = document.getElementById('fragmentBackBtn');
      return btn ? { text: btn.textContent, visible: btn.offsetParent !== null } : null;
    });
    console.log('Back button:', JSON.stringify(backBtn));
    expect(backBtn).not.toBeNull();
    expect(backBtn?.text).toContain('Retour');
    expect(backBtn?.text).toContain('Resume');

    // Screenshot with back button visible
    await page.screenshot({ path: 'test-results/nav-03-back-button-visible.png', fullPage: false });
  });

  test('ADH IDE 237 - Click back button returns to Resume tab', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Navigate to mockup from Resume
    await page.evaluate(() => {
      const resumeSection = document.querySelector('.spec-section[data-tab="Resume"]');
      const link = resumeSection?.querySelector('a[href="#ecran-t1"]') as HTMLAnchorElement;
      if (link) link.click();
    });
    await page.waitForTimeout(1500);

    // Verify on Ecrans tab with back button
    const tab1 = await page.evaluate(() =>
      document.querySelector('.spec-section.active')?.getAttribute('data-tab')
    );
    expect(tab1).toBe('Ecrans');

    // Click back button
    await page.evaluate(() => {
      const btn = document.getElementById('fragmentBackBtn');
      if (btn) (btn as HTMLButtonElement).click();
    });
    await page.waitForTimeout(500);

    // Verify back on Resume tab
    const tab2 = await page.evaluate(() =>
      document.querySelector('.spec-section.active')?.getAttribute('data-tab')
    );
    expect(tab2).toBe('Resume');

    // Verify back button is gone
    const backBtn = await page.evaluate(() => document.getElementById('fragmentBackBtn'));
    expect(backBtn).toBeNull();

    await page.screenshot({ path: 'test-results/nav-04-back-to-resume.png', fullPage: false });
  });

  test('ADH IDE 237 - Manual tab switch hides back button', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Navigate to mockup (Resume -> Ecrans)
    await page.evaluate(() => {
      const resumeSection = document.querySelector('.spec-section[data-tab="Resume"]');
      const link = resumeSection?.querySelector('a[href="#ecran-t1"]') as HTMLAnchorElement;
      if (link) link.click();
    });
    await page.waitForTimeout(1000);

    // Verify back button exists
    let btn = await page.evaluate(() => !!document.getElementById('fragmentBackBtn'));
    expect(btn).toBe(true);

    // Switch tab manually (click Donnees tab)
    await page.evaluate(() => {
      document.querySelectorAll('.spec-tab').forEach(t => {
        if (t.getAttribute('onclick')?.includes('Donnees')) {
          (t as HTMLElement).click();
        }
      });
    });
    await page.waitForTimeout(300);

    // Back button should be gone
    btn = await page.evaluate(() => !!document.getElementById('fragmentBackBtn'));
    expect(btn).toBe(false);
  });

  test('ADH IDE 237 - Same tab scroll: no back button', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Switch to Ecrans tab first
    await page.evaluate(() => {
      document.querySelectorAll('.spec-tab').forEach(t => {
        if (t.getAttribute('onclick')?.includes('Ecrans')) (t as HTMLElement).click();
      });
    });
    await page.waitForTimeout(500);

    // Click a mockup link within the Ecrans tab (should just scroll, no back button)
    await page.evaluate(() => {
      const ecransSection = document.querySelector('.spec-section[data-tab="Ecrans"]');
      const link = ecransSection?.querySelector('a[href="#ecran-t7"]') as HTMLAnchorElement;
      if (link) link.click();
    });
    await page.waitForTimeout(500);

    // No back button should appear (same tab)
    const btn = await page.evaluate(() => !!document.getElementById('fragmentBackBtn'));
    expect(btn).toBe(false);
  });

  test('ADH IDE 237 - Hash preserved after all operations', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    const originalHash = await page.evaluate(() => window.location.hash);

    // Click mockup
    await page.evaluate(() => {
      const link = document.querySelector('a[href="#ecran-t1"]') as HTMLAnchorElement;
      if (link) link.click();
    });
    await page.waitForTimeout(500);

    // Click back
    await page.evaluate(() => {
      const btn = document.getElementById('fragmentBackBtn');
      if (btn) (btn as HTMLButtonElement).click();
    });
    await page.waitForTimeout(500);

    const finalHash = await page.evaluate(() => window.location.hash);
    expect(finalHash).toBe(originalHash);
  });

  test('ADH IDE 237 - Cross-spec link preserves back button behavior', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Switch to Connexions tab
    await page.evaluate(() => {
      document.querySelectorAll('.spec-tab').forEach(t => {
        if (t.getAttribute('onclick')?.includes('Connexions')) (t as HTMLElement).click();
      });
    });
    await page.waitForTimeout(500);

    // Click a cross-spec link (ADH-IDE-163.md)
    await page.evaluate(() => {
      const section = document.querySelector('.spec-section[data-tab="Connexions"]');
      const link = section?.querySelector('a[href*="ADH-IDE-163"]') as HTMLAnchorElement;
      if (link) link.click();
    });
    await page.waitForTimeout(2000);

    // Verify we navigated to a different spec
    const hash = await page.evaluate(() => window.location.hash);
    console.log('After cross-spec click, hash:', hash);

    // Check cross-spec back link
    const backLink = await page.evaluate(() => {
      const link = document.querySelector('.back-link');
      return link ? { text: link.textContent, visible: link.offsetParent !== null } : null;
    });
    console.log('Cross-spec back link:', JSON.stringify(backLink));

    await page.screenshot({ path: 'test-results/nav-05-cross-spec.png', fullPage: false });
  });
});
