// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GiftPassCheck } from '../GiftPassCheck';

describe('GiftPassCheck', () => {
  it('should render "Non verifie" when no result', () => {
    render(
      <GiftPassCheck result={null} isChecking={false} onCheck={vi.fn()} />,
    );

    expect(screen.getByText('Non verifie')).toBeDefined();
  });

  it('should call onCheck when Verifier button is clicked', () => {
    const onCheck = vi.fn();
    render(
      <GiftPassCheck result={null} isChecking={false} onCheck={onCheck} />,
    );

    fireEvent.click(screen.getByText('Verifier'));

    expect(onCheck).toHaveBeenCalled();
  });

  it('should show "Verification..." when checking', () => {
    render(
      <GiftPassCheck result={null} isChecking={true} onCheck={vi.fn()} />,
    );

    expect(screen.getByText('Verification...')).toBeDefined();
  });

  it('should display balance when result is available', () => {
    const result = { balance: 150, available: true, devise: 'EUR' };
    render(
      <GiftPassCheck result={result} isChecking={false} onCheck={vi.fn()} />,
    );

    expect(screen.getByText('Disponible')).toBeDefined();
  });

  it('should show "Indisponible" when not available', () => {
    const result = { balance: 0, available: false, devise: 'EUR' };
    render(
      <GiftPassCheck result={result} isChecking={false} onCheck={vi.fn()} />,
    );

    expect(screen.getByText('Indisponible')).toBeDefined();
  });

  it('should disable button when disabled prop is true', () => {
    render(
      <GiftPassCheck result={null} isChecking={false} onCheck={vi.fn()} disabled />,
    );

    const button = screen.getByText('Verifier').closest('button');
    expect(button?.disabled).toBe(true);
  });
});
