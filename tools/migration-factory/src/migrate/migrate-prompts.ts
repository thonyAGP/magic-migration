/**
 * Prompt builders for each generative phase of the v10 migration pipeline.
 * Each builder returns a complete prompt string for `claude --print`.
 */

import type { MigrateContext } from './migrate-context.js';
import type { AnalysisDocument } from './migrate-types.js';

// ─── Common rules (injected in every prompt) ───────────────────

const COMMON_RULES = `RULES (MANDATORY):
- Use import aliases: @/ for src root (e.g. @/stores/..., @/types/...)
- NEVER use \`any\` type - use \`unknown\` or precise types
- Tailwind v4 classes for styling (no tailwind.config.js)
- Arrow functions everywhere (no function declarations)
- \`as const\` instead of TypeScript enum
- verbatimModuleSyntax is enabled: use \`import type { X }\` ONLY for types/interfaces, use \`import { X }\` for values/consts
- File must be COMPLETE and ready to write - NO placeholders, NO TODOs, NO "// implement here"
- NO comments except for genuinely complex logic
- Output ONLY the code inside a single markdown code block (\`\`\`typescript ... \`\`\` or \`\`\`tsx ... \`\`\`)

SHARED INFRASTRUCTURE (use these exact imports):
- Data source toggle: \`import { useDataSourceStore } from "@/stores/dataSourceStore"\` (has .getState().isRealApi)
- API client: \`import { apiClient } from "@/services/api/apiClient"\` and \`import type { ApiResponse } from "@/services/api/apiClient"\`
- Screen layout: \`import { ScreenLayout } from "@/components/layout"\` (wrapper with sidebar, takes children + className)
- UI components: \`import { Button, Dialog, Input } from "@/components/ui"\`
- cn utility: \`import { cn } from "@/lib/utils"\``;

// ─── Phase 0: SPEC ─────────────────────────────────────────────

export const buildSpecPrompt = (kbData: string, programId: string | number, project: string): string =>
  `You are a Magic Unipaas expert generating a technical specification.

Given the following Knowledge Base data for ${project} IDE ${programId}, produce a detailed Markdown specification document.

The spec must include:
1. Program identification (name, ID, complexity)
2. Tables accessed (with access mode R/W/RW)
3. Parameters (input/output)
4. Key expressions and business rules
5. Call graph (callers and callees)
6. UI forms if applicable

${COMMON_RULES.replace('import aliases: @/', 'Markdown format')}

KB DATA:
${kbData}

Output a complete Markdown document in a code block (\`\`\`markdown ... \`\`\`).`;

// ─── Phase 2: ANALYZE ──────────────────────────────────────────

export const buildAnalyzePrompt = (ctx: MigrateContext): string => {
  const parts: string[] = [
    `You are a software architect producing a design document for migrating a Magic Unipaas program to React/TypeScript.`,
    '',
    `Produce a JSON document following this EXACT structure:`,
    '```json',
    JSON.stringify({
      domain: 'camelCaseDomainName',
      domainPascal: 'PascalCaseDomainName',
      complexity: 'LOW|MEDIUM|HIGH',
      entities: [{ name: 'EntityName', fields: [{ name: 'fieldName', type: 'string|number|boolean|Date', source: 'table.column', nullable: false }] }],
      stateFields: [{ name: 'fieldName', type: 'TypeName[]', default: '[]' }],
      actions: [{ name: 'actionName', params: ['param: type'], businessRules: ['Rule description'], returns: 'Promise<void>' }],
      apiEndpoints: [{ method: 'GET', path: '/api/domain/resource', queryParams: ['param?'], response: 'ResponseType' }],
      uiLayout: { type: 'page-type', sections: [{ name: 'sectionName', controls: ['control1'] }] },
      mockData: { count: 5, description: 'Description of mock data' },
      dependencies: { stores: ['useDataSourceStore'], sharedTypes: [], externalApis: [] },
    }, null, 2),
    '```',
    '',
    'IMPORTANT:',
    '- Derive entity fields from actual DB column types when DB metadata is available',
    '- Each business rule from the spec/contract MUST map to an action',
    '- API endpoints should follow existing patterns: /api/{domain}/{resource}',
    '- State fields must cover ALL data the UI needs to display',
    '- Include isLoading, error, and filter states',
  ];

  if (ctx.spec) {
    parts.push('', 'PROGRAM SPEC:', ctx.spec.slice(0, 8000));
  }

  if (ctx.contract) {
    parts.push('', 'CONTRACT:', JSON.stringify({
      program: ctx.contract.program,
      rules: ctx.contract.rules.slice(0, 30),
      tables: ctx.contract.tables,
      callees: ctx.contract.callees,
      variables: ctx.contract.variables.slice(0, 20),
    }, null, 2));
  }

  const dbEntries = Object.entries(ctx.dbMetadata);
  if (dbEntries.length > 0) {
    parts.push('', 'DB METADATA:');
    for (const [, meta] of dbEntries.slice(0, 5)) {
      parts.push(meta);
    }
  }

  return parts.join('\n');
};

// ─── Phase 3: TYPES ─────────────────────────────────────────────

export const buildTypesPrompt = (ctx: MigrateContext, analysis: AnalysisDocument, patternRef?: string): string => {
  const parts: string[] = [
    `Generate a TypeScript types file for the "${analysis.domain}" domain.`,
    '',
    COMMON_RULES,
    '',
    'The file must export:',
    '- An interface for each entity',
    '- A State interface for the Zustand store',
    '- Request/Response types for API endpoints',
    '- Action types matching the store actions',
    '',
    'ANALYSIS DOCUMENT:',
    JSON.stringify(analysis, null, 2),
  ];

  if (patternRef) {
    parts.push('', 'REFERENCE PATTERN (follow this structure):', patternRef);
  }

  const dbEntries = Object.entries(ctx.dbMetadata);
  if (dbEntries.length > 0) {
    parts.push('', 'DB COLUMN TYPES (use these exact types):');
    for (const [, meta] of dbEntries.slice(0, 5)) {
      parts.push(meta);
    }
  }

  return parts.join('\n');
};

// ─── Phase 4: STORE ─────────────────────────────────────────────

export const buildStorePrompt = (
  ctx: MigrateContext,
  analysis: AnalysisDocument,
  typesContent: string,
  patternRef?: string,
): string => {
  const parts: string[] = [
    `Generate a complete Zustand store for the "${analysis.domain}" domain.`,
    '',
    COMMON_RULES,
    '',
    'STORE REQUIREMENTS:',
    '- Use `create` from zustand (import { create } from "zustand")',
    '- Import types from @/types/' + analysis.domain,
    '- Import useDataSourceStore from @/stores/dataSourceStore',
    '- Mock/API branching via useDataSourceStore.getState().isRealApi',
    '- try/catch with `e instanceof Error` for error handling',
    '- Realistic mock data (not lorem ipsum)',
    '- EVERY business rule from the analysis MUST be implemented',
    '- Include reset() action to clear state',
    '',
    'TYPES FILE (already generated):',
    typesContent,
    '',
    'ANALYSIS DOCUMENT:',
    JSON.stringify(analysis, null, 2),
  ];

  if (ctx.spec) {
    parts.push('', 'SPEC EXCERPT (business rules):', ctx.spec.slice(0, 6000));
  }

  if (patternRef) {
    parts.push('', 'REFERENCE PATTERN (follow this exact structure):',
      '```typescript', patternRef, '```');
  }

  return parts.join('\n');
};

// ─── Phase 5: API ───────────────────────────────────────────────

export const buildApiPrompt = (
  analysis: AnalysisDocument,
  typesContent: string,
  patternRef?: string,
): string => {
  const parts: string[] = [
    `Generate an API service file for the "${analysis.domain}" domain.`,
    '',
    COMMON_RULES,
    '',
    'API REQUIREMENTS:',
    '- Use apiClient from @/services/api/apiClient (import { apiClient })',
    '- Use ApiResponse<T> from @/services/api/apiClient (import type { ApiResponse })',
    '- Each endpoint maps to a function: verbNoun pattern (e.g. getExtrait, createFacture)',
    '- Import types from @/types/' + analysis.domain,
    '',
    'ENDPOINTS TO IMPLEMENT:',
    JSON.stringify(analysis.apiEndpoints, null, 2),
    '',
    'TYPES FILE:',
    typesContent,
  ];

  if (patternRef) {
    parts.push('', 'REFERENCE PATTERN:', '```typescript', patternRef, '```');
  }

  return parts.join('\n');
};

// ─── Phase 6: PAGE ──────────────────────────────────────────────

export const buildPagePrompt = (
  ctx: MigrateContext,
  analysis: AnalysisDocument,
  storeContent: string,
  typesContent: string,
  patternRef?: string,
): string => {
  const parts: string[] = [
    `Generate a React page component for the "${analysis.domainPascal}" domain.`,
    '',
    COMMON_RULES,
    '',
    'PAGE REQUIREMENTS:',
    '- Use store via use' + analysis.domainPascal + 'Store()',
    '- Destructure 20+ fields from store',
    '- useCallback for event handlers',
    '- useEffect for init + cleanup (call reset on unmount)',
    '- ScreenLayout wrapper from @/components/layout (import { ScreenLayout } from "@/components/layout")',
    '- ScreenLayout takes children + className props (no title prop)',
    '- Tailwind v4 classes for styling',
    '- Handle loading, error, and empty states',
    '',
    'UI LAYOUT:',
    JSON.stringify(analysis.uiLayout, null, 2),
    '',
    'STORE INTERFACE (actions and state available):',
    storeContent.slice(0, 3000),
    '',
    'TYPES:',
    typesContent,
  ];

  if (ctx.spec) {
    const layoutSection = ctx.spec.split('\n')
      .filter(l => /ecran|form|layout|button|control|champ/i.test(l))
      .slice(0, 30)
      .join('\n');
    if (layoutSection) {
      parts.push('', 'SPEC UI DESCRIPTION:', layoutSection);
    }
  }

  if (patternRef) {
    parts.push('', 'REFERENCE PATTERN:', '```tsx', patternRef, '```');
  }

  return parts.join('\n');
};

// ─── Phase 7: COMPONENTS ────────────────────────────────────────

export const buildComponentPrompt = (
  componentName: string,
  analysis: AnalysisDocument,
  section: AnalysisDocument['uiLayout']['sections'][0],
  typesContent: string,
  pageContent: string,
): string => {
  const parts: string[] = [
    `Generate a React component: ${componentName} for the "${analysis.domainPascal}" domain.`,
    '',
    COMMON_RULES,
    '',
    'COMPONENT REQUIREMENTS:',
    '- Props interface at the top of the file',
    '- Tailwind v4 classes for styling',
    '- Use shared UI components from @/components/ui/ when applicable (DataGrid, Dialog, etc.)',
    '- Handle loading and empty states',
    '',
    'SECTION TO IMPLEMENT:',
    JSON.stringify(section, null, 2),
    '',
    'PAGE (shows how this component is used):',
    pageContent.slice(0, 2000),
    '',
    'TYPES:',
    typesContent,
  ];

  return parts.join('\n');
};

// ─── Phase 8: TESTS-UNIT ───────────────────────────────────────

export const buildTestUnitPrompt = (
  analysis: AnalysisDocument,
  storeContent: string,
  typesContent: string,
  patternRef?: string,
): string => {
  const parts: string[] = [
    `Generate Vitest unit tests for the "${analysis.domain}Store".`,
    '',
    COMMON_RULES,
    '',
    'TEST REQUIREMENTS:',
    '- Use @vitest-environment jsdom',
    '- import { describe, it, expect, beforeEach, vi } from "vitest"',
    '- vi.mock() for API service',
    '- beforeEach: reset store state',
    '- AAA pattern (Arrange, Act, Assert)',
    '- Test EACH action: success path + error path + loading state',
    '- Mock data as constants at top of file',
    '- Test business rules explicitly',
    '',
    'STORE TO TEST:',
    storeContent,
    '',
    'TYPES:',
    typesContent,
    '',
    'ACTIONS TO COVER:',
    JSON.stringify(analysis.actions, null, 2),
  ];

  if (patternRef) {
    parts.push('', 'REFERENCE TEST PATTERN:', '```typescript', patternRef, '```');
  }

  return parts.join('\n');
};

// ─── Phase 9: TESTS-UI ─────────────────────────────────────────

export const buildTestUiPrompt = (
  analysis: AnalysisDocument,
  pageContent: string,
  typesContent: string,
): string => {
  const parts: string[] = [
    `Generate Vitest component tests for "${analysis.domainPascal}Page".`,
    '',
    COMMON_RULES,
    '',
    'TEST REQUIREMENTS:',
    '- Use @vitest-environment jsdom',
    '- import { render, screen, fireEvent, waitFor } from "@testing-library/react"',
    '- Mock the store with vi.mock()',
    '- CRITICAL: import the page component using @/ alias: import { ' + analysis.domainPascal + 'Page } from "@/pages/' + analysis.domainPascal + 'Page"',
    '- Place vi.mock() calls BEFORE the page import (vitest hoisting)',
    '- Test: renders without crashing',
    '- Test: displays loading state',
    '- Test: displays data when loaded',
    '- Test: handles user interactions (clicks, form submits)',
    '- Test: displays error state',
    '',
    'PAGE COMPONENT:',
    pageContent,
    '',
    'TYPES:',
    typesContent,
    '',
    'UI SECTIONS:',
    JSON.stringify(analysis.uiLayout.sections, null, 2),
  ];

  return parts.join('\n');
};

// ─── Phase 11: FIX-TSC ─────────────────────────────────────────

export const buildFixTscPrompt = (
  fileContent: string,
  filePath: string,
  errors: string[],
  relatedTypes?: string,
): string => {
  const parts: string[] = [
    `Fix the TypeScript compilation errors in ${filePath}.`,
    '',
    COMMON_RULES,
    '',
    'ERRORS TO FIX:',
    errors.join('\n'),
    '',
    'CURRENT FILE CONTENT:',
    '```typescript',
    fileContent,
    '```',
  ];

  if (relatedTypes) {
    parts.push('', 'IMPORTED TYPES:', relatedTypes);
  }

  parts.push('', 'Output the COMPLETE fixed file. Do not omit any code.');

  return parts.join('\n');
};

// ─── Phase 13: FIX-TESTS ───────────────────────────────────────

export const buildFixTestsPrompt = (
  testContent: string,
  testPath: string,
  sourceContent: string,
  errors: string[],
): string => {
  const parts: string[] = [
    `Fix the failing tests in ${testPath}.`,
    '',
    COMMON_RULES,
    '',
    'TEST ERRORS:',
    errors.join('\n'),
    '',
    'CURRENT TEST FILE:',
    '```typescript',
    testContent,
    '```',
    '',
    'SOURCE FILE BEING TESTED:',
    '```typescript',
    sourceContent,
    '```',
    '',
    'Output the COMPLETE fixed test file. Do not omit any tests.',
  ];

  return parts.join('\n');
};

// ─── Phase 14: INTEGRATE ───────────────────────────────────────

export const buildIntegratePrompt = (
  existingRoutes: string,
  newDomains: Array<{ domain: string; domainPascal: string; pagePath: string }>,
): string => {
  const parts: string[] = [
    `Update the application routing to include ${newDomains.length} new page(s).`,
    '',
    COMMON_RULES,
    '',
    'NEW ROUTES TO ADD:',
    JSON.stringify(newDomains, null, 2),
    '',
    'For each domain, add:',
    '1. Import the page component',
    '2. Add a Route element in the router',
    '3. Add navigation link if applicable',
    '',
    'EXISTING ROUTES FILE:',
    '```tsx',
    existingRoutes,
    '```',
    '',
    'Output the COMPLETE updated file.',
  ];

  return parts.join('\n');
};

// ─── Phase 15: REVIEW ──────────────────────────────────────────

export const buildReviewPrompt = (
  ctx: MigrateContext,
  generatedFiles: Record<string, string>,
): string => {
  const parts: string[] = [
    'Review the generated code against the original specification.',
    '',
    'Produce a JSON report:',
    '```json',
    JSON.stringify({
      programId: 0,
      programName: '',
      coveragePct: 0,
      rulesImplemented: 0,
      rulesTotal: 0,
      missingRules: ['rule descriptions not implemented'],
      recommendations: ['improvement suggestions'],
    }, null, 2),
    '```',
    '',
    'Check:',
    '1. Every business rule from the contract is implemented in the store',
    '2. Every table from the contract has corresponding entity types',
    '3. Every API endpoint is wired to the store',
    '4. UI layout matches the spec description',
    '5. Error handling is present for all actions',
  ];

  if (ctx.contract) {
    parts.push('', 'CONTRACT RULES:', JSON.stringify(ctx.contract.rules, null, 2));
  }

  if (ctx.spec) {
    parts.push('', 'SPEC EXCERPT:', ctx.spec.slice(0, 5000));
  }

  parts.push('', 'GENERATED FILES:');
  for (const [filePath, content] of Object.entries(generatedFiles)) {
    parts.push(`\n--- ${filePath} ---`, content.slice(0, 2000));
  }

  return parts.join('\n');
};
