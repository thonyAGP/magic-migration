/**
 * Prompt builders for each generative phase of the v10 migration pipeline.
 * Each builder returns a complete prompt string for `claude --print`.
 */

import type { MigrateContext } from './migrate-context.js';
import type { AnalysisDocument } from './migrate-types.js';
import type { ContractRule } from '../core/types.js';

// ─── Contract rules formatter ──────────────────────────────────

const formatContractRules = (rules: ContractRule[]): string => {
  if (rules.length === 0) return '';
  const lines = [
    '',
    'MANDATORY CONTRACT RULES — each MUST be implemented with // RM-XXX inline on the CODE LINE:',
    'Example: `const isValid = state.networkStatus !== "R"; // RM-001` (marker ON the code line, NOT on a separate comment line)',
  ];
  for (const rule of rules) {
    const vars = rule.variables.length > 0 ? ` (vars: ${rule.variables.join(', ')})` : '';
    lines.push(`- ${rule.id}: ${rule.description} [condition: ${rule.condition}]${vars}`);
  }
  return lines.join('\n');
};

// ─── Common rules (injected in every prompt) ───────────────────

const COMMON_RULES = `RULES (MANDATORY):
- Use import aliases: @/ for src root (e.g. @/stores/..., @/types/...)
- NEVER use \`any\` type - use \`unknown\` or precise types
- Tailwind v4 classes for styling (no tailwind.config.js)
- Arrow functions everywhere (no function declarations)
- \`as const\` instead of TypeScript enum
- verbatimModuleSyntax is enabled: use \`import type { X }\` ONLY for types/interfaces, use \`import { X }\` for values/consts
- File must be COMPLETE and ready to write - NO placeholders, NO TODOs, NO "// implement here"
- NO comments except for genuinely complex logic and MANDATORY // RM-XXX rule markers
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
    parts.push('', 'PROGRAM SPEC:', ctx.spec.slice(0, 12000));
  }

  if (ctx.contract) {
    parts.push('', 'CONTRACT:', JSON.stringify({
      program: ctx.contract.program,
      rules: ctx.contract.rules,
      tables: ctx.contract.tables,
      callees: ctx.contract.callees,
      variables: ctx.contract.variables,
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
  // Build explicit entity field checklist so Claude cannot omit fields
  const entityFieldChecklist = analysis.entities?.map(e => {
    const fieldList = e.fields?.map((f: { name: string; type: string }) => `${f.name}: ${f.type}`).join(', ') ?? '';
    return `  - ${e.name}: ${e.fields?.length ?? 0} fields → [${fieldList}]`;
  }).join('\n') ?? '';

  // Build action signature checklist
  const actionSignatureChecklist = analysis.actions?.map(a => {
    const params = a.params?.join(', ') ?? '';
    return `  - ${a.name}(${params}): ${a.returns ?? 'void'}`;
  }).join('\n') ?? '';

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
    'ENTITY FIELDS REQUIREMENT (MANDATORY — read this carefully):',
    '- Generate a TypeScript interface with EVERY field from analysis.entities[].fields',
    '- Do NOT omit fields even if they seem redundant or unused',
    '- Do NOT add comments like "SPEC-FIX: only X columns" to justify fewer fields',
    '- The number of fields in each interface MUST match the analysis exactly:',
    entityFieldChecklist,
    '',
    'ACTION SIGNATURES REQUIREMENT (MANDATORY):',
    '- The Actions interface MUST include every action with its EXACT signature:',
    actionSignatureChecklist,
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
  // Build explicit action signature enforcement
  const actionEnforcement = analysis.actions?.map(a => {
    const params = a.params?.join(', ') ?? '';
    const ret = a.returns ?? 'Promise<void>';
    return `  ${a.name}: async (${params}) => ${ret}`;
  }).join('\n') ?? '';

  // Build endpoint enforcement (HTTP methods MUST match)
  const endpointEnforcement = analysis.apiEndpoints?.map(ep => {
    const method = (ep.method ?? 'GET').toUpperCase();
    const clientMethod = method === 'DELETE' ? 'apiClient.delete' : method === 'POST' ? 'apiClient.post' : method === 'PUT' ? 'apiClient.put' : 'apiClient.get';
    return `  ${method} ${ep.path} → use ${clientMethod}()`;
  }).join('\n') ?? '';

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
    '- EVERY business rule from the analysis MUST be implemented as real conditional logic',
    '- Each rule implementation MUST have // RM-XXX as inline comment on the CODE line (e.g. `if (state.x === "V") { ... } // RM-001`)',
    '- Include reset() action to clear state',
    '',
    'ACTION SIGNATURE ENFORCEMENT (MANDATORY — match EXACTLY):',
    '- Each action MUST have the EXACT parameters specified in analysis.actions[].params',
    '- Do NOT create actions with empty () when the analysis specifies parameters',
    '- Do NOT rename parameters or change their types',
    '- Expected signatures:',
    actionEnforcement,
    '',
    'HTTP METHOD ENFORCEMENT (MANDATORY):',
    '- Each API call MUST use the correct HTTP method from analysis.apiEndpoints[]:',
    endpointEnforcement,
    '- If endpoint method is DELETE → use apiClient.delete(), never apiClient.post()',
    '- If endpoint method is POST → use apiClient.post(), never apiClient.get()',
    '- DELETE actions MUST accept filter criteria as parameters (never delete without criteria)',
    '',
    'TYPES FILE (already generated):',
    typesContent,
    '',
    'ANALYSIS DOCUMENT:',
    JSON.stringify(analysis, null, 2),
  ];

  if (ctx.contract?.rules.length) {
    parts.push(formatContractRules(ctx.contract.rules));
  }

  if (ctx.spec) {
    parts.push('', 'SPEC EXCERPT (business rules):', ctx.spec.slice(0, 10000));
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
    storeContent.slice(0, 6000),
    '',
    'TYPES:',
    typesContent,
  ];

  if (ctx.contract?.rules.length) {
    const uiRules = ctx.contract.rules.filter(r =>
      /ecran|affich|bouton|champ|saisie|formulaire|dialog|message|alerte|erreur/i.test(r.description + r.condition)
    );
    if (uiRules.length > 0) {
      parts.push(formatContractRules(uiRules));
    }
  }

  if (ctx.spec) {
    const layoutSection = ctx.spec.split('\n')
      .filter(l => /ecran|form|layout|button|control|champ/i.test(l))
      .slice(0, 40)
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
    '⚠️ STEP 1: CODE ANALYSIS (MANDATORY)',
    '',
    'Before writing ANY test, thoroughly analyze the store implementation:',
    '1. Identify all actions and their business logic formulas',
    '2. Identify all async methods and their API calls',
    '3. Identify all state transformations and calculations',
    '4. Note all branching logic (isRealApi, conditional paths)',
    '5. Extract business rules from action implementations',
    '',
    'DO NOT generate tests until you understand the implementation.',
    '',
    '⚠️ STEP 2: TEST GENERATION',
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
    '⚠️ CRITICAL: API Mock Response Format (MANDATORY):',
    '',
    'ApiResponse<T> structure is: { success: boolean, data: T }',
    'The T goes DIRECTLY in data field, NOT wrapped again!',
    '',
    '✅ CORRECT examples (ALWAYS follow these):',
    '```typescript',
    'import type { ApiResponse } from "@/services/api/apiClient"',
    '',
    '// Example 1: Array of objects',
    'const mockResponse: ApiResponse<Account[]> = {',
    '  success: true,',
    '  data: MOCK_ACCOUNTS  // ← DIRECT array, NOT { data: MOCK_ACCOUNTS }',
    '}',
    '',
    '// Example 2: Single object',
    'const mockResponse: ApiResponse<{ status: string }> = {',
    '  success: true,',
    '  data: { status: "A" }  // ← Object structure matches type param',
    '}',
    '',
    'vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)',
    '```',
    '',
    '❌ WRONG patterns (NEVER do this):',
    '```typescript',
    '// ❌ WRONG #1: Double wrapping with { data: ... }',
    'const mockResponse: ApiResponse<{ data: Account[] }> = {',
    '  success: true,',
    '  data: { data: MOCK_ACCOUNTS }  // ❌ WRONG! Extra nesting',
    '}',
    '',
    '// ❌ WRONG #2: Missing ApiResponse type',
    'vi.mocked(apiClient.get).mockResolvedValueOnce({',
    '  data: { success, data }  // ❌ WRONG structure',
    '})',
    '',
    '// ❌ WRONG #3: Array wrapped in object',
    'const mockResponse: ApiResponse<{ data: Account[] }> = {  // ❌ Type is wrong',
    '  success: true,',
    '  data: { data: [...] }  // ← This creates response.data.data',
    '}',
    '```',
    '',
    'RULE: If the store expects response.data to be an array, type must be ApiResponse<Item[]>',
    'RULE: If the store expects response.data to be an object, type must be ApiResponse<{ field: Type }>',
    'NEVER add an extra { data: ... } wrapper!',
    '',
    '⚠️ CRITICAL: Test Both API Modes (MANDATORY):',
    '',
    'Stores support isRealApi branching. Tests MUST cover BOTH modes:',
    '',
    '✅ CORRECT Pattern:',
    '```typescript',
    'import { useDataSourceStore } from "@/stores/dataSourceStore"',
    '',
    'describe("myStore", () => {',
    '  describe("action with real API", () => {',
    '    beforeEach(() => {',
    '      vi.mocked(useDataSourceStore.getState).mockReturnValue({',
    '        isRealApi: true  // ← Test real API path',
    '      })',
    '    })',
    '',
    '    it("should call real API endpoint", async () => {',
    '      await store.loadData()',
    '      expect(apiClient.get).toHaveBeenCalledWith("/real/endpoint")',
    '    })',
    '  })',
    '',
    '  describe("action with mock data", () => {',
    '    beforeEach(() => {',
    '      vi.mocked(useDataSourceStore.getState).mockReturnValue({',
    '        isRealApi: false  // ← Test mock path',
    '      })',
    '    })',
    '',
    '    it("should use mock data generator", async () => {',
    '      await store.loadData()',
    '      expect(apiClient.get).not.toHaveBeenCalled()',
    '      expect(store.items.length).toBeGreaterThan(0)',
    '    })',
    '  })',
    '})',
    '```',
    '',
    'REFERENCE: See sessionListStore.test.ts lines 77-130 for complete example',
    '',
    '⚠️ CRITICAL: Derived Expectations (MANDATORY):',
    '',
    'All test expectations MUST be DERIVED from mock data, NOT hardcoded:',
    '',
    '✅ CORRECT:',
    '```typescript',
    'const MOCK_MONTANT_SAISI = 1300.00',
    'const MOCK_MONTANT_COMPTE = 1250.75',
    'const EXPECTED_ECART = MOCK_MONTANT_SAISI - MOCK_MONTANT_COMPTE  // 49.25',
    '',
    'await store.saisirMontant("monnaie", MOCK_MONTANT_SAISI)',
    'expect(store.ecarts.monnaie).toBe(EXPECTED_ECART)  // ✓ DERIVED',
    '```',
    '',
    '❌ WRONG (DO NOT hardcode magic numbers):',
    '```typescript',
    'expect(store.ecarts.monnaie).toBe(49.25)  // ❌ WHERE DOES 49.25 COME FROM?',
    '```',
    '',
    'RULE: Every numeric expectation MUST show its derivation formula as a comment.',
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
    '',
    '⚠️ CRITICAL ZUSTAND MOCK PATTERN FOR COMPONENTS (MANDATORY):',
    '',
    'Use vi.hoisted() to avoid hoisting errors when store uses hook.setState:',
    '',
    '✅ CORRECT Pattern (components):',
    '```typescript',
    'const { mockStore, mockSetState } = vi.hoisted(() => {',
    '  const store = {',
    '    items: [],',
    '    isLoading: false,',
    '    loadItems: vi.fn(),',
    '    setState: vi.fn()  // For store internal use',
    '  }',
    '  return {',
    '    mockStore: store,',
    '    mockSetState: vi.fn()  // For hook.setState access',
    '  }',
    '})',
    '',
    'vi.mock("@/stores/myStore", () => {',
    '  const mockHook = (() => mockStore) as typeof mockStore & { setState: typeof mockSetState }',
    '  mockHook.setState = mockSetState',
    '  return { useMyStore: mockHook }',
    '})',
    '',
    '// In tests:',
    'beforeEach(() => {',
    '  vi.clearAllMocks()',
    '  mockStore.items = []  // Direct mutation works',
    '})',
    '```',
    '',
    '✅ CORRECT Pattern (store tests only - no hook.setState needed):',
    '```typescript',
    'const mockStore = {',
    '  items: [],',
    '  loadItems: vi.fn()',
    '}',
    '',
    'vi.mock("@/stores/myStore", () => ({',
    '  useMyStore: () => mockStore',
    '}))',
    '```',
    '',
    '❌ WRONG Patterns (DO NOT USE):',
    '```typescript',
    '// ❌ Causes hoisting error:',
    'const mockHook = () => mockStore',
    'vi.mock(..., () => ({ useMyStore: mockHook }))  // mockHook not defined yet',
    '',
    '// ❌ Causes mockReturnValue error:',
    'vi.mock(..., () => ({',
    '  useMyStore: vi.fn(() => ({ ... })),  // Can\'t use .mockReturnValue',
    '}))',
    '```',
    '',
    'REFERENCE: See ArticleZoomPage.test.tsx lines 8-41 for vi.hoisted() example',
    'REFERENCE: See AccountMergePage.test.tsx lines 7-36 for simple pattern',
    '',
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

// ─── Phase REMEDIATE: Coverage Gap Fix ─────────────────────────

export interface RemediateGap {
  category: 'rule' | 'table' | 'variable' | 'callee';
  id: string;
  name: string;
  description: string;
}

export const buildRemediatePrompt = (
  fileContent: string,
  filePath: string,
  gaps: RemediateGap[],
  contractRules: ContractRule[],
  specContext?: string,
): string => {
  const parts: string[] = [
    `Fix the coverage gaps in ${filePath} by implementing the missing business rules.`,
    '',
    COMMON_RULES,
    '',
    'CRITICAL RULES:',
    '- PRESERVE all existing code — only ADD the missing items',
    '- Each RM-XXX rule MUST be implemented as ACTUAL CODE with // RM-XXX as inline comment',
    '- A standalone comment line like "// RM-007: description" is NOT an implementation — it will be REJECTED',
    '- The // RM-XXX marker must appear on a LINE OF CODE: `if (state.field) { ... } // RM-007`',
    '- If a rule references a state variable that does not exist yet, ADD it to the store state',
    '- Do NOT remove, rename, or restructure existing functions/variables/types',
    '- Output the COMPLETE file with additions integrated in the right location',
    '',
    'MAGIC → TYPESCRIPT TRANSLATION (follow exactly):',
    '- "W0 field [X]=\'V\'" → `state.fieldX === "V"` (equality check on state field)',
    '- "W0 field [X]<>\'V\'" → `state.fieldX !== "V"` (inequality check)',
    '- "Negation de (condition)" → `!(condition)` (negate the inner condition)',
    '- "Condition composite: A OR B" → `conditionA || conditionB`',
    '- "Condition toujours vraie" → `true` (always-true guard)',
    '',
    'EXAMPLE of CORRECT implementation (not just a comment):',
    '```typescript',
    '// WRONG (will be rejected):',
    '// RM-005: W0 chrono histo [BA] different de "F"',
    'const data = { ...mockData };',
    '',
    '// CORRECT (actual logic with inline marker):',
    'const isChronoHistoNonFusion = state.chronoHisto !== "F"; // RM-005',
    'if (isChronoHistoNonFusion) {',
    '  // Handle non-fusion chrono path',
    '}',
    '```',
    '',
    `MISSING ITEMS TO ADD (${gaps.length}):`,
  ];

  for (const gap of gaps) {
    parts.push(`- [${gap.category.toUpperCase()}] ${gap.id}: ${gap.name} — ${gap.description}`);
  }

  // Include contract rule details for rules gaps
  const ruleIds = new Set(gaps.filter(g => g.category === 'rule').map(g => g.id));
  const relevantRules = contractRules.filter(r => ruleIds.has(r.id));
  if (relevantRules.length > 0) {
    parts.push('', 'CONTRACT RULE DETAILS (MUST implement each one with real logic):');
    for (const rule of relevantRules) {
      const vars = rule.variables.length > 0 ? ` | vars: ${rule.variables.join(', ')}` : '';
      parts.push(`- ${rule.id}: ${rule.description} [condition: ${rule.condition}]${vars}`);
    }
  }

  // Add spec context for business understanding
  if (specContext) {
    parts.push(
      '',
      'SPECIFICATION CONTEXT (for understanding business logic):',
      '```markdown',
      specContext.slice(0, 4000),
      '```',
    );
  }

  parts.push(
    '',
    'CURRENT FILE CONTENT:',
    '```typescript',
    fileContent,
    '```',
    '',
    'Output the COMPLETE fixed file. Do not omit any existing code.',
  );

  return parts.join('\n');
};

// ─── Phase REMEDIATE: Full regeneration (when patching plateaus) ──

export const buildRegenerateStorePrompt = (
  existingStoreContent: string,
  filePath: string,
  specContent: string,
  contractRules: ContractRule[],
  missingRuleIds: string[],
  testContent?: string,
): string => {
  const parts: string[] = [
    `REGENERATE the store at ${filePath} to implement ALL business rules.`,
    '',
    COMMON_RULES,
    '',
    'CONTEXT: The existing store was auto-generated but is MISSING critical business rules.',
    `Currently ${missingRuleIds.length} rules are NOT implemented: ${missingRuleIds.join(', ')}`,
    '',
    'CRITICAL REQUIREMENTS:',
    '- Keep the SAME store structure (create from zustand, same state shape)',
    '- Keep ALL existing imports and type references',
    '- Keep the mock/API branching pattern (isRealApi)',
    '- IMPLEMENT EVERY rule below as ACTUAL CODE with // RM-XXX as INLINE comment on a CODE line',
    '- A standalone comment "// RM-007: desc" is NOT an implementation and WILL BE REJECTED by the checker',
    '- For each rule referencing a state variable, ADD that variable to the store state if missing',
    '- Create helper functions for complex rules if needed',
    '',
    'MAGIC → TYPESCRIPT TRANSLATION:',
    '- "W0 field [X]=\'V\'" → `state.fieldX === "V"` (add fieldX to state if not present)',
    '- "W0 field [X]<>\'V\'" → `state.fieldX !== "V"`',
    '- "Negation de (condition)" → `!(condition)`',
    '- "Condition composite: A OR B" → `conditionA || conditionB`',
    '- Each rule = an if/guard/validation check that affects the workflow (branching, error, skip)',
    '',
    'CORRECT PATTERN for each rule:',
    '```typescript',
    '// In the store state, add any missing fields:',
    'chronoHisto: string; // "F" for fusion, "S" for separation',
    'repriseConfirmee: boolean;',
    '',
    '// In the action, implement the rule as real logic:',
    'const isFusion = get().chronoHisto === "F"; // RM-004',
    'if (!isFusion) { // RM-005',
    '  throw new Error("Cannot merge: chrono type is not Fusion");',
    '}',
    '```',
    '',
    `ALL CONTRACT RULES (${contractRules.length} total — EVERY one must have // RM-XXX in output):`,
  ];

  for (const rule of contractRules) {
    const vars = rule.variables.length > 0 ? ` (state vars: ${rule.variables.join(', ')})` : '';
    const status = missingRuleIds.includes(rule.id) ? 'MISSING' : 'EXISTS';
    parts.push(`- [${status}] ${rule.id}: ${rule.description}`);
    parts.push(`  condition: ${rule.condition}${vars}`);
  }

  parts.push(
    '',
    'SPECIFICATION (full business context):',
    '```markdown',
    specContent.slice(0, 6000),
    '```',
    '',
    'EXISTING STORE (preserve structure, add missing rules):',
    '```typescript',
    existingStoreContent,
    '```',
  );

  if (testContent) {
    parts.push(
      '',
      'EXISTING TEST FILE (your regenerated store MUST pass these tests):',
      '```typescript',
      testContent.slice(0, 6000),
      '```',
      '',
      'CRITICAL: The tests above already work. Your regenerated store MUST:',
      '- Keep the SAME function signatures and state shape that tests use',
      '- NOT add validation guards that throw before tests can set up state',
      '- If adding a guard (e.g. "chronoHisto must be F"), make it a WARNING not an error,',
      '  OR ensure the default state value already satisfies the guard',
      '- Keep mock data patterns compatible with test assertions',
    );
  }

  parts.push('', 'Output the COMPLETE regenerated store with ALL rules implemented.');

  return parts.join('\n');
};

// ─── Phase REMEDIATE: Spec-guided fallback (sparse contracts) ──

export const buildSpecGuidedRemediatePrompt = (
  fileContent: string,
  filePath: string,
  specContent: string,
): string => {
  const parts: string[] = [
    `MINIMAL FIX: Review ${filePath} against the specification and fix ONLY critical semantic errors.`,
    '',
    COMMON_RULES,
    '',
    'CRITICAL RULES — READ CAREFULLY:',
    '- This is a CONSERVATIVE fix — change as LITTLE as possible',
    '- ONLY fix operations that are semantically WRONG (e.g., code creates when spec says delete)',
    '- DO NOT restructure, rename, or reorganize existing code',
    '- DO NOT add new features or functions not in the spec',
    '- DO NOT remove working code that does not contradict the spec',
    '- If the code is mostly correct, return it UNCHANGED',
    '- Add a comment // SPEC-FIX next to each change you make',
    '- Output the COMPLETE file (unchanged parts + minimal fixes)',
    '',
    'SPECIFICATION (check correctness against this):',
    '```markdown',
    specContent.slice(0, 6000),
    '```',
    '',
    'CURRENT FILE CONTENT:',
    '```typescript',
    fileContent,
    '```',
    '',
    'Output the COMPLETE file. Only change what is semantically wrong per the spec.',
  ];

  return parts.join('\n');
};

// ─── Post-REVIEW Remediation (guided by REVIEW results) ────────

export const buildReviewGuidedRemediatePrompt = (
  fileContent: string,
  filePath: string,
  missingRules: string[],
  recommendations: string[],
  specContent?: string,
): string => {
  const parts: string[] = [
    `IMPLEMENT MISSING RULES in ${filePath}.`,
    '',
    COMMON_RULES,
    '',
    'The code review identified these MISSING business rules that MUST be implemented:',
    '',
    ...missingRules.map((r, i) => `${i + 1}. ${r}`),
    '',
    'Reviewer recommendations:',
    ...recommendations.slice(0, 5).map(r => `- ${r}`),
    '',
    'IMPLEMENTATION RULES:',
    '- Add each missing rule as real working code (not just a comment)',
    '- Tag each rule with a comment like // RM-005: description',
    '- Preserve ALL existing working code',
    '- Add new functions/methods for new business logic',
    '- If a rule requires a condition check, implement it in the store action',
    '- If a rule is UI-related, implement it in the component/page',
    '- Output the COMPLETE file with additions integrated naturally',
  ];

  if (specContent) {
    parts.push('', 'SPECIFICATION (reference for implementation):', '```markdown', specContent.slice(0, 4000), '```');
  }

  parts.push('', 'CURRENT FILE CONTENT:', '```typescript', fileContent, '```', '', 'Output the COMPLETE updated file with all missing rules implemented.');

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
    parts.push('', 'SPEC EXCERPT:', ctx.spec.slice(0, 10000));
  }

  parts.push('', 'GENERATED FILES:');
  for (const [filePath, content] of Object.entries(generatedFiles)) {
    parts.push(`\n--- ${filePath} ---`, content.slice(0, 4000));
  }

  return parts.join('\n');
};

// ─── Phase 17: REFACTOR ─────────────────────────────────────────

export const buildRefactorPrompt = (
  files: Record<string, string>,
  analysis: AnalysisDocument,
  targetFile: string,
): string => {
  const targetContent = files[targetFile];
  if (!targetContent) {
    throw new Error(`Target file not found in files map: ${targetFile}`);
  }

  const contextFiles = Object.entries(files)
    .filter(([p]) => p !== targetFile)
    .map(([p, c]) => `--- ${p} (read-only context) ---\n${c.slice(0, 4000)}`)
    .join('\n\n');

  const parts: string[] = [
    `Refactor the file "${targetFile}" for the "${analysis.domainPascal}" domain.`,
    '',
    'GOAL: Improve code quality WITHOUT changing behavior.',
    '',
    'REFACTORING RULES (MANDATORY):',
    '- PRESERVE all existing functionality — ZERO behavioral change',
    '- PRESERVE all // RM-XXX markers and their associated logic',
    '- PRESERVE all exports (names and signatures)',
    '- Extract helpers if duplicated logic > 3 lines',
    '- Consolidate redundant imports',
    '- Replace `any` with precise types',
    '- Simplify nested conditions with early returns',
    '- Remove unused variables and dead code',
    `- Align naming with domain: "${analysis.domain}" (camelCase) / "${analysis.domainPascal}" (PascalCase)`,
    '- Use arrow functions consistently',
    '- Keep Zustand patterns idiomatic (get/set in actions)',
    '- Keep React patterns idiomatic (hooks order, useCallback for handlers)',
    '',
    'DO NOT:',
    '- Change function signatures or exported names',
    '- Add new features or business logic',
    '- Remove or modify // RM-XXX rule implementations',
    '- Add comments unless logic is genuinely complex',
    '- Change the file structure (keep same sections/organization)',
    '',
    COMMON_RULES,
    '',
    'DOMAIN ANALYSIS:',
    JSON.stringify({
      domain: analysis.domain,
      domainPascal: analysis.domainPascal,
      entities: analysis.entities.map(e => e.name),
      actions: analysis.actions.map(a => a.name),
    }, null, 2),
    '',
    'TARGET FILE TO REFACTOR:',
    '```typescript',
    targetContent,
    '```',
  ];

  if (contextFiles) {
    parts.push('', 'CONTEXT FILES (read-only — for understanding imports and types):', contextFiles);
  }

  parts.push('', 'Output the COMPLETE refactored file. Preserve all existing behavior.');

  return parts.join('\n');
};
