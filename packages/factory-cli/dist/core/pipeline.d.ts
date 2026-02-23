/**
 * Pipeline status lifecycle management.
 * pending -> contracted -> enriched -> verified
 */
export declare const canTransition: (from: string, to: string) => boolean;
export declare const nextStatus: (current: string) => string | null;
export declare const isTerminal: (status: string) => boolean;
export declare const statusOrder: (status: string) => number;
export declare const isAtLeast: (status: string, minimum: string) => boolean;
