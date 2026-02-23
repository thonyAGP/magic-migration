/**
 * Dashboard HTML generator for the action server.
 * Reuses the multi-project report builder but injects __MF_SERVER__ flag
 * and action bar UI for interactive operations.
 */
import path from 'node:path';
import fs from 'node:fs';
import { createMagicAdapter } from '../adapters/magic-adapter.js';
import { resolveDependencies } from '../calculators/dependency-resolver.js';
import { calculateModules } from '../calculators/module-calculator.js';
import { checkReadiness } from '../calculators/readiness-checker.js';
import { calculateDecommission } from '../calculators/decommission-calculator.js';
import { getPipelineStatus } from '../orchestrator/orchestrator.js';
import { readTracker } from '../core/tracker.js';
import { buildMultiProjectReport } from '../dashboard/report-builder.js';
import { generateMultiProjectHtmlReport } from '../dashboard/html-report.js';
import { discoverProjects, readProjectRegistry } from '../dashboard/project-discovery.js';
export const generateServerDashboard = async (config) => {
    const migrationDir = path.join(config.projectDir, '.openspec', 'migration');
    const activeProjects = discoverProjects(migrationDir);
    const registry = readProjectRegistry(migrationDir);
    const projectInputs = [];
    for (const projName of activeProjects) {
        const projMigDir = path.join(migrationDir, projName);
        const projLiveFile = path.join(projMigDir, 'live-programs.json');
        const projTrackerFile = path.join(projMigDir, 'tracker.json');
        const projAdapter = createMagicAdapter(config.projectDir, {
            migrationDir: projMigDir,
            liveProgramsFile: projLiveFile,
            contractPattern: new RegExp(`${projName}-IDE-.*\\.contract\\.yaml$`),
        });
        const graph = await projAdapter.extractProgramGraph();
        const resolved = resolveDependencies(graph.programs);
        const shared = new Set(await projAdapter.getSharedPrograms());
        const statuses = fs.existsSync(projTrackerFile)
            ? getPipelineStatus({ migrationDir: projMigDir, trackerFile: projTrackerFile, adapter: projAdapter })
            : new Map();
        const calcOutput = calculateModules({
            programs: graph.programs,
            adjacency: resolved.adjacency,
            sccs: resolved.sccs,
            levels: resolved.levels,
            programStatuses: statuses,
            sharedPrograms: shared,
            naPrograms: new Set(),
        });
        const readinessReport = checkReadiness({
            calculatorOutput: calcOutput,
            totalLive: graph.liveCount,
            programStatuses: statuses,
        });
        const decommResult = calculateDecommission({
            programs: graph.programs,
            programStatuses: statuses,
            naPrograms: new Set(),
            sharedPrograms: shared,
            sccs: resolved.sccs,
        });
        const projTracker = fs.existsSync(projTrackerFile) ? readTracker(projTrackerFile) : undefined;
        const regEntry = registry.find(r => r.name === projName);
        projectInputs.push({
            name: projName,
            description: regEntry?.description ?? '',
            reportInput: {
                projectName: projName,
                programs: graph.programs,
                programStatuses: statuses,
                sharedPrograms: shared,
                sccs: resolved.sccs,
                maxLevel: resolved.maxLevel,
                modulesOutput: calcOutput,
                readiness: readinessReport,
                decommission: decommResult,
                tracker: projTracker,
            },
        });
    }
    // Add non-started projects from registry
    const activeSet = new Set(activeProjects);
    for (const regEntry of registry) {
        if (!activeSet.has(regEntry.name)) {
            projectInputs.push({
                name: regEntry.name,
                programCount: regEntry.programs,
                description: regEntry.description,
            });
        }
    }
    const multiReport = buildMultiProjectReport({ projects: projectInputs });
    let html = generateMultiProjectHtmlReport(multiReport);
    // Inject __MF_SERVER__ flag before </head>
    html = html.replace('</head>', '<script>window.__MF_SERVER__=true;</script>\n</head>');
    return html;
};
//# sourceMappingURL=dashboard-html.js.map