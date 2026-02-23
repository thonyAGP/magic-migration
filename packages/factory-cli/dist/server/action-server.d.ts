/**
 * Migration Factory Action Server: serves the interactive dashboard
 * with API endpoints for pipeline operations.
 *
 * Usage: migration-factory serve [--port 3070] [--dir ADH]
 */
import http from 'node:http';
export interface ActionServerConfig {
    port: number;
    projectDir: string;
    dir: string;
}
export declare const startActionServer: (config: ActionServerConfig) => Promise<http.Server>;
