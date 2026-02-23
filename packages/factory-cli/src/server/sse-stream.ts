/**
 * SSE (Server-Sent Events) stream helper for real-time pipeline updates.
 * Includes automatic heartbeat to prevent connection drops during long operations.
 * Supports configurable buffer size for event history.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

export interface SSEStream {
  send(data: unknown): void;
  close(): void;
}

const HEARTBEAT_INTERVAL_MS = 15_000;

const ALLOWED_ORIGINS = [
  'http://localhost:3070',
  'http://localhost:3071',
  'https://specmap-dashboard.vercel.app',
];

const resolveOrigin = (req?: IncomingMessage): string => {
  const origin = req?.headers?.origin ?? '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
};

export const createSSEStream = (res: ServerResponse, req?: IncomingMessage): SSEStream => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': resolveOrigin(req),
  });

  // Heartbeat keeps the connection alive during long Claude calls (30-120s)
  const heartbeatTid = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch { /* connection already closed */ }
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
