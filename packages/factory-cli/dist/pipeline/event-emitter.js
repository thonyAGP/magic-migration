/**
 * Typed event emitter for pipeline orchestration.
 * Synchronous, lightweight, no external dependencies.
 */
export const createPipelineEmitter = () => {
    const listeners = new Map();
    const history = [];
    return {
        on(type, listener) {
            if (!listeners.has(type))
                listeners.set(type, new Set());
            listeners.get(type).add(listener);
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
export const createEvent = (type, message, extra) => ({
    type,
    timestamp: new Date().toISOString(),
    message,
    ...extra,
});
//# sourceMappingURL=event-emitter.js.map