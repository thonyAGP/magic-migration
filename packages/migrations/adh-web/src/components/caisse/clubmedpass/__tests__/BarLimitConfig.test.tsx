// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BarLimitConfig } from '../BarLimitConfig';

describe('BarLimitConfig', () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with current limit', () => {
    render(
      <BarLimitConfig
        passId="1"
        currentLimit={200}
        maxLimit={1000}
        onUpdate={onUpdate}
      />,
    );

    expect(screen.getByText('Plafond Bar')).toBeDefined();
    // Multiple elements contain 200,00 (label + center display)
    const matches = screen.getAllByText(/200,00/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1\s?000,00/)).toBeDefined();
  });

  it('should update limit via range input', () => {
    render(
      <BarLimitConfig
        passId="1"
        currentLimit={200}
        maxLimit={1000}
        onUpdate={onUpdate}
      />,
    );

    const slider = screen.getByLabelText('Plafond bar');
    fireEvent.change(slider, { target: { value: '500' } });

    // Apply button should be enabled
    const applyBtn = screen.getByText('Appliquer');
    expect(applyBtn).toBeDefined();
    fireEvent.click(applyBtn);

    expect(onUpdate).toHaveBeenCalledWith(500);
  });

  it('should select preset 200', () => {
    render(
      <BarLimitConfig
        passId="1"
        currentLimit={100}
        maxLimit={1000}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByText('200'));
    fireEvent.click(screen.getByText('Appliquer'));

    expect(onUpdate).toHaveBeenCalledWith(200);
  });

  it('should show warning when limit is 0', () => {
    render(
      <BarLimitConfig
        passId="1"
        currentLimit={0}
        maxLimit={1000}
        onUpdate={onUpdate}
      />,
    );

    expect(screen.getByText('Le bar sera bloque pour ce pass')).toBeDefined();
  });

  it('should disable apply button when limit unchanged', () => {
    render(
      <BarLimitConfig
        passId="1"
        currentLimit={200}
        maxLimit={1000}
        onUpdate={onUpdate}
      />,
    );

    const applyBtn = screen.getByText('Appliquer');
    expect(applyBtn.closest('button')?.disabled).toBe(true);
  });

  it('should show progress bar', () => {
    render(
      <BarLimitConfig
        passId="1"
        currentLimit={500}
        maxLimit={1000}
        onUpdate={onUpdate}
      />,
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeDefined();
    expect(progressBar.getAttribute('aria-valuenow')).toBe('500');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('1000');
  });
});
