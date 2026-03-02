/**
 * Build information (runtime git detection)
 * Used to verify server is running latest code
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Get current git commit hash
 * Tries git command first (always up-to-date), falls back to .build-commit file
 */
function getCommitHash(): string {
  // Try reading from git directly (works in dev with tsx)
  try {
    return execSync('git log -1 --format=%h', {
      cwd: join(__dirname, '..'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'], // Suppress stderr
      windowsHide: true,
    }).trim();
  } catch {
    // Fallback to .build-commit file (production build)
    try {
      const commitFile = join(__dirname, '..', '.build-commit');
      return readFileSync(commitFile, 'utf8').trim();
    } catch {
      return 'unknown';
    }
  }
}

/**
 * Get build information.
 * Called on each API request to ensure commit hash is always up-to-date.
 */
export const getBuildInfo = () => {
  const commit = getCommitHash();
  const now = new Date().toISOString();
  console.log(`[BUILD_INFO] Called at ${now}, commit=${commit}`); // DEBUG
  return {
    version: '1.0.0-qa-phase2-3',
    buildTimestamp: now,
    commit,
    phase: 'QA Phase 2+3 Complete',
  };
};

// Deprecated: Use getBuildInfo() instead
// Kept for backward compatibility but will show stale commit
export const BUILD_INFO = {
  version: '1.0.0-qa-phase2-3',
  buildTimestamp: new Date().toISOString(),
  commit: getCommitHash(),
  phase: 'QA Phase 2+3 Complete',
} as const;
