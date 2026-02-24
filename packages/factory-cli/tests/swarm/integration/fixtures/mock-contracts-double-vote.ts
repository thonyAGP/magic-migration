/**
 * Mock Critical Contracts for Double Vote Tests
 *
 * These contracts trigger isCritical=true and requiresDoubleVote=true
 */

import type { ExtendedMigrationContract } from '../../../../src/core/contract.js';

/**
 * Critical payment processing contract
 */
export const CRITICAL_CONTRACT_PAYMENT: ExtendedMigrationContract = {
  version: '1.0',
  specmapVersion: '7.0.0',
  metadata: {
    program_id: 237,
    program_name: 'Payment Processing System', // Critical keyword
    total_lines: 2500,
    total_tables: 8,
    total_expressions: 45,
  },
  program: {
    id: '237',
    name: 'PaymentProcessor',
    description: 'Critical payment processing with transaction handling, fraud detection, and reconciliation',
  },
  tables: [
    {
      id: 'T1',
      name: 'transactions',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'payment_method', type: 'string' },
      ],
    },
    {
      id: 'T2',
      name: 'payment_gateways',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'provider', type: 'string' },
        { name: 'api_key', type: 'string' },
      ],
    },
    {
      id: 'T3',
      name: 'fraud_checks',
      fields: [
        { name: 'transaction_id', type: 'number' },
        { name: 'risk_score', type: 'number' },
        { name: 'flagged', type: 'boolean' },
      ],
    },
  ],
  rules: [
    {
      id: 'R1',
      description: 'Process payment transaction with fraud detection',
      tags: ['payment', 'critical', 'fraud-detection'],
    },
    {
      id: 'R2',
      description: 'Handle payment gateway integration',
      tags: ['integration', 'external-api'],
    },
    {
      id: 'R3',
      description: 'Validate transaction amount and currency',
      tags: ['validation', 'business-logic'],
    },
    {
      id: 'R4',
      description: 'Update transaction status atomically',
      tags: ['transaction', 'state-management'],
    },
    {
      id: 'R5',
      description: 'Calculate fees and reconciliation',
      tags: ['calculation', 'financial'],
    },
  ],
  expressions: [
    { id: 'E1', purpose: 'Calculate transaction fee', formula: 'amount * 0.029 + 0.30' },
    { id: 'E2', purpose: 'Check fraud risk', formula: 'risk_score > 70' },
    { id: 'E3', purpose: 'Validate amount', formula: 'amount > 0 AND amount < 999999' },
    { id: 'E4', purpose: 'Currency conversion', formula: 'amount * exchange_rate' },
  ],
};

/**
 * Critical security/authentication contract
 */
export const CRITICAL_CONTRACT_SECURITY: ExtendedMigrationContract = {
  version: '1.0',
  specmapVersion: '7.0.0',
  metadata: {
    program_id: 156,
    program_name: 'Security Authentication Module', // Critical keyword
    total_lines: 1800,
    total_tables: 5,
    total_expressions: 30,
  },
  program: {
    id: '156',
    name: 'AuthenticationModule',
    description: 'Critical security module for user authentication, authorization, and session management',
  },
  tables: [
    {
      id: 'T1',
      name: 'users',
      fields: [
        { name: 'id', type: 'number' },
        { name: 'username', type: 'string' },
        { name: 'password_hash', type: 'string' },
        { name: 'salt', type: 'string' },
      ],
    },
    {
      id: 'T2',
      name: 'sessions',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'user_id', type: 'number' },
        { name: 'token', type: 'string' },
        { name: 'expires_at', type: 'date' },
      ],
    },
    {
      id: 'T3',
      name: 'permissions',
      fields: [
        { name: 'user_id', type: 'number' },
        { name: 'resource', type: 'string' },
        { name: 'access_level', type: 'string' },
      ],
    },
  ],
  rules: [
    {
      id: 'R1',
      description: 'Authenticate user with password hashing',
      tags: ['security', 'authentication', 'critical'],
    },
    {
      id: 'R2',
      description: 'Generate and validate session tokens',
      tags: ['security', 'session-management'],
    },
    {
      id: 'R3',
      description: 'Check user permissions and authorization',
      tags: ['authorization', 'critical'],
    },
    {
      id: 'R4',
      description: 'Handle session expiration and refresh',
      tags: ['session', 'state-management'],
    },
  ],
  expressions: [
    { id: 'E1', purpose: 'Check password strength', formula: 'LENGTH(password) >= 8 AND REGEX(password, "[A-Z]") AND REGEX(password, "[0-9]")' },
    { id: 'E2', purpose: 'Validate session token', formula: 'HMAC_SHA256(token, secret)' },
    { id: 'E3', purpose: 'Check session expiration', formula: 'expires_at > NOW()' },
  ],
};
