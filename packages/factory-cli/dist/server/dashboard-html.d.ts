/**
 * Dashboard HTML generator for the action server.
 * Reuses the multi-project report builder but injects __MF_SERVER__ flag
 * and action bar UI for interactive operations.
 */
import type { ActionServerConfig } from './action-server.js';
export declare const generateServerDashboard: (config: ActionServerConfig) => Promise<string>;
