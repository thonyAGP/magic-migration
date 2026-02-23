/**
 * Prompt builders for each generative phase of the v10 migration pipeline.
 * Each builder returns a complete prompt string for `claude --print`.
 */
import type { MigrateContext } from './migrate-context.js';
import type { AnalysisDocument } from './migrate-types.js';
export declare const buildSpecPrompt: (kbData: string, programId: string | number, project: string) => string;
export declare const buildAnalyzePrompt: (ctx: MigrateContext) => string;
export declare const buildTypesPrompt: (ctx: MigrateContext, analysis: AnalysisDocument, patternRef?: string) => string;
export declare const buildStorePrompt: (ctx: MigrateContext, analysis: AnalysisDocument, typesContent: string, patternRef?: string) => string;
export declare const buildApiPrompt: (analysis: AnalysisDocument, typesContent: string, patternRef?: string) => string;
export declare const buildPagePrompt: (ctx: MigrateContext, analysis: AnalysisDocument, storeContent: string, typesContent: string, patternRef?: string) => string;
export declare const buildComponentPrompt: (componentName: string, analysis: AnalysisDocument, section: AnalysisDocument["uiLayout"]["sections"][0], typesContent: string, pageContent: string) => string;
export declare const buildTestUnitPrompt: (analysis: AnalysisDocument, storeContent: string, typesContent: string, patternRef?: string) => string;
export declare const buildTestUiPrompt: (analysis: AnalysisDocument, pageContent: string, typesContent: string) => string;
export declare const buildFixTscPrompt: (fileContent: string, filePath: string, errors: string[], relatedTypes?: string) => string;
export declare const buildFixTestsPrompt: (testContent: string, testPath: string, sourceContent: string, errors: string[]) => string;
export declare const buildIntegratePrompt: (existingRoutes: string, newDomains: Array<{
    domain: string;
    domainPascal: string;
    pagePath: string;
}>) => string;
export declare const buildReviewPrompt: (ctx: MigrateContext, generatedFiles: Record<string, string>) => string;
