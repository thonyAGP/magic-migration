import { test, expect } from '@playwright/test';

test('Capture ADH IDE 237 V6.0 spec content', async ({ page }) => {
  await page.goto('http://jira.lb2i.com/viewer.html#specs/ADH-IDE-237.md');
  await page.waitForTimeout(3000);
  
  // Capture screenshot
  await page.screenshot({ path: 'test-results/v60-iteration1.png', fullPage: true });
  
  // Get section 2 content (OBJECTIF METIER)
  const section2 = await page.locator('h2:has-text("OBJECTIF METIER")').first();
  const section2Content = await section2.evaluate(el => {
    let content = '';
    let sibling = el.nextElementSibling;
    while (sibling && !sibling.tagName.startsWith('H')) {
      content += sibling.textContent + '\n';
      sibling = sibling.nextElementSibling;
    }
    return content;
  });
  console.log('=== SECTION 2 OBJECTIF METIER ===');
  console.log(section2Content);
  
  // Get all sections
  const sections = await page.locator('h2').allTextContents();
  console.log('=== SECTIONS ===');
  sections.forEach(s => console.log('- ' + s));
});
