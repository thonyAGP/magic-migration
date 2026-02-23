import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviseTabSelector } from '../DeviseTabSelector';

describe('DeviseTabSelector', () => {
  it('should not render with a single devise', () => {
    const { container } = render(
      <DeviseTabSelector
        devises={['EUR']}
        activeDevise="EUR"
        onSelect={vi.fn()}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render tabs for 2 devises', () => {
    render(
      <DeviseTabSelector
        devises={['EUR', 'USD']}
        activeDevise="EUR"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('should render tabs for 3 devises', () => {
    render(
      <DeviseTabSelector
        devises={['EUR', 'USD', 'GBP']}
        activeDevise="EUR"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText('EUR')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('GBP')).toBeInTheDocument();
  });

  it('should mark the active tab as selected', () => {
    render(
      <DeviseTabSelector
        devises={['EUR', 'USD']}
        activeDevise="USD"
        onSelect={vi.fn()}
      />,
    );

    const usdTab = screen.getByRole('tab', { name: /USD/i });
    expect(usdTab).toHaveAttribute('aria-selected', 'true');

    const eurTab = screen.getByRole('tab', { name: /EUR/i });
    expect(eurTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should call onSelect when a tab is clicked', () => {
    const onSelect = vi.fn();
    render(
      <DeviseTabSelector
        devises={['EUR', 'USD', 'GBP']}
        activeDevise="EUR"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByText('GBP'));
    expect(onSelect).toHaveBeenCalledWith('GBP');
  });

  it('should display totals in badges when provided', () => {
    render(
      <DeviseTabSelector
        devises={['EUR', 'USD']}
        activeDevise="EUR"
        onSelect={vi.fn()}
        totals={{ EUR: 150.50, USD: 200 }}
      />,
    );

    // Check that formatted currency values appear
    expect(screen.getByText(/150,50/)).toBeInTheDocument();
    expect(screen.getByText(/200,00/)).toBeInTheDocument();
  });

  it('should not display badges when totals are not provided', () => {
    render(
      <DeviseTabSelector
        devises={['EUR', 'USD']}
        activeDevise="EUR"
        onSelect={vi.fn()}
      />,
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    // No badge spans with currency values
    expect(screen.queryByText(/\d+,\d+/)).not.toBeInTheDocument();
  });

  it('should have tablist role on container', () => {
    render(
      <DeviseTabSelector
        devises={['EUR', 'USD']}
        activeDevise="EUR"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
