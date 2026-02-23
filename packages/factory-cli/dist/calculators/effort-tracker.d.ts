/**
 * Effort tracker: auto-timestamp status transitions and compute actual hours.
 */
import type { ContractEffort, PipelineStatus, MigrationContract } from '../core/types.js';
/**
 * Track a status change by updating the appropriate timestamp.
 * Returns the updated effort object (creates one if missing).
 */
export declare const trackStatusChange: (contract: MigrationContract, newStatus: PipelineStatus) => ContractEffort;
/**
 * Compute actual hours from timestamps (contracted → verified).
 * Returns null if insufficient data.
 */
export declare const computeActualHours: (effort: ContractEffort) => number | null;
/**
 * Compute elapsed hours from contracted to enriched.
 */
export declare const computeContractToEnrichHours: (effort: ContractEffort) => number | null;
