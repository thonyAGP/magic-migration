/**
 * Gap report computation: pure function for analyzing contract gaps.
 * Extracted from cli.ts for reuse by both CLI and action server.
 */
export interface GapEntry {
    type: string;
    id: string;
    status: string;
    notes: string;
}
export interface ContractGaps {
    id: string;
    name: string;
    pipelineStatus: string;
    gaps: GapEntry[];
    total: number;
    impl: number;
}
export interface GapReport {
    contracts: ContractGaps[];
    grandTotalGaps: number;
    grandTotalItems: number;
    globalPct: number;
}
export declare const computeGapReport: (contractDir: string, filterStatus?: string) => GapReport;
