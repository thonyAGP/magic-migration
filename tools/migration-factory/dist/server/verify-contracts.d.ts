/**
 * Contract verification: pure function for auto-verifying enriched contracts.
 * Extracted from cli.ts verify command for reuse by action server.
 */
export interface VerifyResult {
    verified: number;
    notReady: number;
    alreadyVerified: number;
    dryRun: boolean;
    details: VerifyDetail[];
}
export interface VerifyDetail {
    id: string;
    status: 'verified' | 'not-ready' | 'already-verified' | 'skipped';
    gaps?: string[];
}
export declare const verifyContracts: (contractDir: string, options?: {
    programs?: string;
    dryRun?: boolean;
}) => VerifyResult;
