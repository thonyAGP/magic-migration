import { test, expect } from '@playwright/test';

const BASE = 'http://jira.lb2i.com/viewer.html';

test.describe('Diagnostic liens mockup dans tous les onglets', () => {

  test('ADH IDE 237 - Inventaire de tous les liens #ecran-tX et #tX', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Collect ALL anchor links (href starting with #)
    const allFragmentLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="#"]');
      return Array.from(links).map(l => ({
        href: l.getAttribute('href'),
        text: l.textContent?.trim().substring(0, 60),
        visible: l.offsetParent !== null,
        tabParent: l.closest('.spec-section')?.getAttribute('data-tab') || 'no-tab',
      }));
    });

    console.log(`\n=== TOTAL FRAGMENT LINKS: ${allFragmentLinks.length} ===`);
    for (const link of allFragmentLinks) {
      console.log(`  [${link.tabParent}] ${link.href} -> "${link.text}" (visible=${link.visible})`);
    }

    // Separate mockup links from task links
    const mockupLinks = allFragmentLinks.filter(l => l.href?.includes('ecran-'));
    const taskLinks = allFragmentLinks.filter(l => l.href?.match(/#t\d+$/) && !l.href.includes('ecran'));
    console.log(`\n  Mockup links (#ecran-tX): ${mockupLinks.length}`);
    console.log(`  Task links (#tX): ${taskLinks.length}`);

    expect(allFragmentLinks.length).toBeGreaterThan(0);
  });

  test('ADH IDE 237 - Verifier existence des ancres cibles #ecran-tX', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Check ALL tabs, not just active one
    const anchorsStatus = await page.evaluate(() => {
      // List all expected ecran anchor IDs from the spec
      const expectedAnchors = [
        'ecran-t1', 'ecran-t2', 'ecran-t7', 'ecran-t8', 'ecran-t10', 'ecran-t11',
        'ecran-t18', 'ecran-t19', 'ecran-t30', 'ecran-t38', 'ecran-t39', 'ecran-t40',
        'ecran-t46', 'ecran-t49'
      ];

      return expectedAnchors.map(id => {
        const el = document.getElementById(id);
        let info: Record<string, unknown> = { id, found: !!el };
        if (el) {
          info.tag = el.tagName;
          info.parentTag = el.parentElement?.tagName || 'none';
          info.parentId = el.parentElement?.id || 'none';
          info.tabSection = el.closest('.spec-section')?.getAttribute('data-tab') || 'no-tab';
          info.visible = el.offsetParent !== null;
        }
        return info;
      });
    });

    console.log('\n=== ANCHOR TARGETS STATUS ===');
    let found = 0, missing = 0;
    for (const a of anchorsStatus) {
      const status = a.found ? 'FOUND' : 'MISSING';
      if (a.found) found++; else missing++;
      console.log(`  [${status}] #${a.id} -> tag=${a.tag || '-'}, parent=${a.parentTag || '-'}(${a.parentId || '-'}), tab=${a.tabSection || '-'}, visible=${a.visible ?? '-'}`);
    }
    console.log(`\n  FOUND: ${found}/${anchorsStatus.length}, MISSING: ${missing}`);

    // Also check if marked.js stripped the <a id="ecran-tX"> tags
    const rawHtmlCheck = await page.evaluate(() => {
      const sections = document.querySelectorAll('.spec-section');
      const results: Record<string, unknown>[] = [];
      sections.forEach(s => {
        const tab = s.getAttribute('data-tab');
        const html = s.innerHTML;
        const aIdMatches = html.match(/id="ecran-t\d+"/g) || [];
        results.push({ tab, anchorIdsInHtml: aIdMatches.length, sample: aIdMatches.slice(0, 3) });
      });
      return results;
    });
    console.log('\n=== RAW HTML ANCHOR CHECK PER TAB ===');
    for (const r of rawHtmlCheck) {
      console.log(`  Tab [${r.tab}]: ${r.anchorIdsInHtml} anchor IDs found. Sample: ${JSON.stringify(r.sample)}`);
    }
  });

  test('ADH IDE 237 - Clic sur mockup link: URL hash et scroll', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    const hashBefore = await page.evaluate(() => window.location.hash);
    console.log(`\nHash BEFORE click: "${hashBefore}"`);

    // Click on the first "Voir mockup" link (#ecran-t1) in Resume tab
    const mockupLink = page.locator('a[href="#ecran-t1"]').first();
    const linkExists = await mockupLink.count();
    console.log(`Link a[href="#ecran-t1"] found: ${linkExists > 0}`);

    if (linkExists > 0) {
      const linkTab = await mockupLink.evaluate(el => el.closest('.spec-section')?.getAttribute('data-tab') || 'no-tab');
      console.log(`Link is in tab: ${linkTab}`);

      await mockupLink.click();
      await page.waitForTimeout(1000);

      const hashAfter = await page.evaluate(() => window.location.hash);
      console.log(`Hash AFTER click: "${hashAfter}"`);

      const hashChanged = hashBefore !== hashAfter;
      console.log(`Hash changed: ${hashChanged} (PROBLEM if true - spec context lost)`);

      // Check which tab is now active
      const activeTab = await page.evaluate(() => {
        const active = document.querySelector('.spec-tab.active');
        return active?.textContent?.trim() || 'none';
      });
      console.log(`Active tab after click: "${activeTab}"`);

      // Check if ecran-t1 is now visible on screen
      const targetVisible = await page.evaluate(() => {
        const el = document.getElementById('ecran-t1');
        if (!el) return { exists: false };
        const rect = el.getBoundingClientRect();
        return {
          exists: true,
          inViewport: rect.top >= 0 && rect.top < window.innerHeight,
          top: rect.top,
          visible: el.offsetParent !== null,
        };
      });
      console.log(`Target #ecran-t1: ${JSON.stringify(targetVisible)}`);

      // CRITICAL: hash should NOT have changed
      if (hashChanged) {
        console.log('\n!!! BUG CONFIRMED: clicking mockup link changes hash, losing spec context !!!');
      }
    }
  });

  test('ADH IDE 237 - Test tous les onglets: liens internes par tab', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    const tabs = ['Resume', 'Ecrans', 'Donnees', 'Connexions'];

    for (const tabName of tabs) {
      // Switch to tab
      await page.evaluate((tn) => {
        const tabs = document.querySelectorAll('.spec-tab');
        tabs.forEach(t => {
          if (t.getAttribute('onclick')?.includes(tn)) {
            (t as HTMLElement).click();
          }
        });
      }, tabName);
      await page.waitForTimeout(500);

      // Count fragment links in this tab
      const tabLinks = await page.evaluate((tn) => {
        const section = document.querySelector(`.spec-section[data-tab="${tn}"]`);
        if (!section) return { tab: tn, links: 0, details: [] as Record<string, unknown>[] };
        const links = section.querySelectorAll('a[href^="#"]');
        return {
          tab: tn,
          links: links.length,
          details: Array.from(links).slice(0, 10).map(l => ({
            href: l.getAttribute('href'),
            text: l.textContent?.trim().substring(0, 40),
          })),
        };
      }, tabName);

      console.log(`\n--- Tab "${tabLinks.tab}": ${tabLinks.links} fragment links ---`);
      for (const d of tabLinks.details) {
        console.log(`  ${d.href} -> "${d.text}"`);
      }
    }
  });

  test('ADH IDE 237 - Test cross-tab navigation (Resume -> Ecrans)', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Ensure we're on Resume tab
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.spec-tab');
      tabs.forEach(t => {
        if (t.getAttribute('onclick')?.includes('Resume')) {
          (t as HTMLElement).click();
        }
      });
    });
    await page.waitForTimeout(300);

    // Find a mockup link in Resume tab
    const resumeSection = page.locator('.spec-section[data-tab="Resume"]');
    const mockupInResume = resumeSection.locator('a[href^="#ecran-"]').first();
    const mockupCount = await mockupInResume.count();
    console.log(`\nMockup links in Resume tab: exists=${mockupCount > 0}`);

    if (mockupCount > 0) {
      const href = await mockupInResume.getAttribute('href');
      console.log(`Clicking: ${href}`);

      const hashBefore = await page.evaluate(() => window.location.hash);
      await mockupInResume.click();
      await page.waitForTimeout(1500);

      const hashAfter = await page.evaluate(() => window.location.hash);
      const activeTab = await page.evaluate(() => {
        const active = document.querySelector('.spec-section.active');
        return active?.getAttribute('data-tab') || 'unknown';
      });

      console.log(`Hash: "${hashBefore}" -> "${hashAfter}" (changed: ${hashBefore !== hashAfter})`);
      console.log(`Active tab after click: "${activeTab}"`);

      // The target should be in Ecrans tab - verify tab switched
      expect(activeTab).toBe('Ecrans');

      await page.screenshot({ path: 'test-results/mockup-link-after-click.png', fullPage: false });
    }
  });

  test('ADH IDE 237 - Connexions tab: liens vers autres specs', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Switch to Connexions tab
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.spec-tab');
      tabs.forEach(t => {
        if (t.getAttribute('onclick')?.includes('Connexions')) {
          (t as HTMLElement).click();
        }
      });
    });
    await page.waitForTimeout(500);

    // Check spec links (ADH-IDE-XXX.md)
    const specLinks = await page.evaluate(() => {
      const section = document.querySelector('.spec-section[data-tab="Connexions"]');
      if (!section) return [];
      const links = section.querySelectorAll('a[href]');
      return Array.from(links).map(l => ({
        href: l.getAttribute('href'),
        text: l.textContent?.trim().substring(0, 50),
        isSpec: /ADH-IDE-\d+\.md/.test(l.getAttribute('href') || ''),
        isFragment: l.getAttribute('href')?.startsWith('#'),
      }));
    });

    const specCount = specLinks.filter(l => l.isSpec).length;
    const fragCount = specLinks.filter(l => l.isFragment).length;
    console.log(`\n--- Connexions tab links ---`);
    console.log(`Spec links (ADH-IDE-XXX.md): ${specCount}`);
    console.log(`Fragment links (#xxx): ${fragCount}`);
    for (const l of specLinks.slice(0, 15)) {
      console.log(`  [${l.isSpec ? 'SPEC' : l.isFragment ? 'FRAG' : 'OTHER'}] ${l.href} -> "${l.text}"`);
    }

    // Click a spec link and verify navigation + back button
    const firstSpecLink = specLinks.find(l => l.isSpec);
    if (firstSpecLink) {
      console.log(`\nClicking spec link: ${firstSpecLink.href}`);
      const hashBefore = await page.evaluate(() => window.location.hash);

      await page.locator(`a[href="${firstSpecLink.href}"]`).first().click();
      await page.waitForTimeout(2000);

      const hashAfter = await page.evaluate(() => window.location.hash);
      console.log(`Hash: "${hashBefore}" -> "${hashAfter}"`);

      // Check back button
      const backButton = page.locator('.back-link');
      const backExists = await backButton.count();
      console.log(`Back button visible: ${backExists > 0}`);

      if (backExists > 0) {
        const backText = await backButton.textContent();
        console.log(`Back button text: "${backText}"`);
      }
    }
  });

  test('ADH IDE 233 - Simple spec: mockup link test', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-233.md`);
    await page.waitForTimeout(3000);

    const mockupLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="#ecran-"]');
      return Array.from(links).map(l => ({
        href: l.getAttribute('href'),
        text: l.textContent?.trim(),
        tab: l.closest('.spec-section')?.getAttribute('data-tab') || 'no-tab',
      }));
    });

    console.log(`\n=== ADH IDE 233 mockup links: ${mockupLinks.length} ===`);
    for (const l of mockupLinks) {
      console.log(`  [${l.tab}] ${l.href} -> "${l.text}"`);
    }

    // Check if targets exist
    const targets = await page.evaluate(() => {
      const el = document.getElementById('ecran-t1');
      return {
        'ecran-t1': {
          found: !!el,
          tag: el?.tagName,
          tab: el?.closest('.spec-section')?.getAttribute('data-tab'),
        }
      };
    });
    console.log(`\nTarget check:`, JSON.stringify(targets));

    // Click test
    if (mockupLinks.length > 0) {
      const hashBefore = await page.evaluate(() => window.location.hash);
      await page.locator('a[href="#ecran-t1"]').first().click();
      await page.waitForTimeout(1000);
      const hashAfter = await page.evaluate(() => window.location.hash);
      console.log(`Hash: "${hashBefore}" -> "${hashAfter}" (changed: ${hashBefore !== hashAfter})`);

      const activeTab = await page.evaluate(() => {
        return document.querySelector('.spec-section.active')?.getAttribute('data-tab') || 'unknown';
      });
      console.log(`Active tab: ${activeTab}`);
    }
  });
});
