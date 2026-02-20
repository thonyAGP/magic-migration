/**
 * Readiness Checker: score + blockers per module.
 * Produces a ReadinessReport with deliverable/close/inProgress/notStarted groups.
 */
import type { DeliverableModule, ReadinessReport, PipelineStatus } from '../core/types.js';
import type { ModuleCalculatorOutput } from './module-calculator.js';
export interface ReadinessInput {
    calculatorOutput: ModuleCalculatorOutput;
    totalLive: number;
    programStatuses: Map<string | number, PipelineStatus>;
}
/**
 * Build a readiness report from module calculator output.
 */
export declare const checkReadiness: (input: ReadinessInput) => ReadinessReport;
/**
 * Format a single module's readiness as a summary line.
 */
export declare const formatModuleSummary: (mod: DeliverableModule) => string;
/**
 * Find the critical path: the sequence of blockers that if resolved
 * would unlock the most modules.
 */
export declare const findCriticalBlockers: (modules: DeliverableModule[], limit?: number) => Map<string | number, number>;
