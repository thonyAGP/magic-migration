import fs from 'node:fs';
import path from 'node:path';

/**
 * Fix incorrect Zustand mock pattern in test files
 *
 * Problem: Generated tests use duplicate key pattern:
 * ```
 * vi.mock('@/stores/myStore', () => ({
 *   useMyStore: vi.fn(() => ({ ... })),  // Line 9
 *   useMyStore: { setState: vi.fn() }     // Line 25 - DUPLICATE KEY!
 * }))
 * ```
 *
 * This causes error: "vi.mocked().mockReturnValue is not a function"
 *
 * Correct pattern:
 * ```
 * vi.mock('@/stores/myStore', () => ({
 *   useMyStore: {
 *     getState: vi.fn()
 *   }
 * }))
 * ```
 */

export const fixZustandMocksInFile = (filePath: string): boolean => {
  const content = fs.readFileSync(filePath, 'utf8');

  // Detect if file contains broken pattern
  if (!content.includes('useArticleZoomStore: vi.fn(') &&
      !content.includes('useFermetureSessionsStore: vi.fn(')) {
    return false;  // No broken mock detected
  }

  let modified = false;
  let fixed = content;

  // Fix ArticleZoomStore - more precise regex with 2 closing parens
  if (content.includes('useArticleZoomStore: vi.fn(')) {
    // Match from vi.mock to the FIRST })) after the duplicate key pattern
    const mockPattern = /vi\.mock\('@\/stores\/articleZoomStore',\s*\(\)\s*=>\s*\({[\s\S]*?useArticleZoomStore:\s*\{[\s\S]*?\}\s*\}\)\)/;
    if (mockPattern.test(fixed)) {
      fixed = fixed.replace(
        mockPattern,
        `vi.mock('@/stores/articleZoomStore', () => ({
  useArticleZoomStore: {
    getState: vi.fn()
  }
}))`
      );
      modified = true;
    }
  }

  // Fix FermetureSessionsStore (same pattern)
  if (content.includes('useFermetureSessionsStore: vi.fn(')) {
    const mockPattern = /vi\.mock\('@\/stores\/fermetureSessionsStore',\s*\(\)\s*=>\s*\({[\s\S]*?useFermetureSessionsStore:\s*\{[\s\S]*?\}\s*\}\)\)/;
    if (mockPattern.test(fixed)) {
      fixed = fixed.replace(
        mockPattern,
        `vi.mock('@/stores/fermetureSessionsStore', () => ({
  useFermetureSessionsStore: {
    getState: vi.fn()
  }
}))`
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, fixed, 'utf8');
  }

  return modified;
};

export const fixAllTestFiles = (targetDir: string): number => {
  const testsDir = path.join(targetDir, 'src', '__tests__');

  if (!fs.existsSync(testsDir)) {
    console.error(`Tests directory not found: ${testsDir}`);
    return 0;
  }

  const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.tsx'));

  let fixedCount = 0;
  for (const file of files) {
    if (fixZustandMocksInFile(path.join(testsDir, file))) {
      console.log(`✓ Fixed ${file}`);
      fixedCount++;
    }
  }

  return fixedCount;
};

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const targetDir = process.argv[2] || path.resolve(__dirname, '../../../adh-web');

  console.log(`Fixing Zustand mocks in: ${targetDir}`);
  console.log('');

  const fixed = fixAllTestFiles(targetDir);

  console.log('');
  console.log(`✅ Fixed ${fixed} test file${fixed !== 1 ? 's' : ''}`);

  if (fixed === 0) {
    console.log('ℹ️  No broken mocks detected');
  }
}
