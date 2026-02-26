/**
 * Git status helper - Compare running code vs Git remote
 */

import { execSync } from 'node:child_process';
import { BUILD_INFO } from '../build-info.js';

export interface GitStatus {
  serverCommit: string;
  serverBuildTime: string;
  latestLocalCommit: string;
  latestRemoteCommit: string | null;
  behindBy: number;
  isUpToDate: boolean;
  needsRestart: boolean;
}

/**
 * Get git status comparing server vs remote
 */
export const getGitStatus = (projectDir: string): GitStatus => {
  try {
    // Current server commit
    const serverCommit = BUILD_INFO.commit;

    // Latest local commit
    const latestLocal = execSync('git log -1 --format=%h', { cwd: projectDir }).toString().trim();

    // Latest remote commit (if available)
    let latestRemote: string | null = null;
    try {
      execSync('git fetch origin --quiet', { cwd: projectDir, timeout: 5000 });
      latestRemote = execSync('git log origin/master -1 --format=%h', { cwd: projectDir }).toString().trim();
    } catch {
      // Remote not available or fetch failed
    }

    // Count commits behind
    let behindBy = 0;
    if (serverCommit !== latestLocal) {
      try {
        const countStr = execSync(`git rev-list ${serverCommit}..${latestLocal} --count`, { cwd: projectDir }).toString().trim();
        behindBy = parseInt(countStr, 10) || 0;
      } catch {
        behindBy = 1; // At least 1 commit behind if hashes differ
      }
    }

    const isUpToDate = serverCommit === latestLocal;
    const needsRestart = !isUpToDate;

    return {
      serverCommit,
      serverBuildTime: BUILD_INFO.buildTimestamp,
      latestLocalCommit: latestLocal,
      latestRemoteCommit: latestRemote,
      behindBy,
      isUpToDate,
      needsRestart,
    };
  } catch (err) {
    // Fallback if git commands fail
    return {
      serverCommit: BUILD_INFO.commit,
      serverBuildTime: BUILD_INFO.buildTimestamp,
      latestLocalCommit: 'unknown',
      latestRemoteCommit: null,
      behindBy: 0,
      isUpToDate: true,
      needsRestart: false,
    };
  }
};
