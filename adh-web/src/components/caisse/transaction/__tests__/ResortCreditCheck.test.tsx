// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResortCreditCheck } from '../ResortCreditCheck';

describe('ResortCreditCheck', () => {
  it('should render "Non verifie" when no result', () => {
    render(
      <ResortCreditCheck result={null} isChecking={false} onCheck={vi.fn()} />,
    );

    expect(screen.getByText('Non verifie')).toBeDefined();
  });

  it('should call onCheck when Verifier button is clicked', () => {
    const onCheck = vi.fn();
    render(
      <ResortCreditCheck result={null} isChecking={false} onCheck={onCheck} />,
    );

    fireEvent.click(screen.getByText('Verifier'));

    expect(onCheck).toHaveBeenCalled();
  });

  it('should show "Verification..." when checking', () => {
    render(
      <ResortCreditCheck result={null} isChecking={true} onCheck={vi.fn()} />,
    );

    expect(screen.getByText('Verification...')).toBeDefined();
  });

  it('should display balance when result is available', () => {
    const result = { balance: 200, available: true, devise: 'EUR' };
    render(
      <ResortCreditCheck result={result} isChecking={false} onCheck={vi.fn()} />,
    );

    expect(screen.getByText('Disponible')).toBeDefined();
  });

  it('should show "Indisponible" when not available', () => {
    const result = { balance: 0, available: false, devise: 'EUR' };
    render(
      <ResortCreditCheck result={result} isChecking={false} onCheck={vi.fn()} />,
    );

    expect(screen.getByText('Indisponible')).toBeDefined();
  });
});
