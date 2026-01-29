import { test } from '@playwright/test';

test('Analyser toutes les sections de la spec V6.0', async ({ page }) => {
  await page.goto('http://jira.lb2i.com/viewer.html#specs/ADH-IDE-237.md');
  await page.waitForTimeout(3000);
  
  const sections = await page.evaluate(() => {
    const result: Record<string, string> = {};
    const h2s = document.querySelectorAll('h2');
    h2s.forEach(h2 => {
      const title = h2.textContent || '';
      let content = '';
      let el = h2.nextElementSibling;
      let lineCount = 0;
      while (el && el.tagName !== 'H2' && lineCount < 10) {
        content += el.textContent?.substring(0, 100) + '\n';
        el = el.nextElementSibling;
        lineCount++;
      }
      result[title] = content.substring(0, 300);
    });
    return result;
  });
  
  console.log('=== RESUME DES SECTIONS ===');
  for (const [title, content] of Object.entries(sections)) {
    console.log(`\n--- ${title} ---`);
    console.log(content);
  }
});
