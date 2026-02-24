/**
 * Complexity Calculator - Determines when to trigger SWARM
 *
 * Analyzes program complexity to decide if SWARM system should be used
 */

import type { ExtendedMigrationContract as MigrationContract } from '../core/contract.js';
import type { ComplexityIndicators, ComplexityScore } from './types.js';

/**
 * Calculate complexity score for a program
 *
 * @param contract - Migration contract to analyze
 * @returns Complexity score and SWARM recommendation
 */
export function calculateComplexity(
  contract: MigrationContract,
): ComplexityScore {
  const indicators = extractComplexityIndicators(contract);
  const score = computeComplexityScore(indicators);
  const level = determineComplexityLevel(score);
  const useSwarm = shouldUseSwarm(score, indicators);
  const requiresDoubleVote = isDoubleVoteRequired(indicators);
  const explanation = buildExplanation(indicators, score, level);

  return {
    score,
    level,
    useSwarm,
    requiresDoubleVote,
    indicators,
    explanation,
  };
}

/**
 * Extract complexity indicators from contract
 */
function extractComplexityIndicators(
  contract: MigrationContract,
): ComplexityIndicators {
  const { metadata, business_logic } = contract;

  // Expression count
  const expressionCount = metadata?.legacy_expressions?.length ?? 0;

  // Table count (from metadata.tables)
  const tableCount = metadata?.tables?.length ?? 0;

  // Nesting depth (from business_logic.complexity)
  const nestingDepth = business_logic?.complexity?.nesting_depth ?? 0;

  // Business logic indicators
  const hasBusinessLogic = hasBusinessLogicIndicators(contract);
  const hasStateManagement = hasStateIndicators(contract);
  const hasExternalIntegrations = hasExternalIntegrationIndicators(contract);

  // Critical program detection
  const isCritical = isCriticalProgram(contract);

  return {
    expressionCount,
    tableCount,
    nestingDepth,
    hasBusinessLogic,
    hasStateManagement,
    isCritical,
    hasExternalIntegrations,
  };
}

/**
 * Detect if program has business logic
 */
function hasBusinessLogicIndicators(contract: MigrationContract): boolean {
  const { business_logic, metadata } = contract;

  // Check for calculations
  if (business_logic?.complexity?.calculations && (business_logic.complexity.calculations as number) > 0) {
    return true;
  }

  // Check for validations
  if (business_logic?.complexity?.validations && (business_logic.complexity.validations as number) > 0) {
    return true;
  }

  // Check for complex expressions (formulas, conditions)
  const expressions = metadata?.legacy_expressions ?? [];
  const hasComplexExpression = expressions.some(
    (expr: { formula: string }) =>
      expr.formula.includes('IF(') ||
      expr.formula.includes('Calc(') ||
      expr.formula.includes('Val(') ||
      expr.formula.includes('Range('),
  );

  return hasComplexExpression;
}

/**
 * Detect if program has state management
 */
function hasStateIndicators(contract: MigrationContract): boolean {
  const { modern_implementation } = contract;

  // Check for state management keywords
  const stateKeywords = [
    'useState',
    'useReducer',
    'Zustand',
    'Redux',
    'state management',
  ];

  const notes = modern_implementation?.notes ?? '';
  return stateKeywords.some((keyword) =>
    notes.toLowerCase().includes(keyword.toLowerCase()),
  );
}

/**
 * Detect if program has external integrations
 */
function hasExternalIntegrationIndicators(
  contract: MigrationContract,
): boolean {
  const { modern_implementation, metadata } = contract;

  // Check for API calls
  const hasApiCalls =
    modern_implementation?.notes?.toLowerCase().includes('api') ?? false;

  // Check for external dependencies
  const dependencies = metadata?.dependencies ?? [];
  const hasExternalDeps = dependencies.some((dep: { type: string }) => dep.type === 'external');

  return hasApiCalls || hasExternalDeps;
}

/**
 * Detect critical programs (payment, security, legal compliance)
 */
function isCriticalProgram(contract: MigrationContract): boolean {
  const { metadata, business_logic } = contract;

  // Keywords indicating critical functionality
  const criticalKeywords = [
    'payment',
    'transaction',
    'money',
    'credit card',
    'security',
    'authentication',
    'authorization',
    'encryption',
    'compliance',
    'gdpr',
    'pci-dss',
    'audit',
  ];

  // Check program name
  const programName = metadata?.program_name?.toLowerCase() ?? '';
  if (
    criticalKeywords.some((keyword) => programName.includes(keyword.toLowerCase()))
  ) {
    return true;
  }

  // Check business logic description
  const objective = (business_logic as any)?.objective?.toLowerCase() ?? '';
  if (
    criticalKeywords.some((keyword) => objective.includes(keyword.toLowerCase()))
  ) {
    return true;
  }

  // Check if marked as critical in metadata
  if (metadata?.complexity === 'CRITICAL') {
    return true;
  }

  return false;
}

/**
 * Compute overall complexity score (0-100)
 */
function computeComplexityScore(indicators: ComplexityIndicators): number {
  let score = 0;

  // Expression count (0-40 points)
  score += Math.min((indicators.expressionCount / 50) * 40, 40);

  // Table count (0-15 points)
  score += Math.min((indicators.tableCount / 5) * 15, 15);

  // Nesting depth (0-15 points)
  score += Math.min((indicators.nestingDepth / 5) * 15, 15);

  // Business logic (10 points)
  if (indicators.hasBusinessLogic) {
    score += 10;
  }

  // State management (10 points)
  if (indicators.hasStateManagement) {
    score += 10;
  }

  // External integrations (10 points)
  if (indicators.hasExternalIntegrations) {
    score += 10;
  }

  // Critical program (automatic 100)
  if (indicators.isCritical) {
    score = 100;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Determine complexity level from score
 */
function determineComplexityLevel(
  score: number,
): 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'CRITICAL' {
  if (score >= 80) return 'CRITICAL';
  if (score >= 50) return 'COMPLEX';
  if (score >= 20) return 'MEDIUM';
  return 'SIMPLE';
}

/**
 * Decide if SWARM should be used
 */
function shouldUseSwarm(score: number, indicators: ComplexityIndicators): boolean {
  // Always use SWARM for critical programs
  if (indicators.isCritical) {
    return true;
  }

  // Use SWARM if complexity >= 50 (COMPLEX or CRITICAL level)
  return score >= 50;
}

/**
 * Check if double vote is required
 */
function isDoubleVoteRequired(indicators: ComplexityIndicators): boolean {
  // Double vote for critical programs
  if (indicators.isCritical) {
    return true;
  }

  // Double vote for very complex programs (30+ expressions + business logic)
  if (indicators.expressionCount >= 30 && indicators.hasBusinessLogic) {
    return true;
  }

  return false;
}

/**
 * Build human-readable explanation
 */
function buildExplanation(
  indicators: ComplexityIndicators,
  score: number,
  level: string,
): string {
  const parts: string[] = [];

  parts.push(`Complexity: ${score}/100 (${level})`);
  parts.push(`Expressions: ${indicators.expressionCount}`);
  parts.push(`Tables: ${indicators.tableCount}`);
  parts.push(`Nesting depth: ${indicators.nestingDepth}`);

  if (indicators.hasBusinessLogic) {
    parts.push('Has business logic');
  }

  if (indicators.hasStateManagement) {
    parts.push('Has state management');
  }

  if (indicators.hasExternalIntegrations) {
    parts.push('Has external integrations');
  }

  if (indicators.isCritical) {
    parts.push('⚠️ CRITICAL program (payment/security/compliance)');
  }

  return parts.join(' | ');
}

/**
 * Format complexity report as markdown
 */
export function formatComplexityReport(complexity: ComplexityScore): string {
  const { score, level, useSwarm, requiresDoubleVote, indicators, explanation } =
    complexity;

  const lines = [
    '# Complexity Analysis',
    '',
    `**Score**: ${score}/100`,
    `**Level**: ${level}`,
    `**SWARM Recommended**: ${useSwarm ? '✅ Yes' : '❌ No'}`,
    `**Double Vote Required**: ${requiresDoubleVote ? '✅ Yes' : '❌ No'}`,
    '',
    '## Indicators',
    '',
    `- Expressions: ${indicators.expressionCount}`,
    `- Tables: ${indicators.tableCount}`,
    `- Nesting depth: ${indicators.nestingDepth}`,
    `- Business logic: ${indicators.hasBusinessLogic ? '✅' : '❌'}`,
    `- State management: ${indicators.hasStateManagement ? '✅' : '❌'}`,
    `- External integrations: ${indicators.hasExternalIntegrations ? '✅' : '❌'}`,
    `- Critical program: ${indicators.isCritical ? '⚠️ YES' : '❌'}`,
    '',
    '## Explanation',
    '',
    explanation,
  ];

  return lines.join('\n');
}
