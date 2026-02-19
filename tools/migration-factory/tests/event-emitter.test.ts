import { describe, it, expect, vi } from 'vitest';
import { createPipelineEmitter, createEvent } from '../src/pipeline/event-emitter.js';
import { PipelineEventType } from '../src/core/types.js';

describe('PipelineEmitter', () => {
  it('should emit and receive events by type', () => {
    const emitter = createPipelineEmitter();
    const received: string[] = [];

    emitter.on(PipelineEventType.PROGRAM_CONTRACTED, (e) => received.push(e.message));
    emitter.emit(createEvent(PipelineEventType.PROGRAM_CONTRACTED, 'test'));

    expect(received).toEqual(['test']);
  });

  it('should support wildcard * listener', () => {
    const emitter = createPipelineEmitter();
    const received: string[] = [];

    emitter.on('*', (e) => received.push(e.type));
    emitter.emit(createEvent(PipelineEventType.PIPELINE_STARTED, 'start'));
    emitter.emit(createEvent(PipelineEventType.PROGRAM_VERIFIED, 'done'));

    expect(received).toEqual([PipelineEventType.PIPELINE_STARTED, PipelineEventType.PROGRAM_VERIFIED]);
  });

  it('should return copy of all events via events()', () => {
    const emitter = createPipelineEmitter();
    emitter.emit(createEvent(PipelineEventType.PIPELINE_STARTED, 'a'));
    emitter.emit(createEvent(PipelineEventType.PROGRAM_CONTRACTED, 'b'));

    const history = emitter.events();
    expect(history).toHaveLength(2);
    expect(history[0].message).toBe('a');
    expect(history[1].message).toBe('b');

    // Should be a copy
    history.push(createEvent(PipelineEventType.ERROR, 'extra'));
    expect(emitter.events()).toHaveLength(2);
  });

  it('should unsubscribe with off()', () => {
    const emitter = createPipelineEmitter();
    const received: string[] = [];
    const listener = (e: { message: string }) => received.push(e.message);

    emitter.on(PipelineEventType.PROGRAM_VERIFIED, listener);
    emitter.emit(createEvent(PipelineEventType.PROGRAM_VERIFIED, 'first'));
    emitter.off(PipelineEventType.PROGRAM_VERIFIED, listener);
    emitter.emit(createEvent(PipelineEventType.PROGRAM_VERIFIED, 'second'));

    expect(received).toEqual(['first']);
  });

  it('should not error when emitting without listeners', () => {
    const emitter = createPipelineEmitter();
    expect(() => {
      emitter.emit(createEvent(PipelineEventType.ERROR, 'no listener'));
    }).not.toThrow();
  });

  it('should support multiple listeners on same type', () => {
    const emitter = createPipelineEmitter();
    const a: string[] = [];
    const b: string[] = [];

    emitter.on(PipelineEventType.TRACKER_SYNCED, () => a.push('a'));
    emitter.on(PipelineEventType.TRACKER_SYNCED, () => b.push('b'));
    emitter.emit(createEvent(PipelineEventType.TRACKER_SYNCED, 'sync'));

    expect(a).toEqual(['a']);
    expect(b).toEqual(['b']);
  });

  it('should include extra fields in createEvent', () => {
    const event = createEvent(PipelineEventType.PROGRAM_CONTRACTED, 'contracted', {
      batchId: 'B2',
      programId: 131,
      data: { rules: 12 },
    });

    expect(event.batchId).toBe('B2');
    expect(event.programId).toBe(131);
    expect(event.data).toEqual({ rules: 12 });
    expect(event.timestamp).toBeTruthy();
  });
});
