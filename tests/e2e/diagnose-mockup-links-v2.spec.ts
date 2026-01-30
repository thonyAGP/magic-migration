import { test, expect } from '@playwright/test';

const BASE = 'http://jira.lb2i.com/viewer.html';

test.describe('Diagnostic V2 - liens mockup + task links', () => {

  test('Verifier cibles #tX (task links) dans le DOM', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Check if #tX targets exist (t1, t2, t7, etc.)
    const taskIds = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10',
      't11', 't12', 't13', 't14', 't15', 't16', 't17', 't18', 't19', 't20',
      't22', 't25', 't26', 't27', 't28', 't29', 't30', 't31', 't33', 't34',
      't35', 't36', 't37', 't38', 't39', 't40', 't41', 't42', 't43', 't44',
      't45', 't46', 't47', 't48', 't49'];

    const results = await page.evaluate((ids) => {
      return ids.map(id => {
        const el = document.getElementById(id);
        // Also check if any heading has an ID starting with this
        const headings = document.querySelectorAll(`[id^="${id}-"], [id^="${id}--"]`);
        return {
          id,
          found: !!el,
          tag: el?.tagName || '-',
          tab: el?.closest('.spec-section')?.getAttribute('data-tab') || '-',
          headingsStartingWith: headings.length,
        };
      });
    }, taskIds);

    let found = 0, missing = 0;
    console.log('\n=== TASK LINK TARGETS (#tX) ===');
    for (const r of results) {
      if (r.found) found++; else missing++;
      const status = r.found ? 'FOUND' : 'MISSING';
      console.log(`  [${status}] #${r.id} tag=${r.tag} tab=${r.tab} headings_similar=${r.headingsStartingWith}`);
    }
    console.log(`\n  FOUND: ${found}/${results.length}, MISSING: ${missing}`);
    console.log(`  >>> #tX links WITHOUT targets: ${missing} <<<`);
  });

  test('Click mockup depuis Connexions tab (section 9.3)', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Take screenshot of initial state (Resume tab)
    await page.screenshot({ path: 'test-results/mockup-01-resume-initial.png', fullPage: false });

    // Switch to Connexions tab using evaluate (bypass visibility)
    await page.evaluate(() => {
      // Find and click the Connexions tab
      document.querySelectorAll('.spec-tab').forEach(tab => {
        if (tab.getAttribute('onclick')?.includes('Connexions')) {
          (tab as HTMLElement).click();
        }
      });
    });
    await page.waitForTimeout(500);

    // Verify Connexions tab is active
    const activeTab = await page.evaluate(() =>
      document.querySelector('.spec-section.active')?.getAttribute('data-tab')
    );
    console.log(`\nActive tab after switch: ${activeTab}`);
    expect(activeTab).toBe('Connexions');

    // Take screenshot of Connexions tab
    await page.screenshot({ path: 'test-results/mockup-02-connexions-tab.png', fullPage: false });

    // Scroll to section 9.3 navigation table
    await page.evaluate(() => {
      // Find the navigation table heading
      const headings = document.querySelectorAll('.spec-section[data-tab="Connexions"] h3');
      for (const h of headings) {
        if (h.textContent?.includes('Structure hierarchique') || h.textContent?.includes('9.3')) {
          h.scrollIntoView({ block: 'start' });
          break;
        }
      }
    });
    await page.waitForTimeout(300);

    // Screenshot showing navigation table
    await page.screenshot({ path: 'test-results/mockup-03-nav-table.png', fullPage: false });

    // Find mockup link in Connexions tab and click via evaluate
    const hashBefore = await page.evaluate(() => window.location.hash);

    const clickResult = await page.evaluate(() => {
      const connexionsSection = document.querySelector('.spec-section[data-tab="Connexions"]');
      if (!connexionsSection) return { error: 'No Connexions section' };

      const mockupLinks = connexionsSection.querySelectorAll('a[href^="#ecran-"]');
      if (mockupLinks.length === 0) return { error: 'No mockup links in Connexions' };

      const link = mockupLinks[0] as HTMLAnchorElement;
      const href = link.getAttribute('href');
      const text = link.textContent;

      // Simulate click
      link.click();

      return { href, text, clicked: true, totalMockupLinks: mockupLinks.length };
    });

    console.log(`\nClick result: ${JSON.stringify(clickResult)}`);
    await page.waitForTimeout(1500);

    const hashAfter = await page.evaluate(() => window.location.hash);
    const tabAfter = await page.evaluate(() =>
      document.querySelector('.spec-section.active')?.getAttribute('data-tab')
    );

    console.log(`Hash: "${hashBefore}" -> "${hashAfter}" (changed: ${hashBefore !== hashAfter})`);
    console.log(`Tab: Connexions -> ${tabAfter}`);

    // Take screenshot after clicking mockup
    await page.screenshot({ path: 'test-results/mockup-04-after-click.png', fullPage: false });

    // Check if target element is visible
    const targetInfo = await page.evaluate(() => {
      const el = document.getElementById('ecran-t1');
      if (!el) return { exists: false };
      const rect = el.getBoundingClientRect();
      return {
        exists: true,
        top: rect.top,
        inViewport: rect.top >= 0 && rect.top < window.innerHeight,
        visible: el.offsetParent !== null,
        parentText: el.parentElement?.textContent?.substring(0, 80),
      };
    });
    console.log(`Target info: ${JSON.stringify(targetInfo)}`);
  });

  test('Click task link #t7 depuis Resume tab (check no target)', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Verify #t7 target does NOT exist
    const t7Exists = await page.evaluate(() => !!document.getElementById('t7'));
    console.log(`\n#t7 target exists: ${t7Exists}`);

    const hashBefore = await page.evaluate(() => window.location.hash);

    // Click #t7 link in Resume tab
    const clicked = await page.evaluate(() => {
      const resumeSection = document.querySelector('.spec-section[data-tab="Resume"]');
      if (!resumeSection) return false;
      const link = resumeSection.querySelector('a[href="#t7"]') as HTMLAnchorElement;
      if (!link) return false;
      link.click();
      return true;
    });

    console.log(`Clicked #t7: ${clicked}`);
    await page.waitForTimeout(1000);

    const hashAfter = await page.evaluate(() => window.location.hash);
    const tabAfter = await page.evaluate(() =>
      document.querySelector('.spec-section.active')?.getAttribute('data-tab')
    );

    console.log(`Hash: "${hashBefore}" -> "${hashAfter}" (changed: ${hashBefore !== hashAfter})`);
    console.log(`Tab after: ${tabAfter}`);

    // If hash changed, that means the browser handled it natively (scrolled/navigated)
    if (hashBefore !== hashAfter) {
      console.log('!!! BUG: hash changed because no preventDefault when target not found !!!');
    }
  });

  test('Verifier toutes les heading IDs generees', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    // Get ALL element IDs in the document
    const allIds = await page.evaluate(() => {
      const elements = document.querySelectorAll('[id]');
      return Array.from(elements)
        .map(el => ({ id: el.id, tag: el.tagName, tab: el.closest('.spec-section')?.getAttribute('data-tab') || 'no-tab' }))
        .filter(e => e.tag.match(/^H[1-6]$/) || e.id.startsWith('ecran-') || e.id.startsWith('t'));
    });

    console.log(`\n=== ALL HEADING/ANCHOR IDs (${allIds.length}) ===`);
    for (const e of allIds.slice(0, 50)) {
      console.log(`  [${e.tab}] <${e.tag}> id="${e.id}"`);
    }
    if (allIds.length > 50) {
      console.log(`  ... and ${allIds.length - 50} more`);
    }
  });

  test('Screenshot tous les onglets ADH IDE 237', async ({ page }) => {
    await page.goto(`${BASE}#specs/ADH-IDE-237.md`);
    await page.waitForTimeout(3000);

    const tabs = ['Resume', 'Ecrans', 'Donnees', 'Connexions'];
    for (const tabName of tabs) {
      await page.evaluate((tn) => {
        document.querySelectorAll('.spec-tab').forEach(t => {
          if (t.getAttribute('onclick')?.includes(tn)) (t as HTMLElement).click();
        });
      }, tabName);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `test-results/tab-${tabName.toLowerCase()}.png`, fullPage: true });
    }
  });
});
