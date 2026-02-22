/**
 * API route handlers for the Migration Factory action server.
 * Each handler reuses existing core functions and returns JSON.
 */
import type { ServerResponse } from 'node:http';
export interface RouteContext {
    projectDir: string;
    dir: string;
}
export declare const json: (res: ServerResponse, data: unknown, status?: number) => void;
export declare const handleStatus: (ctx: RouteContext, res: ServerResponse) => void;
export declare const handleGaps: (ctx: RouteContext, query: URLSearchParams, res: ServerResponse) => void;
export declare const handlePreflight: (ctx: RouteContext, query: URLSearchParams, res: ServerResponse) => void;
export declare const handlePipelineRun: (ctx: RouteContext, body: Record<string, unknown>, res: ServerResponse) => Promise<void>;
export declare const handleVerify: (ctx: RouteContext, body: Record<string, unknown>, res: ServerResponse) => void;
export declare const handleProjects: (ctx: RouteContext, res: ServerResponse) => void;
export declare const handleCalibrate: (ctx: RouteContext, body: Record<string, unknown>, res: ServerResponse) => void;
export declare const handleGenerate: (ctx: RouteContext, body: Record<string, unknown>, res: ServerResponse) => Promise<void>;
export declare const handleGenerateStream: (ctx: RouteContext, query: URLSearchParams, res: ServerResponse) => Promise<void>;
export declare const handlePipelineStream: (ctx: RouteContext, query: URLSearchParams, res: ServerResponse) => Promise<void>;
export declare const handleMigrateStream: (ctx: RouteContext, query: URLSearchParams, res: ServerResponse) => Promise<void>;
export declare const handleMigrateStatus: (ctx: RouteContext, res: ServerResponse) => void;
export declare const handleMigrateBatchCreate: (ctx: RouteContext, body: Record<string, unknown>, res: ServerResponse) => void;
export declare const handleMigrateActive: (_ctx: RouteContext, res: ServerResponse) => void;
export declare const handleMigrateAbort: (res: ServerResponse) => void;
export declare const handleAnalyze: (ctx: RouteContext, body: Record<string, unknown>, res: ServerResponse) => Promise<void>;
export declare const handleAnalyzeGet: (ctx: RouteContext, res: ServerResponse) => Promise<void>;
