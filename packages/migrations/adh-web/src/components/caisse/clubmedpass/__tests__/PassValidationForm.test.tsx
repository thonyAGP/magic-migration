// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassValidationForm } from '../PassValidationForm';

describe('PassValidationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(<PassValidationForm onValidate={vi.fn()} onScan={vi.fn()} />);

    expect(screen.getByText('Validation Club Med Pass')).toBeDefined();
    expect(screen.getByPlaceholderText('CM-2026-XXXXXX')).toBeDefined();
    expect(screen.getByPlaceholderText('0,00')).toBeDefined();
    expect(screen.getByText('Valider')).toBeDefined();
    expect(screen.getByText('Scanner')).toBeDefined();
  });

  it('should show validation errors on empty submit', () => {
    render(<PassValidationForm onValidate={vi.fn()} onScan={vi.fn()} />);

    fireEvent.click(screen.getByText('Valider'));

    expect(screen.getByText('Numero de pass requis')).toBeDefined();
  });

  it('should call onValidate with valid data', () => {
    const onValidate = vi.fn();
    render(<PassValidationForm onValidate={onValidate} onScan={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('CM-2026-XXXXXX'), {
      target: { value: 'CM-2026-001234' },
    });
    fireEvent.change(screen.getByPlaceholderText('0,00'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByText('Valider'));

    expect(onValidate).toHaveBeenCalledWith({
      numeroPass: 'CM-2026-001234',
      montantTransaction: 50,
    });
  });

  it('should call onScan with pass number', () => {
    const onScan = vi.fn();
    render(<PassValidationForm onValidate={vi.fn()} onScan={onScan} />);

    fireEvent.change(screen.getByPlaceholderText('CM-2026-XXXXXX'), {
      target: { value: 'CM-2026-001234' },
    });
    fireEvent.click(screen.getByText('Scanner'));

    expect(onScan).toHaveBeenCalledWith('CM-2026-001234');
  });

  it('should show validating state', () => {
    render(
      <PassValidationForm onValidate={vi.fn()} onScan={vi.fn()} isValidating />,
    );

    expect(screen.getByText('Validation...')).toBeDefined();
  });

  it('should disable fields when disabled', () => {
    render(
      <PassValidationForm onValidate={vi.fn()} onScan={vi.fn()} disabled />,
    );

    const passInput = screen.getByPlaceholderText('CM-2026-XXXXXX');
    const montantInput = screen.getByPlaceholderText('0,00');
    expect(passInput).toHaveProperty('disabled', true);
    expect(montantInput).toHaveProperty('disabled', true);
  });
});
