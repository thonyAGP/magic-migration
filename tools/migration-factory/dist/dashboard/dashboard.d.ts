/**
 * Dashboard: CLI-formatted migration progress views.
 */
import type { Tracker, Program } from '../core/types.js';
export interface DashboardData {
    tracker: Tracker;
    contractsDir: string;
    programs: Program[];
}
/**
 * Render the global progress dashboard as text.
 */
export declare const renderDashboard: (data: DashboardData) => string;
