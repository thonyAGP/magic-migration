/**
 * Contract schema validator for legacy expressions.
 *
 * Validates that enriched contracts have proper structure for the
 * legacy_expressions field, ensuring traceability and verification.
 */

import type { ExpressionTrace } from './expression-coverage-types.js';

/**
 * Extended contract rule with legacy expressions.
 */
export interface EnrichedContractRule {
  id: string;
  description: string;
  condition: string;
  variables: string[];
  status: 'IMPL' | 'MISSING' | 'PARTIAL';
  target_file: string;
  gap_notes: string;
  legacy_expressions?: LegacyExpression[];
}

/**
 * Legacy expression with detailed location tracking.
 */
export interface LegacyExpression {
  expr_id: string; // "Prg_48:Task_2:Line_5:Expr_10"
  formula: string; // Full Magic formula
  location: {
    program_id: number;
    task_id: number;
    line_id: number;
    expr_id: number;
  };
  mapped_to?: string; // "src/validation.ts:42"
  test_file?: string; // "tests/validation.test.ts:15"
  verified: boolean;
  notes?: string;
}

/**
 * Validation result.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate expression ID format.
 *
 * Expected: "Prg_XXX:Task_YYY:Line_ZZZ:Expr_NNN"
 */
export const validateExpressionId = (exprId: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const pattern = /^Prg_\d+:Task_\d+:Line_\d+:Expr_\d+$/;
  if (!pattern.test(exprId)) {
    errors.push(`Invalid expr_id format: "${exprId}". Expected "Prg_XXX:Task_YYY:Line_ZZZ:Expr_NNN"`);
  }

  // Check for template values
  if (exprId.includes('XXX') || exprId.includes('YYY') || exprId.includes('ZZZ') || exprId.includes('NNN')) {
    warnings.push(`Expression ID contains template placeholders: "${exprId}". Replace with actual values.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate file reference format.
 *
 * Expected: "path/to/file.ts:42"
 */
export const validateFileReference = (fileRef: string, label: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fileRef || fileRef === '') {
    warnings.push(`${label} is empty. Should be "path/to/file.ts:lineNumber"`);
    return { valid: true, errors, warnings };
  }

  const pattern = /^.+\.\w+:\d+$/;
  if (!pattern.test(fileRef)) {
    errors.push(`Invalid ${label} format: "${fileRef}". Expected "path/to/file.ts:lineNumber"`);
  }

  // Check for template values
  if (fileRef === ':0' || fileRef.endsWith(':0')) {
    warnings.push(`${label} has line number 0: "${fileRef}". Replace with actual line number.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate location object.
 */
export const validateLocation = (location: LegacyExpression['location']): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (location.program_id === 0) {
    warnings.push('program_id is 0. Should be actual Magic program ID.');
  }

  if (location.task_id === 0) {
    warnings.push('task_id is 0. Should be actual Magic task ID.');
  }

  if (location.line_id === 0) {
    warnings.push('line_id is 0. Should be actual Magic line ID.');
  }

  if (location.expr_id === 0) {
    warnings.push('expr_id is 0. Should be actual Magic expression ID.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate legacy expression.
 */
export const validateLegacyExpression = (expr: LegacyExpression, ruleId: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate expr_id
  const exprIdResult = validateExpressionId(expr.expr_id);
  errors.push(...exprIdResult.errors);
  warnings.push(...exprIdResult.warnings);

  // Validate formula
  if (!expr.formula || expr.formula === '') {
    errors.push(`Rule ${ruleId}: formula is empty`);
  }

  // Validate location
  const locationResult = validateLocation(expr.location);
  warnings.push(...locationResult.warnings);

  // Validate mapped_to
  if (expr.mapped_to) {
    const mappedResult = validateFileReference(expr.mapped_to, 'mapped_to');
    errors.push(...mappedResult.errors);
    warnings.push(...mappedResult.warnings);
  }

  // Validate test_file
  if (expr.test_file) {
    const testResult = validateFileReference(expr.test_file, 'test_file');
    errors.push(...testResult.errors);
    warnings.push(...testResult.warnings);
  }

  // Check verified status
  if (expr.verified && (!expr.test_file || expr.test_file === '')) {
    warnings.push(`Rule ${ruleId}: marked as verified but no test_file specified`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate enriched contract rule.
 */
export const validateEnrichedRule = (rule: EnrichedContractRule): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if rule has legacy_expressions
  if (!rule.legacy_expressions || rule.legacy_expressions.length === 0) {
    warnings.push(`Rule ${rule.id}: no legacy_expressions defined`);
    return { valid: true, errors, warnings };
  }

  // Validate each expression
  for (const expr of rule.legacy_expressions) {
    const exprResult = validateLegacyExpression(expr, rule.id);
    errors.push(...exprResult.errors.map(e => `Rule ${rule.id}: ${e}`));
    warnings.push(...exprResult.warnings.map(w => `Rule ${rule.id}: ${w}`));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate entire enriched contract.
 */
export const validateEnrichedContract = (rules: EnrichedContractRule[]): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  let totalExpressions = 0;
  let verifiedExpressions = 0;

  for (const rule of rules) {
    const ruleResult = validateEnrichedRule(rule);
    errors.push(...ruleResult.errors);
    warnings.push(...ruleResult.warnings);

    if (rule.legacy_expressions) {
      totalExpressions += rule.legacy_expressions.length;
      verifiedExpressions += rule.legacy_expressions.filter(e => e.verified).length;
    }
  }

  // Summary
  if (totalExpressions === 0) {
    warnings.push('Contract has no legacy expressions. Run enrich-contract-expressions.ts to add them.');
  } else {
    const verifiedPct = Math.round((verifiedExpressions / totalExpressions) * 100);
    console.log(`📊 Expression coverage: ${verifiedExpressions}/${totalExpressions} verified (${verifiedPct}%)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Convert ExpressionTrace to LegacyExpression format.
 */
export const expressionTraceToLegacyExpression = (trace: ExpressionTrace): LegacyExpression => {
  // Parse expr_id to extract location
  const parts = trace.exprId.split(':');
  const programId = parts[0] ? Number.parseInt(parts[0].replace('Prg_', ''), 10) : 0;
  const taskId = parts[1] ? Number.parseInt(parts[1].replace('Task_', ''), 10) : 0;
  const lineId = parts[2] ? Number.parseInt(parts[2].replace('Line_', ''), 10) : 0;
  const exprIdNum = parts[3] ? Number.parseInt(parts[3].replace('Expr_', ''), 10) : 0;

  return {
    expr_id: trace.exprId,
    formula: trace.legacyFormula,
    location: {
      program_id: programId,
      task_id: taskId,
      line_id: lineId,
      expr_id: exprIdNum,
    },
    mapped_to: trace.modernFile && trace.modernLine ? `${trace.modernFile}:${trace.modernLine}` : undefined,
    test_file: trace.testFile && trace.testLine ? `${trace.testFile}:${trace.testLine}` : undefined,
    verified: trace.verified,
  };
};
