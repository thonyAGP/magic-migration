/**
 * Coverage calculation for migration contracts.
 * Formula: (impl + partial * 0.5) / (total - na) * 100
 */

import type { ItemStatus, MigrationContract } from './types.js';

export interface CoverageBreakdown {
  impl: number;
  partial: number;
  missing: number;
  na: number;
  total: number;
  coveragePct: number;
}

const countStatuses = (items: { status: ItemStatus }[]): CoverageBreakdown => {
  let impl = 0, partial = 0, missing = 0, na = 0;

  for (const item of items) {
    switch (item.status) {
      case 'IMPL': impl++; break;
      case 'PARTIAL': partial++; break;
      case 'MISSING': missing++; break;
      case 'N/A': na++; break;
    }
  }

  const total = items.length;
  const applicable = total - na;
  const coveragePct = applicable > 0
    ? Math.round((impl + partial * 0.5) / applicable * 100)
    : 100;

  return { impl, partial, missing, na, total, coveragePct };
};

export const computeRulesCoverage = (contract: MigrationContract): CoverageBreakdown =>
  countStatuses(contract.rules);

export const computeVariablesCoverage = (contract: MigrationContract): CoverageBreakdown =>
  countStatuses(contract.variables);

export const computeTablesCoverage = (contract: MigrationContract): CoverageBreakdown =>
  countStatuses(contract.tables);

export const computeCalleesCoverage = (contract: MigrationContract): CoverageBreakdown =>
  countStatuses(contract.callees);

export const computeOverallCoverage = (contract: MigrationContract): number => {
  const rules = computeRulesCoverage(contract);
  const variables = computeVariablesCoverage(contract);
  const tables = computeTablesCoverage(contract);
  const callees = computeCalleesCoverage(contract);

  const totalApplicable =
    (rules.total - rules.na) +
    (variables.total - variables.na) +
    (tables.total - tables.na) +
    (callees.total - callees.na);

  if (totalApplicable === 0) return 100;

  const totalImpl =
    rules.impl + variables.impl + tables.impl + callees.impl;
  const totalPartial =
    rules.partial + variables.partial + tables.partial + callees.partial;

  return Math.round((totalImpl + totalPartial * 0.5) / totalApplicable * 100);
};

export const formatCoverageBar = (pct: number, width = 20): string => {
  const filled = Math.round(pct / 100 * width);
  const empty = width - filled;
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
  return `[${bar}] ${pct}%`;
};
