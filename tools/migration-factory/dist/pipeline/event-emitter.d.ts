/**
 * Typed event emitter for pipeline orchestration.
 * Synchronous, lightweight, no external dependencies.
 */
import type { PipelineEvent, PipelineEventType } from '../core/types.js';
type Listener = (event: PipelineEvent) => void;
export interface PipelineEmitter {
    on(type: PipelineEventType | '*', listener: Listener): void;
    off(type: PipelineEventType | '*', listener: Listener): void;
    emit(event: PipelineEvent): void;
    events(): PipelineEvent[];
}
export declare const createPipelineEmitter: () => PipelineEmitter;
export declare const createEvent: (type: PipelineEventType, message: string, extra?: {
    batchId?: string;
    programId?: string | number;
    data?: Record<string, unknown>;
}) => PipelineEvent;
export {};
