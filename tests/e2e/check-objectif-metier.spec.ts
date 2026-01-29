import { test, expect } from '@playwright/test';

test('Verifier section OBJECTIF METIER enrichie', async ({ page }) => {
  await page.goto('http://jira.lb2i.com/viewer.html#specs/ADH-IDE-237.md');
  await page.waitForTimeout(3000);
  
  // Screenshot
  await page.screenshot({ path: 'test-results/iteration1-objectif.png', fullPage: true });
  
  // Get all text from the page
  const content = await page.evaluate(() => {
    const sections = document.querySelectorAll('h2');
    for (const sec of sections) {
      if (sec.textContent?.includes('OBJECTIF METIER')) {
        let text = '';
        let el = sec.nextElementSibling;
        while (el && el.tagName !== 'H2') {
          text += el.textContent + '\n';
          el = el.nextElementSibling;
        }
        return text;
      }
    }
    return 'Section not found';
  });
  
  console.log('=== SECTION OBJECTIF METIER ===');
  console.log(content);
  
  // Verify it has more content
  expect(content.length).toBeGreaterThan(100);
});
