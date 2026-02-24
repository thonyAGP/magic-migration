/**
 * Mock Migration Contracts for Integration Tests
 */

import type { ExtendedMigrationContract } from '../../../../src/core/contract.js';

/**
 * Simple contract with sufficient complexity for SWARM
 */
export const SIMPLE_CONTRACT: ExtendedMigrationContract = {
  version: '1.0',
  specmapVersion: '7.0.0',
  metadata: {
    program_id: 100,
    program_name: 'Payment Processing', // Critical keyword to trigger isCritical = true
    total_lines: 500,
    total_tables: 3,
    total_expressions: 10,
  },
  program: {
    id: '100',
    name: 'SimpleProgram',
    description: 'A simple program with basic CRUD operations',
  },
  tables: [
    {
      id: 'T1',
      name: 'users',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
      ],
    },
    {
      id: 'T2',
      name: 'logs',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'message', type: 'string' },
      ],
    },
    {
      id: 'T3',
      name: 'settings',
      fields: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' },
      ],
    },
  ],
  rules: [
    {
      id: 'R1',
      description: 'Validate email format',
      tags: ['validation'],
    },
    {
      id: 'R2',
      description: 'Ensure unique email',
      tags: ['constraint'],
    },
    {
      id: 'R3',
      description: 'Log all user actions',
      tags: ['audit'],
    },
    {
      id: 'R4',
      description: 'Check permissions',
      tags: ['security'],
    },
    {
      id: 'R5',
      description: 'Update settings',
      tags: ['config'],
    },
  ],
  expressions: [
    { id: 'E1', purpose: 'Format email', formula: 'LOWER(email)' },
    { id: 'E2', purpose: 'Check active', formula: 'status = ACTIVE' },
    { id: 'E3', purpose: 'Calculate age', formula: 'YEAR(NOW()) - YEAR(birthdate)' },
  ],
};

/**
 * Complex contract with high complexity
 */
export const COMPLEX_CONTRACT: ExtendedMigrationContract = {
  version: '1.0',
  specmapVersion: '7.0.0',
  metadata: {
    program_id: 200,
    program_name: 'Transaction Processing', // Critical keyword
    total_lines: 2000,
    total_tables: 5,
    total_expressions: 25,
  },
  program: {
    id: '200',
    name: 'ComplexProgram',
    description: 'Complex program with multiple tables, business rules, and expressions',
  },
  tables: [
    {
      id: 'T1',
      name: 'orders',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'customer_id', type: 'number' },
        { name: 'total', type: 'number' },
        { name: 'status', type: 'string' },
      ],
    },
    {
      id: 'T2',
      name: 'order_items',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'order_id', type: 'number' },
        { name: 'product_id', type: 'number' },
        { name: 'quantity', type: 'number' },
        { name: 'price', type: 'number' },
      ],
    },
    {
      id: 'T3',
      name: 'products',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'stock', type: 'number' },
        { name: 'price', type: 'number' },
      ],
    },
  ],
  rules: [
    {
      id: 'R1',
      description: 'Calculate order total from items',
      tags: ['calculation', 'critical'],
    },
    {
      id: 'R2',
      description: 'Check product stock availability',
      tags: ['validation', 'critical'],
    },
    {
      id: 'R3',
      description: 'Update product stock on order',
      tags: ['transaction', 'critical'],
    },
    {
      id: 'R4',
      description: 'Apply discounts based on customer tier',
      tags: ['business-logic'],
    },
    {
      id: 'R5',
      description: 'Send notification on order status change',
      tags: ['integration'],
    },
  ],
  expressions: [
    {
      id: 'E1',
      purpose: 'Calculate item subtotal',
      formula: 'quantity * price',
    },
    {
      id: 'E2',
      purpose: 'Check if stock sufficient',
      formula: 'product.stock >= order_item.quantity',
    },
  ],
};

/**
 * Incomplete contract with missing information
 */
export const INCOMPLETE_CONTRACT: ExtendedMigrationContract = {
  version: '1.0',
  specmapVersion: '7.0.0',
  program: {
    id: '300',
    name: 'IncompleteProgram',
  },
  tables: [],
  rules: [
    {
      id: 'R1',
      description: 'Unknown rule - needs analysis',
      tags: ['TODO'],
    },
  ],
  remainingMarkers: [
    'RM_001: Missing table definitions',
    'RM_002: Business logic unclear',
    'RM_003: No documentation',
    'RM_004: Unknown dependencies',
    'RM_005: Data model undefined',
    'RM_006: Integration points missing',
  ],
};

/**
 * Contract with critical issues (should trigger REJECT with veto)
 */
export const CRITICAL_ISSUES_CONTRACT: ExtendedMigrationContract = {
  version: '1.0',
  specmapVersion: '7.0.0',
  metadata: {
    program_id: 400,
    program_name: 'Security Module', // Critical keyword
    total_lines: 1500,
    total_tables: 3,
    total_expressions: 15,
  },
  program: {
    id: '400',
    name: 'CriticalIssuesProgram',
    description: 'Program with data integrity and security concerns',
  },
  tables: [
    {
      id: 'T1',
      name: 'sensitive_data',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'password', type: 'string' }, // No encryption mentioned
        { name: 'credit_card', type: 'string' }, // PII not protected
      ],
    },
  ],
  rules: [
    {
      id: 'R1',
      description: 'Store password in plain text',
      tags: ['SECURITY_RISK'],
    },
    {
      id: 'R2',
      description: 'Log credit card numbers',
      tags: ['SECURITY_RISK', 'COMPLIANCE_VIOLATION'],
    },
  ],
  remainingMarkers: [
    'RM_001: No encryption strategy',
    'RM_002: No access control',
    'RM_003: No audit trail',
  ],
};
