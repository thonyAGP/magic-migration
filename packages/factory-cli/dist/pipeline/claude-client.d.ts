/**
 * Claude API client wrapper: testable, mockable factory.
 * v4: auto-enrichment of migration contracts via Claude API.
 */
export interface ClaudeClientConfig {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
}
export interface EnrichedItem {
    id: string;
    type: 'rule' | 'variable' | 'table' | 'callee';
    status: 'IMPL' | 'N/A' | 'PARTIAL' | 'MISSING';
    targetFile: string;
    gapNotes: string;
}
export interface ClaudeResponse {
    items: EnrichedItem[];
    reasoning: string;
    inputTokens: number;
    outputTokens: number;
}
export interface ClaudeClient {
    classify(systemPrompt: string, userPrompt: string): Promise<ClaudeResponse>;
}
export declare const createClaudeClient: (config?: ClaudeClientConfig) => ClaudeClient;
