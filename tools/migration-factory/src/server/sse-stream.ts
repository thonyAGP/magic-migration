/**
 * SSE (Server-Sent Events) stream helper for real-time pipeline updates.
 */

import type { ServerResponse } from 'node:http';

export interface SSEStream {
  send(data: unknown): void;
  close(): void;
}

export const createSSEStream = (res: ServerResponse): SSEStream => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  return {
    send(data) { res.write(`data: ${JSON.stringify(data)}\n\n`); },
    close() { res.write('data: {"type":"stream_end"}\n\n'); res.end(); },
  };
};
