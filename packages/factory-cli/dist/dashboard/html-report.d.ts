/**
 * HTML Report Generator: produces a self-contained HTML dashboard.
 * No external dependencies - all CSS/JS inline.
 */
import type { FullMigrationReport, MultiProjectReport } from '../core/types.js';
export declare const generateHtmlReport: (report: FullMigrationReport) => string;
export declare const generateMultiProjectHtmlReport: (report: MultiProjectReport) => string;
