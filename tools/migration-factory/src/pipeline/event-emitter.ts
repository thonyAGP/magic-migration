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

export const createPipelineEmitter = (): PipelineEmitter => {
  const listeners = new Map<string, Set<Listener>>();
  const history: PipelineEvent[] = [];

  return {
    on(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },

    off(type, listener) {
      listeners.get(type)?.delete(listener);
    },

    emit(event) {
      history.push(event);
      listeners.get(event.type)?.forEach(fn => fn(event));
      listeners.get('*')?.forEach(fn => fn(event));
    },

    events() {
      return [...history];
    },
  };
};

export const createEvent = (
  type: PipelineEventType,
  message: string,
  extra?: { batchId?: string; programId?: string | number; data?: Record<string, unknown> },
): PipelineEvent => ({
  type,
  timestamp: new Date().toISOString(),
  message,
  ...extra,
});
