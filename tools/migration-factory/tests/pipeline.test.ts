import { describe, it, expect } from 'vitest';
import { canTransition, nextStatus, isTerminal, statusOrder, isAtLeast } from '../src/core/pipeline.js';

describe('Pipeline transitions', () => {
  it('should allow contracted → enriched', () => {
    expect(canTransition('contracted', 'enriched')).toBe(true);
  });

  it('should allow enriched → verified', () => {
    expect(canTransition('enriched', 'verified')).toBe(true);
  });

  it('should reject pending → enriched (skip)', () => {
    expect(canTransition('pending', 'enriched')).toBe(false);
  });

  it('should reject verified → anything', () => {
    expect(canTransition('verified', 'pending')).toBe(false);
    expect(canTransition('verified', 'contracted')).toBe(false);
  });

  it('should allow rollback contracted → pending', () => {
    expect(canTransition('contracted', 'pending')).toBe(true);
  });

  it('should allow rollback enriched → contracted', () => {
    expect(canTransition('enriched', 'contracted')).toBe(true);
  });

  it('should return next status in pipeline', () => {
    expect(nextStatus('pending')).toBe('contracted');
    expect(nextStatus('contracted')).toBe('enriched');
    expect(nextStatus('enriched')).toBe('verified');
    expect(nextStatus('verified')).toBeNull();
  });

  it('should detect terminal state', () => {
    expect(isTerminal('verified')).toBe(true);
    expect(isTerminal('enriched')).toBe(false);
  });

  it('should order statuses correctly', () => {
    expect(statusOrder('pending')).toBe(0);
    expect(statusOrder('contracted')).toBe(1);
    expect(statusOrder('enriched')).toBe(2);
    expect(statusOrder('verified')).toBe(3);
  });

  it('should compare statuses with isAtLeast', () => {
    expect(isAtLeast('enriched', 'contracted')).toBe(true);
    expect(isAtLeast('contracted', 'enriched')).toBe(false);
    expect(isAtLeast('verified', 'pending')).toBe(true);
  });
});
