/**
 * SSE (Server-Sent Events) stream helper for real-time pipeline updates.
 * Includes automatic heartbeat to prevent connection drops during long operations.
 */
const HEARTBEAT_INTERVAL_MS = 15_000;
export const createSSEStream = (res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    });
    // Heartbeat keeps the connection alive during long Claude calls (30-120s)
    const heartbeatTid = setInterval(() => {
        try {
            res.write(': heartbeat\n\n');
        }
        catch { /* connection already closed */ }
    }, HEARTBEAT_INTERVAL_MS);
    return {
        send(data) { res.write(`data: ${JSON.stringify(data)}\n\n`); },
        close() {
            clearInterval(heartbeatTid);
            res.write('data: {"type":"stream_end"}\n\n');
            res.end();
        },
    };
};
//# sourceMappingURL=sse-stream.js.map