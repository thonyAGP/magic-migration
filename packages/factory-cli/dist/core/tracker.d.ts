/**
 * Tracker I/O: read, update, and persist tracker.json.
 */
import type { Tracker, Batch, PipelineStatus } from './types.js';
export declare const readTracker: (filePath: string) => Tracker;
export declare const writeTracker: (tracker: Tracker, filePath: string) => void;
export declare const updateTrackerStats: (tracker: Tracker, updates: Partial<Tracker["stats"]>) => Tracker;
export declare const updateBatchStatus: (tracker: Tracker, batchId: string, status: PipelineStatus) => Tracker;
export declare const createTracker: (projectName: string) => Tracker;
export declare const upsertBatches: (tracker: Tracker, newBatches: Batch[]) => Tracker;
