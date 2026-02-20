/**
 * SSE (Server-Sent Events) stream helper for real-time pipeline updates.
 */
import type { ServerResponse } from 'node:http';
export interface SSEStream {
    send(data: unknown): void;
    close(): void;
}
export declare const createSSEStream: (res: ServerResponse) => SSEStream;
