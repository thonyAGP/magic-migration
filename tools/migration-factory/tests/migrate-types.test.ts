import { describe, it, expect } from 'vitest';
import {
  MigratePhase, GENERATION_PHASES, VERIFICATION_PHASES,
  PhaseStatus, MigrateEventType,
} from '../src/migrate/migrate-types.js';

describe('MigratePhase', () => {
  it('should define 16 phases', () => {
    expect(Object.keys(MigratePhase)).toHaveLength(16);
  });

  it('should include spec through review', () => {
    expect(MigratePhase.SPEC).toBe('spec');
    expect(MigratePhase.REVIEW).toBe('review');
  });

  it('should separate generation and verification phases', () => {
    expect(GENERATION_PHASES).toHaveLength(10);
    expect(VERIFICATION_PHASES).toHaveLength(6);
    expect(GENERATION_PHASES[0]).toBe('spec');
    expect(GENERATION_PHASES[9]).toBe('tests-ui');
    expect(VERIFICATION_PHASES[0]).toBe('verify-tsc');
    expect(VERIFICATION_PHASES[5]).toBe('review');
  });
});

describe('PhaseStatus', () => {
  it('should define 5 statuses', () => {
    expect(Object.keys(PhaseStatus)).toHaveLength(5);
    expect(PhaseStatus.PENDING).toBe('pending');
    expect(PhaseStatus.COMPLETED).toBe('completed');
    expect(PhaseStatus.FAILED).toBe('failed');
  });
});

describe('MigrateEventType', () => {
  it('should define all event types', () => {
    expect(MigrateEventType.MIGRATION_STARTED).toBe('migration_started');
    expect(MigrateEventType.PROGRAM_COMPLETED).toBe('program_completed');
    expect(MigrateEventType.VERIFY_PASS).toBe('verify_pass');
    expect(Object.keys(MigrateEventType).length).toBeGreaterThanOrEqual(10);
  });
});
